"""
The LangGraph workflow.

    classify_intent
          |
      load_memory
          |
        reason  <-------+
          |             |
      has tool calls?   |
       /          \     |
     act ---------+     |   (loop, capped by AGENT_MAX_TOOL_LOOPS)
       \                |
        no tool calls   |
          |             |
       finalize --------+
          |
         END

This is the reason/act cycle from section 11 of the roadmap. reason decides,
act executes, results go back into the message list, and reason looks again
with more information than it had before. Multi-step workflows fall out of
this naturally: "find an AI workshop and register me" is search_events on the
first pass, register_participant on the second, using the event_id the first
pass returned.

run_agent() is the only function the API layer needs.
"""

from __future__ import annotations

import logging
import time
from uuid import UUID, uuid4

from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.agent import memory
from app.agent.nodes import (
    act,
    classify_intent,
    finalize,
    load_memory,
    reason,
    should_continue,
)
from app.agent.state import AgentState, new_state
from app.observability.logger import finish_agent_run, start_agent_run
from app.tools.context import ToolContext, use_tool_context

logger = logging.getLogger(__name__)

_compiled_graph = None


def build_graph():
    """Wire the nodes together and compile."""
    graph = StateGraph(AgentState)

    graph.add_node("classify_intent", classify_intent)
    graph.add_node("load_memory", load_memory)
    graph.add_node("reason", reason)
    graph.add_node("act", act)
    graph.add_node("finalize", finalize)

    graph.add_edge(START, "classify_intent")
    graph.add_edge("classify_intent", "load_memory")
    graph.add_edge("load_memory", "reason")

    graph.add_conditional_edges(
        "reason",
        should_continue,
        {"act": "act", "finalize": "finalize"},
    )



    graph.add_edge("act", "reason")
    graph.add_edge("finalize", END)

    return graph.compile()


def get_graph():
    """Compile once, reuse. Compilation is not free."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
        logger.info("Agent graph compiled")
    return _compiled_graph


class AgentResult:
    """What the API layer gets back."""

    def __init__(
        self,
        *,
        reply: str,
        session_id: UUID,
        run_id: UUID,
        intent: str,
        tools_used: list[str],
        tool_results: list[dict],
        sources: list[str],
        latency_ms: float,
        status: str,
        error: str = "",
    ):
        self.reply = reply
        self.session_id = session_id
        self.run_id = run_id
        self.intent = intent
        self.tools_used = tools_used
        self.tool_results = tool_results
        self.sources = sources
        self.latency_ms = latency_ms
        self.status = status
        self.error = error


def run_agent(
    db: Session,
    user_id: UUID,
    role: str,
    message: str,
    session_id: UUID | None = None,
) -> AgentResult:
    """
    Process one user message, start to finish.

    Responsible for the things that surround the graph: resolving the session,
    opening the run log, installing the tool context, and making sure a failure
    anywhere inside still produces a reply and a closed log entry.
    """
    started = time.perf_counter()

    session = memory.get_or_create_session(
        db=db, user_id=user_id, session_id=session_id, first_message=message
    )
    run = start_agent_run(
        db=db, session_id=session.session_id, user_id=user_id, user_request=message
    )

    state = new_state(
        user_id=user_id,
        role=role,
        session_id=session.session_id,
        run_id=run.run_id,
        message=message,
    )

    context = ToolContext(db=db, user_id=user_id, role=role)

    try:

        with use_tool_context(context):
            final_state = get_graph().invoke(state)

        latency_ms = (time.perf_counter() - started) * 1000
        reply = final_state.get("final_response", "")
        tools_used = [call["name"] for call in final_state.get("tool_calls", [])]

        finish_agent_run(
            db=db,
            run=run,
            final_response=reply,
            intent=final_state.get("intent", ""),
            tool_loop_count=final_state.get("loop_count", 0),
            latency_ms=latency_ms,
            status="success",
        )
        db.commit()

        logger.info(
            "run=%s intent=%s tools=%s latency=%.0fms",
            run.run_id,
            final_state.get("intent"),
            tools_used,
            latency_ms,
        )

        return AgentResult(
            reply=reply,
            session_id=session.session_id,
            run_id=run.run_id,
            intent=final_state.get("intent", ""),
            tools_used=tools_used,
            tool_results=final_state.get("tool_results", []),
            sources=final_state.get("retrieved_documents", []),
            latency_ms=latency_ms,
            status="success",
        )

    except Exception as exc:
        logger.exception("Agent run %s failed", run.run_id)
        latency_ms = (time.perf_counter() - started) * 1000

        db.rollback()
        try:

            finish_agent_run(
                db=db,
                run=run,
                final_response="",
                intent="",
                tool_loop_count=0,
                latency_ms=latency_ms,
                status="error",
                error=str(exc),
            )
            db.commit()
        except Exception:
            db.rollback()
            logger.exception("Could not record the failed run")

        return AgentResult(
            reply=(
                "Something went wrong while handling that request. "
                "Please try again, or contact an administrator if it keeps happening."
            ),
            session_id=session.session_id,
            run_id=run.run_id,
            intent="",
            tools_used=[],
            tool_results=[],
            sources=[],
            latency_ms=latency_ms,
            status="error",
            error=str(exc),
        )
