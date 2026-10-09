from typing import Sequence, Union

import pgvector.sqlalchemy
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = 'e6f7a8b9c0d1'
down_revision: Union[str, Sequence[str], None] = 'd5e6f7a8b9c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

EMBEDDING_DIM = 2048


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_extension
                WHERE extname = 'vector'
                  AND string_to_array(extversion, '.')::int[] >= ARRAY[0, 7, 0]
            ) THEN
                RAISE EXCEPTION 'pgvector 0.7.0 or newer is required for 2048-dimensional halfvec HNSW indexes';
            END IF;
        END
        $$;
        """
    )
    op.create_table(
        'knowledge_chunks_nvidia',
        sa.Column('chunk_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            'document_id',
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey('knowledge_documents.document_id', ondelete='CASCADE'),
            nullable=False,
        ),
        sa.Column('doc_type', sa.String(), nullable=False, server_default='general'),
        sa.Column('source_filename', sa.String(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_hash', sa.String(), nullable=False),
        sa.Column('primary_model', sa.String(), nullable=False),
        sa.Column('fallback_model', sa.String(), nullable=False),
        sa.Column('embedding_primary', pgvector.sqlalchemy.Vector(EMBEDDING_DIM), nullable=True),
        sa.Column('embedding_fallback', pgvector.sqlalchemy.Vector(EMBEDDING_DIM), nullable=True),
        sa.Column('search_vec', postgresql.TSVECTOR(), nullable=True),
        sa.Column('doc_metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint(
            'document_id',
            'chunk_index',
            name='uq_knowledge_chunks_nvidia_document_chunk',
        ),
    )
    op.create_index('idx_knowledge_chunks_nvidia_document_id', 'knowledge_chunks_nvidia', ['document_id'])
    op.create_index('idx_knowledge_chunks_nvidia_doc_type', 'knowledge_chunks_nvidia', ['doc_type'])
    op.create_index(
        'idx_knowledge_chunks_nvidia_search_vec',
        'knowledge_chunks_nvidia',
        ['search_vec'],
        postgresql_using='gin',
    )
    op.execute(
        'CREATE INDEX idx_knowledge_chunks_nvidia_embedding_primary '
        'ON knowledge_chunks_nvidia USING hnsw '
        '((embedding_primary::halfvec(2048)) halfvec_cosine_ops)'
    )
    op.execute(
        'CREATE INDEX idx_knowledge_chunks_nvidia_embedding_fallback '
        'ON knowledge_chunks_nvidia USING hnsw '
        '((embedding_fallback::halfvec(2048)) halfvec_cosine_ops)'
    )


def downgrade() -> None:
    op.drop_table('knowledge_chunks_nvidia')
