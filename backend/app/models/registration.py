import uuid

from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.database import Base


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    event_id = Column(
        UUID(as_uuid=True),
        ForeignKey("events.id"),
        nullable=False
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    registered_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    cancelled_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    __table_args__ = (
        UniqueConstraint(
            "event_id",
            "user_id",
            name="unique_event_user_registration"
        ),
    )