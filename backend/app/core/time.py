from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.core.config import settings

APP_TIMEZONE = ZoneInfo(settings.APP_TIMEZONE)


def now_local() -> datetime:
    return datetime.now(APP_TIMEZONE)


def as_local(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=APP_TIMEZONE)
    return value.astimezone(APP_TIMEZONE)


def as_utc(value: datetime) -> datetime:
    return as_local(value).astimezone(timezone.utc)
