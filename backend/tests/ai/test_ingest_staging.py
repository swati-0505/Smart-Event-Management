from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, patch

from app.core.ai_config import ai_settings
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
from app.rag.converter import ConvertedDocument
from app.rag.ingest import (
    _ingest_nvidia_document,
    clear_knowledge_base,
    clear_nvidia_index,
    ingest_directory,
)


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
        'app.rag.ingest.embed_texts_openrouter_model_async',
        new_callable=AsyncMock,
        return_value=[[1.0] + [0.0] * 2047],
    ) as embed, patch('app.rag.ingest.extract_metadata', return_value={}), patch(
        'app.rag.ingest._populate_search_vectors'
    ) as populate, patch('app.rag.ingest.redis_cache.invalidate_policies') as invalidate:
        result = asyncio.run(_ingest_nvidia_document(fake_db, document))

    assert result.status == 'indexed'
    embed.assert_awaited_once()
    populate.assert_called_once()
    invalidate.assert_called_once()
    staged_rows = [
        row for row in fake_db.added if isinstance(row, KnowledgeChunkNvidia)
    ]
    assert staged_rows
    assert all(row.primary_model == 'nvidia/test-embedding:free' for row in staged_rows)
    assert all(row.fallback_model is None and row.embedding_fallback is None for row in staged_rows)
    assert all(len(row.embedding_primary) == 2048 for row in staged_rows)
    assert not any(isinstance(row, KnowledgeChunk) for row in fake_db.added)
    assert any(isinstance(row, KnowledgeDocument) for row in fake_db.added)


def test_directory_ingest_reports_document_conversion_failures(fake_db, tmp_path, monkeypatch):
    (tmp_path / 'broken.pdf').write_bytes(b'invalid pdf')
    monkeypatch.setattr(ai_settings, 'RAG_ACTIVE_EMBEDDING_INDEX', 'nvidia')

    def fail_conversion(_path):
        raise ValueError('document could not be converted')

    monkeypatch.setattr('app.rag.ingest.convert_file', fail_conversion)

    results = asyncio.run(ingest_directory(fake_db, directory=str(tmp_path)))

    assert len(results) == 1
    assert results[0].filename == 'broken.pdf'
    assert results[0].status == 'failed'
    assert results[0].detail == 'document could not be converted'


def test_clearing_knowledge_base_invalidates_policy_cache(fake_db):
    with patch('app.rag.ingest.redis_cache.invalidate_policies') as invalidate:
        assert clear_knowledge_base(fake_db) == 0

    fake_db.commit()
    invalidate.assert_called_once()


def test_clearing_embedding_index_invalidates_policy_cache(fake_db):
    with patch('app.rag.ingest.redis_cache.invalidate_policies') as invalidate:
        assert clear_nvidia_index(fake_db) == 0

    fake_db.commit()
    invalidate.assert_called_once()
