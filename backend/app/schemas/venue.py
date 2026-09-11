from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VenueCreate(BaseModel):
    name: str
    address: str
    city: str
    capacity: int


class VenueUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    capacity: int | None = None


class VenueResponse(BaseModel):
    venue_id: UUID
    name: str
    address: str
    city: str
    capacity: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)