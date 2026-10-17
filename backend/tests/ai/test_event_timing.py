from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4
import pytest
from sqlalchemy.dialects import postgresql
from pydantic import ValidationError
from app.core.time import APP_TIMEZONE
from app.services.feedback_service import FeedbackSubmissionError, submit_feedback
from app.services import event_service, feedback_service
from app.schemas.event import EventCreate, EventUpdate
from app.schemas.feedback import FeedbackCreate
from app.models.registration import Registration
from app.tools.formatting import format_datetime, get_event_time_status, parse_datetime
from app.tools.event_tools import submit_event_feedback
from tests.ai.conftest import FakeSession

def test_event_create_accepts_explicit_end_time():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    event = EventCreate(title='Timed event', category='Workshop', venue_id=uuid4(), event_date=start, end_time=start + timedelta(hours=2), capacity=25)
    assert event.end_time == start + timedelta(hours=2)

def test_event_create_rejects_end_time_before_start():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    with pytest.raises(ValidationError, match='end_time must be later'):
        EventCreate(title='Invalid event', category='Workshop', venue_id=uuid4(), event_date=start, end_time=start - timedelta(hours=1), capacity=25)

def test_event_update_rejects_end_time_before_start():
    start = datetime(2035, 6, 15, 14, tzinfo=timezone.utc)
    with pytest.raises(ValidationError, match='end_time must be later'):
        EventUpdate(event_date=start, end_time=start - timedelta(hours=1))

def test_naive_event_times_are_interpreted_in_the_application_timezone():
    parsed = parse_datetime('2026-10-17T04:15:00')
    assert parsed.utcoffset() == timedelta(hours=5, minutes=30)
    assert parsed.astimezone(timezone.utc) == datetime(2026, 10, 16, 22, 45, tzinfo=timezone.utc)

def test_event_dates_are_formatted_in_the_application_timezone():
    event_time = datetime(2026, 10, 16, 22, 45, tzinfo=timezone.utc)
    assert format_datetime(event_time) == 'Sat 17 Oct 2026 at 04:15 AM IST'

def test_event_timing_uses_end_time_instead_of_start_date():
    now = datetime(2026, 10, 17, 12, 0, tzinfo=timezone(timedelta(hours=5, minutes=30)))
    ongoing = type('EventStub', (), {
        'event_date': datetime(2026, 10, 17, 9, 0, tzinfo=now.tzinfo),
        'end_time': datetime(2026, 10, 17, 13, 0, tzinfo=now.tzinfo),
    })()
    completed = type('EventStub', (), {
        'event_date': datetime(2026, 10, 17, 9, 0, tzinfo=now.tzinfo),
        'end_time': datetime(2026, 10, 17, 11, 0, tzinfo=now.tzinfo),
    })()
    assert get_event_time_status(ongoing, now) == 'In progress'
    assert get_event_time_status(completed, now) == 'Completed'

def test_feedback_is_rejected_until_the_event_end_time(user_id):
    now = datetime.now(timezone.utc)
    event = type('EventStub', (), {
        'event_id': uuid4(),
        'event_date': now - timedelta(hours=1),
        'end_time': now + timedelta(hours=1),
    })()
    registration = Registration(user_id=user_id, event_id=event.event_id, status='confirmed')
    db = FakeSession({Registration: [registration]})
    with pytest.raises(FeedbackSubmissionError, match='after the event has ended') as exc:
        submit_feedback(db, user_id, event.event_id, 5, None, event)
    assert exc.value.status_code == 400
    assert db.added == []

def test_feedback_rejects_invalid_rating(user_id):
    event_id = uuid4()
    with pytest.raises(FeedbackSubmissionError, match='between 1 and 5'):
        submit_feedback(FakeSession(), user_id, event_id, 6, None)

def test_feedback_schema_accepts_a_decimal_rating():
    result = FeedbackCreate(event_id=uuid4(), rating=4.8)
    assert result.rating == Decimal('4.8')

def test_feedback_schema_rejects_more_than_one_decimal_place():
    with pytest.raises(ValidationError):
        FeedbackCreate(event_id=uuid4(), rating=4.85)

def test_completed_today_query_filters_by_event_end_and_local_day(monkeypatch):
    now = datetime(2026, 10, 17, 12, 0, tzinfo=APP_TIMEZONE)

    class RecordingQuery:
        def __init__(self):
            self.criteria = []

        def filter(self, *criteria):
            self.criteria.extend(criteria)
            return self

        def order_by(self, *_):
            return self

        def all(self):
            return []

    query = RecordingQuery()
    db = type('DbStub', (), {'query': lambda self, *_: query})()
    monkeypatch.setattr(event_service, 'now_local', lambda: now)

    event_service.get_events_by_period(db, 'completed_today')

    sql = [str(clause.compile(dialect=postgresql.dialect())) for clause in query.criteria]
    assert any('coalesce(events.end_time, events.event_date) <=' in clause for clause in sql)
    assert any('coalesce(events.end_time, events.event_date) >=' in clause for clause in sql)
    end_clause = next(clause for clause in query.criteria if 'coalesce' in str(clause) and '<=' in str(clause))
    assert next(iter(end_clause.compile(dialect=postgresql.dialect()).params.values())) == datetime(2026, 10, 17, 6, 30, tzinfo=timezone.utc)

    query.criteria.clear()
    event_service.get_events_by_period(db, 'today')
    today_sql = [str(clause.compile(dialect=postgresql.dialect())) for clause in query.criteria]
    assert any('events.event_date < ' in clause for clause in today_sql)
    assert any('coalesce(events.end_time, events.event_date) >=' in clause for clause in today_sql)

def test_completed_event_feedback_is_created_after_registration_check(user_id, monkeypatch):
    now = datetime.now(timezone.utc)
    event = type('EventStub', (), {
        'event_id': uuid4(),
        'event_date': now - timedelta(hours=2),
        'end_time': now - timedelta(hours=1),
    })()
    registration = Registration(user_id=user_id, event_id=event.event_id, status='confirmed')
    db = FakeSession({Registration: [registration]})
    created = object()
    submitted = {}
    def create_feedback(*args):
        submitted['rating'] = args[3]
        return created
    monkeypatch.setattr(feedback_service, 'create_feedback', create_feedback)
    result = submit_feedback(db, user_id, event.event_id, 4.8, 'Good event', event)
    assert result is created
    assert submitted['rating'] == Decimal('4.8')

def test_admin_automatic_participant_can_leave_feedback(user_id, monkeypatch):
    event_id = uuid4()
    event = type('EventStub', (), {
        'event_id': event_id,
        'event_date': datetime.now(timezone.utc) - timedelta(hours=2),
        'end_time': datetime.now(timezone.utc) - timedelta(hours=1),
    })()
    monkeypatch.setattr(feedback_service, 'create_feedback', lambda *_: object())
    result = submit_feedback(
        FakeSession(),
        user_id,
        event_id,
        Decimal('4.8'),
        'Really helpful.',
        event,
        automatic_participant=True,
    )
    assert result is not None

def test_feedback_tool_reports_decimal_rating(admin_context, monkeypatch):
    from app.services import feedback_service

    event_id = uuid4()
    event = type('EventStub', (), {'event_id': event_id, 'title': 'Ethical Hacking Workshop'})()
    monkeypatch.setattr(event_service, 'get_event_by_id', lambda *_: event)
    submitted = {}
    def submit(*args, **kwargs):
        submitted.update(kwargs)
    monkeypatch.setattr(feedback_service, 'submit_feedback', submit)

    result = submit_event_feedback.invoke({
        'event_id': str(event_id),
        'rating': 4.8,
        'comment': 'Really helpful.',
    })

    assert '4.8/5' in result
    assert submitted['automatic_participant'] is True