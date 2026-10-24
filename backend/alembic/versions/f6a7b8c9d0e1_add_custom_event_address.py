from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, Sequence[str], None] = 'f5e6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('events', sa.Column('address', sa.Text(), nullable=True))
    op.alter_column('events', 'venue_id', existing_type=sa.UUID(), nullable=True)


def downgrade() -> None:
    op.alter_column('events', 'venue_id', existing_type=sa.UUID(), nullable=False)
    op.drop_column('events', 'address')
