from __future__ import annotations

import logging
import shutil
from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.agent import memory
from app.agent.graph import run_agent
from app.core.ai_config import ai_settings
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.agent import ChatMessage
from app.models.user import User
from app.observability.logger import get_recent_runs, get_run_tool_calls
from app.rag import ingest
from app.rag.converter import SUPPORTED
from app.schemas.chat import (
    AgentRunOut,
    ChatRequest,
    ChatResponse,
    IngestResponse,
    MessageOut,
    SessionSummary,
    ToolCallOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["ai"])




@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """
    Send a message to the agent.

    Identity comes from the JWT, never from the request body. That is what
    stops a user asking the agent to act as someone else - the agent has no
    mechanism to do it.
    """
    result = run_agent(
        db=db,
        user_id=current_user.id,
        role=current_user.role,
        message=payload.message,
        session_id=payload.session_id,
    )

    return ChatResponse(
        reply=result.reply,
        session_id=result.session_id,
        run_id=result.run_id,
        intent=result.intent,
        tools_used=result.tools_used,
        sources=result.sources,
        latency_ms=round(result.latency_ms, 2),
        status=result.status,
    )


@router.get("/chat/sessions", response_model=list[SessionSummary])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """The caller's conversation threads, most recent first."""
    return memory.list_sessions(db, current_user.id)


@router.get("/chat/sessions/{session_id}", response_model=list[MessageOut])
def get_session_messages(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Messages in one thread.

    Ownership is checked before returning anything - session ids are UUIDs,
    but guessability is not an access control model.
    """
    session = memory.get_or_create_session(db, current_user.id, session_id)
    if session.session_id != session_id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )






@router.get("/admin/agent-activity", response_model=list[AgentRunOut])
def agent_activity(
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Recent agent runs. Backs the /admin/agent-activity page."""
    runs = get_recent_runs(db, limit=min(limit, 200))
    return [AgentRunOut.model_validate(run) for run in runs]


@router.get("/admin/agent-activity/{run_id}", response_model=AgentRunOut)
def agent_run_detail(
    run_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """One run with every tool call it made, in order."""
    from app.models.agent import AgentRun

    run = db.query(AgentRun).filter(AgentRun.run_id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    output = AgentRunOut.model_validate(run)
    output.tool_calls = [
        ToolCallOut.model_validate(call) for call in get_run_tool_calls(db, run_id)
    ]
    return output



@router.post("/admin/knowledge/upload", response_model=IngestResponse)
def upload_knowledge_document(
    file: UploadFile = File(...),
    force: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Save and index one uploaded knowledge document."""
    filename = Path(file.filename or "").name
    suffix = Path(filename).suffix.lower()
    if not filename or filename in {".", ".."}:
        raise HTTPException(status_code=400, detail="A filename is required")
    if suffix not in SUPPORTED:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{suffix}'. Supported: {sorted(SUPPORTED)}",
        )

    directory = Path(ai_settings.KNOWLEDGE_DOCS_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / filename

    try:
        with destination.open("wb") as output:
            shutil.copyfileobj(file.file, output)
        result = ingest.ingest_path(db, str(destination), force=force)
    finally:
        file.file.close()

    if result.status == "failed":
        raise HTTPException(status_code=422, detail=result.detail)

    return IngestResponse(
        filename=result.filename,
        status=result.status,
        chunk_count=result.chunk_count,
        detail=result.detail,
    )

@router.post("/admin/knowledge/ingest", response_model=list[IngestResponse])
def ingest_knowledge(
    force: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """
    Index the policy documents in the documents/ directory.

    Safe to re-run: unchanged files are skipped by content hash. Pass
    force=true to reindex everything, which you need after changing the
    embedding model or the chunk size.

    This is synchronous and can take a while on a cold index, since every
    chunk needs an embedding call. For a large corpus, move it to a worker.
    """
    results = ingest.ingest_directory(
        db=db, directory=ai_settings.KNOWLEDGE_DOCS_DIR, force=force
    )
    return [
        IngestResponse(
            filename=r.filename,
            status=r.status,
            chunk_count=r.chunk_count,
            detail=r.detail,
        )
        for r in results
    ]


@router.get("/admin/knowledge/status")
def knowledge_status(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """What is currently indexed. Useful for checking ingest actually ran."""
    from app.models.knowledge import KnowledgeChunk, KnowledgeDocument

    documents = db.query(KnowledgeDocument).all()
    return {
        "embedding_model": ai_settings.EMBEDDING_MODEL,
        "embedding_dim": ai_settings.EMBEDDING_DIM,
        "document_count": len(documents),
        "chunk_count": db.query(KnowledgeChunk).count(),
        "documents": [
            {
                "filename": d.filename,
                "doc_type": d.doc_type,
                "chunks": d.chunk_count,
            }
            for d in documents
        ],
    }
