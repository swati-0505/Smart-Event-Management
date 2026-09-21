"""
Observability.
Section 15 of the roadmap lists what must be captured per run: run id, user
id, timestamp, request, detected intent, tool selected, tool input, tool
output, latency, errors, final response. All of it lands in agent_runs and
tool_calls, which is what /admin/agent-activity reads.

Design choices worth knowing:

  * A run row is written *before* the graph executes, not after. If the run
    crashes, there is still a record of it having been attempted - which is
    exactly the case you most want visibility into.
  * Tool output is truncated. A search returning 200 events would otherwise
    put a wall of text in the audit table for no benefit.
  * Logging failures are swallowed. Observability that can take down the
    feature it observes is worse than no observability.
"""

from __future__ import annotations
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.agent import AgentRun, ToolCall



logger = logging.getLogger(__name__)
MAX_OUTPUT_CHARS = 4000


def start_agent_run(
    db: Session,
    session_id: UUID,
    user_id: UUID,
    user_request: str,
) -> AgentRun:
    """Open a run record before the graph starts."""
    run = AgentRun(
        session_id=session_id,
        user_id=user_id,
        user_request=user_request,
        status="running",
    )
    db.add(run)
    db.flush()
    return run


def finish_agent_run(
    db: Session,
    run: AgentRun,
    final_response: str,
    intent: str,
    tool_loop_count: int,
    latency_ms: float,
    status: str = "success",
    error: str | None = None,
    grounded: bool | None = None,
    retry_count: int = 0,
) -> None:
    """Close the run record with the outcome."""
    run.final_response = final_response or None
    run.detected_intent = intent or None
    run.tool_loop_count = tool_loop_count
    run.latency_ms = round(latency_ms, 2)
    run.status = status
    run.error = error
    run.grounded = grounded
    run.retry_count = retry_count
    db.flush()


def log_tool_call(
    db: Session,
    run_id: UUID,
    tool_name: str,
    tool_input: dict,
    tool_output: str,
    latency_ms: float,
    status: str = "success",
    error: str | None = None,
    sequence: int = 0,
) -> None:
    """Record one tool invocation. Never raises."""
    try:
        db.add(
            ToolCall(
                run_id=run_id,
                tool_name=tool_name,
                tool_input=_serialisable(tool_input),
                tool_output=(tool_output or "")[:MAX_OUTPUT_CHARS],
                latency_ms=round(latency_ms, 2),
                status=status,
                error=error,
                sequence=sequence,
            )
        )
        db.flush()
    except Exception as exc:
        logger.warning("Could not log tool call %s: %s", tool_name, exc)


def _serialisable(value: dict) -> dict:
    """
    Make tool arguments safe for a JSONB column.

    UUIDs and datetimes arrive here regularly and are not JSON-serialisable;
    stringifying them is lossless enough for an audit log.
    """
    if not isinstance(value, dict):
        return {"value": str(value)}
    return {key: (item if isinstance(item, (str, int, float, bool, type(None))) else str(item))
            for key, item in value.items()}


def get_recent_runs(db: Session, limit: int = 50) -> list[AgentRun]:
    """Feeds the admin agent-activity view."""
    return db.query(AgentRun).order_by(AgentRun.created_at.desc()).limit(limit).all()


def get_run_tool_calls(db: Session, run_id: UUID) -> list[ToolCall]:
    return (
        db.query(ToolCall)
        .filter(ToolCall.run_id == run_id)
        .order_by(ToolCall.sequence.asc())
        .all()
    )
