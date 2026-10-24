from __future__ import annotations
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from app.api.chat import get_optional_chat_user
from app.core.security import require_admin
from app.db.database import get_db
from app.main import app
from tests.ai.conftest import FakeSession

@pytest.fixture
def chat_client():
    original_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = FakeSession
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(original_overrides)

def _agent_result():
    return SimpleNamespace(reply='Hello!', session_id=uuid4(), run_id=uuid4(), intent='GENERAL', tools_used=[], sources=[], latency_ms=1.0, status='success')

def test_chat_endpoint_accepts_guest_without_a_token(chat_client):
    with patch('app.api.chat.run_agent', return_value=_agent_result()) as run_agent:
        response = chat_client.post('/api/chat', json={'message': 'Hello'})
    assert response.status_code == 200
    assert run_agent.call_args.kwargs['user_id'] is None
    assert 'role' not in run_agent.call_args.kwargs
    assert chat_client.post('/api/public/chat', json={'message': 'Hello'}).status_code == 404

def test_chat_endpoint_preserves_authenticated_user_without_accepting_a_supplied_role(chat_client):
    user = SimpleNamespace(id=uuid4(), role='ADMIN')
    app.dependency_overrides[get_optional_chat_user] = lambda: user
    with patch('app.api.chat.run_agent', return_value=_agent_result()) as run_agent:
        response = chat_client.post('/api/chat', json={'message': 'Hello'})
    assert response.status_code == 200
    assert run_agent.call_args.kwargs['user_id'] == user.id
    assert 'role' not in run_agent.call_args.kwargs

def test_delete_multiple_sessions_endpoint(chat_client):
    user = SimpleNamespace(id=uuid4(), role='USER')
    from app.core.security import get_current_user
    app.dependency_overrides[get_current_user] = lambda: user
    s_id1 = str(uuid4())
    s_id2 = str(uuid4())
    with patch('app.agent.memory.delete_sessions', return_value=2) as mock_delete:
        response = chat_client.request('DELETE', '/api/chat/sessions', json={'session_ids': [s_id1, s_id2]})
    assert response.status_code == 200
    assert response.json()['deleted_count'] == 2
    mock_delete.assert_called_once()

def test_upload_knowledge_document_awaits_ingestion(chat_client, tmp_path, monkeypatch):
    app.dependency_overrides[require_admin] = lambda: SimpleNamespace(id=uuid4(), role='ADMIN')
    monkeypatch.setattr('app.api.chat.ai_settings.KNOWLEDGE_DOCS_DIR', str(tmp_path))
    ingest_result = SimpleNamespace(filename='policy.md', status='indexed', chunk_count=2, detail='')
    with patch('app.api.chat.ingest.ingest_path', new_callable=AsyncMock, return_value=ingest_result) as ingest_path:
        response = chat_client.post(
            '/api/admin/knowledge/upload',
            files={'file': ('policy.md', b'# Policy\nContent', 'text/markdown')},
        )
    assert response.status_code == 200
    assert response.json()['status'] == 'indexed'
    ingest_path.assert_awaited_once()

def test_failed_upload_restores_previous_source_file(chat_client, tmp_path, monkeypatch):
    app.dependency_overrides[require_admin] = lambda: SimpleNamespace(id=uuid4(), role='ADMIN')
    monkeypatch.setattr('app.api.chat.ai_settings.KNOWLEDGE_DOCS_DIR', str(tmp_path))
    source = tmp_path / 'policy.md'
    source.write_text('previous indexed policy', encoding='utf-8')
    ingest_result = SimpleNamespace(filename='policy.md', status='failed', chunk_count=0, detail='embedding failed')

    with patch(
        'app.api.chat.ingest.ingest_path',
        new_callable=AsyncMock,
        return_value=ingest_result,
    ):
        response = chat_client.post(
            '/api/admin/knowledge/upload',
            files={'file': ('policy.md', b'new policy content', 'text/markdown')},
        )

    assert response.status_code == 422
    assert source.read_text(encoding='utf-8') == 'previous indexed policy'
    assert not list(tmp_path.glob('.knowledge-upload-*'))

def test_ingest_knowledge_awaits_directory_ingestion(chat_client):
    app.dependency_overrides[require_admin] = lambda: SimpleNamespace(id=uuid4(), role='ADMIN')
    ingest_result = SimpleNamespace(filename='policy.md', status='indexed', chunk_count=2, detail='')
    with patch(
        'app.api.chat.ingest.ingest_directory',
        new_callable=AsyncMock,
        return_value=[ingest_result],
    ) as ingest_directory:
        response = chat_client.post('/api/admin/knowledge/ingest')
    assert response.status_code == 200
    assert response.json() == [{
        'filename': 'policy.md',
        'status': 'indexed',
        'chunk_count': 2,
        'detail': '',
    }]
    ingest_directory.assert_awaited_once()

def test_delete_knowledge_document_route_is_registered(chat_client):
    app.dependency_overrides[require_admin] = lambda: SimpleNamespace(id=uuid4(), role='ADMIN')
    deleted = SimpleNamespace(
        filename='policy.md',
        status='deleted',
        chunks_removed=3,
        file_removed=True,
        detail='Removed 3 chunk(s) and document metadata',
    )
    with patch('app.api.chat.ingest.delete_knowledge_document', return_value=deleted):
        response = chat_client.delete('/api/admin/knowledge/documents/policy.md')

    assert response.status_code == 200
    assert response.json()['status'] == 'deleted'
    assert response.json()['chunks_removed'] == 3