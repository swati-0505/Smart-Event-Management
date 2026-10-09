from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = '8c362a3536c1'
down_revision: Union[str, Sequence[str], None] = '800ff740ca57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass