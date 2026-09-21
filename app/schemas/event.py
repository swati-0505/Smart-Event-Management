from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
class EventCreate(BaseModel):
    title: str
    description: str | None = None
    category: str
    venue_id: UUID
    event_date: datetime
    registration_deadline: datetime | None = None
    capacity: int = Field(gt=0)
class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    venue_id: UUID | None = None
    event_date: datetime | None = None
    registration_deadline: datetime | None = None
    capacity: int | None = Field(default=None, gt=0)
    status: str | None = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    event_id: UUID
    title: str
    description: str | None
    category: str
    venue_id: UUID
    event_date: datetime
    registration_deadline: datetime | None
    capacity: int
    available_seats: int
    created_by: UUID
    status: str
    created_at: datetime | None = None