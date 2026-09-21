"""
The tool registry.

One place that answers "which tools exist, and who may use them".

Tools are filtered by role *before* being bound to the model, so a normal user's
agent is never even told that create_event exists. This is defence in depth
rather than the only defence - the admin tools also call require_admin()
internally - but it removes the temptation entirely and shortens the prompt.
"""

from __future__ import annotations

from langchain_core.tools import BaseTool

from app.tools.event_tools import (
    cancel_event,
    create_event,
    get_event_details,
    search_events,
    update_event,
)
from app.tools.rag_tools import search_event_policy
from app.tools.registration_tools import (
    cancel_registration,
    get_event_registrations,
    my_registrations,
    register_participant,
)
from app.tools.venue_tools import check_venue_availability, search_venues


USER_TOOLS: list[BaseTool] = [
    search_events,
    get_event_details,
    search_venues,
    check_venue_availability,
    register_participant,
    cancel_registration,
    my_registrations,
    search_event_policy,
]


ADMIN_ONLY_TOOLS: list[BaseTool] = [
    create_event,
    update_event,
    cancel_event,
    get_event_registrations,
]

ALL_TOOLS: list[BaseTool] = USER_TOOLS + ADMIN_ONLY_TOOLS

TOOLS_BY_NAME: dict[str, BaseTool] = {tool.name: tool for tool in ALL_TOOLS}


def get_tools_for_role(role: str) -> list[BaseTool]:
    """Return the tools a given role is allowed to call."""
    if (role or "").upper() == "ADMIN":
        return list(ALL_TOOLS)
    return list(USER_TOOLS)


def tool_names_for_role(role: str) -> list[str]:
    return [tool.name for tool in get_tools_for_role(role)]
