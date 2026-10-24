from __future__ import annotations
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from langchain_core.messages import AIMessage
import pytest
from pydantic import ValidationError
from fastapi.security import HTTPAuthorizationCredentials
from app.agent import nodes as agent_nodes
from app.schemas.user import UserCreate
from app.core.security import create_access_token, get_current_user
from app.tools.context import PermissionDenied, ToolContext, get_tool_context, require_admin, use_tool_context
from app.tools.formatting import parse_datetime, parse_uuid
from app.core.permissions import AuthorizationError
from app.models.event import Event
from app.models.user import User
from app.services import event_service, registration_service, venue_service
from app.tools.registry import ADMIN_ONLY_TOOLS, ALL_TOOLS, GUEST_TOOLS, USER_TOOLS, get_tools_for_role
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

def test_only_canonical_database_admin_roles_are_privileged():
    for role in ('ADMIN', 'MAIN_ADMIN'):
        assert ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role=role).is_admin

def test_unknown_and_noncanonical_roles_are_not_admin():
    for role in ('USER', 'admin', 'Admin', ' MAIN_ADMIN ', '', None):
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

def test_admins_receive_management_tools_but_not_participant_tools():
    names = {tool.name for tool in get_tools_for_role('ADMIN')}
    assert names == {tool.name for tool in GUEST_TOOLS + ADMIN_ONLY_TOOLS}
    assert names.isdisjoint({'register_participant', 'cancel_registration', 'my_registrations'})

def test_guests_receive_only_public_read_only_tools():
    names = {tool.name for tool in get_tools_for_role('GUEST')}
    assert names == {'search_events', 'get_event_details', 'search_venues', 'check_venue_availability', 'search_event_policy'}

def test_unknown_role_is_treated_as_a_plain_user():
    assert get_tools_for_role('superuser') == GUEST_TOOLS
    assert get_tools_for_role('') == GUEST_TOOLS

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

def test_admin_tools_cover_requested_management_surfaces():
    registered = {tool.name for tool in ALL_TOOLS}
    assert {
        'create_venue', 'update_venue', 'delete_venue',
        'list_all_registrations', 'list_users', 'create_user', 'update_user_role', 'delete_user',
        'view_agent_activity', 'view_agent_run',
    }.issubset(registered)

def test_no_tool_exposes_identity_as_an_argument():
    forbidden = {'user_id', 'current_user', 'role', 'db', 'session', 'created_by'}
    for tool in ALL_TOOLS:
        exposed = set(tool.args.keys())
        leaked = exposed & forbidden
        assert not leaked, f'{tool.name} exposes {leaked} to the model'

def test_users_cannot_trigger_admin_tools_through_agent_call(user_context, monkeypatch):
    from app.agent.nodes import act

    invoked = MagicMock()
    invoked.name = 'create_event'
    monkeypatch.setitem(agent_nodes.TOOLS_BY_NAME, 'create_event', invoked)
    state = {
        'messages': [AIMessage(content='', tool_calls=[{
            'name': 'create_event',
            'args': {},
            'id': 'admin-tool-attempt',
        }])],
        'run_id': uuid.uuid4(),
        'tool_calls': [],
        'tool_results': [],
        'retrieved_documents': [],
    }
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    invoked.invoke.assert_not_called()
    assert result['tool_results'][0]['status'] == 'denied'

def test_admin_cannot_trigger_participant_registration_through_agent_call(admin_context, monkeypatch):
    from app.agent.nodes import act

    invoked = MagicMock()
    invoked.name = 'register_participant'
    monkeypatch.setitem(agent_nodes.TOOLS_BY_NAME, 'register_participant', invoked)
    state = {
        'messages': [AIMessage(content='', tool_calls=[{
            'name': 'register_participant',
            'args': {'event_id': str(uuid.uuid4())},
            'id': 'participant-tool-attempt',
        }])],
        'run_id': uuid.uuid4(),
        'tool_calls': [],
        'tool_results': [],
        'retrieved_documents': [],
    }
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    invoked.invoke.assert_not_called()
    assert result['tool_results'][0]['status'] == 'denied'


def test_agent_delete_event_reports_registration_conflict(admin_context, monkeypatch):
    from app.tools.event_tools import delete_event

    def reject_deletion(*args, **kwargs):
        raise event_service.EventDeletionConflict(
            'Cannot permanently delete this event: it has registrations. '
            'Cancel the event instead to preserve its history.'
        )

    monkeypatch.setattr(
        event_service,
        'delete_event',
        reject_deletion,
    )

    result = delete_event.invoke({'event_id': str(uuid.uuid4())})

    assert 'Cancel the event instead' in result

def test_business_services_reject_user_event_and_venue_mutations(fake_db, user_id):
    actor = User(id=user_id, role='USER')
    fake_db.rows_for[User] = [actor]
    with pytest.raises(AuthorizationError):
        event_service.create_event(
            fake_db, title='Event', description='', category='Other',
            venue_id=uuid.uuid4(), event_date=None, registration_deadline=None,
            capacity=1, actor_id=user_id,
        )
    with pytest.raises(AuthorizationError):
        venue_service.create_venue(
            fake_db, name='Venue', address='Address', city='City',
            capacity=10, actor_id=user_id,
        )

def test_admin_can_create_events_and_venues(fake_db, user_id, monkeypatch):
    actor = User(id=user_id, role='ADMIN')
    fake_db.rows_for[User] = [actor]
    monkeypatch.setattr(event_service.redis_cache, 'delete_pattern', lambda _pattern: None)
    monkeypatch.setattr(venue_service.redis_cache, 'delete_pattern', lambda _pattern: None)
    event_date = datetime.now(timezone.utc) + timedelta(days=1)

    event = event_service.create_event(
        fake_db,
        title='Authorized event',
        description='',
        category='Technology',
        venue_id=uuid.uuid4(),
        event_date=event_date,
        registration_deadline=None,
        capacity=10,
        actor_id=user_id,
    )
    venue = venue_service.create_venue(
        fake_db,
        name='Authorized venue',
        address='Street',
        city='City',
        capacity=10,
        actor_id=user_id,
    )

    assert event.created_by == user_id
    assert event.status == 'draft'
    assert venue.name == 'Authorized venue'

def test_business_service_rejects_admin_participant_registration(fake_db, user_id):
    actor = User(id=user_id, role='ADMIN')
    fake_db.rows_for[User] = [actor]
    with pytest.raises(AuthorizationError, match='Administrators cannot'):
        registration_service.create_registration(
            fake_db, user_id=user_id, event_id=uuid.uuid4(), actor_id=user_id,
        )

def test_user_can_register_themselves_for_a_published_event(fake_db, user_id):
    fake_db.rows_for[User] = [User(id=user_id, role='USER')]
    event_id = uuid.uuid4()
    fake_db.rows_for[Event] = [SimpleNamespace(
        event_id=event_id,
        status='published',
        event_date=datetime.now(timezone.utc) + timedelta(days=1),
        available_seats=1,
    )]

    registration = registration_service.create_registration(
        fake_db, user_id=user_id, event_id=event_id, actor_id=user_id,
    )

    assert registration.user_id == user_id
    assert registration.event_id == event_id
    assert fake_db.rows_for[Event][0].available_seats == 0

def test_business_service_rejects_user_reading_another_users_registrations(fake_db, user_id):
    actor = User(id=user_id, role='USER')
    fake_db.rows_for[User] = [actor]
    with pytest.raises(AuthorizationError, match='Registration access denied'):
        registration_service.get_user_registrations(
            fake_db, uuid.uuid4(), actor_id=user_id,
        )

def test_authorization_role_is_loaded_from_database_not_jwt_claim(user_id, fake_db):
    database_user = User(id=user_id, role='USER')
    fake_db.rows_for[User] = [database_user]
    token = create_access_token({'sub': str(user_id), 'role': 'ADMIN'})
    credentials = HTTPAuthorizationCredentials(scheme='Bearer', credentials=token)

    current_user = get_current_user(credentials=credentials, db=fake_db)

    assert current_user is database_user
    assert current_user.role == 'USER'

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