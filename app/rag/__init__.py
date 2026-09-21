"""
RAG pipeline.

Indexing:  convert -> chunk -> metadata -> embed -> store (pgvector + tsvector)
Query:     dense + sparse -> RRF fusion -> rerank -> generate -> grounding check
"""

from app.rag.pipeline import RAGResponse, answer, retrieve

__all__ = ["RAGResponse", "answer", "retrieve"]
