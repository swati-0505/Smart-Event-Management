from __future__ import annotations
import logging
import re
from app.core.ai_config import ai_settings
from app.rag.clients import get_chat_model
from app.rag.search import RetrievedChunk

logger = logging.getLogger(__name__)

_RERANK_PROMPT = """Rate how well each passage answers the user's question.

Question: {query}
Passages:
{passages}

Scoring guide:
  0-2  = unrelated
  3-5  = same topic, does not answer the question
  6-8  = partially answers it
  9-10 = directly and completely answers it

Reply with ONE line per passage, nothing else, in this exact format:
[1] 7
[2] 2
"""


def rerank(
    query: str,
    candidates: list[RetrievedChunk],
    top_k: int | None = None,
    backend: str | None = None,
) -> list[RetrievedChunk]:
    """Reorder candidates by true relevance and truncate to top_k."""
    top_k = top_k or ai_settings.FINAL_TOP_K

    if not candidates:
        return []
    if not ai_settings.ENABLE_RERANKER or len(candidates) <= 1:
        return candidates[:top_k]

    backend = backend or "llm"

    try:
        if backend == "cross_encoder":
            scored = _rerank_cross_encoder(query, candidates)
        else:
            scored = _rerank_llm(query, candidates)
    except Exception as exc:
        logger.warning("Reranking failed, falling back to fused order: %s", exc)
        return candidates[:top_k]

    ranked = sorted(scored, key=lambda c: c.rerank_score or 0.0, reverse=True)
    return ranked[:top_k]






def _rerank_llm(query: str, candidates: list[RetrievedChunk]) -> list[RetrievedChunk]:
    """Score all candidates in one call (cheaper and more consistent than N calls)."""
    passages = "\n\n".join(
        f"[{i}] {_preview(chunk)}" for i, chunk in enumerate(candidates, start=1)
    )

    model = get_chat_model(temperature=0.0)
    response = model.invoke(_RERANK_PROMPT.format(query=query, passages=passages))
    scores = _parse_scores(str(response.content), expected=len(candidates))

    for chunk, score in zip(candidates, scores):
        chunk.rerank_score = score
    return candidates


def _preview(chunk: RetrievedChunk, limit: int = 500) -> str:
    """Trim a candidate so a 10-candidate rerank prompt stays manageable."""
    summary = chunk.metadata.get("summary", "")
    body = chunk.content[:limit]
    return f"({summary}) {body}" if summary else body


def _parse_scores(raw: str, expected: int) -> list[float]:
    """
    Pull '[n] score' pairs out of the response.

    Small models drift from the format constantly - they add prose, use
    'Passage 1:' instead of '[1]', or skip entries. So: extract whatever
    indexed pairs we can find, and default anything missing to a neutral 5.0
    so an unparsed entry keeps its fused position rather than being buried.
    """
    scores = [5.0] * expected

    for match in re.finditer(r"\[?(\d+)\]?\s*[:.\-]?\s*(\d+(?:\.\d+)?)", raw):
        index = int(match.group(1)) - 1
        value = float(match.group(2))
        if 0 <= index < expected and 0.0 <= value <= 10.0:
            scores[index] = value

    return scores

def _rerank_cross_encoder(
    query: str,
    candidates: list[RetrievedChunk],
    model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
) -> list[RetrievedChunk]:
    from sentence_transformers import CrossEncoder

    model = CrossEncoder(model_name)
    pairs = [(query, chunk.content) for chunk in candidates]
    scores = model.predict(pairs)

    for chunk, score in zip(candidates, scores):
        chunk.rerank_score = float(score)
    return candidates
