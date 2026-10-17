from __future__ import annotations
import logging
import re
from dataclasses import dataclass, field
from app.core.ai_config import ai_settings
from app.llm.exceptions import LLMUnavailableError
from app.llm.router import LLMProviderRouter
from app.rag.search import RetrievedChunk
logger = logging.getLogger(__name__)
NO_ANSWER = 'I could not find that in the event policy documents. Please check with an event administrator.'
_ANSWER_PROMPT = (
    'You answer questions about event-management policies using ONLY the '
    'context below.\n\n'
    'Rules:\n'
    '- Use only what the context states. Do not add general knowledge.\n'
    '- If the context does not contain the answer, reply exactly: {no_answer}\n'
    '- Lead with a concise, direct answer and use polished Markdown.\n'
    '- Split multiple conditions into short bullets under clear headings.\n'
    '- Use a Markdown table for refund schedules or other comparable tiers.\n'
    '- Avoid long paragraphs, repeated information, and inline document '
    'headings. The source list will be provided separately.\n'
    '- Keep simple answers to a few sentences; include only relevant details.\n'
    '{extra_rules}\n\n'
    'Context:\n{context}\n\n'
    'Question: {question}\n\n'
    'Answer:'
)
_GROUNDING_PROMPT = 'Check whether the ANSWER is fully supported by the CONTEXT.\n\nCONTEXT:\n{context}\n\nANSWER:\n{answer}\n\nAn answer is supported only if every factual claim in it appears in the\ncontext. Added details, softened conditions, or invented numbers make it\nunsupported.\n\nReply with exactly one line:\nGROUNDED: yes\nor\nGROUNDED: no | <what is unsupported, in under 15 words>\n'

@dataclass
class GenerationResult:
    answer: str
    grounded: bool
    retry_count: int = 0
    sources: list[str] = field(default_factory=list)
    check_note: str = ''

def build_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return ''
    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        summary = chunk.metadata.get('summary', '')
        header = f'[{i}] Source: {chunk.citation()}'
        if summary:
            header += f'\nSummary: {summary}'
        blocks.append(f'{header}\n{chunk.content}')
    return '\n\n---\n\n'.join(blocks)

def generate_answer(question: str, chunks: list[RetrievedChunk]) -> GenerationResult:
    if not chunks:
        return GenerationResult(answer=NO_ANSWER, grounded=True, sources=[])
    context = build_context(chunks)
    sources = _unique_sources(chunks)
    extra_rules = ''
    retry_count = 0
    answer = ''
    note = ''
    max_attempts = 1 + (ai_settings.MAX_GENERATION_RETRIES if ai_settings.ENABLE_HALLUCINATION_CHECK else 0)
    for attempt in range(max_attempts):
        response = LLMProviderRouter().invoke(
            _ANSWER_PROMPT.format(no_answer=NO_ANSWER, context=context, question=question, extra_rules=extra_rules),
            temperature=0.0,
        )
        answer = str(response.content).strip()
        if not answer:
            raise RuntimeError('RAG chat model returned an empty answer.')
        if not ai_settings.ENABLE_HALLUCINATION_CHECK:
            return GenerationResult(answer=answer, grounded=True, sources=sources)
        if NO_ANSWER.lower() in answer.lower():
            return GenerationResult(answer=NO_ANSWER, grounded=True, retry_count=retry_count, sources=sources)
        grounded, note = check_grounding(answer, context)
        if grounded:
            return GenerationResult(answer=answer, grounded=True, retry_count=retry_count, sources=sources, check_note=note)
        logger.warning('Ungrounded answer on attempt %d.', attempt + 1)
        retry_count += 1
        extra_rules = f'- A previous attempt was rejected as unsupported ({note}). Quote the context closely and omit anything it does not state.'
    return GenerationResult(answer=NO_ANSWER, grounded=False, retry_count=retry_count, sources=sources, check_note=note)

def check_grounding(answer: str, context: str) -> tuple[bool, str]:
    try:
        response = LLMProviderRouter().invoke(
            _GROUNDING_PROMPT.format(context=context, answer=answer),
            temperature=0.0,
        )
        raw = str(response.content).strip()
    except LLMUnavailableError:
        logger.warning('Grounding check failed, accepting answer.')
        return (True, 'checker unavailable')
    match = re.search('GROUNDED\\s*:\\s*(yes|no)', raw, re.IGNORECASE)
    if not match:
        logger.warning('Unparseable grounding verdict.')
        return (True, 'unparseable verdict')
    if match.group(1).lower() == 'yes':
        return (True, '')
    note = ''
    if '|' in raw:
        note = raw.split('|', 1)[1].strip()
    return (False, note or 'unsupported claim')

def _unique_sources(chunks: list[RetrievedChunk]) -> list[str]:
    seen: list[str] = []
    for chunk in chunks:
        label = chunk.citation()
        if label not in seen:
            seen.append(label)
    return seen