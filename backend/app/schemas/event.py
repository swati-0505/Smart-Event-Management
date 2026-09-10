from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: str | None = None
    category: str = Field(..., min_length=2)
    location: str = Field(..., min_length=2)
    event_date: datetime
    registration_deadline: datetime | None = None
    capacity: int = Field(..., gt=0)
    organizer_id: UUID


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    location: str | None = None
    event_date: datetime | None = None
    registration_deadline: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    status: str | None = None


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    category: str
    location: str
    event_date: datetime
    registration_deadline: datetime | None
    capacity: int
    available_seats: int
    organizer_id: UUID
    status: str
    created_at: datetime | None

    model_config = {"from_attributes": True}