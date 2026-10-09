from typing import Sequence, Union
import pgvector.sqlalchemy
from alembic import op
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.drop_index('idx_knowledge_chunks_embedding', table_name='knowledge_chunks')
    op.alter_column('knowledge_chunks', 'embedding', type_=pgvector.sqlalchemy.Vector(384), postgresql_using='NULL::vector(384)')
    op.create_index('idx_knowledge_chunks_embedding', 'knowledge_chunks', ['embedding'], postgresql_using='hnsw', postgresql_ops={'embedding': 'vector_cosine_ops'})

def downgrade() -> None:
    op.drop_index('idx_knowledge_chunks_embedding', table_name='knowledge_chunks')
    op.alter_column('knowledge_chunks', 'embedding', type_=pgvector.sqlalchemy.Vector(1024), postgresql_using='NULL::vector(1024)')
    op.create_index('idx_knowledge_chunks_embedding', 'knowledge_chunks', ['embedding'], postgresql_using='hnsw', postgresql_ops={'embedding': 'vector_cosine_ops'})