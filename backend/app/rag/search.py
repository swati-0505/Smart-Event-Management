from __future__ import annotations
import logging
from dataclasses import dataclass, field
from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session
from app.core.ai_config import ai_settings
from app.rag.clients import embed_query, embed_query_openrouter
logger = logging.getLogger(__name__)

@dataclass
class RetrievedChunk:
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
        return self.metadata.get('section', '')

    @property
    def document_title(self) -> str:
        return self.metadata.get('document_title', self.source_filename)

    def citation(self) -> str:
        return f'{self.document_title} > {self.section}' if self.section else self.document_title

def dense_search(db: Session, query: str, top_k: int | None=None, doc_type: str | None=None) -> list[RetrievedChunk]:
    top_k = top_k or ai_settings.DENSE_TOP_K
    if ai_settings.RAG_ACTIVE_EMBEDDING_INDEX == 'nvidia':
        query_vector = embed_query_openrouter(query)
        embedding_column = 'embedding_primary'
        table_name = 'knowledge_chunks_nvidia'
        vector_type = f'halfvec({ai_settings.OPENROUTER_EMBEDDING_DIM})'
        vector_expression = f'({embedding_column}::{vector_type})'
        model_column = 'primary_model'
        selected_model = ai_settings.OPENROUTER_EMBEDDING_MODEL
    else:
        query_vector = embed_query(query)
        embedding_column = 'embedding'
        table_name = 'knowledge_chunks'
        vector_type = 'vector'
        vector_expression = embedding_column
        model_column = None
        selected_model = None
    vector_literal = '[' + ','.join((str(v) for v in query_vector)) + ']'
    filter_clause = 'AND doc_type = :doc_type' if doc_type else ''
    model_filter = f'AND {model_column} = :model_name' if model_column else ''
    parameters = {'query_vector': vector_literal, 'top_k': top_k, 'doc_type': doc_type}
    if selected_model is not None:
        parameters['model_name'] = selected_model
    rows = db.execute(
        sql_text(
            f'\n            SELECT\n                chunk_id::text,\n                content,\n                source_filename,\n                doc_type,\n                doc_metadata,\n                            1 - ({vector_expression} <=> CAST(:query_vector AS {vector_type})) AS score\n'
            f'            FROM {table_name}\n'
            f'            WHERE {embedding_column} IS NOT NULL\n'
            f'            {model_filter}\n'
            f'            {filter_clause}\n'
            f'            ORDER BY {vector_expression} <=> CAST(:query_vector AS {vector_type})\n'
            '            LIMIT :top_k\n            '
        ),
        parameters,
    ).fetchall()
    return [RetrievedChunk(chunk_id=row[0], content=row[1], source_filename=row[2], doc_type=row[3], metadata=row[4] or {}, dense_score=float(row[5])) for row in rows]

def sparse_search(db: Session, query: str, top_k: int | None=None, doc_type: str | None=None) -> list[RetrievedChunk]:
    top_k = top_k or ai_settings.SPARSE_TOP_K
    filter_clause = 'AND doc_type = :doc_type' if doc_type else ''
    table_name = 'knowledge_chunks_nvidia' if ai_settings.RAG_ACTIVE_EMBEDDING_INDEX == 'nvidia' else 'knowledge_chunks'
    rows = db.execute(sql_text(f"\n            SELECT\n                chunk_id::text,\n                content,\n                source_filename,\n                doc_type,\n                doc_metadata,\n                ts_rank_cd(search_vec, websearch_to_tsquery('english', :query)) AS score\n            FROM {table_name}\n            WHERE search_vec @@ websearch_to_tsquery('english', :query)\n            {filter_clause}\n            ORDER BY score DESC\n            LIMIT :top_k\n            "), {'query': query, 'top_k': top_k, 'doc_type': doc_type}).fetchall()
    return [RetrievedChunk(chunk_id=row[0], content=row[1], source_filename=row[2], doc_type=row[3], metadata=row[4] or {}, sparse_score=float(row[5])) for row in rows]