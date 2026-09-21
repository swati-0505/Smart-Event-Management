"""
Conversation memory.

Memory here means: load the last N turns of this session from Postgres and
put them in front of the model, then save the new turn.

Why the database rather than LangGraph's checkpointer: the frontend already
has a conversation_id concept, the roadmap already asks for agent_sessions in
section 7, and an admin needs to read these threads back in the agent-activity
view. One store that serves memory, history and audit is simpler than a
checkpointer plus a separate audit trail.

Only user and assistant turns are persisted, not the intermediate tool calls.
Replaying old tool results into a new turn is worse than useless - the model
treats stale seat counts as current. Tool results live in the agent_runs and
tool_calls tables for observability, not in memory.
"""

from __future__ import annotations

import logging
from uuid import UUID

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy.orm import Session

from app.core.ai_config import ai_settings
from app.models.agent import AgentSession, ChatMessage

logger = logging.getLogger(__name__)


def get_or_create_session(
    db: Session,
    user_id: UUID,
    session_id: UUID | None = None,
    first_message: str = "",
) -> AgentSession:
    """
    Fetch an existing session or start a new one.

    A session_id belonging to a different user is treated as not found rather
    than raising, so one user cannot read another's thread by guessing an id.
    """
    if session_id:
        session = (
            db.query(AgentSession)
            .filter(
                AgentSession.session_id == session_id,
                AgentSession.user_id == user_id,
            )
            .first()
        )
        if session:
            return session
        logger.info("Session %s not found for this user; starting a new one", session_id)

    session = AgentSession(
        user_id=user_id,
        title=(first_message[:80] if first_message else None),
    )
    db.add(session)
    db.flush()
    return session


def load_history(
    db: Session,
    session_id: UUID,
    limit: int | None = None,
) -> list[BaseMessage]:
    """Load the most recent turns, oldest first, as LangChain messages."""
    limit = limit or ai_settings.MEMORY_WINDOW_MESSAGES

    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    messages: list[BaseMessage] = []
    for row in reversed(rows):
        if row.role == "user":
            messages.append(HumanMessage(content=row.content))
        elif row.role == "assistant":
            messages.append(AIMessage(content=row.content))

    return messages


def save_turn(
    db: Session,
    session_id: UUID,
    user_message: str,
    assistant_message: str,
) -> None:
    """Persist one exchange and bump the session's activity timestamp."""
    db.add(ChatMessage(session_id=session_id, role="user", content=user_message))
    db.add(
        ChatMessage(session_id=session_id, role="assistant", content=assistant_message)
    )

    session = (
        db.query(AgentSession).filter(AgentSession.session_id == session_id).first()
    )
    if session:
        from sqlalchemy import func

        session.last_active_at = func.now()

    db.flush()


def list_sessions(db: Session, user_id: UUID, limit: int = 20) -> list[AgentSession]:
    """A user's conversation threads, most recently active first."""
    return (
        db.query(AgentSession)
        .filter(AgentSession.user_id == user_id)
        .order_by(AgentSession.last_active_at.desc())
        .limit(limit)
        .all()
    )
