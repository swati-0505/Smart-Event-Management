from __future__ import annotations
import logging
from dataclasses import dataclass
from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session
from app.core.ai_config import ai_settings
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
from app.rag.chunker import build_embedding_text, chunk_markdown
from app.rag.clients import embed_texts, embed_texts_openrouter
from app.rag.converter import ConvertedDocument, convert_directory, convert_file
from app.rag.metadata import extract_metadata
logger = logging.getLogger(__name__)

@dataclass
class IngestResult:
    filename: str
    status: str
    chunk_count: int = 0
    detail: str = ''

def ingest_directory(db: Session, directory: str | None=None, force: bool=False, target_index: str='legacy') -> list[IngestResult]:
    directory = directory or ai_settings.KNOWLEDGE_DOCS_DIR
    documents = convert_directory(directory)
    if not documents:
        logger.warning('No supported documents found in %s', directory)
        return []
    return [ingest_document(db, doc, force=force, target_index=target_index) for doc in documents]

def ingest_path(db: Session, path: str, force: bool=False, target_index: str='legacy') -> IngestResult:
    return ingest_document(db, convert_file(path), force=force, target_index=target_index)

def ingest_document(db: Session, document: ConvertedDocument, force: bool=False, target_index: str='legacy') -> IngestResult:
    if target_index not in {'legacy', 'nvidia'}:
        raise ValueError(f'Unsupported knowledge index: {target_index}')
    if target_index == 'nvidia':
        return _ingest_nvidia_document(db, document, force=force)

    existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.filename == document.filename).first()
    if existing and existing.content_hash == document.content_hash and (not force):
        logger.info('%s unchanged, skipping', document.filename)
        return IngestResult(filename=document.filename, status='skipped', chunk_count=existing.chunk_count, detail='content hash unchanged')
    try:
        if existing:
            db.query(KnowledgeChunk).filter(KnowledgeChunk.document_id == existing.document_id).delete(synchronize_session=False)
            existing.content_hash = document.content_hash
            existing.title = document.title
            existing.doc_type = document.doc_type
            record = existing
        else:
            record = KnowledgeDocument(filename=document.filename, title=document.title, doc_type=document.doc_type, content_hash=document.content_hash)
            db.add(record)
        db.flush()
        chunks = chunk_markdown(document.text)
        if not chunks:
            raise ValueError('chunker produced no chunks')
        logger.info('%s -> %d chunks', document.filename, len(chunks))
        for chunk in chunks:
            chunk.metadata = extract_metadata(content=chunk.content, title=document.title, section=chunk.section)
        embedding_inputs = [build_embedding_text(c, document.title) for c in chunks]
        vectors = embed_texts(embedding_inputs)
        rows = []
        for chunk, vector in zip(chunks, vectors):
            row = KnowledgeChunk(document_id=record.document_id, doc_type=document.doc_type, source_filename=document.filename, chunk_index=chunk.index, content=chunk.content, embedding=vector, doc_metadata={'section': chunk.section, 'document_title': document.title, **chunk.metadata})
            db.add(row)
            rows.append(row)
        record.chunk_count = len(rows)
        db.flush()
        _populate_search_vectors(db, record.document_id)
        db.commit()
        return IngestResult(filename=document.filename, status='indexed', chunk_count=len(rows))
    except Exception as exc:
        db.rollback()
        logger.exception('Failed to ingest %s', document.filename)
        return IngestResult(filename=document.filename, status='failed', detail=str(exc))

def _ingest_nvidia_document(db: Session, document: ConvertedDocument, force: bool=False) -> IngestResult:
    record = db.query(KnowledgeDocument).filter(KnowledgeDocument.filename == document.filename).first()
    staged_rows = (
        db.query(KnowledgeChunkNvidia)
        .filter(KnowledgeChunkNvidia.document_id == record.document_id)
        .all()
        if record
        else []
    )
    if (
        staged_rows
        and len(staged_rows) == record.chunk_count
        and all(row.content_hash == document.content_hash for row in staged_rows)
        and all(row.primary_model == ai_settings.OPENROUTER_EMBEDDING_MODEL for row in staged_rows)
        and all(row.embedding_primary is not None for row in staged_rows)
        and not force
    ):
        return IngestResult(
            filename=document.filename,
            status='skipped',
            chunk_count=len(staged_rows),
            detail='staged content hash unchanged',
        )
    try:
        if record:
            record.title = document.title
            record.doc_type = document.doc_type
            record.content_hash = document.content_hash
        else:
            record = KnowledgeDocument(
                filename=document.filename,
                title=document.title,
                doc_type=document.doc_type,
                content_hash=document.content_hash,
            )
            db.add(record)
        db.flush()
        chunks = chunk_markdown(document.text)
        if not chunks:
            raise ValueError('chunker produced no chunks')
        for chunk in chunks:
            chunk.metadata = extract_metadata(content=chunk.content, title=document.title, section=chunk.section)
        embedding_inputs = [build_embedding_text(chunk, document.title) for chunk in chunks]
        vectors = embed_texts_openrouter(embedding_inputs)
        if len(vectors) != len(chunks):
            raise ValueError('Embedding model returned a different number of vectors than input chunks.')

        db.query(KnowledgeChunkNvidia).filter(
            KnowledgeChunkNvidia.document_id == record.document_id
        ).delete(synchronize_session=False)
        rows = []
        for chunk, vector in zip(chunks, vectors):
            row = KnowledgeChunkNvidia(
                document_id=record.document_id,
                doc_type=document.doc_type,
                source_filename=document.filename,
                chunk_index=chunk.index,
                content=chunk.content,
                content_hash=document.content_hash,
                primary_model=ai_settings.OPENROUTER_EMBEDDING_MODEL,
                fallback_model=None,
                embedding_primary=vector,
                embedding_fallback=None,
                doc_metadata={
                    'section': chunk.section,
                    'document_title': document.title,
                    **chunk.metadata,
                },
            )
            db.add(row)
            rows.append(row)
        record.chunk_count = len(rows)
        db.flush()
        _populate_search_vectors(db, record.document_id, target_index='nvidia')
        db.commit()
        return IngestResult(filename=document.filename, status='indexed', chunk_count=len(rows))
    except Exception as exc:
        db.rollback()
        logger.exception('Failed to stage OpenRouter embeddings for %s', document.filename)
        return IngestResult(filename=document.filename, status='failed', detail=str(exc))

def _populate_search_vectors(db: Session, document_id, target_index: str='legacy') -> None:
    if target_index not in {'legacy', 'nvidia'}:
        raise ValueError(f'Unsupported knowledge index: {target_index}')
    table_name = 'knowledge_chunks_nvidia' if target_index == 'nvidia' else 'knowledge_chunks'
    db.execute(sql_text(f"\n            UPDATE {table_name}\n            SET search_vec =\n                setweight(to_tsvector('english', coalesce(content, '')), 'A')\n                ||\n                setweight(\n                    to_tsvector(\n                        'english',\n                        coalesce(doc_metadata->>'section', '') || ' ' ||\n                        coalesce(\n                            (SELECT string_agg(value, ' ')\n                             FROM jsonb_array_elements_text(\n                                 coalesce(doc_metadata->'keywords', '[]'::jsonb)\n                             )),\n                            ''\n                        )\n                    ),\n                    'B'\n                )\n            WHERE document_id = :document_id\n            "), {'document_id': str(document_id)})

def clear_knowledge_base(db: Session) -> int:
    deleted = db.query(KnowledgeDocument).delete(synchronize_session=False)
    db.commit()
    return deleted

def clear_nvidia_index(db: Session) -> int:
    deleted = db.query(KnowledgeChunkNvidia).delete(synchronize_session=False)
    db.commit()
    return deleted