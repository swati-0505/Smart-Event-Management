import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
class Registration(Base):
    __tablename__ = "registrations"
    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_user_event_registration"),
    )
    registration_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.event_id"), nullable=False)
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="confirmed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())