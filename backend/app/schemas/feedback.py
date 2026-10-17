from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class FeedbackCreate(BaseModel):
    event_id: UUID
    rating: Decimal = Field(ge=1, le=5, decimal_places=1)
    comment: str | None = Field(default=None, max_length=2000)

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    feedback_id: UUID
    user_id: UUID
    event_id: UUID
    rating: Decimal
    comment: str | None
    created_at: datetime | None = None