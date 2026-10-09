from __future__ import annotations
from langchain_core.tools import tool
from app.services import availability_service, event_service, registration_service
from app.tools.context import get_tool_context
from app.tools.formatting import format_datetime, parse_uuid

@tool
def register_participant(event_id: str) -> str:
    """Register the current authenticated user for an event."""
    context = get_tool_context()
    db = context.db
    event_uuid = parse_uuid(event_id, 'event_id')
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f'No event exists with id {event_id}.'
    if event.status == 'cancelled':
        return f"'{event.title}' has been cancelled, so registration is closed."
    if event.status != 'published':
        return f"'{event.title}' is not open for registration yet."
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    event_dt = event.event_date
    if event_dt:
        if event_dt.tzinfo is None:
            event_dt = event_dt.replace(tzinfo=timezone.utc)
        else:
            event_dt = event_dt.astimezone(timezone.utc)
        if event_dt < now:
            formatted_date = format_datetime(event.event_date)
            return f'This event has already been completed on {formatted_date}, so I cannot register you for it.'
    try:
        registration = registration_service.create_registration(db=db, user_id=context.user_id, event_id=event_uuid)
    except ValueError as exc:
        return f'Could not register: {exc}'
    return f"Registered for '{event.title}' on {format_datetime(event.event_date)}. Registration id: {registration.registration_id}. {event.available_seats} seat(s) remain."

@tool
def cancel_registration(event_id: str) -> str:
    """Cancel the current user's registration for an event."""
    context = get_tool_context()
    db = context.db
    event_uuid = parse_uuid(event_id, 'event_id')
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f'No event exists with id {event_id}.'
    registration = availability_service.get_registration_by_user_and_event(db=db, user_id=context.user_id, event_id=event_uuid)
    if not registration:
        return f"You do not have an active registration for '{event.title}'."
    registration_service.cancel_registration(db, registration.registration_id)
    return f"Cancelled your registration for '{event.title}'. The seat has been released. Refund terms depend on the cancellation policy."

@tool
def my_registrations() -> str:
    """List all events the current user is registered for."""
    context = get_tool_context()
    db = context.db
    registrations = registration_service.get_user_registrations(db, context.user_id)
    active = [r for r in registrations if r.status == 'confirmed']
    if not active:
        return 'You are not registered for any events.'
    lines = []
    for registration in active:
        event = event_service.get_event_by_id(db, registration.event_id)
        if not event:
            continue
        lines.append(f'- {event.title} (event_id: {event.event_id}) on {format_datetime(event.event_date)} | status: {event.status}')
    return f'You are registered for {len(lines)} event(s):\n' + '\n'.join(lines)

@tool
def get_event_registrations(event_id: str) -> str:
    """Get the registration list and stats for an event (Admin only)."""
    from app.tools.context import require_admin
    context = require_admin("view an event's registration list")
    db = context.db
    event_uuid = parse_uuid(event_id, 'event_id')
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f'No event exists with id {event_id}.'
    registrations = registration_service.get_event_registrations(db, event_uuid)
    confirmed = [r for r in registrations if r.status == 'confirmed']
    cancelled = len(registrations) - len(confirmed)
    return f"'{event.title}': {len(confirmed)} confirmed registration(s), {cancelled} cancelled. {event.available_seats} of {event.capacity} seats still open."