from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.db.database import get_db
from app.main import app
from app.models.feedback import Feedback
from app.models.payment import Payment
from app.models.registration import Registration
from app.services import event_service
from tests.ai.conftest import FakeSession


@pytest.fixture
def role_client():
    original_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_db] = FakeSession
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(original_overrides)


def authenticate_as(role_client, role: str):
    user = SimpleNamespace(id=uuid4(), role=role)
    app.dependency_overrides[get_current_user] = lambda: user
    return user


@pytest.mark.parametrize(
    ('method', 'path', 'payload'),
    [
        (
            'POST',
            '/api/events/',
            {
                'title': 'Example event',
                'category': 'Technology',
                'venue_id': str(uuid4()),
                'event_date': '2030-01-01T10:00:00Z',
                'capacity': 10,
            },
        ),
        ('PUT', f'/api/events/{uuid4()}', {'title': 'Updated event'}),
        ('DELETE', f'/api/events/{uuid4()}', None),
        (
            'POST',
            '/api/venues/',
            {'name': 'Venue', 'address': 'Street', 'city': 'City', 'capacity': 10},
        ),
        ('PUT', f'/api/venues/{uuid4()}', {'name': 'Updated venue'}),
        ('DELETE', f'/api/venues/{uuid4()}', None),
    ],
)
def test_normal_user_cannot_mutate_events_or_venues(role_client, method, path, payload):
    authenticate_as(role_client, 'USER')

    response = role_client.request(method, path, json=payload)

    assert response.status_code == 403


def test_admin_cannot_create_a_participant_registration(role_client):
    admin = authenticate_as(role_client, 'ADMIN')

    response = role_client.post(
        '/api/registrations/',
        json={'user_id': str(admin.id), 'event_id': str(uuid4())},
    )

    assert response.status_code == 403


def test_admin_cannot_cancel_a_participant_registration(role_client):
    authenticate_as(role_client, 'ADMIN')

    response = role_client.put(f'/api/registrations/{uuid4()}/cancel')

    assert response.status_code == 403


def test_user_cannot_register_another_account(role_client):
    user = authenticate_as(role_client, 'USER')

    response = role_client.post(
        '/api/registrations/',
        json={'user_id': str(uuid4()), 'event_id': str(uuid4())},
    )

    assert response.status_code == 403


def test_user_cannot_list_all_registrations(role_client):
    authenticate_as(role_client, 'USER')

    response = role_client.get('/api/registrations/')

    assert response.status_code == 403


def test_delete_event_rejects_events_with_registration_history(role_client, monkeypatch):
    authenticate_as(role_client, 'ADMIN')
    event_id = uuid4()
    conflict = event_service.EventDeletionConflict(
        "Cannot permanently delete 'Example event': it is referenced by "
        "1 registration(s). Cancel the event instead to preserve its history."
    )

    def raise_conflict(*args, **kwargs):
        raise conflict

    monkeypatch.setattr(event_service, 'delete_event', raise_conflict)

    response = role_client.delete(f'/api/events/{event_id}')

    assert response.status_code == 409
    assert 'Cancel the event instead' in response.json()['detail']


def test_delete_event_service_preserves_registration_references(monkeypatch, user_id):
    event_id = uuid4()
    event = SimpleNamespace(event_id=event_id, title='Example event')
    registration = SimpleNamespace(event_id=event_id)
    db = FakeSession({
        Registration: [registration],
        Payment: [],
        Feedback: [],
    })
    monkeypatch.setattr(event_service, 'require_admin_actor', lambda *_: None)
    monkeypatch.setattr(event_service, 'get_event_by_id', lambda *_args, **_kwargs: event)

    with pytest.raises(event_service.EventDeletionConflict, match='registration'):
        event_service.delete_event(db, event_id, actor_id=user_id)

    assert not db.committed
