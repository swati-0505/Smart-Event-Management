"""
Registration tools: register_participant, cancel_registration, my_registrations.

Security note. None of these take a user_id. The user being registered is
always the authenticated caller, read from the ToolContext. If user_id were a
tool argument, the model could be talked into putting someone else's id there
by a user who simply asks it to - "register bob@example.com for me" - and the
tool would comply. Identity comes from the JWT, never from the conversation.

The capacity, duplicate-registration and event-exists checks all live in
registration_service.create_registration(), which raises ValueError. We catch
that and turn it into a sentence the agent can relay, because an unhandled
exception here would abort the whole turn.
"""

from __future__ import annotations

from langchain_core.tools import tool

from app.services import availability_service, event_service, registration_service
from app.tools.context import get_tool_context
from app.tools.formatting import format_datetime, parse_uuid


@tool
def register_participant(event_id: str) -> str:
    """Register the current user for an event.

    Find the event with search_events first to get its event_id. The service
    rejects the call if the event is full or the user is already registered.

    Args:
        event_id: UUID of the event to register for.
    """
    context = get_tool_context()
    db = context.db

    event_uuid = parse_uuid(event_id, "event_id")
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f"No event exists with id {event_id}."

    if event.status == "cancelled":
        return f"'{event.title}' has been cancelled, so registration is closed."
    if event.status != "published":
        return f"'{event.title}' is not open for registration yet."

    try:
        registration = registration_service.create_registration(
            db=db,
            user_id=context.user_id,
            event_id=event_uuid,
        )
    except ValueError as exc:

        return f"Could not register: {exc}"

    return (
        f"Registered for '{event.title}' on {format_datetime(event.event_date)}. "
        f"Registration id: {registration.registration_id}. "
        f"{event.available_seats} seat(s) remain."
    )


@tool
def cancel_registration(event_id: str) -> str:
    """Cancel the current user's registration for an event.

    This frees the seat for someone else. Point the user at the cancellation
    policy with search_event_policy if they ask about refunds or deadlines.

    Args:
        event_id: UUID of the event to withdraw from.
    """
    context = get_tool_context()
    db = context.db

    event_uuid = parse_uuid(event_id, "event_id")
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f"No event exists with id {event_id}."

    registration = availability_service.get_registration_by_user_and_event(
        db=db,
        user_id=context.user_id,
        event_id=event_uuid,
    )
    if not registration:
        return f"You do not have an active registration for '{event.title}'."

    registration_service.cancel_registration(db, registration.registration_id)

    return (
        f"Cancelled your registration for '{event.title}'. The seat has been "
        f"released. Refund terms depend on the cancellation policy."
    )


@tool
def my_registrations() -> str:
    """List the events the current user is registered for.

    Use this when the user asks what they have signed up for, or before
    cancelling, to confirm which registration they mean.
    """
    context = get_tool_context()
    db = context.db

    registrations = registration_service.get_user_registrations(db, context.user_id)
    active = [r for r in registrations if r.status == "confirmed"]

    if not active:
        return "You are not registered for any events."

    lines = []
    for registration in active:
        event = event_service.get_event_by_id(db, registration.event_id)
        if not event:
            continue
        lines.append(
            f"- {event.title} (event_id: {event.event_id}) on "
            f"{format_datetime(event.event_date)} | status: {event.status}"
        )

    return f"You are registered for {len(lines)} event(s):\n" + "\n".join(lines)


@tool
def get_event_registrations(event_id: str) -> str:
    """Show how many people are registered for an event. Administrators only.

    Args:
        event_id: UUID of the event.
    """
    from app.tools.context import require_admin

    context = require_admin("view an event's registration list")
    db = context.db

    event_uuid = parse_uuid(event_id, "event_id")
    event = event_service.get_event_by_id(db, event_uuid)
    if not event:
        return f"No event exists with id {event_id}."

    registrations = registration_service.get_event_registrations(db, event_uuid)
    confirmed = [r for r in registrations if r.status == "confirmed"]
    cancelled = len(registrations) - len(confirmed)

    return (
        f"'{event.title}': {len(confirmed)} confirmed registration(s), "
        f"{cancelled} cancelled. {event.available_seats} of {event.capacity} "
        f"seats still open."
    )
