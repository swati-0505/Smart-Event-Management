"""
Reciprocal Rank Fusion: merging the dense and sparse result lists.

The problem RRF solves: cosine similarity lives roughly in [0, 1] and
ts_rank_cd is unbounded and differently distributed. You cannot add them, and
normalising them into a shared range requires assumptions that break as soon
as the corpus changes.

RRF sidesteps this by throwing away the scores entirely and using only the
rank each list assigned:

    score(chunk) = sum over lists of  1 / (K + rank_in_that_list)

A chunk ranked #1 by both arms scores highest. A chunk ranked #1 by one arm
and absent from the other still scores well - which is exactly what you want,
because the arms are supposed to disagree.

K (default 60, the value from the original Cormack et al. paper) damps the
influence of top ranks. Lower K makes the #1 result dominate; higher K
flattens the contribution across the list.
"""

from __future__ import annotations

from app.core.ai_config import ai_settings
from app.rag.search import RetrievedChunk


def reciprocal_rank_fusion(
    result_lists: list[list[RetrievedChunk]],
    k: int | None = None,
    top_k: int | None = None,
) -> list[RetrievedChunk]:
    """
    Fuse several ranked lists into one.

    Chunks appearing in more than one list are merged, keeping whichever
    individual scores were present, so nothing is lost for debugging.
    """
    k = k if k is not None else ai_settings.RRF_K
    top_k = top_k or ai_settings.FUSED_TOP_K

    merged: dict[str, RetrievedChunk] = {}
    scores: dict[str, float] = {}

    for results in result_lists:
        for rank, chunk in enumerate(results, start=1):
            key = chunk.chunk_id

            if key not in merged:
                merged[key] = chunk
                scores[key] = 0.0
            else:

                existing = merged[key]
                if chunk.dense_score is not None:
                    existing.dense_score = chunk.dense_score
                if chunk.sparse_score is not None:
                    existing.sparse_score = chunk.sparse_score

            scores[key] += 1.0 / (k + rank)

    for key, score in scores.items():
        merged[key].fused_score = score

    ranked = sorted(merged.values(), key=lambda c: c.fused_score or 0.0, reverse=True)
    return ranked[:top_k]
