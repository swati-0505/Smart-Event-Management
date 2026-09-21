"""
AgentState - the object that flows through the graph.

Section 10 of the roadmap specifies these fields:

    user_id, message, intent, tool_calls, tool_results,
    retrieved_documents, final_response

All seven are here. A few extras are added because the graph needs them:

    messages    - the LangGraph conversation channel. Everything the model
                  sees lives here: system prompt, memory, the current turn,
                  and every tool result. The `add_messages` reducer means
                  nodes return only what they want to append, rather than
                  rebuilding the list each time.
    session_id  - conversation thread, so memory can be loaded and saved.
    run_id      - this single turn, for observability.
    role        - the caller's role, used to pick the tool set.
    loop_count  - guards against an agent that calls tools forever.
"""

from __future__ import annotations

from typing import Annotated, Any, TypedDict
from uuid import UUID

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):

    user_id: UUID
    role: str
    session_id: UUID
    run_id: UUID


    message: str
    messages: Annotated[list[BaseMessage], add_messages]


    intent: str
    tool_calls: list[dict[str, Any]]
    tool_results: list[dict[str, Any]]
    retrieved_documents: list[str]


    final_response: str


    loop_count: int
    error: str


def new_state(
    *,
    user_id: UUID,
    role: str,
    session_id: UUID,
    run_id: UUID,
    message: str,
) -> AgentState:
    """Build a fresh state for one turn, with every collection initialised."""
    return AgentState(
        user_id=user_id,
        role=role,
        session_id=session_id,
        run_id=run_id,
        message=message,
        messages=[],
        intent="",
        tool_calls=[],
        tool_results=[],
        retrieved_documents=[],
        final_response="",
        loop_count=0,
        error="",
    )
