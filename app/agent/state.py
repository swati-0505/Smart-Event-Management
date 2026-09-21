
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
