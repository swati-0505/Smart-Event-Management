from __future__ import annotations
import logging
from uuid import UUID
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy.orm import Session
from app.core.ai_config import ai_settings
from app.models.agent import AgentSession, ChatMessage
logger = logging.getLogger(__name__)

def get_or_create_session(db: Session, user_id: UUID | None, session_id: UUID | None=None, first_message: str='') -> AgentSession:
    if session_id:
        session = db.query(AgentSession).filter(AgentSession.session_id == session_id, AgentSession.user_id.is_(None) if user_id is None else AgentSession.user_id == user_id).first()
        if session:
            return session
        logger.info('Session %s not found for this user; starting a new one', session_id)
    session = AgentSession(user_id=user_id, title=first_message[:80] if first_message else None)
    db.add(session)
    db.flush()
    return session

def load_history(db: Session, session_id: UUID, limit: int | None=None) -> list[BaseMessage]:
    limit = limit or ai_settings.MEMORY_WINDOW_MESSAGES
    rows = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    messages: list[BaseMessage] = []
    for row in reversed(rows):
        if row.role == 'user':
            messages.append(HumanMessage(content=row.content))
        elif row.role == 'assistant':
            messages.append(AIMessage(content=row.content))
    return messages

def save_turn(db: Session, session_id: UUID, user_message: str, assistant_message: str) -> None:
    db.add(ChatMessage(session_id=session_id, role='user', content=user_message))
    db.add(ChatMessage(session_id=session_id, role='assistant', content=assistant_message))
    session = db.query(AgentSession).filter(AgentSession.session_id == session_id).first()
    if session:
        from sqlalchemy import func
        session.last_active_at = func.now()
    db.flush()

def list_sessions(db: Session, user_id: UUID, limit: int=20) -> list[AgentSession]:
    return db.query(AgentSession).filter(AgentSession.user_id == user_id).order_by(AgentSession.last_active_at.desc()).limit(limit).all()

def delete_sessions(db: Session, user_id: UUID, session_ids: list[UUID]) -> int:
    if not session_ids:
        return 0
    valid_sessions = db.query(AgentSession.session_id).filter(AgentSession.user_id == user_id, AgentSession.session_id.in_(session_ids)).all()
    valid_ids = [s.session_id for s in valid_sessions]
    if not valid_ids:
        return 0
    from app.models.agent import AgentRun, ToolCall
    run_ids = [r.run_id for r in db.query(AgentRun.run_id).filter(AgentRun.session_id.in_(valid_ids)).all()]
    if run_ids:
        db.query(ToolCall).filter(ToolCall.run_id.in_(run_ids)).delete(synchronize_session=False)
    db.query(AgentRun).filter(AgentRun.session_id.in_(valid_ids)).delete(synchronize_session=False)
    db.query(ChatMessage).filter(ChatMessage.session_id.in_(valid_ids)).delete(synchronize_session=False)
    deleted_count = db.query(AgentSession).filter(AgentSession.session_id.in_(valid_ids)).delete(synchronize_session=False)
    db.commit()
    return deleted_count