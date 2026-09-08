import uuid

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String,
        nullable=False
    )

    location = Column(
        String,
        nullable=False
    )

    event_date = Column(
        DateTime(timezone=True),
        nullable=False
    )

    registration_deadline = Column(
        DateTime(timezone=True),
        nullable=True
    )

    capacity = Column(
        Integer,
        nullable=False
    )

    available_seats = Column(
        Integer,
        nullable=False
    )

    organizer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )