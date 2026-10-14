from __future__ import annotations
import uuid
import pytest
from pydantic import ValidationError
from app.agent.prompts import build_system_prompt
from app.schemas.user import UserCreate
from app.tools.context import PermissionDenied, ToolContext, get_tool_context, require_admin, use_tool_context
from app.tools.formatting import parse_datetime, parse_uuid
from app.tools.registry import ADMIN_ONLY_TOOLS, ALL_TOOLS, USER_TOOLS, get_tools_for_role
from tests.ai.conftest import FakeSession

def test_tool_without_a_context_raises_clearly():
    with pytest.raises(RuntimeError, match='No ToolContext'):
        get_tool_context()

def test_context_is_removed_on_exit():
    context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role='USER')
    with use_tool_context(context):
        assert get_tool_context() is context
    with pytest.raises(RuntimeError):
        get_tool_context()

def test_context_is_removed_even_if_the_body_raises():
    context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role='USER')
    with pytest.raises(ValueError):
        with use_tool_context(context):
            raise ValueError('boom')
    with pytest.raises(RuntimeError):
        get_tool_context()

def test_nested_contexts_restore_the_outer_one():
    outer = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role='ADMIN')
    inner = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role='USER')
    with use_tool_context(outer):
        with use_tool_context(inner):
            assert get_tool_context().role == 'USER'
        assert get_tool_context().role == 'ADMIN'

def test_is_admin_is_case_insensitive():
    for role in ('ADMIN', 'admin', 'Admin'):
        assert ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role=role).is_admin

def test_user_role_is_not_admin():
    for role in ('USER', 'user', '', None):
        context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role=role)
        assert not context.is_admin

def test_require_admin_rejects_a_normal_user(user_context):
    with pytest.raises(PermissionDenied, match='administrator'):
        require_admin('create events')

def test_require_admin_allows_an_admin(admin_context):
    assert require_admin('create events') is admin_context

def test_permission_message_tells_the_user_what_to_do(user_context):
    with pytest.raises(PermissionDenied) as exc:
        require_admin('cancel events')
    message = str(exc.value)
    assert 'cancel events' in message
    assert 'administrator' in message.lower()

def test_users_do_not_receive_admin_tools():
    names = {tool.name for tool in get_tools_for_role('USER')}
    admin_names = {tool.name for tool in ADMIN_ONLY_TOOLS}
    assert names.isdisjoint(admin_names)

def test_admins_receive_every_tool():
    assert len(get_tools_for_role('ADMIN')) == len(ALL_TOOLS)

@pytest.mark.parametrize('role', ['ADMIN', 'MAIN_ADMIN'])
def test_admins_can_manage_events_and_use_attendee_tools(role):
    names = {tool.name for tool in get_tools_for_role(role)}
    assert {'register_participant', 'my_registrations', 'search_event_policy'}.issubset(names)
    assert {'create_event', 'get_event_registrations'}.issubset(names)

def test_assistant_prompt_explains_automatic_admin_participation_and_policy_answers():
    prompt = build_system_prompt('ADMIN', 'Wednesday, 14 October 2026')
    assert 'automatically considered participants in every event' in prompt
    assert 'do not call register_participant' in prompt
    assert 'search_event_policy' in prompt
    assert 'cite its source' in prompt
    assert 'Never apply this rule to a request to register another person' in prompt

def test_assistant_prompt_requires_missing_event_details_before_creation():
    prompt = build_system_prompt('ADMIN', 'Wednesday, 14 October 2026')
    assert 'ask a concise clarifying question' in prompt
    assert 'do not call create_event yet' in prompt
    assert 'Never invent required details' in prompt

def test_guests_receive_only_public_read_only_tools():
    names = {tool.name for tool in get_tools_for_role('GUEST')}
    assert names == {'search_events', 'get_event_details', 'search_venues', 'check_venue_availability', 'search_event_policy'}

def test_unknown_role_is_treated_as_a_plain_user():
    assert len(get_tools_for_role('superuser')) == len(USER_TOOLS)
    assert len(get_tools_for_role('')) == len(USER_TOOLS)

@pytest.mark.parametrize('role', ['admin', 'Admin', 'MAIN_ADMIN ', 'superuser'])
def test_user_creation_rejects_noncanonical_or_unsupported_roles(role):
    with pytest.raises(ValidationError):
        UserCreate(name='Test User', email='test@example.com', password='password123', role=role)

def test_user_creation_accepts_only_canonical_privileged_roles():
    user = UserCreate(name='Test User', email='test@example.com', password='password123', role='ADMIN')
    assert user.role == 'ADMIN'

def test_every_roadmap_tool_is_registered():
    required = {'search_events', 'create_event', 'update_event', 'cancel_event', 'check_venue_availability', 'register_participant', 'cancel_registration', 'get_event_details', 'search_event_policy'}
    registered = {tool.name for tool in ALL_TOOLS}
    assert required.issubset(registered), required - registered

def test_no_tool_exposes_identity_as_an_argument():
    forbidden = {'user_id', 'current_user', 'role', 'db', 'session', 'created_by'}
    for tool in ALL_TOOLS:
        exposed = set(tool.args.keys())
        leaked = exposed & forbidden
        assert not leaked, f'{tool.name} exposes {leaked} to the model'

def test_every_tool_has_a_description():
    for tool in ALL_TOOLS:
        assert tool.description and len(tool.description) > 40, tool.name

def test_parse_uuid_accepts_a_real_uuid():
    value = uuid.uuid4()
    assert parse_uuid(str(value), 'event_id') == value

def test_parse_uuid_error_tells_the_model_to_search_first():
    with pytest.raises(ValueError) as exc:
        parse_uuid('the-ai-workshop', 'event_id')
    message = str(exc.value)
    assert 'search_events' in message
    assert 'do not guess' in message.lower()

@pytest.mark.parametrize('bad', ['', '   ', '123', None])
def test_parse_uuid_rejects_junk(bad):
    with pytest.raises(ValueError):
        parse_uuid(bad, 'event_id')

@pytest.mark.parametrize('text', ['2026-03-15T14:30:00', '2026-03-15 14:30', '2026-03-15', '2026-03-15T14:30:00Z', '15/03/2026 14:30'])
def test_parse_datetime_accepts_formats_a_model_might_emit(text):
    result = parse_datetime(text)
    assert result.year == 2026
    assert result.month == 3
    assert result.day == 15

def test_parse_datetime_error_shows_the_expected_format():
    with pytest.raises(ValueError, match='ISO format'):
        parse_datetime('next Tuesday afternoon')