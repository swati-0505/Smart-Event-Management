from __future__ import annotations
from langchain_core.tools import BaseTool
from app.tools.event_tools import cancel_event, create_event, get_event_details, search_events, submit_event_feedback, update_event
from app.tools.rag_tools import search_event_policy
from app.tools.registration_tools import cancel_registration, get_event_registrations, my_registrations, register_participant
from app.tools.venue_tools import check_venue_availability, search_venues
USER_TOOLS: list[BaseTool] = [search_events, get_event_details, search_venues, check_venue_availability, register_participant, cancel_registration, my_registrations, submit_event_feedback, search_event_policy]
GUEST_TOOLS: list[BaseTool] = [search_events, get_event_details, search_venues, check_venue_availability, search_event_policy]
ADMIN_ONLY_TOOLS: list[BaseTool] = [create_event, update_event, cancel_event, get_event_registrations]
ALL_TOOLS: list[BaseTool] = USER_TOOLS + ADMIN_ONLY_TOOLS
TOOLS_BY_NAME: dict[str, BaseTool] = {tool.name: tool for tool in ALL_TOOLS}

def get_tools_for_role(role: str) -> list[BaseTool]:
    if (role or '').upper() in ('ADMIN', 'MAIN_ADMIN'):
        return list(ALL_TOOLS)
    if (role or '').upper() == 'GUEST':
        return list(GUEST_TOOLS)
    return list(USER_TOOLS)

def tool_names_for_role(role: str) -> list[str]:
    return [tool.name for tool in get_tools_for_role(role)]