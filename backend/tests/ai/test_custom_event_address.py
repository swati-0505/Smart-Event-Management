from datetime import datetime, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.event import EventCreate, EventUpdate


def test_event_create_accepts_a_custom_address_without_a_venue():
    event = EventCreate(
        title='Custom address event',
        category='Workshop',
        address='  123 Main Street, Example City  ',
        event_date=datetime(2035, 6, 15, 14, tzinfo=timezone.utc),
        capacity=25,
    )

    assert event.venue_id is None
    assert event.address == '123 Main Street, Example City'


def test_event_create_requires_a_venue_or_custom_address():
    with pytest.raises(ValidationError, match='Provide either venue_id or a custom address'):
        EventCreate(
            title='Location missing',
            category='Workshop',
            event_date=datetime(2035, 6, 15, 14, tzinfo=timezone.utc),
            capacity=25,
        )


def test_event_create_rejects_both_venue_and_custom_address():
    with pytest.raises(ValidationError, match='Provide either venue_id or a custom address'):
        EventCreate(
            title='Ambiguous location',
            category='Workshop',
            venue_id=uuid4(),
            address='123 Main Street',
            event_date=datetime(2035, 6, 15, 14, tzinfo=timezone.utc),
            capacity=25,
        )


def test_event_update_accepts_a_custom_address():
    update = EventUpdate(address='123 Main Street')

    assert update.address == '123 Main Street'
