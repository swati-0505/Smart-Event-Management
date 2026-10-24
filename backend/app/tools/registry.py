from __future__ import annotations
from langchain_core.tools import BaseTool
from app.core.permissions import ADMIN_ROLES, GUEST_ROLE, USER_ROLE
from app.tools.admin_tools import create_user, create_venue, delete_user, delete_venue, list_all_registrations, list_users, update_user_role, update_venue, view_agent_activity, view_agent_run
from app.tools.event_tools import cancel_event, create_event, delete_event, get_event_details, search_events, update_event
from app.tools.rag_tools import search_event_policy
from app.tools.registration_tools import cancel_registration, get_event_registrations, my_registrations, register_participant
from app.tools.venue_tools import check_venue_availability, search_venues
GUEST_TOOLS: list[BaseTool] = [search_events, get_event_details, search_venues, check_venue_availability, search_event_policy]
USER_TOOLS: list[BaseTool] = GUEST_TOOLS + [register_participant, cancel_registration, my_registrations]
ADMIN_TOOLS: list[BaseTool] = [
    create_event,
    update_event,
    cancel_event,
    delete_event,
    get_event_registrations,
    list_all_registrations,
    create_venue,
    update_venue,
    delete_venue,
    list_users,
    create_user,
    update_user_role,
    delete_user,
    view_agent_activity,
    view_agent_run,
]
ADMIN_ONLY_TOOLS = ADMIN_TOOLS
ALL_TOOLS: list[BaseTool] = USER_TOOLS + ADMIN_TOOLS
TOOLS_BY_NAME: dict[str, BaseTool] = {tool.name: tool for tool in ALL_TOOLS}

def get_tools_for_role(role: str) -> list[BaseTool]:
    if role in ADMIN_ROLES:
        return GUEST_TOOLS + ADMIN_TOOLS
    if role == GUEST_ROLE:
        return list(GUEST_TOOLS)
    if role == USER_ROLE:
        return list(USER_TOOLS)
    return list(GUEST_TOOLS)

def tool_names_for_role(role: str) -> list[str]:
    return [tool.name for tool in get_tools_for_role(role)]