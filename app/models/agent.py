"""
Agent memory and observability tables.

  agent_sessions - one conversation thread (this is the memory boundary)
  chat_messages  - the actual turns; loading the last N gives the agent memory
  agent_runs     - one row per user message processed, with intent + latency
  tool_calls     - one row per tool invocation, with input, output and timing

Section 15 of the Infosys roadmap asks for run id, user id, intent, tool
selected, tool input/output, latency and errors. agent_runs + tool_calls
cover all of it, which is what feeds /admin/agent-activity.
"""

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.database import Base


class AgentSession(Base):
    """A conversation thread. The frontend passes session_id back to continue."""

    __tablename__ = "agent_sessions"
    __table_args__ = (Index("idx_agent_sessions_user_id", "user_id"),)

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_active_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    """One turn. This table IS the agent's memory."""

    __tablename__ = "chat_messages"
    __table_args__ = (
        Index("idx_chat_messages_session_created", "session_id", "created_at"),
    )

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agent_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
    )
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AgentRun(Base):
    """One trip through the graph, for one user message."""

    __tablename__ = "agent_runs"
    __table_args__ = (
        Index("idx_agent_runs_session_id", "session_id"),
        Index("idx_agent_runs_created_at", "created_at"),
    )

    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agent_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    user_request = Column(Text, nullable=False)
    detected_intent = Column(String, nullable=True)
    final_response = Column(Text, nullable=True)

    tool_loop_count = Column(Integer, nullable=False, default=0)
    grounded = Column(Boolean, nullable=True)
    retry_count = Column(Integer, nullable=False, default=0)

    latency_ms = Column(Float, nullable=True)
    status = Column(String, nullable=False, default="success")
    error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ToolCall(Base):
    """One tool invocation inside a run."""

    __tablename__ = "tool_calls"
    __table_args__ = (Index("idx_tool_calls_run_id", "run_id"),)

    tool_call_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agent_runs.run_id", ondelete="CASCADE"),
        nullable=False,
    )

    tool_name = Column(String, nullable=False)
    tool_input = Column(JSONB, nullable=True)
    tool_output = Column(Text, nullable=True)

    latency_ms = Column(Float, nullable=True)
    status = Column(String, nullable=False, default="success")
    error = Column(Text, nullable=True)

    sequence = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
