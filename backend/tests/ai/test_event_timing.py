from datetime import datetime, timedelta, timezone
from uuid import uuid4
import pytest
from pydantic import ValidationError
from app.schemas.event import EventCreate, EventUpdate

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