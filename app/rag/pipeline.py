import logging
import time
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.core.ai_config import ai_settings
from app.rag.fusion import reciprocal_rank_fusion
from app.rag.generator import GenerationResult, generate_answer
from app.rag.reranker import rerank
from app.rag.search import RetrievedChunk, dense_search, sparse_search

logger = logging.getLogger(__name__)


@dataclass
class RAGResponse:
    question: str
    answer: str
    grounded: bool
    sources: list[str] = field(default_factory=list)
    chunks: list[RetrievedChunk] = field(default_factory=list)
    retry_count: int = 0
    latency_ms: float = 0.0

    stage_counts: dict = field(default_factory=dict)


def retrieve(
    db: Session,
    query: str,
    doc_type: str | None = None,
    final_k: int | None = None,
) -> tuple[list[RetrievedChunk], dict]:
    """
    Run hybrid retrieval and return (chunks, stage_counts).

    If one arm fails - say the embedding API is rate-limited - we log it and
    continue with whatever the other arm returned. Degraded retrieval beats
    no retrieval.
    """
    final_k = final_k or ai_settings.FINAL_TOP_K

    try:
        dense = dense_search(db, query, doc_type=doc_type)
    except Exception as exc:
        logger.warning("Dense search failed: %s", exc)
        dense = []

    try:
        sparse = sparse_search(db, query, doc_type=doc_type)
    except Exception as exc:
        logger.warning("Sparse search failed: %s", exc)
        sparse = []

    if not dense and not sparse:
        return [], {"dense": 0, "sparse": 0, "fused": 0, "final": 0}

    fused = reciprocal_rank_fusion([dense, sparse])
    final = rerank(query, fused, top_k=final_k)

    counts = {
        "dense": len(dense),
        "sparse": len(sparse),
        "fused": len(fused),
        "final": len(final),
    }
    logger.info("Retrieval for %r: %s", query[:60], counts)

    return final, counts


def answer(
    db: Session,
    query: str,
    doc_type: str | None = None,
) -> RAGResponse:
    """Retrieve, then generate a grounded answer."""
    started = time.perf_counter()

    chunks, counts = retrieve(db, query, doc_type=doc_type)
    result: GenerationResult = generate_answer(query, chunks)

    return RAGResponse(
        question=query,
        answer=result.answer,
        grounded=result.grounded,
        sources=result.sources,
        chunks=chunks,
        retry_count=result.retry_count,
        latency_ms=(time.perf_counter() - started) * 1000,
        stage_counts=counts,
    )
