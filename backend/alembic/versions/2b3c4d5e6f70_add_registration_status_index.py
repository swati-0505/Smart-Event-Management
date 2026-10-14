from typing import Sequence, Union

from alembic import op

revision: str = "2b3c4d5e6f70"
down_revision: Union[str, Sequence[str], None] = "1a2b3c4d5e6f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_registrations_status", "registrations", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_registrations_status", table_name="registrations")
