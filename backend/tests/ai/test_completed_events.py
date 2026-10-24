from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.models.event import Event
from app.schemas.feedback import PublicFeedbackResponse
from app.services import event_service


def test_completed_event_service_returns_only_completed_published_events(monkeypatch):
    now = datetime.now(timezone.utc)
    completed = Event(
        event_id=uuid4(),
        title='Completed event',
        category='Workshop',
        event_date=now - timedelta(days=1),
        end_time=now - timedelta(hours=20),
        capacity=10,
        available_seats=10,
        created_by=uuid4(),
        status='published',
    )
    upcoming = Event(
        event_id=uuid4(),
        title='Upcoming event',
        category='Workshop',
        event_date=now + timedelta(days=1),
        capacity=10,
        available_seats=10,
        created_by=uuid4(),
        status='published',
    )

    class Query:
        def filter(self, *_args):
            return self

        def order_by(self, *_args):
            return self

        def all(self):
            return [upcoming, completed]

    class Database:
        def query(self, _model):
            return Query()

    monkeypatch.setattr(event_service.redis_cache, 'get', lambda _key: None)
    monkeypatch.setattr(event_service.redis_cache, 'set', lambda *_args, **_kwargs: None)

    assert event_service.get_completed_events(Database()) == [completed]


def test_public_feedback_response_does_not_expose_attendee_identity():
    response = PublicFeedbackResponse(
        event_id=uuid4(),
        rating=5,
        comment='Excellent event',
        created_at=datetime.now(timezone.utc),
    )

    assert set(response.model_dump()) == {'event_id', 'rating', 'comment', 'created_at'}
