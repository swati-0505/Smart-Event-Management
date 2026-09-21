import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_user_event_feedback"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_feedback_rating_range"),
    )
    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.event_id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False, index=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())