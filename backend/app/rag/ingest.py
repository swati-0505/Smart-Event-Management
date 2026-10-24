from __future__ import annotations
import logging
from dataclasses import dataclass
from pathlib import Path
from langsmith import traceable
from app.core.redis_cache import redis_cache
from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session
from app.core.ai_config import ai_settings
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
from app.rag.chunker import build_embedding_text, chunk_markdown
from app.rag.clients import embed_texts_openrouter_model_async, embed_texts_openrouter
from app.rag.converter import SUPPORTED, ConvertedDocument, convert_file
from app.rag.metadata import extract_metadata
from app.observability.langsmith import langsmith_trace
logger = logging.getLogger(__name__)

SUPPORTED_INDEXES = frozenset({'nvidia'})

def safe_knowledge_filename(filename: str) -> str:
    """Return a basename-only filename; reject path traversal / empty names."""
    raw = str(filename or '').strip()
    if not raw or '\0' in raw or '/' in raw or '\\' in raw:
        raise ValueError('Invalid filename')
    name = Path(raw).name
    if not name or name in {'.', '..'} or name != raw:
        raise ValueError('Invalid filename')
    return name


def knowledge_docs_directory() -> Path:
    return Path(ai_settings.KNOWLEDGE_DOCS_DIR).resolve()


def resolve_knowledge_file(filename: str) -> Path:
    """Resolve a knowledge file path under KNOWLEDGE_DOCS_DIR (no escape)."""
    name = safe_knowledge_filename(filename)
    directory = knowledge_docs_directory()
    directory.mkdir(parents=True, exist_ok=True)
    path = (directory / name).resolve()
    if path != directory and directory not in path.parents:
        raise ValueError('Invalid filename')
    return path


@dataclass
class IngestResult:
    filename: str
    status: str
    chunk_count: int = 0
    detail: str = ''


def _resolve_target_index(target_index: str | None) -> str:
    resolved = target_index or ai_settings.RAG_ACTIVE_EMBEDDING_INDEX
    if resolved not in SUPPORTED_INDEXES:
        raise ValueError(
            f"Unsupported knowledge index '{resolved}'. "
            "Only OpenRouter embeddings (target_index='nvidia') are supported."
        )
    return resolved


async def ingest_directory(
    db: Session,
    directory: str | None = None,
    force: bool = False,
    target_index: str | None = None,
) -> list[IngestResult]:
    directory_path = Path(directory or ai_settings.KNOWLEDGE_DOCS_DIR)
    if not directory_path.is_dir():
        raise ValueError(f'{directory_path} is not a directory')
    paths = [
        path for path in sorted(directory_path.iterdir())
        if path.is_file() and path.suffix.lower() in SUPPORTED
    ]
    if not paths:
        logger.warning('No supported documents found in %s', directory_path)
        return []
    resolved = _resolve_target_index(target_index)
    results = []
    for path in paths:
        try:
            document = convert_file(path)
        except Exception as exc:
            logger.exception('Failed to convert knowledge document %s', path.name)
            results.append(IngestResult(filename=path.name, status='failed', detail=str(exc)))
            continue
        results.append(await ingest_document(db, document, force=force, target_index=resolved))
    return results


async def ingest_path(
    db: Session,
    path: str,
    force: bool = False,
    target_index: str | None = None,
) -> IngestResult:
    return await ingest_document(db, convert_file(path), force=force, target_index=target_index)


async def ingest_document(
    db: Session,
    document: ConvertedDocument,
    force: bool = False,
    target_index: str | None = None,
) -> IngestResult:
    _resolve_target_index(target_index)
    with langsmith_trace('rag-ingestion'):
        return await _ingest_nvidia_document(db, document, force=force)


def _ingest_trace_inputs(inputs: dict) -> dict:
    document = inputs.get('document')
    return {
        'filename': getattr(document, 'filename', ''),
        'doc_type': getattr(document, 'doc_type', ''),
        'content_hash': getattr(document, 'content_hash', ''),
        'force': inputs.get('force', False),
    }


@traceable(
    name='rag.index_document',
    run_type='chain',
    process_inputs=_ingest_trace_inputs,
)
async def _ingest_nvidia_document(db: Session, document: ConvertedDocument, force: bool = False) -> IngestResult:
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
        vectors = await embed_texts_openrouter_model_async(embedding_inputs, ai_settings.OPENROUTER_EMBEDDING_MODEL)
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
        _populate_search_vectors(db, record.document_id)
        db.commit()
        redis_cache.invalidate_policies()
        return IngestResult(filename=document.filename, status='indexed', chunk_count=len(rows))
    except Exception as exc:
        db.rollback()
        logger.exception('Failed to stage OpenRouter embeddings for %s', document.filename)
        return IngestResult(filename=document.filename, status='failed', detail=str(exc))


def _populate_search_vectors(db: Session, document_id) -> None:
    db.execute(sql_text("""
            UPDATE knowledge_chunks_nvidia
            SET search_vec =
                setweight(to_tsvector('english', coalesce(content, '')), 'A')
                ||
                setweight(
                    to_tsvector(
                        'english',
                        coalesce(doc_metadata->>'section', '') || ' ' ||
                        coalesce(
                            (SELECT string_agg(value, ' ')
                             FROM jsonb_array_elements_text(
                                 coalesce(doc_metadata->'keywords', '[]'::jsonb)
                             )),
                            ''
                        )
                    ),
                    'B'
                )
            WHERE document_id = :document_id
            """), {'document_id': str(document_id)})


def clear_knowledge_base(db: Session) -> int:
    deleted = db.query(KnowledgeDocument).delete(synchronize_session=False)
    db.commit()
    redis_cache.invalidate_policies()
    return deleted


def clear_nvidia_index(db: Session) -> int:
    deleted = db.query(KnowledgeChunkNvidia).delete(synchronize_session=False)
    db.commit()
    redis_cache.invalidate_policies()
    return deleted


@dataclass
class DeleteDocumentResult:
    filename: str
    status: str
    chunks_removed: int = 0
    file_removed: bool = False
    detail: str = ''


def delete_knowledge_document(db: Session, filename: str) -> DeleteDocumentResult:
    """
    Remove one knowledge document everywhere it is stored:
    - OpenRouter/pgvector rows (knowledge_chunks_nvidia)
    - Legacy chunk rows if any (knowledge_chunks)
    - knowledge_documents row
    - file under KNOWLEDGE_DOCS_DIR (best-effort after DB commit)
    """
    name = safe_knowledge_filename(filename)
    record = db.query(KnowledgeDocument).filter(KnowledgeDocument.filename == name).first()
    if record is None:
        raise LookupError(f"Document '{name}' was not found in the knowledge base")

    document_id = record.document_id
    try:
        nvidia_removed = (
            db.query(KnowledgeChunkNvidia)
            .filter(KnowledgeChunkNvidia.document_id == document_id)
            .delete(synchronize_session=False)
        )
        legacy_removed = (
            db.query(KnowledgeChunk)
            .filter(KnowledgeChunk.document_id == document_id)
            .delete(synchronize_session=False)
        )
        db.delete(record)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception('Failed to delete knowledge document %s from database', name)
        raise

    chunks_removed = int(nvidia_removed or 0) + int(legacy_removed or 0)
    file_removed = False
    file_detail = ''
    try:
        path = resolve_knowledge_file(name)
        if path.is_file():
            path.unlink()
            file_removed = True
        else:
            file_detail = 'Database rows removed; source file was already missing on disk'
    except Exception as exc:
        # DB is already clean; do not fail the API if disk cleanup fails.
        logger.warning('Deleted DB rows for %s but could not remove file: %s', name, exc)
        file_detail = f'Database rows removed; file cleanup failed: {exc}'

    detail = file_detail or f'Removed {chunks_removed} chunk(s) and document metadata'
    logger.info(
        'Deleted knowledge document %s (chunks=%d, file_removed=%s)',
        name,
        chunks_removed,
        file_removed,
    )
    redis_cache.invalidate_policies()
    return DeleteDocumentResult(
        filename=name,
        status='deleted',
        chunks_removed=chunks_removed,
        file_removed=file_removed,
        detail=detail,
    )
