from __future__ import annotations

import logging
from dataclasses import dataclass, field

from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session

from app.core.ai_config import ai_settings
from app.rag.clients import embed_query

logger = logging.getLogger(__name__)

@dataclass
class RetrievedChunk:
    """A candidate chunk, carried through fusion and reranking."""

    chunk_id: str
    content: str
    source_filename: str
    doc_type: str
    metadata: dict = field(default_factory=dict)

    dense_score: float | None = None
    sparse_score: float | None = None
    fused_score: float | None = None
    rerank_score: float | None = None

    @property
    def section(self) -> str:
        return self.metadata.get("section", "")

    @property
    def document_title(self) -> str:
        return self.metadata.get("document_title", self.source_filename)

    def citation(self) -> str:
        return (
            f"{self.document_title} > {self.section}"
            if self.section
            else self.document_title
        )

def dense_search(
    db: Session,
    query: str,
    top_k: int | None = None,
    doc_type: str | None = None,
) -> list[RetrievedChunk]:
    """
    Vector similarity search over the existing knowledge_chunks table.

    Existing database columns:
        id
        content
        embedding
        source_document
        document_id
    """

    top_k = top_k or ai_settings.DENSE_TOP_K

    query_vector = embed_query(query)

    vector_literal = "[" + ",".join(str(v) for v in query_vector) + "]"

    rows = db.execute(
        sql_text(
            """
            SELECT
                id::text,
                content,
                source_document,
                document_id::text,
                1 - (embedding <=> CAST(:query_vector AS vector)) AS score
            FROM knowledge_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:query_vector AS vector)
            LIMIT :top_k
            """
        ),
        {
            "query_vector": vector_literal,
            "top_k": top_k,
        },
    ).fetchall()

    return [
        RetrievedChunk(
            chunk_id=row[0],
            content=row[1],
            source_filename=row[2] or "Unknown document",
            doc_type="",
            metadata={
                "document_id": row[3],
            },
            dense_score=float(row[4]),
        )
        for row in rows
    ]


def sparse_search(
    db: Session,
    query: str,
    top_k: int | None = None,
    doc_type: str | None = None,
) -> list[RetrievedChunk]:
    """
    Sparse keyword search.

    The current knowledge_chunks table does not contain a search_vec
    column, so this uses PostgreSQL full-text search directly on content.
    """

    top_k = top_k or ai_settings.SPARSE_TOP_K

    rows = db.execute(
        sql_text(
            """
            SELECT
                id::text,
                content,
                source_document,
                document_id::text,
                ts_rank_cd(
                    to_tsvector('english', content),
                    websearch_to_tsquery('english', :query)
                ) AS score
            FROM knowledge_chunks
            WHERE to_tsvector('english', content)
                  @@ websearch_to_tsquery('english', :query)
            ORDER BY score DESC
            LIMIT :top_k
            """
        ),
        {
            "query": query,
            "top_k": top_k,
        },
    ).fetchall()

    return [
        RetrievedChunk(
            chunk_id=row[0],
            content=row[1],
            source_filename=row[2] or "Unknown document",
            doc_type="",
            metadata={
                "document_id": row[3],
            },
            sparse_score=float(row[4]),
        )
        for row in rows
    ]