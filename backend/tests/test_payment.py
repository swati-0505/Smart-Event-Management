import socket
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from app.core.security import hash_password
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.models.venue import Venue
from app.services import payment_service
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


def test_completed_payment_creates_registration_once():
    db = TestingSessionLocal()
    user = User(
        name="Payment User",
        email=f"payment-user-{uuid4()}@example.com",
        password_hash=hash_password("test-password"),
        role="USER",
    )
    venue = Venue(name="Payment Venue", address="1 Test Road", city="Test City", capacity=100)
    db.add_all([user, venue])
    db.flush()
    event = Event(
        title="Paid Event",
        category="Workshop",
        venue_id=venue.venue_id,
        event_date=datetime.now(timezone.utc) + timedelta(days=1),
        end_time=datetime.now(timezone.utc) + timedelta(days=1, hours=2),
        capacity=20,
        available_seats=20,
        created_by=user.id,
        status="published",
    )
    db.add(event)
    db.commit()

    try:
        payment = payment_service.create_payment(
            db=db,
            user_id=user.id,
            event_id=event.event_id,
            amount=200,
            transaction_id=f"TXN_{uuid4()}",
        )
        assert payment.payment_status == "pending"
        assert db.query(Registration).filter_by(user_id=user.id, event_id=event.event_id).count() == 0

        payment_service.update_payment_status(db, payment.payment_id, "completed")
        assert db.query(Registration).filter_by(user_id=user.id, event_id=event.event_id).count() == 1
        assert db.query(Event).filter_by(event_id=event.event_id).one().available_seats == 19

        payment_service.update_payment_status(db, payment.payment_id, "completed")
        assert db.query(Registration).filter_by(user_id=user.id, event_id=event.event_id).count() == 1
        assert db.query(Event).filter_by(event_id=event.event_id).one().available_seats == 19
    finally:
        db.close()
