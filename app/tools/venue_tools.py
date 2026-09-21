"""
Venue tools: check_venue_availability, plus a search_venues helper.

search_venues is not in the roadmap's list of nine, but check_venue_availability
takes a venue_id and users say "the Main Auditorium". Without a name-to-id
lookup the agent has only one way to produce that id, which is to invent it.
Adding the lookup is cheaper than debugging hallucinated UUIDs.
"""

from __future__ import annotations

from langchain_core.tools import tool

from app.services import availability_service, venue_service
from app.tools.context import get_tool_context
from app.tools.formatting import format_datetime, parse_datetime, parse_uuid


@tool
def search_venues(name: str = "") -> str:
    """Find venues by name, or list all venues if no name is given.

    Use this to get a venue_id before calling check_venue_availability or
    create_event.

    Args:
        name: Part of the venue name, e.g. "auditorium".
    """
    db = get_tool_context().db

    venues = (
        availability_service.find_venues_by_name(db, name)
        if name
        else venue_service.get_all_venues(db)
    )

    if not venues:
        return f"No venues matched '{name}'." if name else "No venues are set up yet."

    lines = [
        f"- {venue.name} (venue_id: {venue.venue_id}) | "
        f"capacity {venue.capacity} | {venue.address}, {venue.city}"
        for venue in venues[:15]
    ]
    return f"Found {len(venues)} venue(s):\n" + "\n".join(lines)


@tool
def check_venue_availability(
    venue_id: str,
    requested_time: str,
    required_capacity: int = 0,
) -> str:
    """Check whether a venue is free at a given time and big enough.

    Call this before create_event. It reports both scheduling conflicts with
    other events and whether the venue can hold the expected attendance.

    Args:
        venue_id: UUID of the venue, from search_venues.
        requested_time: ISO datetime to check, e.g. 2026-03-15T14:30:00.
        required_capacity: Expected number of attendees. 0 skips the size check.
    """
    db = get_tool_context().db

    when = parse_datetime(requested_time)
    result = availability_service.check_venue_availability(
        db=db,
        venue_id=parse_uuid(venue_id, "venue_id"),
        requested_time=when,
        required_capacity=required_capacity or None,
    )

    status = "AVAILABLE" if result.available else "NOT AVAILABLE"
    message = f"{status}: {result.reason}"

    if result.available and result.venue_capacity:
        message += f" Capacity is {result.venue_capacity}."

    return f"{message} (checked for {format_datetime(when)})"
