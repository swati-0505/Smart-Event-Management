from __future__ import annotations
import logging
import shutil
from pathlib import Path
from typing import Literal
from uuid import UUID
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
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
from app.schemas.chat import AgentRunOut, ChatRequest, ChatResponse, DeleteSessionsRequest, DeleteSessionsResponse, IngestResponse, MessageOut, SessionSummary, ToolCallOut
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
logger = logging.getLogger(__name__)
router = APIRouter(prefix='/api')
optional_chat_bearer = HTTPBearer(auto_error=False)

def get_optional_chat_user(credentials: HTTPAuthorizationCredentials | None=Depends(optional_chat_bearer), db: Session=Depends(get_db)) -> User | None:
    if credentials is None:
        return None
    return get_current_user(credentials=credentials, db=db)

@router.post('/chat', response_model=ChatResponse, tags=['ai'])
def chat(payload: ChatRequest, db: Session=Depends(get_db), current_user: User | None=Depends(get_optional_chat_user)) -> ChatResponse:
    result = run_agent(db=db, user_id=current_user.id if current_user else None, role=current_user.role if current_user else 'guest', message=payload.message, session_id=payload.session_id)
    return ChatResponse(reply=result.reply, session_id=result.session_id, run_id=result.run_id, intent=result.intent, tools_used=result.tools_used, sources=result.sources, latency_ms=round(result.latency_ms, 2), status=result.status)

@router.get('/chat/sessions', response_model=list[SessionSummary], tags=['ai'])
def list_sessions(db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    return memory.list_sessions(db, current_user.id)

@router.delete('/chat/sessions/{session_id}', tags=['ai'])
def delete_single_session(session_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    count = memory.delete_sessions(db, current_user.id, [session_id])
    if count == 0:
        raise HTTPException(status_code=404, detail='Conversation session not found')
    return {'status': 'success', 'deleted_count': count, 'message': 'Session deleted successfully'}

@router.delete('/chat/sessions', response_model=DeleteSessionsResponse, tags=['ai'])
def delete_multiple_sessions(payload: DeleteSessionsRequest, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    count = memory.delete_sessions(db, current_user.id, payload.session_ids)
    return DeleteSessionsResponse(deleted_count=count, message=f'Successfully deleted {count} session(s)')

@router.get('/chat/sessions/{session_id}', response_model=list[MessageOut], tags=['ai'])
def get_session_messages(session_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    session = memory.get_or_create_session(db, current_user.id, session_id)
    if session.session_id != session_id:
        raise HTTPException(status_code=404, detail='Conversation not found')
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()

@router.get('/admin/agent-activity', response_model=list[AgentRunOut], tags=['Admin'])
def agent_activity(limit: int=50, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    runs = get_recent_runs(db, limit=min(limit, 200))
    user_ids = {r.user_id for r in runs if r.user_id}
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u.email for u in users}
    result = []
    for run in runs:
        out = AgentRunOut.model_validate(run)
        out.user_email = user_map.get(run.user_id) if run.user_id else 'Guest User'
        result.append(out)
    return result

@router.get('/admin/agent-activity/{run_id}', response_model=AgentRunOut, tags=['Admin'])
def agent_run_detail(run_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    from app.models.agent import AgentRun
    run = db.query(AgentRun).filter(AgentRun.run_id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail='Run not found')
    output = AgentRunOut.model_validate(run)
    if run.user_id:
        u = db.query(User).filter(User.id == run.user_id).first()
        output.user_email = u.email if u else 'Unknown User'
    else:
        output.user_email = 'Guest User'
    output.tool_calls = [ToolCallOut.model_validate(call) for call in get_run_tool_calls(db, run_id)]
    return output

@router.post('/admin/knowledge/upload', response_model=IngestResponse, tags=['Admin'])
def upload_knowledge_document(file: UploadFile=File(...), force: bool=False, target_index: Literal['legacy', 'nvidia'] | None=None, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    filename = Path(file.filename or '').name
    suffix = Path(filename).suffix.lower()
    if not filename or filename in {'.', '..'}:
        raise HTTPException(status_code=400, detail='A filename is required')
    if suffix not in SUPPORTED:
        raise HTTPException(status_code=415, detail=f"Unsupported file type '{suffix}'. Supported: {sorted(SUPPORTED)}")
    directory = Path(ai_settings.KNOWLEDGE_DOCS_DIR)
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / filename
    try:
        with destination.open('wb') as output:
            shutil.copyfileobj(file.file, output)
        result = ingest.ingest_path(
            db,
            str(destination),
            force=force,
            target_index=target_index or ai_settings.RAG_ACTIVE_EMBEDDING_INDEX,
        )
    finally:
        file.file.close()
    if result.status == 'failed':
        raise HTTPException(status_code=422, detail=result.detail)
    return IngestResponse(filename=result.filename, status=result.status, chunk_count=result.chunk_count, detail=result.detail)

@router.post('/admin/knowledge/ingest', response_model=list[IngestResponse], tags=['Admin'])
def ingest_knowledge(force: bool=False, target_index: Literal['legacy', 'nvidia'] | None=None, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    results = ingest.ingest_directory(
        db=db,
        directory=ai_settings.KNOWLEDGE_DOCS_DIR,
        force=force,
        target_index=target_index or ai_settings.RAG_ACTIVE_EMBEDDING_INDEX,
    )
    return [IngestResponse(filename=r.filename, status=r.status, chunk_count=r.chunk_count, detail=r.detail) for r in results]

@router.get('/admin/knowledge/status', tags=['Admin'])
def knowledge_status(db: Session=Depends(get_db), _: User=Depends(require_admin)):
    documents = db.query(KnowledgeDocument).all()
    staged_query = db.query(KnowledgeChunkNvidia)
    staged_count = staged_query.count()
    primary_missing = staged_query.filter(KnowledgeChunkNvidia.embedding_primary.is_(None)).count()
    fallback_missing = staged_query.filter(KnowledgeChunkNvidia.embedding_fallback.is_(None)).count()
    stale_count = (
        staged_query.join(KnowledgeDocument)
        .filter(KnowledgeChunkNvidia.content_hash != KnowledgeDocument.content_hash)
        .count()
    )
    primary_model_mismatch = staged_query.filter(
        KnowledgeChunkNvidia.primary_model != ai_settings.OPENROUTER_EMBEDDING_MODEL
    ).count()
    fallback_model_mismatch = staged_query.filter(
        KnowledgeChunkNvidia.fallback_model.is_not(None)
    ).count()
    expected_chunks = sum(document.chunk_count for document in documents)
    nvidia_active = ai_settings.RAG_ACTIVE_EMBEDDING_INDEX == 'nvidia'
    return {
        'active_embedding_index': ai_settings.RAG_ACTIVE_EMBEDDING_INDEX,
        'embedding_model': ai_settings.OPENROUTER_EMBEDDING_MODEL if nvidia_active else ai_settings.EMBEDDING_MODEL,
        'embedding_dim': ai_settings.OPENROUTER_EMBEDDING_DIM if nvidia_active else ai_settings.EMBEDDING_DIM,
        'openrouter_embedding_model': ai_settings.OPENROUTER_EMBEDDING_MODEL,
        'openrouter_embedding_dim': ai_settings.OPENROUTER_EMBEDDING_DIM,
        'nvidia_primary_model': ai_settings.OPENROUTER_EMBEDDING_MODEL,
        'nvidia_fallback_model': None,
        'nvidia_embedding_dim': ai_settings.OPENROUTER_EMBEDDING_DIM,
        'document_count': len(documents),
        'chunk_count': db.query(KnowledgeChunk).count(),
        'staged_nvidia_chunk_count': staged_count,
        'staged_nvidia_expected_chunk_count': expected_chunks,
        'staged_nvidia_primary_missing': primary_missing,
        'staged_nvidia_fallback_missing': fallback_missing,
        'staged_nvidia_stale_chunk_count': stale_count,
        'staged_nvidia_primary_model_mismatch': primary_model_mismatch,
        'staged_nvidia_fallback_model_mismatch': fallback_model_mismatch,
        'staged_nvidia_ready': (
            staged_count == expected_chunks
            and primary_missing == 0
            and stale_count == 0
            and primary_model_mismatch == 0
        ),
        'documents': [{'filename': d.filename, 'doc_type': d.doc_type, 'chunks': d.chunk_count} for d in documents],
    }