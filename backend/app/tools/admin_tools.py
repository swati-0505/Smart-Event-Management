from __future__ import annotations

from uuid import UUID

from langchain_core.tools import tool

from app.core.permissions import USER_ROLE
from app.core.security import hash_password
from app.models.agent import AgentRun
from app.models.user import User
from app.observability.logger import get_recent_runs, get_run_tool_calls
from app.services import event_service, registration_service, user_service, venue_service
from app.tools.context import require_admin


@tool
def create_venue(name: str, address: str, city: str, capacity: int) -> str:
    """Create a venue with its name, address, city, and attendee capacity. Admin only."""
    context = require_admin('create venues')
    venue = venue_service.create_venue(
        context.db,
        name=name,
        address=address,
        city=city,
        capacity=capacity,
        actor_id=context.user_id,
    )
    return f"Created venue '{venue.name}' (venue_id: {venue.venue_id}) in {venue.city}."


@tool
def list_all_registrations(limit: int = 50) -> str:
    """View recent event registrations across all events. Admin only."""
    context = require_admin('view all event registrations')
    registrations = registration_service.get_all_registrations(
        context.db,
        actor_id=context.user_id,
    )
    registrations = registrations[:max(1, min(limit, 100))]
    if not registrations:
        return 'There are no event registrations to display.'
    lines = []
    for registration in registrations:
        event = event_service.get_event_by_id(
            context.db,
            registration.event_id,
            actor_id=context.user_id,
        )
        user = context.db.query(User).filter(User.id == registration.user_id).first()
        lines.append(
            f'- {event.title if event else "Unknown event"} | '
            f'{user.name if user else "Unknown user"} | status: {registration.status}'
        )
    return f'Event registrations (showing {len(lines)}):\n' + '\n'.join(lines)


@tool
def update_venue(
    venue_id: str,
    name: str = '',
    address: str = '',
    city: str = '',
    capacity: int = 0,
) -> str:
    """Update a venue's details or capacity by venue ID. Admin only."""
    context = require_admin('update venues')
    try:
        parsed_id = UUID(venue_id)
    except (TypeError, ValueError) as exc:
        raise ValueError('venue_id must be a UUID.') from exc
    updates = {
        key: value
        for key, value in {
            'name': name,
            'address': address,
            'city': city,
            'capacity': capacity or None,
        }.items()
        if value
    }
    if not updates:
        return 'No venue changes were provided.'
    venue = venue_service.update_venue(
        context.db,
        parsed_id,
        actor_id=context.user_id,
        **updates,
    )
    if not venue:
        return f'No venue exists with id {venue_id}.'
    return f"Updated venue '{venue.name}' (venue_id: {venue.venue_id})."


@tool
def delete_venue(venue_id: str) -> str:
    """Delete a venue by venue ID. Admin only; existing event constraints still apply."""
    context = require_admin('delete venues')
    try:
        parsed_id = UUID(venue_id)
    except (TypeError, ValueError) as exc:
        raise ValueError('venue_id must be a UUID.') from exc
    venue = venue_service.delete_venue(
        context.db,
        parsed_id,
        actor_id=context.user_id,
    )
    if not venue:
        return f'No venue exists with id {venue_id}.'
    return f"Deleted venue '{venue.name}'."


@tool
def list_users() -> str:
    """List user names, email addresses, and roles for administration. Admin only."""
    context = require_admin('view and manage users')
    users = user_service.get_all_users(context.db, actor_id=context.user_id)
    if not users:
        return 'There are no users to display.'
    return 'Users:\n' + '\n'.join(
        f'- {user.name} <{user.email}> | role: {user.role} | user_id: {user.id}'
        for user in users
    )


@tool
def create_user(name: str, email: str, password: str, assigned_role: str = USER_ROLE) -> str:
    """Create a user account; creating administrator accounts requires MAIN_ADMIN. Admin only."""
    context = require_admin('create user accounts')
    if user_service.get_user_by_email(
        context.db,
        email,
        actor_id=context.user_id,
    ):
        return 'A user with that email address already exists.'
    user = user_service.create_user(
        context.db,
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=assigned_role,
        actor_id=context.user_id,
    )
    return f"Created user '{user.name}' (user_id: {user.id}) with role {user.role}."


@tool
def delete_user(target_user_id: str) -> str:
    """Delete a user account by user ID. Admin only."""
    context = require_admin('delete user accounts')
    try:
        parsed_id = UUID(target_user_id)
    except (TypeError, ValueError) as exc:
        raise ValueError('target_user_id must be a UUID.') from exc
    user = user_service.delete_user(
        context.db,
        parsed_id,
        actor_id=context.user_id,
    )
    if not user:
        return f'No user exists with id {target_user_id}.'
    return f"Deleted user '{user.name}'."


@tool
def update_user_role(target_user_id: str, assigned_role: str) -> str:
    """Change a user's role. This restricted operation requires MAIN_ADMIN."""
    context = require_admin('change user roles')
    try:
        parsed_id = UUID(target_user_id)
    except (TypeError, ValueError) as exc:
        raise ValueError('target_user_id must be a UUID.') from exc
    user = user_service.update_user_role(
        context.db,
        parsed_id,
        assigned_role,
        actor_id=context.user_id,
    )
    if not user:
        return f'No user exists with id {target_user_id}.'
    return f"Updated '{user.name}' to role {user.role}."


@tool
def view_agent_activity(limit: int = 10) -> str:
    """View recent AI agent runs and their status. Admin only."""
    context = require_admin('view agent activity')
    runs = get_recent_runs(
        context.db,
        limit=max(1, min(limit, 50)),
        actor_id=context.user_id,
    )
    if not runs:
        return 'There is no agent activity to display.'
    return 'Recent agent runs:\n' + '\n'.join(
        f'- {run.run_id} | status: {run.status} | request: {(run.user_request or "")[:160]}'
        for run in runs
    )


@tool
def view_agent_run(run_id: str) -> str:
    """View an AI agent run and its tool activity by run ID. Admin only."""
    context = require_admin('view agent activity')
    try:
        parsed_id = UUID(run_id)
    except (TypeError, ValueError) as exc:
        raise ValueError('run_id must be a UUID.') from exc
    run = context.db.query(AgentRun).filter(AgentRun.run_id == parsed_id).first()
    if not run:
        return f'No agent run exists with id {run_id}.'
    calls = get_run_tool_calls(
        context.db,
        parsed_id,
        actor_id=context.user_id,
    )
    call_summary = '\n'.join(
        f'- {call.tool_name} | {call.status}: {(call.tool_output or "")[:200]}'
        for call in calls
    ) or 'No tools were called.'
    return (
        f'Run {run.run_id} | status: {run.status}\n'
        f'Request: {run.user_request}\n'
        f'Response: {run.final_response or ""}\n'
        f'Tool calls:\n{call_summary}'
    )
