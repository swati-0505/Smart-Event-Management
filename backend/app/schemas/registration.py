from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RegistrationCreate(BaseModel):
    user_id: UUID
    event_id: UUID


class RegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    status: str
    registered_at: datetime | None
    cancelled_at: datetime | None

    model_config = {
        "from_attributes": True
    }