"""
Tool context and permission tests.

This is the security-relevant file. Two properties are being defended:

  1. An LLM cannot choose whose behalf it acts on. Identity comes from the
     JWT via ToolContext, never from a tool argument.
  2. An LLM cannot grant itself admin rights by being asked nicely. The
     admin check is Python, not a sentence in the system prompt.

If someone later "simplifies" tools by adding a user_id parameter, the
signature test below is what should fail.
"""

from __future__ import annotations

import uuid

import pytest

from app.tools.context import (
    PermissionDenied,
    ToolContext,
    get_tool_context,
    require_admin,
    use_tool_context,
)
from app.tools.formatting import parse_datetime, parse_uuid
from app.tools.registry import (
    ADMIN_ONLY_TOOLS,
    ALL_TOOLS,
    USER_TOOLS,
    get_tools_for_role,
)
from tests.ai.conftest import FakeSession






def test_tool_without_a_context_raises_clearly():
    """
    A missing context must fail loudly at the boundary.

    Returning None here would surface as an AttributeError deep inside a
    query, and the real cause would be invisible.
    """
    with pytest.raises(RuntimeError, match="No ToolContext"):
        get_tool_context()


def test_context_is_removed_on_exit():
    context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role="USER")

    with use_tool_context(context):
        assert get_tool_context() is context

    with pytest.raises(RuntimeError):
        get_tool_context()


def test_context_is_removed_even_if_the_body_raises():
    context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role="USER")

    with pytest.raises(ValueError):
        with use_tool_context(context):
            raise ValueError("boom")

    with pytest.raises(RuntimeError):
        get_tool_context()


def test_nested_contexts_restore_the_outer_one():
    outer = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role="ADMIN")
    inner = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role="USER")

    with use_tool_context(outer):
        with use_tool_context(inner):
            assert get_tool_context().role == "USER"
        assert get_tool_context().role == "ADMIN"






def test_is_admin_is_case_insensitive():
    for role in ("ADMIN", "admin", "Admin"):
        assert ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role=role).is_admin


def test_user_role_is_not_admin():
    for role in ("USER", "user", "", None):
        context = ToolContext(db=FakeSession(), user_id=uuid.uuid4(), role=role)
        assert not context.is_admin


def test_require_admin_rejects_a_normal_user(user_context):
    with pytest.raises(PermissionDenied, match="administrator"):
        require_admin("create events")


def test_require_admin_allows_an_admin(admin_context):
    assert require_admin("create events") is admin_context


def test_permission_message_tells_the_user_what_to_do(user_context):
    """The message goes back to the model and then to the user, so it must
    be actionable rather than a bare 403."""
    with pytest.raises(PermissionDenied) as exc:
        require_admin("cancel events")

    message = str(exc.value)
    assert "cancel events" in message
    assert "administrator" in message.lower()






def test_users_do_not_receive_admin_tools():
    """
    Defence in depth: a user's model is never even told create_event exists.

    The require_admin() check inside each admin tool is the real guarantee;
    this just removes the temptation and shortens the prompt.
    """
    names = {tool.name for tool in get_tools_for_role("USER")}
    admin_names = {tool.name for tool in ADMIN_ONLY_TOOLS}

    assert names.isdisjoint(admin_names)


def test_admins_receive_every_tool():
    assert len(get_tools_for_role("ADMIN")) == len(ALL_TOOLS)


def test_unknown_role_is_treated_as_a_plain_user():
    """Fail closed: an unrecognised role gets the smaller tool set."""
    assert len(get_tools_for_role("superuser")) == len(USER_TOOLS)
    assert len(get_tools_for_role("")) == len(USER_TOOLS)


def test_every_roadmap_tool_is_registered():
    """Section 10 lists nine required tools."""
    required = {
        "search_events",
        "create_event",
        "update_event",
        "cancel_event",
        "check_venue_availability",
        "register_participant",
        "cancel_registration",
        "get_event_details",
        "search_event_policy",
    }
    registered = {tool.name for tool in ALL_TOOLS}

    assert required.issubset(registered), required - registered


def test_no_tool_exposes_identity_as_an_argument():
    """
    The load-bearing security test.

    LangChain turns a tool signature into the JSON schema the model sees. A
    visible user_id would let a user say "register bob@example.com for me"
    and have the model comply. Identity must arrive via ToolContext only.
    """
    forbidden = {"user_id", "current_user", "role", "db", "session", "created_by"}

    for tool in ALL_TOOLS:
        exposed = set(tool.args.keys())
        leaked = exposed & forbidden
        assert not leaked, f"{tool.name} exposes {leaked} to the model"


def test_every_tool_has_a_description():
    """The docstring is the only thing telling the model when to use a tool."""
    for tool in ALL_TOOLS:
        assert tool.description and len(tool.description) > 40, tool.name






def test_parse_uuid_accepts_a_real_uuid():
    value = uuid.uuid4()
    assert parse_uuid(str(value), "event_id") == value


def test_parse_uuid_error_tells_the_model_to_search_first():
    """
    LLMs invent UUIDs under pressure. The error has to be a recovery
    instruction, not just a rejection, or the model retries the same guess.
    """
    with pytest.raises(ValueError) as exc:
        parse_uuid("the-ai-workshop", "event_id")

    message = str(exc.value)
    assert "search_events" in message
    assert "do not guess" in message.lower()


@pytest.mark.parametrize("bad", ["", "   ", "123", None])
def test_parse_uuid_rejects_junk(bad):
    with pytest.raises(ValueError):
        parse_uuid(bad, "event_id")


@pytest.mark.parametrize(
    "text",
    [
        "2026-03-15T14:30:00",
        "2026-03-15 14:30",
        "2026-03-15",
        "2026-03-15T14:30:00Z",
        "15/03/2026 14:30",
    ],
)
def test_parse_datetime_accepts_formats_a_model_might_emit(text):
    result = parse_datetime(text)
    assert result.year == 2026
    assert result.month == 3
    assert result.day == 15


def test_parse_datetime_error_shows_the_expected_format():
    with pytest.raises(ValueError, match="ISO format"):
        parse_datetime("next Tuesday afternoon")
