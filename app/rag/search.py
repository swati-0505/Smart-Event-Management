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
        """Human-readable source label shown in the final answer."""
        return f"{self.document_title} > {self.section}" if self.section else self.document_title


def dense_search(
    db: Session,
    query: str,
    top_k: int | None = None,
    doc_type: str | None = None,
) -> list[RetrievedChunk]:
    """
    Vector similarity search over pgvector.

    `<=>` is cosine distance (0 = identical), so we convert to a similarity
    score with 1 - distance to keep "higher is better" consistent everywhere.
    """
    top_k = top_k or ai_settings.DENSE_TOP_K
    query_vector = embed_query(query)


    vector_literal = "[" + ",".join(str(v) for v in query_vector) + "]"

    filter_clause = "AND doc_type = :doc_type" if doc_type else ""
    rows = db.execute(
        sql_text(
            f"""
            SELECT
                chunk_id::text,
                content,
                source_filename,
                doc_type,
                doc_metadata,
                1 - (embedding <=> CAST(:query_vector AS vector)) AS score
            FROM knowledge_chunks
            WHERE embedding IS NOT NULL
            {filter_clause}
            ORDER BY embedding <=> CAST(:query_vector AS vector)
            LIMIT :top_k
            """
        ),
        {"query_vector": vector_literal, "top_k": top_k, "doc_type": doc_type},
    ).fetchall()

    return [
        RetrievedChunk(
            chunk_id=row[0],
            content=row[1],
            source_filename=row[2],
            doc_type=row[3],
            metadata=row[4] or {},
            dense_score=float(row[5]),
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
    Keyword search over the tsvector column.

    websearch_to_tsquery is used rather than plainto_tsquery because it
    tolerates natural phrasing and quoted phrases without throwing on
    punctuation - important when the query is a raw user sentence.
    """
    top_k = top_k or ai_settings.SPARSE_TOP_K

    filter_clause = "AND doc_type = :doc_type" if doc_type else ""
    rows = db.execute(
        sql_text(
            f"""
            SELECT
                chunk_id::text,
                content,
                source_filename,
                doc_type,
                doc_metadata,
                ts_rank_cd(search_vec, websearch_to_tsquery('english', :query)) AS score
            FROM knowledge_chunks
            WHERE search_vec @@ websearch_to_tsquery('english', :query)
            {filter_clause}
            ORDER BY score DESC
            LIMIT :top_k
            """
        ),
        {"query": query, "top_k": top_k, "doc_type": doc_type},
    ).fetchall()

    return [
        RetrievedChunk(
            chunk_id=row[0],
            content=row[1],
            source_filename=row[2],
            doc_type=row[3],
            metadata=row[4] or {},
            sparse_score=float(row[5]),
        )
        for row in rows
    ]
