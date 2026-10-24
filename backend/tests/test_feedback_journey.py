from datetime import datetime, timedelta, timezone
import socket
from uuid import uuid4

import pytest

from app.core.security import hash_password
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.registration import Registration
from app.models.user import User
from tests.conftest import TestingSessionLocal


def _postgres_available() -> bool:
    try:
        with socket.create_connection(('127.0.0.1', 5432), timeout=0.2):
            return True
    except OSError:
        return False


pytestmark = pytest.mark.skipif(
    not _postgres_available(),
    reason='PostgreSQL on localhost:5432 is required for database-backed API tests.',
)


def _seed_completed_event(*, register_attendee=True):
    attendee = User(
        name='Feedback Attendee',
        email=f'feedback-attendee-{uuid4()}@example.test',
        password_hash=hash_password('test-password'),
        role='USER',
    )
    admin = User(
        name='Feedback Admin',
        email=f'feedback-admin-{uuid4()}@example.test',
        password_hash=hash_password('test-password'),
        role='ADMIN',
    )
    start = datetime.now(timezone.utc) - timedelta(days=2)
    event = Event(
        title='Feedback Test Event',
        description='Event for feedback testing',
        category='Workshop',
        venue_id=None,
        address='123 Feedback Road',
        event_date=start,
        end_time=start + timedelta(hours=2),
        capacity=20,
        available_seats=19,
        created_by=admin.id,
        status='published',
    )
    db = TestingSessionLocal()
    try:
        db.add_all([attendee, admin])
        db.flush()
        event.created_by = admin.id
        db.add(event)
        db.flush()
        if register_attendee:
            db.add(
                Registration(
                    user_id=attendee.id,
                    event_id=event.event_id,
                    status='confirmed',
                )
            )
        db.commit()
        return attendee, admin, event.event_id
    finally:
        db.close()


def _login(client, user):
    response = client.post(
        '/api/auth/login',
        json={'email': user.email, 'password': 'test-password'},
    )
    assert response.status_code == 200
    return {'Authorization': f"Bearer {response.json()['access_token']}"}


def test_attendee_can_submit_feedback_and_admin_can_review_and_delete(client):
    attendee, admin, event_id = _seed_completed_event()
    attendee_headers = _login(client, attendee)
    feedback_response = client.post(
        '/api/feedback/',
        headers=attendee_headers,
        json={
            'user_id': str(attendee.id),
            'event_id': str(event_id),
            'rating': 5,
            'comment': 'Great event!',
        },
    )

    assert feedback_response.status_code == 201
    assert feedback_response.json()['rating'] == 5

    admin_headers = _login(client, admin)
    feedback_list = client.get('/api/feedback/', headers=admin_headers)
    assert feedback_list.status_code == 200
    entry = next(item for item in feedback_list.json() if item['event_id'] == str(event_id))
    assert entry['user_name'] == attendee.name
    assert entry['event_title'] == 'Feedback Test Event'

    deleted = client.delete(
        f"/api/feedback/{entry['feedback_id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 204

    db = TestingSessionLocal()
    try:
        assert db.query(Feedback).filter(Feedback.event_id == event_id).count() == 0
    finally:
        db.close()


def test_non_attendee_can_submit_feedback_for_completed_event(client):
    user, _, event_id = _seed_completed_event(register_attendee=False)
    response = client.post(
        '/api/feedback/',
        headers=_login(client, user),
        json={
            'user_id': str(user.id),
            'event_id': str(event_id),
            'rating': 4,
            'comment': 'I was not able to attend, but I am interested in this event.',
        },
    )

    assert response.status_code == 201
    assert response.json()['rating'] == 4
