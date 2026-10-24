import uuid
from sqlalchemy import CheckConstraint, Column, String, Text, Integer, DateTime, ForeignKey, Numeric, func, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class Event(Base):
    __tablename__ = 'events'
    __table_args__ = (CheckConstraint('end_time IS NULL OR end_time > event_date', name='ck_events_end_time_after_start'), Index('idx_events_venue_id', 'venue_id'), Index('idx_events_event_date', 'event_date'), Index('idx_events_created_by', 'created_by'), Index('idx_events_status', 'status'))
    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    venue_id = Column(UUID(as_uuid=True), ForeignKey('venues.venue_id'), nullable=True)
    address = Column(Text, nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    registration_deadline = Column(DateTime(timezone=True), nullable=True)
    capacity = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    status = Column(String, nullable=False, default='draft')
    ticket_price = Column(Numeric(10, 2), nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())