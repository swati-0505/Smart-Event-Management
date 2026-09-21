"""
Venue availability.

The roadmap requires a check_venue_availability() tool, but no service
function existed for it - the other services cover CRUD only. Adding it here,
in the service layer, keeps the rule from section 10 intact: tools call
services, services touch the database, the LLM touches neither.

"Available" means two things, and both matter:
  1. No other event is already booked at that venue in the time window.
  2. The venue is physically big enough for the expected attendance.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.venue import Venue




DEFAULT_EVENT_DURATION_HOURS = 3


BLOCKING_STATUSES = ("draft", "published")


@dataclass
class AvailabilityResult:
    available: bool
    reason: str
    venue_name: str = ""
    venue_capacity: int = 0
    conflicting_events: list[str] = None

    def __post_init__(self) -> None:
        if self.conflicting_events is None:
            self.conflicting_events = []


def check_venue_availability(
    db: Session,
    venue_id,
    requested_time: datetime,
    duration_hours: int = DEFAULT_EVENT_DURATION_HOURS,
    required_capacity: int | None = None,
) -> AvailabilityResult:
    """Check whether a venue is free and large enough at a given time."""
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return AvailabilityResult(available=False, reason="Venue not found.")

    if required_capacity is not None and venue.capacity < required_capacity:
        return AvailabilityResult(
            available=False,
            reason=(
                f"{venue.name} holds {venue.capacity} people, "
                f"which is fewer than the {required_capacity} required."
            ),
            venue_name=venue.name,
            venue_capacity=venue.capacity,
        )

    window_start = requested_time - timedelta(hours=duration_hours)
    window_end = requested_time + timedelta(hours=duration_hours)

    conflicts = (
        db.query(Event)
        .filter(
            Event.venue_id == venue_id,
            Event.status.in_(BLOCKING_STATUSES),
            Event.event_date > window_start,
            Event.event_date < window_end,
        )
        .all()
    )

    if conflicts:
        titles = [event.title for event in conflicts]
        return AvailabilityResult(
            available=False,
            reason=(
                f"{venue.name} is already booked around that time by: "
                + ", ".join(titles)
            ),
            venue_name=venue.name,
            venue_capacity=venue.capacity,
            conflicting_events=titles,
        )

    return AvailabilityResult(
        available=True,
        reason=f"{venue.name} is free at that time.",
        venue_name=venue.name,
        venue_capacity=venue.capacity,
    )


def find_venues_by_name(db: Session, name: str) -> list[Venue]:
    """
    Resolve a venue name to venue records.

    Users say "Main Auditorium", not a UUID, so the agent needs a lookup step
    before it can call check_venue_availability.
    """
    return db.query(Venue).filter(Venue.name.ilike(f"%{name}%")).all()


def get_registration_by_user_and_event(db: Session, user_id, event_id):
    """
    Find a user's registration for a specific event.

    registration_service.cancel_registration() takes a registration_id, but
    users refer to events, not registration ids. This bridges the two without
    modifying the existing service.
    """
    from app.models.registration import Registration

    return (
        db.query(Registration)
        .filter(
            Registration.user_id == user_id,
            Registration.event_id == event_id,
            Registration.status == "confirmed",
        )
        .first()
    )
