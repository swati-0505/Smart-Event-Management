from __future__ import annotations

from unittest.mock import patch

from app.core.ai_config import ai_settings
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
from app.rag.converter import ConvertedDocument
from app.rag.ingest import _ingest_nvidia_document


def test_staged_document_ingestion_uses_openrouter_vectors_without_touching_legacy(fake_db, monkeypatch):
    document = ConvertedDocument(
        filename='policy.md',
        doc_type='policy',
        title='Policy',
        text='# Refunds\n' + ('Refund details are available here. ' * 8),
        content_hash='current-hash',
    )
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_MODEL', 'nvidia/test-embedding:free')

    with patch(
        'app.rag.ingest.embed_texts_openrouter',
        return_value=[[1.0] + [0.0] * 2047],
    ) as embed, patch('app.rag.ingest.extract_metadata', return_value={}), patch(
        'app.rag.ingest._populate_search_vectors'
    ) as populate:
        result = _ingest_nvidia_document(fake_db, document)

    assert result.status == 'indexed'
    embed.assert_called_once()
    populate.assert_called_once()
    staged_rows = [
        row for row in fake_db.added if isinstance(row, KnowledgeChunkNvidia)
    ]
    assert staged_rows
    assert all(row.primary_model == 'nvidia/test-embedding:free' for row in staged_rows)
    assert all(row.fallback_model is None and row.embedding_fallback is None for row in staged_rows)
    assert all(len(row.embedding_primary) == 2048 for row in staged_rows)
    assert not any(isinstance(row, KnowledgeChunk) for row in fake_db.added)
    assert any(isinstance(row, KnowledgeDocument) for row in fake_db.added)
