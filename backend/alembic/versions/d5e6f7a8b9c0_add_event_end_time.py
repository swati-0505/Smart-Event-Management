from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, Sequence[str], None] = 'c4d5e6f7a8b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('events', sa.Column('end_time', sa.DateTime(timezone=True), nullable=True))
    op.create_check_constraint('ck_events_end_time_after_start', 'events', 'end_time IS NULL OR end_time > event_date')

def downgrade() -> None:
    op.drop_constraint('ck_events_end_time_after_start', 'events', type_='check')
    op.drop_column('events', 'end_time')