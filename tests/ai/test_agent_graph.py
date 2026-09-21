"""
Agent graph tests.

Covers the control flow rather than model quality: does the loop terminate,
does a tool failure become a recoverable message instead of an exception, does
the state carry what section 10 says it should.

Model quality is not testable here - it depends on whichever free model
openrouter/free happened to route to. What is testable is that the machinery
around the model behaves the same way regardless.
"""

from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from app.agent.graph import build_graph
from app.agent.nodes import act, classify_intent, finalize, should_continue
from app.agent.prompts import VALID_INTENTS, build_system_prompt
from app.agent.state import new_state
from app.core.ai_config import ai_settings


def _state(**overrides):
    state = new_state(
        user_id=uuid.uuid4(),
        role="USER",
        session_id=uuid.uuid4(),
        run_id=uuid.uuid4(),
        message="find an AI workshop",
    )
    state.update(overrides)
    return state






def test_graph_compiles_with_the_expected_nodes():
    nodes = set(build_graph().get_graph().nodes)

    for expected in ("classify_intent", "load_memory", "reason", "act", "finalize"):
        assert expected in nodes


def test_state_has_every_field_the_roadmap_requires():
    """Section 10 specifies these seven fields by name."""
    state = _state()

    for field in (
        "user_id",
        "message",
        "intent",
        "tool_calls",
        "tool_results",
        "retrieved_documents",
        "final_response",
    ):
        assert field in state


def test_collections_start_empty_not_none():
    """A None here becomes a TypeError three nodes later."""
    state = _state()

    assert state["tool_calls"] == []
    assert state["tool_results"] == []
    assert state["retrieved_documents"] == []
    assert state["loop_count"] == 0






def test_tool_calls_route_to_act():
    message = AIMessage(
        content="",
        tool_calls=[{"name": "search_events", "args": {}, "id": "1"}],
    )
    assert should_continue(_state(messages=[message], loop_count=1)) == "act"


def test_a_plain_answer_routes_to_finalize():
    message = AIMessage(content="Here are three workshops.")
    assert should_continue(_state(messages=[message], loop_count=1)) == "finalize"


def test_loop_cap_forces_finalize():
    """
    Without this, a model that keeps re-calling search_events with slightly
    different arguments runs until the request times out, burning free-tier
    quota the whole way.
    """
    message = AIMessage(
        content="",
        tool_calls=[{"name": "search_events", "args": {}, "id": "1"}],
    )
    state = _state(messages=[message], loop_count=ai_settings.AGENT_MAX_TOOL_LOOPS)

    assert should_continue(state) == "finalize"






def test_intent_is_extracted_from_a_noisy_reply():
    with patch("app.agent.nodes.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(
            content="The label is POLICY_QUESTION."
        )
        result = classify_intent(_state(message="what is the refund policy?"))

    assert result["intent"] == "POLICY_QUESTION"


def test_intent_failure_does_not_fail_the_turn():
    """Intent is observability, not control flow. It must never block a run."""
    with patch("app.agent.nodes.get_chat_model", side_effect=RuntimeError("429")):
        result = classify_intent(_state())

    assert result["intent"] == "GENERAL"


def test_unrecognised_label_falls_back_to_general():
    with patch("app.agent.nodes.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(content="BANANA")
        assert classify_intent(_state())["intent"] == "GENERAL"


def test_general_is_a_valid_intent():
    assert "GENERAL" in VALID_INTENTS






def _tool_request(name, args=None):
    return AIMessage(
        content="",
        tool_calls=[{"name": name, "args": args or {}, "id": "call-1"}],
    )


def test_successful_tool_call_is_recorded(user_context):
    state = _state(messages=[_tool_request("my_registrations")])

    with patch("app.agent.nodes.log_tool_call"):
        result = act(state)

    assert len(result["tool_calls"]) == 1
    assert result["tool_calls"][0]["name"] == "my_registrations"
    assert result["tool_results"][0]["status"] == "success"
    assert isinstance(result["messages"][0], ToolMessage)


def test_unknown_tool_returns_a_message_not_an_exception():
    """The model can recover from being told the tool does not exist."""
    state = _state(messages=[_tool_request("delete_everything")])

    with patch("app.agent.nodes.log_tool_call"), patch(
        "app.agent.nodes.get_tool_context"
    ) as ctx:
        ctx.return_value = MagicMock()
        result = act(state)

    assert result["tool_results"][0]["status"] == "error"
    assert "no tool called" in result["messages"][0].content.lower()


def test_permission_denial_is_reported_as_denied(user_context):
    """
    A user asking for an admin action is an expected outcome, not a crash,
    and it must be distinguishable from a genuine error in the activity log.
    """
    state = _state(
        role="USER",
        messages=[_tool_request("cancel_event", {"event_id": str(uuid.uuid4())})],
    )

    with patch("app.agent.nodes.log_tool_call"):
        result = act(state)

    assert result["tool_results"][0]["status"] == "denied"
    assert "administrator" in result["messages"][0].content.lower()


def test_bad_uuid_becomes_a_recoverable_message(user_context):
    state = _state(
        messages=[_tool_request("get_event_details", {"event_id": "not-a-uuid"})]
    )

    with patch("app.agent.nodes.log_tool_call"):
        result = act(state)

    assert result["tool_results"][0]["status"] == "error"
    assert "invalid input" in result["messages"][0].content.lower()


def test_tool_latency_is_measured(user_context):
    state = _state(messages=[_tool_request("my_registrations")])

    with patch("app.agent.nodes.log_tool_call"):
        result = act(state)

    assert result["tool_results"][0]["latency_ms"] >= 0


def test_multiple_tool_calls_in_one_turn_are_all_run(user_context):
    message = AIMessage(
        content="",
        tool_calls=[
            {"name": "my_registrations", "args": {}, "id": "a"},
            {"name": "search_events", "args": {"keyword": "ai"}, "id": "b"},
        ],
    )

    with patch("app.agent.nodes.log_tool_call"):
        result = act(_state(messages=[message]))

    assert len(result["tool_calls"]) == 2
    assert len(result["messages"]) == 2






def test_finalize_takes_the_last_assistant_message(user_context):
    state = _state(
        messages=[
            HumanMessage(content="find workshops"),
            AIMessage(content="", tool_calls=[{"name": "x", "args": {}, "id": "1"}]),
            ToolMessage(content="Found 2 events", tool_call_id="1", name="x"),
            AIMessage(content="I found two workshops for you."),
        ]
    )

    with patch("app.agent.nodes.memory.save_turn"):
        result = finalize(state)

    assert result["final_response"] == "I found two workshops for you."


def test_finalize_produces_a_fallback_when_there_is_no_answer(user_context):
    """Happens when the loop cap fires mid-chain. The user still gets text."""
    state = _state(messages=[HumanMessage(content="hi")])

    with patch("app.agent.nodes.memory.save_turn"):
        result = finalize(state)

    assert result["final_response"]
    assert "could not complete" in result["final_response"].lower()


def test_memory_failure_does_not_lose_the_answer(user_context):
    """Losing memory is bad. Losing the user's reply is worse."""
    state = _state(messages=[AIMessage(content="Here you go.")])

    with patch("app.agent.nodes.memory.save_turn", side_effect=RuntimeError("db down")):
        result = finalize(state)

    assert result["final_response"] == "Here you go."






def test_system_prompt_states_the_routing_rule():
    prompt = build_system_prompt(role="USER", today="Friday, 18 September 2026")

    assert "search_event_policy" in prompt
    assert "USER" in prompt
    assert "18 September 2026" in prompt


def test_system_prompt_forbids_inventing_ids():
    """The single most common failure mode for small models."""
    prompt = build_system_prompt(role="USER", today="today")
    assert "never invent" in prompt.lower()
