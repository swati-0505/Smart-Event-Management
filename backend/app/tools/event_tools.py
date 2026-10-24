from __future__ import annotations
from langchain_core.tools import tool
from app.models.venue import Venue
from app.services import event_service
from app.tools.context import get_tool_context, require_admin
from app.tools.formatting import format_event, format_event_list, parse_datetime, parse_uuid

def _venue_names(db, events) -> dict:
    venue_ids = {event.venue_id for event in events if event.venue_id}
    if not venue_ids:
        return {}
    rows = db.query(Venue).filter(Venue.venue_id.in_(venue_ids)).all()
    return {venue.venue_id: venue.name for venue in rows}

@tool
def search_events(keyword: str='', category: str='', city: str='', only_with_seats: bool=False) -> str:
    """Search for events matching keyword, category, city, or seat availability."""
    context = get_tool_context()
    db = context.db
    if context.is_admin:
        events = event_service.get_all_events(db, actor_id=context.user_id)
        if keyword:
            events = [event for event in events if keyword.lower() in (event.title or '').lower()]
        if category:
            events = [event for event in events if category.lower() in (event.category or '').lower()]
        if city:
            city_by_venue = {
                venue.venue_id: venue.city
                for venue in db.query(Venue).all()
            }
            events = [
                event for event in events
                if city.lower() in (city_by_venue.get(event.venue_id) or '').lower()
            ]
        if only_with_seats:
            events = [event for event in events if event.available_seats > 0]
    elif keyword:
        events = event_service.search_events_by_title(db, keyword)
    elif category:
        events = event_service.search_events_by_category(db, category)
    elif city:
        events = event_service.get_events_by_city(db, city)
    elif only_with_seats:
        events = event_service.get_events_with_available_seats(db)
    else:
        events = event_service.get_upcoming_events(db)
    if not context.is_admin and category and (not (keyword == '' and city == '')):
        events = [e for e in events if category.lower() in (e.category or '').lower()]
    if only_with_seats:
        events = [e for e in events if e.available_seats > 0]
    if not events:
        return 'No events matched those filters. Try a broader search or a different keyword.'
    return format_event_list(events, venue_names=_venue_names(db, events))

@tool
def get_event_details(event_id: str) -> str:
    """Retrieve detailed information about a specific event by its ID."""
    context = get_tool_context()
    db = context.db
    event = event_service.get_event_by_id(db, parse_uuid(event_id, 'event_id'), actor_id=context.user_id)
    if not event or (event.status != 'published' and not context.is_admin):
        return f'No event exists with id {event_id}.'
    venue = db.query(Venue).filter(Venue.venue_id == event.venue_id).first()
    details = format_event(event, venue_name=venue.name if venue else None, detailed=True)
    if venue:
        details += f'\n  Address: {venue.address}, {venue.city}'
    return details

@tool
def create_event(title: str, category: str, venue_id: str, event_date: str, capacity: int, end_time: str='', description: str='', registration_deadline: str='') -> str:
    """Create a new event in draft status (Admin only)."""
    context = require_admin('create events')
    if capacity <= 0:
        return 'Capacity must be a positive number.'
    event = event_service.create_event(db=context.db, title=title, description=description or None, category=category, venue_id=parse_uuid(venue_id, 'venue_id'), event_date=parse_datetime(event_date), end_time=parse_datetime(end_time) if end_time else None, registration_deadline=parse_datetime(registration_deadline) if registration_deadline else None, capacity=capacity, actor_id=context.user_id)
    return f"Created '{event.title}' (event_id: {event.event_id}) for {capacity} people. It is in draft status and is not yet visible to users - publish it with update_event when ready."

@tool
def update_event(event_id: str, title: str='', description: str='', category: str='', event_date: str='', end_time: str='', capacity: int=0, status: str='') -> str:
    """Update details or status of an existing event (Admin only)."""
    context = require_admin('update events')
    db = context.db
    event_uuid = parse_uuid(event_id, 'event_id')
    event = event_service.get_event_by_id(db, event_uuid, actor_id=context.user_id)
    if not event or (event.status != 'published' and not context.is_admin):
        return f'No event exists with id {event_id}.'
    if status and status not in ('draft', 'published', 'cancelled'):
        return 'Status must be one of: draft, published, cancelled.'
    updates: dict = {}
    if title:
        updates['title'] = title
    if description:
        updates['description'] = description
    if category:
        updates['category'] = category
    if event_date:
        updates['event_date'] = parse_datetime(event_date)
    if end_time:
        updates['end_time'] = parse_datetime(end_time)
    if status:
        updates['status'] = status
    if capacity:
        booked = event.capacity - event.available_seats
        if capacity < booked:
            return f'Cannot reduce capacity to {capacity}: {booked} people are already registered.'
        updates['capacity'] = capacity
        updates['available_seats'] = capacity - booked
    if not updates:
        return 'No changes were given, so nothing was updated.'
    try:
        updated = event_service.update_event(db, event_uuid, actor_id=context.user_id, **updates)
    except ValueError as exc:
        return str(exc)
    return f"Updated '{updated.title}'. Changed: {', '.join(sorted(updates))}."

@tool
def cancel_event(event_id: str, reason: str='') -> str:
    """Cancel an existing event and notify affected registrants; admin-only operation required."""
    context = require_admin('cancel events')
    db = context.db
    event_uuid = parse_uuid(event_id, 'event_id')
    event = event_service.get_event_by_id(db, event_uuid, actor_id=context.user_id)
    if not event:
        return f'No event exists with id {event_id}.'
    if event.status == 'cancelled':
        return f"'{event.title}' is already cancelled."
    registered = event.capacity - event.available_seats
    updates = {'status': 'cancelled'}
    if reason:
        updates['description'] = f"{event.description or ''}\n\n[CANCELLED] {reason}".strip()
    event_service.update_event(db, event_uuid, actor_id=context.user_id, **updates)
    return f"Cancelled '{event.title}'. {registered} registered participant(s) are affected and should be notified."

@tool
def delete_event(event_id: str) -> str:
    """Permanently delete an event by ID after explicit administrator confirmation."""
    context = require_admin('delete events')
    event_uuid = parse_uuid(event_id, 'event_id')
    try:
        event = event_service.delete_event(
            context.db,
            event_uuid,
            actor_id=context.user_id,
        )
    except event_service.EventDeletionConflict as exc:
        return str(exc)
    if not event:
        return f'No event exists with id {event_id}.'
    return f"Permanently deleted event '{event.title}'."