from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.config import settings
from app.core.event_status import is_event_completed
from app.models.event import Event
from app.schemas.event import EventResponse
from app.services import event_service


def test_event_is_not_completed_before_explicit_end_time():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    end = start + timedelta(hours=2)

    assert not is_event_completed(start, end, now=end - timedelta(seconds=1))


def test_event_is_completed_at_explicit_end_time():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    end = start + timedelta(hours=2)

    assert is_event_completed(start, end, now=end)


def test_event_without_end_time_uses_configured_default_duration():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    completion = start + timedelta(hours=settings.EVENT_DEFAULT_DURATION_HOURS)

    assert not is_event_completed(start, now=completion - timedelta(seconds=1))
    assert is_event_completed(start, now=completion)


def test_event_with_naive_datetime_is_treated_as_utc():
    start = datetime(2035, 6, 15, 14)

    assert is_event_completed(start, now=(start + timedelta(hours=4)).replace(tzinfo=timezone.utc))


def test_missing_event_date_is_not_completed():
    assert not is_event_completed(None)


def test_event_response_includes_completion_status():
    event_date = datetime.now(timezone.utc) - timedelta(days=1)
    response = EventResponse(
        event_id='2f6c70db-d8db-4bbb-baa3-e6bf36e06d5a',
        title='Completed event',
        description=None,
        category='Workshop',
        venue_id=None,
        address='123 Example Street',
        event_date=event_date,
        end_time=event_date + timedelta(hours=1),
        registration_deadline=None,
        capacity=20,
        available_seats=20,
        created_by='71ef38f8-b6b5-42af-a686-67be7060c47b',
        status='published',
    )

    assert response.model_dump()['is_completed'] is True


def test_published_event_listing_excludes_completed_events(monkeypatch):
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
            return [completed, upcoming]

    class Database:
        def query(self, _model):
            return Query()

    monkeypatch.setattr(event_service.redis_cache, 'get', lambda _key: None)
    monkeypatch.setattr(event_service.redis_cache, 'set', lambda *_args, **_kwargs: None)

    result = event_service.get_published_events(Database())

    assert [event.title for event in result] == ['Upcoming event']
