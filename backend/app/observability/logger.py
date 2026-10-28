from __future__ import annotations
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.permissions import require_admin_actor
from app.models.agent import AgentRun, ToolCall
logger = logging.getLogger(__name__)
MAX_OUTPUT_CHARS = 4000

def start_agent_run(db: Session, session_id: UUID, user_id: UUID | None, user_request: str) -> AgentRun:
    run = AgentRun(session_id=session_id, user_id=user_id, user_request=user_request, status='running')
    db.add(run)
    db.flush()
    return run

def finish_agent_run(db: Session, run_id: UUID, final_response: str, intent: str, tool_loop_count: int, latency_ms: float, status: str='success', error: str | None=None, grounded: bool | None=None, retry_count: int=0) -> None:
    updated_count = db.query(AgentRun).filter(AgentRun.run_id == run_id).update(
        {
            AgentRun.final_response: final_response or None,
            AgentRun.detected_intent: intent or None,
            AgentRun.tool_loop_count: tool_loop_count,
            AgentRun.latency_ms: round(latency_ms, 2),
            AgentRun.status: status,
            AgentRun.error: error,
            AgentRun.grounded: grounded,
            AgentRun.retry_count: retry_count,
        },
        synchronize_session=False,
    )
    if updated_count == 0:
        logger.info('Agent run %s was deleted before it could be finalized', run_id)
    db.flush()

def log_tool_call(db: Session, run_id: UUID, tool_name: str, tool_input: dict, tool_output: str, latency_ms: float, status: str='success', error: str | None=None, sequence: int=0) -> None:
    try:
        db.add(ToolCall(run_id=run_id, tool_name=tool_name, tool_input=_serialisable(tool_input), tool_output=(tool_output or '')[:MAX_OUTPUT_CHARS], latency_ms=round(latency_ms, 2), status=status, error=error, sequence=sequence))
        db.flush()
    except Exception as exc:
        db.rollback()
        logger.warning('Could not log tool call %s: %s', tool_name, exc)

def _serialisable(value: dict) -> dict:
    if not isinstance(value, dict):
        return {'value': str(value)}
    return {key: item if isinstance(item, (str, int, float, bool, type(None))) else str(item) for key, item in value.items()}

def get_recent_runs(db: Session, limit: int=50, *, actor_id: UUID) -> list[AgentRun]:
    require_admin_actor(db, actor_id)
    return db.query(AgentRun).order_by(AgentRun.created_at.desc()).limit(limit).all()

def get_run_tool_calls(db: Session, run_id: UUID, *, actor_id: UUID) -> list[ToolCall]:
    require_admin_actor(db, actor_id)
    return db.query(ToolCall).filter(ToolCall.run_id == run_id).order_by(ToolCall.sequence.asc()).all()