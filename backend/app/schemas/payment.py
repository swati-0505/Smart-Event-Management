from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    user_id: UUID
    event_id: UUID
    amount: float = Field(gt=0)
    currency: str = "INR"
    transaction_id: str | None = None


class PaymentStatusUpdate(BaseModel):
    payment_status: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: UUID
    user_id: UUID
    event_id: UUID
    amount: float
    currency: str
    payment_status: str
    transaction_id: str | None
    created_at: datetime | None = None