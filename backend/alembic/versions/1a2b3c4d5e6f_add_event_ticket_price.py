from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "1a2b3c4d5e6f"
down_revision: Union[str, Sequence[str], None] = "f5e6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "events",
        sa.Column("ticket_price", sa.Numeric(precision=10, scale=2), nullable=False, server_default="0.00"),
    )
    op.alter_column(
        "events",
        "ticket_price",
        existing_type=sa.Numeric(precision=10, scale=2),
        existing_server_default="0.00",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("events", "ticket_price")
