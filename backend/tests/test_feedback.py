import socket
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from app.core.security import hash_password
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.models.venue import Venue
from tests.conftest import TestingSessionLocal


def _postgres_available() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 5433), timeout=0.2):
            return True
    except OSError:
        return False


pytestmark = pytest.mark.skipif(
    not _postgres_available(),
    reason="PostgreSQL on localhost:5433 is required for database-backed API tests.",
)


def test_feedback_requires_completed_event_and_active_registration(client):
    db = TestingSessionLocal()
    email = f"feedback-user-{uuid4()}@example.com"
    password = "test-password"
    try:
        user = User(
            name="Feedback User",
            email=email,
            password_hash=hash_password(password),
            role="USER",
        )
        venue = Venue(name="Feedback Venue", address="1 Test Road", city="Test City", capacity=100)
        db.add_all([user, venue])
        db.flush()

        now = datetime.now(timezone.utc)
        completed_event = Event(
            title="Completed Feedback Event",
            category="Workshop",
            venue_id=venue.venue_id,
            event_date=now - timedelta(hours=2),
            end_time=now - timedelta(hours=1),
            capacity=20,
            available_seats=19,
            created_by=user.id,
            status="published",
        )
        upcoming_event = Event(
            title="Upcoming Feedback Event",
            category="Workshop",
            venue_id=venue.venue_id,
            event_date=now + timedelta(days=1),
            end_time=now + timedelta(days=1, hours=2),
            capacity=20,
            available_seats=19,
            created_by=user.id,
            status="published",
        )
        cancelled_event = Event(
            title="Cancelled Registration Feedback Event",
            category="Workshop",
            venue_id=venue.venue_id,
            event_date=now - timedelta(hours=2),
            end_time=now - timedelta(hours=1),
            capacity=20,
            available_seats=20,
            created_by=user.id,
            status="published",
        )
        db.add_all([completed_event, upcoming_event, cancelled_event])
        db.flush()
        db.add_all(
            [
                Registration(user_id=user.id, event_id=completed_event.event_id, status="confirmed"),
                Registration(user_id=user.id, event_id=upcoming_event.event_id, status="confirmed"),
                Registration(user_id=user.id, event_id=cancelled_event.event_id, status="cancelled"),
            ]
        )
        db.commit()
        user_id = user.id
        completed_event_id = completed_event.event_id
        upcoming_event_id = upcoming_event.event_id
        cancelled_event_id = cancelled_event.event_id
    finally:
        db.close()

    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    feedback_response = client.post(
        "/api/feedback/",
        headers=headers,
        json={
            "event_id": str(completed_event_id),
            "rating": 4,
            "comment": "Great event",
            "user_id": str(uuid4()),
        },
    )
    assert feedback_response.status_code == 201
    assert feedback_response.json()["user_id"] == str(user_id)

    duplicate = client.post(
        "/api/feedback/",
        headers=headers,
        json={"event_id": str(completed_event_id), "rating": 5},
    )
    assert duplicate.status_code == 400

    upcoming = client.post(
        "/api/feedback/",
        headers=headers,
        json={"event_id": str(upcoming_event_id), "rating": 5},
    )
    assert upcoming.status_code == 400

    cancelled = client.post(
        "/api/feedback/",
        headers=headers,
        json={"event_id": str(cancelled_event_id), "rating": 5},
    )
    assert cancelled.status_code == 403

    my_feedback = client.get("/api/feedback/mine", headers=headers)
    assert my_feedback.status_code == 200
    assert len(my_feedback.json()) == 1
    assert my_feedback.json()[0]["event_id"] == str(completed_event_id)
