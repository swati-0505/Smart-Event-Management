from __future__ import annotations
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.permissions import is_admin_role

@dataclass
class ToolContext:
    db: Session
    user_id: UUID | None
    role: str

    @property
    def is_admin(self) -> bool:
        return is_admin_role(self.role)
_tool_context: ContextVar[ToolContext | None] = ContextVar('tool_context', default=None)

@contextmanager
def use_tool_context(context: ToolContext):
    token = _tool_context.set(context)
    try:
        yield context
    finally:
        _tool_context.reset(token)

def get_tool_context() -> ToolContext:
    context = _tool_context.get()
    if context is None:
        raise RuntimeError('No ToolContext is active. Tools must run inside use_tool_context(...). If you are writing a test, wrap the call in that context manager.')
    return context

class PermissionDenied(PermissionError):
    pass

def require_admin(action: str) -> ToolContext:
    context = get_tool_context()
    if not context.is_admin:
        raise PermissionDenied(f'Only an administrator can {action}. Ask an event administrator to do this for you.')
    return context