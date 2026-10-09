from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from app.core.ai_config import ai_settings
from app.rag import search


def test_openrouter_dense_search_uses_configured_model_index(monkeypatch):
    monkeypatch.setattr(ai_settings, 'RAG_ACTIVE_EMBEDDING_INDEX', 'nvidia')
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_MODEL', 'nvidia/embedding-model:free')
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 2048)
    monkeypatch.setattr(search, 'embed_query_openrouter', lambda _: [0.1, 0.2])
    db = MagicMock()
    db.execute.return_value.fetchall.return_value = []

    assert search.dense_search(db, 'query', doc_type='policy') == []

    statement = str(db.execute.call_args.args[0])
    assert 'FROM knowledge_chunks_nvidia' in statement
    assert '(embedding_primary::halfvec(2048)) <=> CAST(:query_vector AS halfvec(2048))' in statement
    assert 'WHERE embedding_primary IS NOT NULL' in statement
    assert 'AND primary_model = :model_name' in statement
    assert db.execute.call_args.args[1]['model_name'] == 'nvidia/embedding-model:free'
    assert 'AND doc_type = :doc_type' in statement
