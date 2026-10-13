from __future__ import annotations
import socket
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4
import pytest
from app.agent.graph import AgentResult
from app.core.security import hash_password
from app.models.event import Event
from app.models.user import User
from app.models.venue import Venue
from app.rag import pipeline
from app.services import availability_service
from app.tools.context import ToolContext, use_tool_context
from app.tools.rag_tools import search_event_policy
from tests.conftest import TestingSessionLocal

def _postgres_available() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 5432), timeout=0.2):
            return True
    except OSError:
        return False


pytestmark = pytest.mark.skipif(
    not _postgres_available(),
    reason="PostgreSQL on localhost:5432 is required for database-backed API tests.",
)


def _seed_published_event():
    db = TestingSessionLocal()

    try:
        admin = User(
            name="Journey Admin",
            email=f"journey-admin-{uuid4()}@example.test",
            password_hash=hash_password("test-password"),
            role="ADMIN",
        )

        venue = Venue(
            name="Journey Venue",
            address="1 Test Road",
            city="Test City",
            capacity=100,
        )

        db.add_all([admin, venue])
        db.flush()

        start = datetime.now(timezone.utc) + timedelta(days=14)

        event = Event(
            title="Journey Test Event",
            description="An event for the end-to-end user journey.",
            category="Workshop",
            venue_id=venue.venue_id,
            event_date=start,
            end_time=start + timedelta(hours=2),
            registration_deadline=start - timedelta(days=2),
            capacity=20,
            available_seats=20,
            created_by=admin.id,
            status="published",
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return venue.venue_id, event.event_id

    finally:
        db.close()


def test_login_event_search_registration_confirmation_and_policy(
    client, monkeypatch
):
    _, event_id = _seed_published_event()

    email = f"journey-user-{uuid4()}@gmail.com"

    registered = client.post(
        "/api/auth/register",
        json={
            "name": "Journey User",
            "email": email,
            "password": "test-password",
        },
    )

    print("User registration status:", registered.status_code)
    print("User registration response:", registered.text)

    assert registered.status_code == 200, (
        f"User registration failed: {registered.text}"
    )

    login = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "test-password",
        },
    )

    print("User login status:", login.status_code)
    print("User login response:", login.text)

    assert login.status_code == 200, (
        f"User login failed: {login.text}"
    )

    headers = {
        "Authorization": f"Bearer {login.json()['access_token']}"
    }

    events = client.get("/api/events/published")

    assert events.status_code == 200, (
        f"Published event search failed: {events.text}"
    )

    assert any(
        event["event_id"] == str(event_id)
        for event in events.json()
    ), "Seeded event was not found in published events."

    event_registration = client.post(
        "/api/registrations/",
        json={
            "user_id": registered.json()["id"],
            "event_id": str(event_id),
        },
        headers=headers,
    )

    print(
        "Event registration status:",
        event_registration.status_code,
    )
    print(
        "Event registration response:",
        event_registration.text,
    )

    assert event_registration.status_code == 201, (
        f"Event registration failed: {event_registration.text}"
    )

    assert event_registration.json()["status"] == "confirmed"

    db = TestingSessionLocal()

    try:
        event = (
            db.query(Event)
            .filter(Event.event_id == event_id)
            .one()
        )

        assert event.available_seats == 19

    finally:
        db.close()

    policy_answer = SimpleNamespace(
        chunks=[SimpleNamespace()],
        answer="Cancellations are accepted up to 48 hours before the event.",
        sources=["cancellation_policy.pdf"],
        grounded=True,
    )

    monkeypatch.setattr(
        pipeline,
        "answer",
        lambda *args, **kwargs: policy_answer,
    )

    def run_policy_query(
        *,
        db,
        user_id,
        role,
        message,
        session_id=None,
    ):
        with use_tool_context(
            ToolContext(
                db=db,
                user_id=user_id,
                role=role,
            )
        ):
            reply = search_event_policy.invoke(
                {"question": message}
            )

        return AgentResult(
            reply=reply,
            session_id=uuid4(),
            run_id=uuid4(),
            intent="POLICY",
            tools_used=["search_event_policy"],
            tool_results=[],
            sources=["cancellation_policy.pdf"],
            latency_ms=1,
            status="success",
        )

    monkeypatch.setattr(
        "app.api.chat.run_agent",
        run_policy_query,
    )

    policy = client.post(
        "/api/chat",
        json={
            "message": "What is the cancellation policy?"
        },
        headers=headers,
    )

    print("Policy response status:", policy.status_code)
    print("Policy response body:", policy.text)

    assert policy.status_code == 200, (
        f"Policy query failed: {policy.text}"
    )

    assert "48 hours" in policy.json()["reply"]
    assert policy.json()["sources"] == ["cancellation_policy.pdf"]


def test_venue_availability_uses_event_end_times(client):
    venue_id, _ = _seed_published_event()

    db = TestingSessionLocal()

    try:
        existing = (
            db.query(Event)
            .filter(Event.venue_id == venue_id)
            .one()
        )

        start = existing.event_date
        end = existing.end_time

        adjacent = availability_service.check_venue_availability(
            db,
            venue_id,
            requested_time=end,
            requested_end_time=end + timedelta(hours=1),
        )

        overlapping = availability_service.check_venue_availability(
            db,
            venue_id,
            requested_time=start + timedelta(minutes=30),
            requested_end_time=end + timedelta(minutes=30),
        )

        assert adjacent.available
        assert not overlapping.available

        assert (
            "Journey Test Event"
            in overlapping.conflicting_events
        )

        existing.end_time = None
        db.commit()

        legacy_overlap = (
            availability_service.check_venue_availability(
                db,
                venue_id,
                requested_time=start + timedelta(hours=1),
                requested_end_time=start + timedelta(hours=2),
            )
        )

        assert not legacy_overlap.available

    finally:
        db.close()


def test_event_create_rejects_end_time_before_start(client):
    venue_id, _ = _seed_published_event()

    admin_email = f"timing-admin-{uuid4()}@gmail.com"

    admin = User(
        name="Timing Admin",
        email=admin_email,
        password_hash=hash_password("test-password"),
        role="ADMIN",
    )

    db = TestingSessionLocal()

    try:
        db.add(admin)
        db.commit()

    finally:
        db.close()

    login = client.post(
        "/api/auth/login",
        json={
            "email": admin_email,
            "password": "test-password",
        },
    )

    print("Admin login status:", login.status_code)
    print("Admin login response:", login.text)

    assert login.status_code == 200, (
        f"Admin login failed: {login.text}"
    )

    token = login.json()["access_token"]

    start = datetime.now(timezone.utc) + timedelta(days=30)

    response = client.post(
        "/api/events/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "title": "Invalid event",
            "category": "Workshop",
            "venue_id": str(venue_id),
            "event_date": start.isoformat(),
            "end_time": (
                start - timedelta(hours=1)
            ).isoformat(),
            "capacity": 10,
        },
    )

    print("Invalid event status:", response.status_code)
    print("Invalid event response:", response.text)

    assert response.status_code == 422, (
        f"Expected HTTP 422 for invalid event timing, "
        f"but got {response.status_code}: {response.text}"
    )