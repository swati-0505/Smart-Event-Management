from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.event import Event
from app.models.venue import Venue
DEFAULT_EVENT_DURATION_HOURS = settings.EVENT_DEFAULT_DURATION_HOURS
BLOCKING_STATUSES = ('draft', 'published')

@dataclass
class AvailabilityResult:
    available: bool
    reason: str
    venue_name: str = ''
    venue_capacity: int = 0
    conflicting_events: list[str] = None

    def __post_init__(self) -> None:
        if self.conflicting_events is None:
            self.conflicting_events = []

def check_venue_availability(db: Session, venue_id, requested_time: datetime, duration_hours: float=DEFAULT_EVENT_DURATION_HOURS, required_capacity: int | None=None, requested_end_time: datetime | None=None) -> AvailabilityResult:
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return AvailabilityResult(available=False, reason='Venue not found.')
    if required_capacity is not None and venue.capacity < required_capacity:
        return AvailabilityResult(available=False, reason=f'{venue.name} holds {venue.capacity} people, which is fewer than the {required_capacity} required.', venue_name=venue.name, venue_capacity=venue.capacity)
    if requested_end_time is None:
        requested_end_time = requested_time + timedelta(hours=duration_hours)
    start_utc = requested_time.replace(tzinfo=timezone.utc) if requested_time.tzinfo is None else requested_time.astimezone(timezone.utc)
    end_utc = requested_end_time.replace(tzinfo=timezone.utc) if requested_end_time.tzinfo is None else requested_end_time.astimezone(timezone.utc)
    if end_utc <= start_utc:
        raise ValueError('requested_end_time must be later than requested_time')
    legacy_window_start = start_utc - timedelta(hours=duration_hours)
    conflicts = db.query(Event).filter(Event.venue_id == venue_id, Event.status.in_(BLOCKING_STATUSES), Event.event_date < end_utc, or_(Event.end_time > start_utc, and_(Event.end_time.is_(None), Event.event_date > legacy_window_start))).all()
    if conflicts:
        titles = [event.title for event in conflicts]
        return AvailabilityResult(available=False, reason=f'{venue.name} is already booked around that time by: ' + ', '.join(titles), venue_name=venue.name, venue_capacity=venue.capacity, conflicting_events=titles)
    return AvailabilityResult(available=True, reason=f'{venue.name} is free at that time.', venue_name=venue.name, venue_capacity=venue.capacity)

def find_venues_by_name(db: Session, name: str) -> list[Venue]:
    return db.query(Venue).filter(Venue.name.ilike(f'%{name}%')).all()

def get_registration_by_user_and_event(db: Session, user_id, event_id):
    from app.models.registration import Registration
    return db.query(Registration).filter(Registration.user_id == user_id, Registration.event_id == event_id, Registration.status == 'confirmed').first()