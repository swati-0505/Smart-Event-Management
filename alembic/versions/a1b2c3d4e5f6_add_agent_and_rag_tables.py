"""add agent and rag tables

Creates the pgvector extension, the knowledge base tables used by RAG, and the
agent memory / observability tables.

Revision ID: a1b2c3d4e5f6
Revises: 182c94d707e7
"""

from typing import Sequence, Union

import pgvector.sqlalchemy
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "182c94d707e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

EMBEDDING_DIM = 1024


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "knowledge_documents",
        sa.Column("document_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("filename", sa.String(), nullable=False, unique=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("doc_type", sa.String(), nullable=False, server_default="general"),
        sa.Column("content_hash", sa.String(), nullable=False),
        sa.Column("chunk_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_knowledge_documents_doc_type", "knowledge_documents", ["doc_type"])

    op.create_table(
        "knowledge_chunks",
        sa.Column("chunk_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("knowledge_documents.document_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("doc_type", sa.String(), nullable=False, server_default="general"),
        sa.Column("source_filename", sa.String(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", pgvector.sqlalchemy.Vector(EMBEDDING_DIM), nullable=True),
        sa.Column("search_vec", postgresql.TSVECTOR(), nullable=True),
        sa.Column("doc_metadata", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_knowledge_chunks_document_id", "knowledge_chunks", ["document_id"])
    op.create_index("idx_knowledge_chunks_doc_type", "knowledge_chunks", ["doc_type"])
    op.execute(
        "CREATE INDEX idx_knowledge_chunks_search_vec "
        "ON knowledge_chunks USING gin (search_vec)"
    )
    op.execute(
        "CREATE INDEX idx_knowledge_chunks_embedding "
        "ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)"
    )

    op.create_table(
        "agent_sessions",
        sa.Column("session_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_active_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_agent_sessions_user_id", "agent_sessions", ["user_id"])

    op.create_table(
        "chat_messages",
        sa.Column("message_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agent_sessions.session_id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_chat_messages_session_created", "chat_messages", ["session_id", "created_at"])

    op.create_table(
        "agent_runs",
        sa.Column("run_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agent_sessions.session_id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("user_request", sa.Text(), nullable=False),
        sa.Column("detected_intent", sa.String(), nullable=True),
        sa.Column("final_response", sa.Text(), nullable=True),
        sa.Column("tool_loop_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("grounded", sa.Boolean(), nullable=True),
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="success"),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_agent_runs_session_id", "agent_runs", ["session_id"])
    op.create_index("idx_agent_runs_created_at", "agent_runs", ["created_at"])

    op.create_table(
        "tool_calls",
        sa.Column("tool_call_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("run_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agent_runs.run_id", ondelete="CASCADE"), nullable=False),
        sa.Column("tool_name", sa.String(), nullable=False),
        sa.Column("tool_input", postgresql.JSONB(), nullable=True),
        sa.Column("tool_output", sa.Text(), nullable=True),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="success"),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("sequence", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_tool_calls_run_id", "tool_calls", ["run_id"])


def downgrade() -> None:
    op.drop_table("tool_calls")
    op.drop_table("agent_runs")
    op.drop_table("chat_messages")
    op.drop_table("agent_sessions")
    op.drop_table("knowledge_chunks")
    op.drop_table("knowledge_documents")
