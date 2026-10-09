from __future__ import annotations
from langchain_core.tools import tool
from app.services import availability_service, venue_service
from app.tools.context import get_tool_context
from app.tools.formatting import format_datetime, parse_datetime, parse_uuid

@tool
def search_venues(name: str='') -> str:
    """Search for available venues by name or list all venues."""
    db = get_tool_context().db
    venues = availability_service.find_venues_by_name(db, name) if name else venue_service.get_all_venues(db)
    if not venues:
        return f"No venues matched '{name}'." if name else 'No venues are set up yet.'
    lines = [f'- {venue.name} (venue_id: {venue.venue_id}) | capacity {venue.capacity} | {venue.address}, {venue.city}' for venue in venues[:15]]
    return f'Found {len(venues)} venue(s):\n' + '\n'.join(lines)

@tool
def check_venue_availability(venue_id: str, requested_time: str, required_capacity: int=0, requested_end_time: str='') -> str:
    """Check if a venue is available at the specified date and time."""
    db = get_tool_context().db
    when = parse_datetime(requested_time)
    result = availability_service.check_venue_availability(db=db, venue_id=parse_uuid(venue_id, 'venue_id'), requested_time=when, required_capacity=required_capacity or None, requested_end_time=parse_datetime(requested_end_time) if requested_end_time else None)
    status = 'AVAILABLE' if result.available else 'NOT AVAILABLE'
    message = f'{status}: {result.reason}'
    if result.available and result.venue_capacity:
        message += f' Capacity is {result.venue_capacity}.'
    return f'{message} (checked for {format_datetime(when)})'