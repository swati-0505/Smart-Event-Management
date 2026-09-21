"""
Knowledge base tables for the RAG pipeline.

Two tables:
  knowledge_documents - one row per source file (event_policy.pdf, faq.md, ...)
  knowledge_chunks    - one row per chunk, holding BOTH representations:
                          * embedding  -> dense vector, for semantic search
                          * search_vec -> tsvector, for keyword search

Keeping both on the same row is what makes hybrid search cheap: two indexes,
one table, no join.
"""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID

from app.core.ai_config import ai_settings
from app.db.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    filename = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=True)



    doc_type = Column(String, nullable=False, default="general", index=True)


    content_hash = Column(String, nullable=False)

    chunk_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    __table_args__ = (
        Index("idx_knowledge_chunks_document_id", "document_id"),
        Index("idx_knowledge_chunks_doc_type", "doc_type"),

        Index("idx_knowledge_chunks_search_vec", "search_vec", postgresql_using="gin"),



    )

    chunk_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_documents.document_id", ondelete="CASCADE"),
        nullable=False,
    )


    doc_type = Column(String, nullable=False, default="general")
    source_filename = Column(String, nullable=False)

    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)


    embedding = Column(Vector(ai_settings.EMBEDDING_DIM), nullable=True)



    search_vec = Column(TSVECTOR, nullable=True)




    doc_metadata = Column(JSONB, nullable=True, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
