"""
RRF fusion tests.

The point of RRF is that it uses rank and ignores raw score. These tests pin
that down, because the obvious "improvement" someone will later propose -
normalising and adding the scores - would break the moment cosine similarity
and ts_rank_cd drift apart in scale.
"""

from __future__ import annotations

from app.rag.fusion import reciprocal_rank_fusion
from tests.ai.conftest import make_chunk


def test_agreement_between_arms_wins():
    """A chunk both arms rank first must come out on top."""
    dense = [make_chunk("a"), make_chunk("b"), make_chunk("c")]
    sparse = [make_chunk("a"), make_chunk("c"), make_chunk("b")]

    fused = reciprocal_rank_fusion([dense, sparse])

    assert fused[0].chunk_id == "a"


def test_chunk_found_by_only_one_arm_still_ranks():
    """
    The arms are supposed to disagree - that is why we run both.

    A chunk only the sparse arm found (an exact phrase the embedding blurred)
    must not be discarded just because the dense arm missed it.
    """
    dense = [make_chunk("a"), make_chunk("b")]
    sparse = [make_chunk("z")]

    fused = reciprocal_rank_fusion([dense, sparse])

    assert "z" in {c.chunk_id for c in fused}


def test_raw_scores_do_not_affect_ordering():
    """
    Only rank counts.

    'b' carries a far larger sparse_score than 'a' carries a dense_score, but
    both sit at rank 1 in their own list, so the tie is not broken by
    magnitude.
    """
    dense = [make_chunk("a", dense=0.01), make_chunk("b", dense=0.001)]
    sparse = [make_chunk("b", sparse=99999.0), make_chunk("a", sparse=0.0001)]

    fused = reciprocal_rank_fusion([dense, sparse])
    scores = {c.chunk_id: c.fused_score for c in fused}


    assert abs(scores["a"] - scores["b"]) < 1e-9


def test_scores_from_both_arms_are_merged_onto_one_chunk():
    """Keeping both scores is what makes a bad ranking debuggable later."""
    dense = [make_chunk("a", dense=0.87)]
    sparse = [make_chunk("a", sparse=0.42)]

    fused = reciprocal_rank_fusion([dense, sparse])

    assert len(fused) == 1
    assert fused[0].dense_score == 0.87
    assert fused[0].sparse_score == 0.42


def test_rrf_formula_is_exact():
    dense = [make_chunk("a"), make_chunk("b")]

    fused = reciprocal_rank_fusion([dense], k=60)
    scores = {c.chunk_id: c.fused_score for c in fused}

    assert abs(scores["a"] - 1 / 61) < 1e-12
    assert abs(scores["b"] - 1 / 62) < 1e-12


def test_lower_k_sharpens_the_top_rank():
    """K damps the influence of the top position; this documents the knob."""
    lists = [[make_chunk("a"), make_chunk("b")]]

    sharp = {c.chunk_id: c.fused_score for c in reciprocal_rank_fusion(lists, k=1)}
    flat = {c.chunk_id: c.fused_score for c in reciprocal_rank_fusion(lists, k=1000)}

    assert (sharp["a"] - sharp["b"]) > (flat["a"] - flat["b"])


def test_results_are_sorted_descending():
    dense = [make_chunk(f"d{i}") for i in range(5)]
    sparse = [make_chunk(f"s{i}") for i in range(5)]

    fused = reciprocal_rank_fusion([dense, sparse])
    scores = [c.fused_score for c in fused]

    assert scores == sorted(scores, reverse=True)


def test_top_k_truncates():
    lists = [[make_chunk(f"c{i}") for i in range(20)]]
    assert len(reciprocal_rank_fusion(lists, top_k=3)) == 3


def test_empty_input_is_safe():
    """Both arms failing must return empty, not raise."""
    assert reciprocal_rank_fusion([]) == []
    assert reciprocal_rank_fusion([[], []]) == []
