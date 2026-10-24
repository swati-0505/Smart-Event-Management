from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.rag import pipeline


def test_retrieve_reports_failure_when_both_search_stages_fail():
    with patch('app.rag.pipeline.dense_search', side_effect=RuntimeError('embedding provider down')), patch(
        'app.rag.pipeline.sparse_search',
        side_effect=RuntimeError('database unavailable'),
    ):
        with pytest.raises(RuntimeError, match='all available search stages: dense, sparse'):
            pipeline.retrieve(MagicMock(), 'refund policy')


def test_retrieve_keeps_partial_results_when_one_search_stage_fails():
    chunk = MagicMock(chunk_id='chunk-1', dense_score=0.9, sparse_score=None)
    with patch('app.rag.pipeline.dense_search', return_value=[chunk]), patch(
        'app.rag.pipeline.sparse_search',
        side_effect=RuntimeError('sparse index unavailable'),
    ), patch('app.rag.pipeline.reciprocal_rank_fusion', return_value=[chunk]), patch(
        'app.rag.pipeline.rerank',
        return_value=[chunk],
    ):
        chunks, counts = pipeline.retrieve(MagicMock(), 'refund policy')

    assert chunks == [chunk]
    assert counts == {'dense': 1, 'sparse': 0, 'fused': 1, 'final': 1}
