"""add database optimization

Revision ID: 182c94d707e7
Revises: 8c362a3536c1
Create Date: 2026-09-13 13:00:00.766614

"""
from typing import Sequence, Union
from alembic import op
# revision identifiers, used by Alembic.
revision: str = "182c94d707e7"
down_revision: Union[str, Sequence[str], None] = "8c362a3536c1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add database optimization indexes."""

    # Events
    op.create_index(
        "idx_events_created_by",
        "events",
        ["created_by"],
        unique=False,
    )

    op.create_index(
        "idx_events_event_date",
        "events",
        ["event_date"],
        unique=False,
    )

    op.create_index(
        "idx_events_status",
        "events",
        ["status"],
        unique=False,
    )

    op.create_index(
        "idx_events_venue_id",
        "events",
        ["venue_id"],
        unique=False,
    )

    # Feedback
    op.create_index(
        "ix_feedback_event_id",
        "feedback",
        ["event_id"],
        unique=False,
    )

    op.create_index(
        "ix_feedback_rating",
        "feedback",
        ["rating"],
        unique=False,
    )

    op.create_index(
        "ix_feedback_user_id",
        "feedback",
        ["user_id"],
        unique=False,
    )

    # Payments
    op.create_index(
        "ix_payments_event_id",
        "payments",
        ["event_id"],
        unique=False,
    )

    op.create_index(
        "ix_payments_payment_status",
        "payments",
        ["payment_status"],
        unique=False,
    )

    op.create_index(
        "ix_payments_user_id",
        "payments",
        ["user_id"],
        unique=False,
    )

    # Registrations
    op.create_index(
        "ix_registrations_event_id",
        "registrations",
        ["event_id"],
        unique=False,
    )

    op.create_index(
        "ix_registrations_user_id",
        "registrations",
        ["user_id"],
        unique=False,
    )

    # Venues
    op.create_index(
        "ix_venues_capacity",
        "venues",
        ["capacity"],
        unique=False,
    )

    op.create_index(
        "ix_venues_city",
        "venues",
        ["city"],
        unique=False,
    )


def downgrade() -> None:
    """Remove database optimization indexes."""

    op.drop_index("ix_venues_city", table_name="venues")
    op.drop_index("ix_venues_capacity", table_name="venues")

    op.drop_index("ix_registrations_user_id", table_name="registrations")
    op.drop_index("ix_registrations_event_id", table_name="registrations")

    op.drop_index("ix_payments_user_id", table_name="payments")
    op.drop_index("ix_payments_payment_status", table_name="payments")
    op.drop_index("ix_payments_event_id", table_name="payments")

    op.drop_index("ix_feedback_user_id", table_name="feedback")
    op.drop_index("ix_feedback_rating", table_name="feedback")
    op.drop_index("ix_feedback_event_id", table_name="feedback")

    op.drop_index("idx_events_venue_id", table_name="events")
    op.drop_index("idx_events_status", table_name="events")
    op.drop_index("idx_events_event_date", table_name="events")
    op.drop_index("idx_events_created_by", table_name="events")