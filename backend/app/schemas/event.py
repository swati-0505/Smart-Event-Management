from datetime import datetime
from datetime import timezone
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator

def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)

class EventCreate(BaseModel):
    title: str
    description: str | None = None
    category: str
    venue_id: UUID
    event_date: datetime
    end_time: datetime | None = None
    registration_deadline: datetime | None = None
    capacity: int = Field(gt=0)
    ticket_price: float = 0.0

    @model_validator(mode='after')
    def end_must_follow_start(self):
        if self.end_time is not None and _as_utc(self.end_time) <= _as_utc(self.event_date):
            raise ValueError('end_time must be later than event_date')
        return self

class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    venue_id: UUID | None = None
    event_date: datetime | None = None
    end_time: datetime | None = None
    registration_deadline: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    status: str | None = None
    ticket_price: float | None = None

    @model_validator(mode='after')
    def end_must_follow_start_when_both_are_given(self):
        if self.event_date is not None and self.end_time is not None and (_as_utc(self.end_time) <= _as_utc(self.event_date)):
            raise ValueError('end_time must be later than event_date')
        return self

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    event_id: UUID
    title: str
    description: str | None
    category: str
    venue_id: UUID
    event_date: datetime
    end_time: datetime | None
    registration_deadline: datetime | None
    capacity: int
    available_seats: int
    created_by: UUID
    status: str
    ticket_price: float = 0.0
    created_at: datetime | None = None