from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.rag.ingest import delete_knowledge_document, safe_knowledge_filename


@pytest.mark.parametrize(
    'filename',
    ['../secret.md', 'folder/doc.md', 'folder\\doc.md', '', '.', '..', 'a/../../b.md'],
)
def test_safe_knowledge_filename_rejects_traversal(filename):
    with pytest.raises(ValueError, match='Invalid filename'):
        safe_knowledge_filename(filename)


def test_safe_knowledge_filename_accepts_basename():
    assert safe_knowledge_filename('refund-policy.md') == 'refund-policy.md'


def test_delete_knowledge_document_removes_chunks_and_metadata(monkeypatch, tmp_path):
    monkeypatch.setattr('app.rag.ingest.ai_settings.KNOWLEDGE_DOCS_DIR', str(tmp_path))
    filename = 'refund-policy.md'
    source = tmp_path / filename
    source.write_text('# refund', encoding='utf-8')

    document_id = uuid4()
    record = SimpleNamespace(document_id=document_id, filename=filename)

    db = MagicMock()
    doc_query = MagicMock()
    doc_query.filter.return_value.first.return_value = record

    nvidia_query = MagicMock()
    nvidia_query.filter.return_value.delete.return_value = 3
    legacy_query = MagicMock()
    legacy_query.filter.return_value.delete.return_value = 1

    def query_side_effect(model):
        name = getattr(model, '__name__', str(model))
        if name == 'KnowledgeDocument':
            return doc_query
        if name == 'KnowledgeChunkNvidia':
            return nvidia_query
        if name == 'KnowledgeChunk':
            return legacy_query
        raise AssertionError(f'Unexpected model {model}')

    db.query.side_effect = query_side_effect

    with patch('app.rag.ingest.redis_cache.invalidate_policies') as invalidate:
        result = delete_knowledge_document(db, filename)

    assert result.status == 'deleted'
    assert result.filename == filename
    assert result.chunks_removed == 4
    assert result.file_removed is True
    assert not source.exists()
    db.delete.assert_called_once_with(record)
    db.commit.assert_called_once()
    invalidate.assert_called_once()


def test_delete_knowledge_document_missing_raises_lookup(monkeypatch, tmp_path):
    monkeypatch.setattr('app.rag.ingest.ai_settings.KNOWLEDGE_DOCS_DIR', str(tmp_path))
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(LookupError, match='not found'):
        delete_knowledge_document(db, 'missing.md')
