from datetime import datetime, timedelta, timezone

from app.core.config import settings


def is_event_completed(
    event_date: datetime | None,
    end_time: datetime | None = None,
    *,
    now: datetime | None = None,
) -> bool:
    if event_date is None:
        return False
    completion_time = end_time or (
        event_date + timedelta(hours=settings.EVENT_DEFAULT_DURATION_HOURS)
    )
    if completion_time.tzinfo is None:
        completion_time = completion_time.replace(tzinfo=timezone.utc)
    else:
        completion_time = completion_time.astimezone(timezone.utc)
    current_time = now or datetime.now(timezone.utc)
    if current_time.tzinfo is None:
        current_time = current_time.replace(tzinfo=timezone.utc)
    else:
        current_time = current_time.astimezone(timezone.utc)
    return completion_time <= current_time
