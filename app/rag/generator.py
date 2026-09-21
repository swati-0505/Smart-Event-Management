"""
The generation half of the RAG pipeline.

    prompt builder -> LLM -> hallucination checker -> (retry) -> final answer

The hallucination checker is the piece people skip, and it is what makes the
difference between "a chatbot that sounds authoritative about our refund
policy" and "a system that says it does not know". A second LLM call verifies
that every claim in the draft is supported by the retrieved chunks. If it is
not, we regenerate once with a stricter instruction, and if that still fails
we return the grounded-but-unhelpful answer rather than the ungrounded-but-
fluent one.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field

from app.core.ai_config import ai_settings
from app.rag.clients import get_chat_model
from app.rag.search import RetrievedChunk

logger = logging.getLogger(__name__)

NO_ANSWER = (
    "I could not find that in the event policy documents. "
    "Please check with an event administrator."
)

_ANSWER_PROMPT = """You answer questions about event-management policies using ONLY the context below.

Rules:
- Use only what the context states. Do not add general knowledge.
- If the context does not contain the answer, reply exactly: {no_answer}
- Cite the source in brackets after each claim, e.g. [Cancellation Policy].
- Be concise. Two or three sentences unless the question needs a list.
{extra_rules}

Context:
{context}

Question: {question}

Answer:"""

_GROUNDING_PROMPT = """Check whether the ANSWER is fully supported by the CONTEXT.

CONTEXT:
{context}

ANSWER:
{answer}

An answer is supported only if every factual claim in it appears in the
context. Added details, softened conditions, or invented numbers make it
unsupported.

Reply with exactly one line:
GROUNDED: yes
or
GROUNDED: no | <what is unsupported, in under 15 words>
"""


@dataclass
class GenerationResult:
    answer: str
    grounded: bool
    retry_count: int = 0
    sources: list[str] = field(default_factory=list)
    check_note: str = ""


def build_context(chunks: list[RetrievedChunk]) -> str:
    """
    Assemble retrieved chunks into the context block.

    Each chunk is labelled with its source so the model can cite it and so a
    reader can trace any claim back to a document.
    """
    if not chunks:
        return ""

    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        summary = chunk.metadata.get("summary", "")
        header = f"[{i}] Source: {chunk.citation()}"
        if summary:
            header += f"\nSummary: {summary}"
        blocks.append(f"{header}\n{chunk.content}")

    return "\n\n---\n\n".join(blocks)


def generate_answer(question: str, chunks: list[RetrievedChunk]) -> GenerationResult:
    """Generate a grounded answer, verifying and retrying once if needed."""
    if not chunks:
        return GenerationResult(answer=NO_ANSWER, grounded=True, sources=[])

    context = build_context(chunks)
    sources = _unique_sources(chunks)
    model = get_chat_model(temperature=0.0)

    extra_rules = ""
    retry_count = 0
    answer = ""
    note = ""

    max_attempts = 1 + (
        ai_settings.MAX_GENERATION_RETRIES if ai_settings.ENABLE_HALLUCINATION_CHECK else 0
    )

    for attempt in range(max_attempts):
        response = model.invoke(
            _ANSWER_PROMPT.format(
                no_answer=NO_ANSWER,
                context=context,
                question=question,
                extra_rules=extra_rules,
            )
        )
        answer = str(response.content).strip()

        if not ai_settings.ENABLE_HALLUCINATION_CHECK:
            return GenerationResult(answer=answer, grounded=True, sources=sources)


        if NO_ANSWER.lower() in answer.lower():
            return GenerationResult(
                answer=NO_ANSWER, grounded=True, retry_count=retry_count, sources=sources
            )

        grounded, note = check_grounding(answer, context)
        if grounded:
            return GenerationResult(
                answer=answer,
                grounded=True,
                retry_count=retry_count,
                sources=sources,
                check_note=note,
            )

        logger.warning("Ungrounded answer on attempt %d: %s", attempt + 1, note)
        retry_count += 1
        extra_rules = (
            "- A previous attempt was rejected as unsupported"
            f" ({note}). Quote the context closely and omit anything it does not state."
        )


    return GenerationResult(
        answer=NO_ANSWER,
        grounded=False,
        retry_count=retry_count,
        sources=sources,
        check_note=note,
    )


def check_grounding(answer: str, context: str) -> tuple[bool, str]:
    """
    Verify an answer against its context.

    Returns (is_grounded, note). On checker failure we return True - a broken
    verifier should not block every answer the system produces.
    """
    try:
        model = get_chat_model(temperature=0.0)
        response = model.invoke(
            _GROUNDING_PROMPT.format(context=context, answer=answer)
        )
        raw = str(response.content).strip()
    except Exception as exc:
        logger.warning("Grounding check failed, accepting answer: %s", exc)
        return True, "checker unavailable"

    match = re.search(r"GROUNDED\s*:\s*(yes|no)", raw, re.IGNORECASE)
    if not match:
        logger.warning("Unparseable grounding verdict: %s", raw[:120])
        return True, "unparseable verdict"

    if match.group(1).lower() == "yes":
        return True, ""

    note = ""
    if "|" in raw:
        note = raw.split("|", 1)[1].strip()
    return False, note or "unsupported claim"


def _unique_sources(chunks: list[RetrievedChunk]) -> list[str]:
    seen: list[str] = []
    for chunk in chunks:
        label = chunk.citation()
        if label not in seen:
            seen.append(label)
    return seen
