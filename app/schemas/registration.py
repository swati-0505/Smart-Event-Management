from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RegistrationCreate(BaseModel):
    user_id: UUID
    event_id: UUID


class RegistrationResponse(BaseModel):
    id: UUID = Field(validation_alias="registration_id")
    event_id: UUID
    user_id: UUID
    status: str
    registered_at: datetime | None = Field(
        default=None,
        validation_alias="registration_date",
    )
    cancelled_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)