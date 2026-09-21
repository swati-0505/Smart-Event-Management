"""Agent tools. Every tool wraps a service; none of them touch SQL directly."""

from app.tools.context import (
    PermissionDenied,
    ToolContext,
    get_tool_context,
    require_admin,
    use_tool_context,
)
from app.tools.registry import (
    ADMIN_ONLY_TOOLS,
    ALL_TOOLS,
    TOOLS_BY_NAME,
    USER_TOOLS,
    get_tools_for_role,
)

__all__ = [
    "ADMIN_ONLY_TOOLS",
    "ALL_TOOLS",
    "PermissionDenied",
    "TOOLS_BY_NAME",
    "ToolContext",
    "USER_TOOLS",
    "get_tool_context",
    "get_tools_for_role",
    "require_admin",
    "use_tool_context",
]
