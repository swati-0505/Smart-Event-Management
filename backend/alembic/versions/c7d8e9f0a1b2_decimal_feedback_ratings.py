from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "c7d8e9f0a1b2"
down_revision: Union[str, Sequence[str], None] = "2b3c4d5e6f70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("ck_feedback_rating_range", "feedback", type_="check")
    op.alter_column(
        "feedback",
        "rating",
        existing_type=sa.Integer(),
        type_=sa.Numeric(precision=2, scale=1),
        existing_nullable=False,
        postgresql_using="rating::numeric(2, 1)",
    )
    op.create_check_constraint(
        "ck_feedback_rating_range",
        "feedback",
        "rating >= 1 AND rating <= 5",
    )


def downgrade() -> None:
    op.drop_constraint("ck_feedback_rating_range", "feedback", type_="check")
    op.alter_column(
        "feedback",
        "rating",
        existing_type=sa.Numeric(precision=2, scale=1),
        type_=sa.Integer(),
        existing_nullable=False,
        postgresql_using="round(rating)::integer",
    )
    op.create_check_constraint(
        "ck_feedback_rating_range",
        "feedback",
        "rating >= 1 AND rating <= 5",
    )
