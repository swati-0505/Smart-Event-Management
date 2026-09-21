"""create initial table

Revision ID: 8c362a3536c1
Revises: 
Create Date: 2026-09-11 21:22:51.655821

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c362a3536c1'
down_revision: Union[str, Sequence[str], None] = '800ff740ca57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Keep this historical duplicate revision without recreating tables."""
    pass


def downgrade() -> None:
    """There are no schema changes owned by this compatibility revision."""
    pass
