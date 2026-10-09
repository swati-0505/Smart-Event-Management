from __future__ import annotations
from types import SimpleNamespace
from unittest.mock import patch
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient
from app.api.chat import get_optional_chat_user
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
    assert run_agent.call_args.kwargs['role'] == 'guest'
    assert chat_client.post('/api/public/chat', json={'message': 'Hello'}).status_code == 404

def test_chat_endpoint_preserves_authenticated_user(chat_client):
    user = SimpleNamespace(id=uuid4(), role='ADMIN')
    app.dependency_overrides[get_optional_chat_user] = lambda: user
    with patch('app.api.chat.run_agent', return_value=_agent_result()) as run_agent:
        response = chat_client.post('/api/chat', json={'message': 'Hello'})
    assert response.status_code == 200
    assert run_agent.call_args.kwargs['user_id'] == user.id
    assert run_agent.call_args.kwargs['role'] == 'ADMIN'

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