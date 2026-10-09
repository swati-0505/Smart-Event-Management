from __future__ import annotations
import logging
import re
from app.core.ai_config import ai_settings
from app.llm.exceptions import LLMUnavailableError
from app.llm.router import LLMProviderRouter
from app.rag.search import RetrievedChunk
logger = logging.getLogger(__name__)
_RERANK_PROMPT = "Rate how well each passage answers the user's question.\n\nQuestion: {query}\nPassages:\n{passages}\n\nScoring guide:\n  0-2  = unrelated\n  3-5  = same topic, does not answer the question\n  6-8  = partially answers it\n  9-10 = directly and completely answers it\n\nReply with ONE line per passage, nothing else, in this exact format:\n[1] 7\n[2] 2\n"

def rerank(query: str, candidates: list[RetrievedChunk], top_k: int | None=None, backend: str | None=None) -> list[RetrievedChunk]:
    top_k = top_k or ai_settings.FINAL_TOP_K
    if not candidates:
        return []
    if not ai_settings.ENABLE_RERANKER or len(candidates) <= 1:
        return candidates[:top_k]
    backend = backend or 'llm'
    try:
        if backend == 'cross_encoder':
            scored = _rerank_cross_encoder(query, candidates)
        else:
            scored = _rerank_llm(query, candidates)
    except (LLMUnavailableError, ImportError):
        logger.warning('Reranking failed, falling back to fused order.')
        return candidates[:top_k]
    ranked = sorted(scored, key=lambda c: c.rerank_score or 0.0, reverse=True)
    return ranked[:top_k]

def _rerank_llm(query: str, candidates: list[RetrievedChunk]) -> list[RetrievedChunk]:
    passages = '\n\n'.join((f'[{i}] {_preview(chunk)}' for i, chunk in enumerate(candidates, start=1)))
    response = LLMProviderRouter().invoke(
        _RERANK_PROMPT.format(query=query, passages=passages),
        temperature=0.0,
    )
    scores = _parse_scores(str(response.content), expected=len(candidates))
    for chunk, score in zip(candidates, scores):
        chunk.rerank_score = score
    return candidates

def _preview(chunk: RetrievedChunk, limit: int=500) -> str:
    summary = chunk.metadata.get('summary', '')
    body = chunk.content[:limit]
    return f'({summary}) {body}' if summary else body

def _parse_scores(raw: str, expected: int) -> list[float]:
    scores = [5.0] * expected
    for match in re.finditer('\\[?(\\d+)\\]?\\s*[:.\\-]?\\s*(\\d+(?:\\.\\d+)?)', raw):
        index = int(match.group(1)) - 1
        value = float(match.group(2))
        if 0 <= index < expected and 0.0 <= value <= 10.0:
            scores[index] = value
    return scores

def _rerank_cross_encoder(query: str, candidates: list[RetrievedChunk], model_name: str='cross-encoder/ms-marco-MiniLM-L-6-v2') -> list[RetrievedChunk]:
    from sentence_transformers import CrossEncoder
    model = CrossEncoder(model_name)
    pairs = [(query, chunk.content) for chunk in candidates]
    scores = model.predict(pairs)
    for chunk, score in zip(candidates, scores):
        chunk.rerank_score = float(score)
    return candidates