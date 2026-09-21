"""
Request-scoped context for tools.

The problem this solves: a tool needs a database session, the caller's user id
and the caller's role. None of those may appear in the tool's signature,
because LangChain turns the signature into the JSON schema the LLM sees - and
an LLM that can see a `user_id` parameter is an LLM that can set it to someone
else's id. Every tool would become a privilege-escalation hole.

So the LLM-visible arguments are business arguments only ("category",
"event_id"), and identity arrives out of band through a context variable that
the chat endpoint sets before invoking the graph.

contextvars rather than a plain global because FastAPI runs sync endpoints in
a threadpool; contextvars are copied per task, so two concurrent requests
cannot see each other's session or user.
"""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session


@dataclass
class ToolContext:
    """Everything a tool needs that the LLM must not control."""

    db: Session
    user_id: UUID
    role: str

    @property
    def is_admin(self) -> bool:
        return (self.role or "").upper() == "ADMIN"


_tool_context: ContextVar[ToolContext | None] = ContextVar("tool_context", default=None)


@contextmanager
def use_tool_context(context: ToolContext):
    """Set the context for the duration of one agent run."""
    token = _tool_context.set(context)
    try:
        yield context
    finally:
        _tool_context.reset(token)


def get_tool_context() -> ToolContext:
    """
    Fetch the active context.

    Raises rather than returning None: a tool running without a context would
    otherwise fall through to an AttributeError somewhere deep in a query,
    and the cause would be very hard to see.
    """
    context = _tool_context.get()
    if context is None:
        raise RuntimeError(
            "No ToolContext is active. Tools must run inside use_tool_context(...). "
            "If you are writing a test, wrap the call in that context manager."
        )
    return context


class PermissionDenied(Exception):
    """Raised when a tool is called by a user whose role does not allow it."""


def require_admin(action: str) -> ToolContext:
    """
    Guard for admin-only tools.

    This is enforced here, in Python, rather than by asking the LLM nicely in
    the system prompt. Prompt instructions are a suggestion; this is a check.
    """
    context = get_tool_context()
    if not context.is_admin:
        raise PermissionDenied(
            f"Only an administrator can {action}. "
            f"Ask an event administrator to do this for you."
        )
    return context
