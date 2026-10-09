from typing import Sequence, Union
from alembic import op
revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.alter_column('agent_sessions', 'user_id', nullable=True)
    op.alter_column('agent_runs', 'user_id', nullable=True)

def downgrade() -> None:
    op.execute('DELETE FROM agent_runs WHERE user_id IS NULL')
    op.execute('DELETE FROM agent_sessions WHERE user_id IS NULL')
    op.alter_column('agent_runs', 'user_id', nullable=False)
    op.alter_column('agent_sessions', 'user_id', nullable=False)