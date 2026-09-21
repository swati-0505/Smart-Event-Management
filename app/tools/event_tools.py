"""
Event tools.

Five of the nine tools in section 10: search_events, get_event_details,
create_event, update_event, cancel_event.

Every one of these is a thin wrapper. The rule from section 10 of the roadmap
is that the LLM never touches PostgreSQL - it calls a tool, the tool calls a
service, the service runs the query. No SQL in this file, and none in any of
the other tool modules.

Docstrings are load-bearing. LangChain sends them to the model as the tool
description, so they are the only thing telling the agent when to reach for
this tool instead of another one.
"""

from __future__ import annotations

from langchain_core.tools import tool

from app.models.venue import Venue
from app.services import event_service
from app.tools.context import get_tool_context, require_admin
from app.tools.formatting import (
    format_event,
    format_event_list,
    parse_datetime,
    parse_uuid,
)


def _venue_names(db, events) -> dict:
    """Fetch venue names for a set of events in one query rather than N."""
    venue_ids = {event.venue_id for event in events if event.venue_id}
    if not venue_ids:
        return {}
    rows = db.query(Venue).filter(Venue.venue_id.in_(venue_ids)).all()
    return {venue.venue_id: venue.name for venue in rows}


@tool
def search_events(
    keyword: str = "",
    category: str = "",
    city: str = "",
    only_with_seats: bool = False,
) -> str:
    """Search published events by keyword, category, or city.

    Use this whenever the user asks what events exist, or before registering
    someone, to find the event_id. All filters are optional; with none set it
    returns upcoming published events.

    Args:
        keyword: Words to match in the event title, e.g. "AI workshop".
        category: Event category, e.g. "workshop", "seminar".
        city: City the venue is in, e.g. "Hyderabad".
        only_with_seats: If true, exclude events that are already full.
    """
    context = get_tool_context()
    db = context.db


    if keyword:
        events = event_service.search_events_by_title(db, keyword)
    elif category:
        events = event_service.search_events_by_category(db, category)
    elif city:
        events = event_service.get_events_by_city(db, city)
    elif only_with_seats:
        events = event_service.get_events_with_available_seats(db)
    else:
        events = event_service.get_upcoming_events(db)



    if category and not (keyword == "" and city == ""):
        events = [e for e in events if category.lower() in (e.category or "").lower()]
    if only_with_seats:
        events = [e for e in events if e.available_seats > 0]

    if not events:
        return (
            "No events matched those filters. "
            "Try a broader search or a different keyword."
        )

    return format_event_list(events, venue_names=_venue_names(db, events))


@tool
def get_event_details(event_id: str) -> str:
    """Get full details for one event, including venue and seat availability.

    Use after search_events when the user asks about a specific event.

    Args:
        event_id: The event's UUID, taken from a previous search_events result.
    """
    context = get_tool_context()
    db = context.db

    event = event_service.get_event_by_id(db, parse_uuid(event_id, "event_id"))
    if not event:
        return f"No event exists with id {event_id}."

    venue = db.query(Venue).filter(Venue.venue_id == event.venue_id).first()
    details = format_event(event, venue_name=venue.name if venue else None, detailed=True)

    if venue:
        details += f"\n  Address: {venue.address}, {venue.city}"
    return details


@tool
def create_event(
    title: str,
    category: str,
    venue_id: str,
    event_date: str,
    capacity: int,
    description: str = "",
    registration_deadline: str = "",
) -> str:
    """Create a new event. Administrators only.

    Check venue availability with check_venue_availability before calling this,
    so you do not double-book a venue.

    Args:
        title: Event name.
        category: Event category, e.g. "workshop".
        venue_id: UUID of the venue, from search_venues.
        event_date: Start date and time in ISO format, e.g. 2026-03-15T14:30:00.
        capacity: Maximum number of participants.
        description: Optional longer description.
        registration_deadline: Optional ISO datetime when registration closes.
    """

    context = require_admin("create events")

    if capacity <= 0:
        return "Capacity must be a positive number."

    event = event_service.create_event(
        db=context.db,
        title=title,
        description=description or None,
        category=category,
        venue_id=parse_uuid(venue_id, "venue_id"),
        event_date=parse_datetime(event_date),
        registration_deadline=(
            parse_datetime(registration_deadline) if registration_deadline else None
        ),
        capacity=capacity,
        created_by=context.user_id,
    )

    return (
        f"Created '{event.title}' (event_id: {event.event_id}) "
        f"for {capacity} people. It is in draft status and is not yet visible "
        f"to users - publish it with update_event when ready."
    )


@tool
def update_event(
    event_id: str,
    title: str = "",
    description: str = "",
    category: str = "",
    event_date: str = "",
    capacity: int = 0,
    status: str = "",
) -> str:
    """Update an existing event. Administrators only.

    Only the fields you pass are changed. Use status="published" to make a
    draft event visible to users.

    Args:
        event_id: UUID of the event to update.
        title: New title, if changing.
        description: New description, if changing.
        category: New category, if changing.
        event_date: New ISO datetime, if changing.
        capacity: New capacity, if changing. Must not be below current bookings.
        status: One of "draft", "published", "cancelled".
    """
    context = require_admin("update events")
    db = context.db

    event_uuid = parse_uuid(event_id, "event_id")
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f"No event exists with id {event_id}."

    if status and status not in ("draft", "published", "cancelled"):
        return "Status must be one of: draft, published, cancelled."

    updates: dict = {}
    if title:
        updates["title"] = title
    if description:
        updates["description"] = description
    if category:
        updates["category"] = category
    if event_date:
        updates["event_date"] = parse_datetime(event_date)
    if status:
        updates["status"] = status

    if capacity:
        booked = event.capacity - event.available_seats
        if capacity < booked:
            return (
                f"Cannot reduce capacity to {capacity}: {booked} people are "
                f"already registered."
            )

        updates["capacity"] = capacity
        updates["available_seats"] = capacity - booked

    if not updates:
        return "No changes were given, so nothing was updated."

    updated = event_service.update_event(db, event_uuid, **updates)
    return (
        f"Updated '{updated.title}'. Changed: {', '.join(sorted(updates))}."
    )


@tool
def cancel_event(event_id: str, reason: str = "") -> str:
    """Cancel an event. Administrators only.

    This sets the event's status to "cancelled" rather than deleting it, so
    the registration history is preserved for reporting.

    Args:
        event_id: UUID of the event to cancel.
        reason: Optional reason, recorded in the description.
    """
    context = require_admin("cancel events")
    db = context.db

    event_uuid = parse_uuid(event_id, "event_id")
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f"No event exists with id {event_id}."

    if event.status == "cancelled":
        return f"'{event.title}' is already cancelled."

    registered = event.capacity - event.available_seats

    updates = {"status": "cancelled"}
    if reason:
        updates["description"] = (
            f"{event.description or ''}\n\n[CANCELLED] {reason}".strip()
        )

    event_service.update_event(db, event_uuid, **updates)

    return (
        f"Cancelled '{event.title}'. "
        f"{registered} registered participant(s) are affected and should be notified."
    )
