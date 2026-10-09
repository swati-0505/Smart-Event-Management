from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'f5e6a7b8c9d0'
down_revision: Union[str, Sequence[str], None] = 'e6f7a8b9c0d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'knowledge_chunks_nvidia',
        'fallback_model',
        existing_type=sa.String(),
        nullable=True,
    )


def downgrade() -> None:
    op.execute(
        'UPDATE knowledge_chunks_nvidia '
        'SET fallback_model = primary_model '
        'WHERE fallback_model IS NULL'
    )
    op.alter_column(
        'knowledge_chunks_nvidia',
        'fallback_model',
        existing_type=sa.String(),
        nullable=False,
    )
