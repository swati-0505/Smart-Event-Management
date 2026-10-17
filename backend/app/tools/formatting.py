from __future__ import annotations
from datetime import datetime
from uuid import UUID

from app.core.time import as_local, now_local

def format_datetime(value: datetime | None) -> str:
    if not value:
        return 'unspecified'
    return as_local(value).strftime('%a %d %b %Y at %I:%M %p %Z')

def get_event_time_status(event, now: datetime | None=None) -> str:
    current = as_local(now) if now else now_local()
    start = as_local(event.event_date)
    end = as_local(getattr(event, 'end_time', None) or event.event_date)
    if end <= current:
        return 'Completed'
    if start <= current:
        return 'In progress'
    return 'Upcoming'

def format_event(event, venue_name: str | None=None, detailed: bool=False) -> str:
    lines = [f'- {event.title} (event_id: {event.event_id})', f'  Category: {event.category}', f'  When: {format_datetime(event.event_date)}' + (f' - {format_datetime(event.end_time)}' if getattr(event, 'end_time', None) else ''), f'  Timing: {get_event_time_status(event)}', f'  Seats left: {event.available_seats} of {event.capacity}', f'  Status: {event.status}']
    if venue_name:
        lines.insert(2, f'  Venue: {venue_name}')
    if detailed:
        if event.description:
            lines.append(f'  Description: {event.description}')
        if event.registration_deadline:
            lines.append(f'  Registration closes: {format_datetime(event.registration_deadline)}')
    return '\n'.join(lines)

def format_event_list(events, venue_names: dict | None=None, limit: int=10) -> str:
    if not events:
        return 'No events matched.'
    venue_names = venue_names or {}
    shown = events[:limit]
    blocks = [format_event(event, venue_name=venue_names.get(event.venue_id)) for event in shown]
    body = '\n'.join(blocks)
    if len(events) > limit:
        body += f'\n({len(events) - limit} more not shown - narrow the search.)'
    return f'Found {len(events)} event(s):\n{body}'

def parse_uuid(value: str, field_name: str='id') -> UUID:
    try:
        return UUID(str(value).strip())
    except (ValueError, AttributeError, TypeError):
        raise ValueError(f"'{value}' is not a valid {field_name}. Use search_events to look up the real id first - do not guess it.")

def parse_datetime(value: str) -> datetime:
    text = str(value).strip().replace('Z', '+00:00')
    try:
        return as_local(datetime.fromisoformat(text))
    except ValueError:
        pass
    for pattern in ('%Y-%m-%d %H:%M', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d/%m/%Y %H:%M'):
        try:
            return as_local(datetime.strptime(text, pattern))
        except ValueError:
            continue
    raise ValueError(f"Could not read '{value}' as a date and time. Use ISO format, for example 2026-03-15T14:30:00.")