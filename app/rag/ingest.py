from __future__ import annotations
import logging
from dataclasses import dataclass

from sqlalchemy import text as sql_text
from sqlalchemy.orm import Session

from app.core.ai_config import ai_settings
from app.models.knowledge import KnowledgeChunk, KnowledgeDocument
from app.rag.chunker import build_embedding_text, chunk_markdown
from app.rag.clients import embed_texts
from app.rag.converter import ConvertedDocument, convert_directory, convert_file
from app.rag.metadata import extract_metadata

logger = logging.getLogger(__name__)


@dataclass
class IngestResult:
    filename: str
    status: str
    chunk_count: int = 0
    detail: str = ""


def ingest_directory(
    db: Session,
    directory: str | None = None,
    force: bool = False,
) -> list[IngestResult]:
    """Ingest every supported document in a directory."""
    directory = directory or ai_settings.KNOWLEDGE_DOCS_DIR
    documents = convert_directory(directory)

    if not documents:
        logger.warning("No supported documents found in %s", directory)
        return []

    return [ingest_document(db, doc, force=force) for doc in documents]


def ingest_path(db: Session, path: str, force: bool = False) -> IngestResult:
    """Ingest a single file."""
    return ingest_document(db, convert_file(path), force=force)


def ingest_document(
    db: Session,
    document: ConvertedDocument,
    force: bool = False,
) -> IngestResult:
    """Index one already-converted document."""
    existing = (
        db.query(KnowledgeDocument)
        .filter(KnowledgeDocument.filename == document.filename)
        .first()
    )

    if existing and existing.content_hash == document.content_hash and not force:
        logger.info("%s unchanged, skipping", document.filename)
        return IngestResult(
            filename=document.filename,
            status="skipped",
            chunk_count=existing.chunk_count,
            detail="content hash unchanged",
        )

    try:



        if existing:
            db.query(KnowledgeChunk).filter(
                KnowledgeChunk.document_id == existing.document_id
            ).delete(synchronize_session=False)
            existing.content_hash = document.content_hash
            existing.title = document.title
            existing.doc_type = document.doc_type
            record = existing
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
            raise ValueError("chunker produced no chunks")

        logger.info("%s -> %d chunks", document.filename, len(chunks))

        for chunk in chunks:
            chunk.metadata = extract_metadata(
                content=chunk.content,
                title=document.title,
                section=chunk.section,
            )

        embedding_inputs = [build_embedding_text(c, document.title) for c in chunks]
        vectors = embed_texts(embedding_inputs)




        rows = []
        for chunk, vector in zip(chunks, vectors):
            row = KnowledgeChunk(
                document_id=record.document_id,
                doc_type=document.doc_type,
                source_filename=document.filename,
                chunk_index=chunk.index,
                content=chunk.content,
                embedding=vector,
                doc_metadata={
                    "section": chunk.section,
                    "document_title": document.title,
                    **chunk.metadata,
                },
            )
            db.add(row)
            rows.append(row)

        record.chunk_count = len(rows)
        db.flush()

        _populate_search_vectors(db, record.document_id)
        db.commit()

        return IngestResult(
            filename=document.filename,
            status="indexed",
            chunk_count=len(rows),
        )

    except Exception as exc:
        db.rollback()
        logger.exception("Failed to ingest %s", document.filename)
        return IngestResult(
            filename=document.filename,
            status="failed",
            detail=str(exc),
        )


def _populate_search_vectors(db: Session, document_id) -> None:
    """
    Build the tsvector for the sparse arm.

    Done in SQL rather than Python because to_tsvector must run inside
    Postgres to match the same stemming that the query side uses.

    Weighting: content is 'A' (most important), the LLM-extracted keywords
    and section heading are 'B'. ts_rank_cd then scores a keyword hit lower
    than a body hit, which is what we want - keywords are a recall aid, not
    a substitute for the text actually saying something.
    """
    db.execute(
        sql_text(
            """
            UPDATE knowledge_chunks
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
            """
        ),
        {"document_id": str(document_id)},
    )


def clear_knowledge_base(db: Session) -> int:
    """Delete everything. Useful when switching embedding models."""
    deleted = db.query(KnowledgeDocument).delete(synchronize_session=False)
    db.commit()
    return deleted
