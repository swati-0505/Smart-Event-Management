import uuid
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID
from app.core.ai_config import ai_settings
from app.db.database import Base

class KnowledgeDocument(Base):
    __tablename__ = 'knowledge_documents'
    __table_args__ = (Index('idx_knowledge_documents_doc_type', 'doc_type'),)
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=True)
    doc_type = Column(String, nullable=False, default='general')
    content_hash = Column(String, nullable=False)
    chunk_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

class KnowledgeChunk(Base):
    __tablename__ = 'knowledge_chunks'
    __table_args__ = (
        Index('idx_knowledge_chunks_document_id', 'document_id'),
        Index('idx_knowledge_chunks_doc_type', 'doc_type'),
        Index('idx_knowledge_chunks_search_vec', 'search_vec', postgresql_using='gin'),
        Index(
            'idx_knowledge_chunks_embedding',
            'embedding',
            postgresql_using='hnsw',
            postgresql_ops={'embedding': 'vector_cosine_ops'},
        ),
    )
    chunk_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('knowledge_documents.document_id', ondelete='CASCADE'), nullable=False)
    doc_type = Column(String, nullable=False, default='general')
    source_filename = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(ai_settings.EMBEDDING_DIM), nullable=True)
    search_vec = Column(TSVECTOR, nullable=True)
    doc_metadata = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class KnowledgeChunkNvidia(Base):
    __tablename__ = 'knowledge_chunks_nvidia'
    __table_args__ = (
        UniqueConstraint('document_id', 'chunk_index', name='uq_knowledge_chunks_nvidia_document_chunk'),
        Index('idx_knowledge_chunks_nvidia_document_id', 'document_id'),
        Index('idx_knowledge_chunks_nvidia_doc_type', 'doc_type'),
        Index('idx_knowledge_chunks_nvidia_search_vec', 'search_vec', postgresql_using='gin'),
        Index(
            'idx_knowledge_chunks_nvidia_embedding_primary',
            text('((embedding_primary)::halfvec(2048)) halfvec_cosine_ops'),
            postgresql_using='hnsw',
        ),
        Index(
            'idx_knowledge_chunks_nvidia_embedding_fallback',
            text('((embedding_fallback)::halfvec(2048)) halfvec_cosine_ops'),
            postgresql_using='hnsw',
        ),
    )
    chunk_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey('knowledge_documents.document_id', ondelete='CASCADE'), nullable=False)
    doc_type = Column(String, nullable=False, default='general')
    source_filename = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_hash = Column(String, nullable=False)
    primary_model = Column(String, nullable=False)
    fallback_model = Column(String, nullable=True)
    embedding_primary = Column(Vector(ai_settings.OPENROUTER_EMBEDDING_DIM), nullable=True)
    embedding_fallback = Column(Vector(ai_settings.OPENROUTER_EMBEDDING_DIM), nullable=True)
    search_vec = Column(TSVECTOR, nullable=True)
    doc_metadata = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())