"""
Formatting helpers for tool output.

Tools return strings, not objects, because the string goes straight back into
the model's context. That makes formatting a correctness concern, not a
cosmetic one:

  * Always include the event_id. The model needs it to chain a search into a
    registration without inventing one.
  * Say "no results" explicitly. An empty string reads as a failure and the
    model will retry the same call or apologise for an error that did not
    happen.
  * Keep it compact. Every token here is a token of context.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID


def format_datetime(value: datetime | None) -> str:
    if not value:
        return "unspecified"
    return value.strftime("%a %d %b %Y at %I:%M %p")


def format_event(event, venue_name: str | None = None, detailed: bool = False) -> str:
    """One event as a single line, or a block when detailed."""
    lines = [
        f"- {event.title} (event_id: {event.event_id})",
        f"  Category: {event.category}",
        f"  When: {format_datetime(event.event_date)}",
        f"  Seats left: {event.available_seats} of {event.capacity}",
        f"  Status: {event.status}",
    ]
    if venue_name:
        lines.insert(2, f"  Venue: {venue_name}")
    if detailed:
        if event.description:
            lines.append(f"  Description: {event.description}")
        if event.registration_deadline:
            lines.append(
                f"  Registration closes: {format_datetime(event.registration_deadline)}"
            )
    return "\n".join(lines)


def format_event_list(events, venue_names: dict | None = None, limit: int = 10) -> str:
    """A list of events, truncated with a note so the model knows more exist."""
    if not events:
        return "No events matched."

    venue_names = venue_names or {}
    shown = events[:limit]
    blocks = [
        format_event(event, venue_name=venue_names.get(event.venue_id))
        for event in shown
    ]

    body = "\n".join(blocks)
    if len(events) > limit:
        body += f"\n({len(events) - limit} more not shown - narrow the search.)"
    return f"Found {len(events)} event(s):\n{body}"


def parse_uuid(value: str, field_name: str = "id") -> UUID:
    """
    Convert a string to a UUID with an error the model can act on.

    LLMs hallucinate ids under pressure. A clear message lets the agent
    recover by searching first, rather than failing the whole turn.
    """
    try:
        return UUID(str(value).strip())
    except (ValueError, AttributeError, TypeError):
        raise ValueError(
            f"'{value}' is not a valid {field_name}. "
            f"Use search_events to look up the real id first - do not guess it."
        )


def parse_datetime(value: str) -> datetime:
    """Parse common datetime formats the model is likely to emit."""
    text = str(value).strip().replace("Z", "+00:00")

    try:
        return datetime.fromisoformat(text)
    except ValueError:
        pass

    for pattern in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y %H:%M"):
        try:
            return datetime.strptime(text, pattern)
        except ValueError:
            continue

    raise ValueError(
        f"Could not read '{value}' as a date and time. "
        f"Use ISO format, for example 2026-03-15T14:30:00."
    )
