from __future__ import annotations
import uuid
from unittest.mock import MagicMock, patch
import pytest
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from app.agent import nodes as agent_nodes
from app.agent.graph import build_graph, run_agent
from app.agent.nodes import _redact_tool_arguments, act, classify_intent, finalize, reason, should_continue
from app.agent.prompts import VALID_INTENTS, build_system_prompt
from app.agent.state import new_state
from app.core.ai_config import ai_settings

def _state(**overrides):
    state = new_state(user_id=uuid.uuid4(), session_id=uuid.uuid4(), run_id=uuid.uuid4(), message='find an AI workshop')
    state.update(overrides)
    return state

def test_graph_compiles_with_the_expected_nodes():
    nodes = set(build_graph().get_graph().nodes)
    for expected in ('classify_intent', 'load_memory', 'reason', 'act', 'finalize'):
        assert expected in nodes

def test_state_has_every_field_the_roadmap_requires():
    state = _state()
    for field in ('user_id', 'message', 'intent', 'tool_calls', 'tool_results', 'retrieved_documents', 'final_response'):
        assert field in state

def test_collections_start_empty_not_none():
    state = _state()
    assert state['tool_calls'] == []
    assert state['tool_results'] == []
    assert state['retrieved_documents'] == []
    assert state['loop_count'] == 0

def test_tool_calls_route_to_act():
    message = AIMessage(content='', tool_calls=[{'name': 'search_events', 'args': {}, 'id': '1'}])
    assert should_continue(_state(messages=[message], loop_count=1)) == 'act'

def test_sensitive_tool_arguments_are_redacted_before_logging():
    assert _redact_tool_arguments({
        'email': 'person@example.com',
        'password': 'do-not-log',
        'api_key': 'secret-key',
    }) == {
        'email': 'person@example.com',
        'password': '[REDACTED]',
        'api_key': '[REDACTED]',
    }

def test_a_plain_answer_routes_to_finalize():
    message = AIMessage(content='Here are three workshops.')
    assert should_continue(_state(messages=[message], loop_count=1)) == 'finalize'

def test_loop_cap_forces_finalize():
    message = AIMessage(content='', tool_calls=[{'name': 'search_events', 'args': {}, 'id': '1'}])
    state = _state(messages=[message], loop_count=ai_settings.AGENT_MAX_TOOL_LOOPS)
    assert should_continue(state) == 'finalize'

def test_intent_is_extracted_from_a_noisy_reply():
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='The label is POLICY_QUESTION.')
        result = classify_intent(_state(message='what is the refund policy?'))
    assert result['intent'] == 'POLICY_QUESTION'

def test_intent_failure_does_not_fail_the_turn():
    from app.llm.exceptions import LLMUnavailableError
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = LLMUnavailableError(
            'multi-provider', 'All configured LLM providers failed.'
        )
        result = classify_intent(_state())
    assert result['intent'] == 'GENERAL'

def test_intent_classification_uses_the_central_provider_router():
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='POLICY_QUESTION')
        result = classify_intent(_state(message='What is the refund policy?'))
    assert result['intent'] == 'POLICY_QUESTION'
    router.return_value.invoke.assert_called_once()
    assert router.return_value.invoke.call_args.kwargs == {'temperature': 0.0}

def test_intent_returns_general_when_all_providers_fail():
    from app.llm.exceptions import LLMUnavailableError
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = LLMUnavailableError(
            'multi-provider', 'All configured LLM providers failed.'
        )
        assert classify_intent(_state())['intent'] == 'GENERAL'

def test_intent_does_not_hide_unexpected_programming_errors():
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = ValueError('unexpected prompt error')
        with pytest.raises(ValueError, match='unexpected prompt error'):
            classify_intent(_state())

def test_reason_uses_provider_defaults_and_preserves_tool_binding(user_context):
    from app.tools.registry import get_tools_for_role
    state = _state(messages=[HumanMessage(content='Find events')])
    state['role'] = 'ADMIN'
    tools = get_tools_for_role('USER')
    response = AIMessage(
        content='',
        tool_calls=[{'name': 'search_events', 'args': {'keyword': 'AI'}, 'id': 'call-1'}],
    )
    with patch('app.agent.nodes.LLMProviderRouter') as router, patch(
        'app.agent.nodes.get_tools_for_role', return_value=tools
    ) as get_tools:
        router.return_value.invoke.return_value = response
        result = reason(state)
    assert result['messages'] == [response]
    assert result['loop_count'] == 1
    get_tools.assert_called_once_with('USER')
    assert router.return_value.invoke.call_args.args == (state['messages'],)
    assert router.return_value.invoke.call_args.kwargs['tools'] == tools
    assert 'model' not in router.return_value.invoke.call_args.kwargs

def test_reason_returns_controlled_message_when_all_providers_fail(user_context):
    from app.llm.exceptions import LLMUnavailableError
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = LLMUnavailableError(
            'multi-provider', 'All configured LLM providers failed.'
        )
        result = reason(_state(messages=[HumanMessage(content='Hello')]))
    assert result['messages'][0].content.startswith("I'm unable to reach the AI service")
    assert result['error'] == 'Configured chat providers unavailable.'

def test_act_keeps_rag_source_citations(monkeypatch):
    rag_tool = MagicMock()
    rag_tool.name = 'search_event_policy'
    rag_tool.invoke.return_value = 'Policies say so.\n\nSources: Refund Policy'
    monkeypatch.setitem(agent_nodes.TOOLS_BY_NAME, 'search_event_policy', rag_tool)
    monkeypatch.setattr('app.agent.nodes.get_tools_for_role', lambda _role: [rag_tool])
    state = _state(messages=[_tool_request('search_event_policy')])
    with patch('app.agent.nodes.get_tool_context') as get_context, patch('app.agent.nodes.log_tool_call'):
        get_context.return_value = MagicMock(role='USER', db=MagicMock())
        result = act(state)
    assert result['messages'][0].content == 'Policies say so.\n\nSources: Refund Policy'
    assert result['retrieved_documents'] == ['Refund Policy']

def test_unrecognised_label_falls_back_to_general():
    with patch('app.agent.nodes.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='BANANA')
        assert classify_intent(_state())['intent'] == 'GENERAL'

def test_general_is_a_valid_intent():
    assert 'GENERAL' in VALID_INTENTS

def _tool_request(name, args=None):
    return AIMessage(content='', tool_calls=[{'name': name, 'args': args or {}, 'id': 'call-1'}])

def test_successful_tool_call_is_recorded(user_context):
    state = _state(messages=[_tool_request('my_registrations')])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    assert len(result['tool_calls']) == 1
    assert result['tool_calls'][0]['name'] == 'my_registrations'
    assert result['tool_results'][0]['status'] == 'success'
    assert isinstance(result['messages'][0], ToolMessage)

def test_unexpected_tool_failure_rolls_back_the_database_session(user_context, monkeypatch):
    failing_tool = MagicMock()
    failing_tool.name = 'my_registrations'
    failing_tool.invoke.side_effect = RuntimeError('database operation failed')
    monkeypatch.setitem(agent_nodes.TOOLS_BY_NAME, failing_tool.name, failing_tool)
    monkeypatch.setattr('app.agent.nodes.get_tools_for_role', lambda _role: [failing_tool])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(_state(messages=[_tool_request(failing_tool.name)]))
    assert user_context.db.rolled_back
    assert result['tool_results'][0]['status'] == 'error'

def test_unknown_tool_returns_a_message_not_an_exception():
    state = _state(messages=[_tool_request('delete_everything')])
    with patch('app.agent.nodes.log_tool_call'), patch('app.agent.nodes.get_tool_context') as ctx:
        ctx.return_value = MagicMock()
        result = act(state)
    assert result['tool_results'][0]['status'] == 'error'
    assert 'no tool called' in result['messages'][0].content.lower()

def test_permission_denial_is_reported_as_denied(user_context):
    state = _state(role='USER', messages=[_tool_request('cancel_event', {'event_id': str(uuid.uuid4())})])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    assert result['tool_results'][0]['status'] == 'denied'
    assert 'administrator' in result['messages'][0].content.lower()

def test_bad_uuid_becomes_a_recoverable_message(user_context):
    state = _state(messages=[_tool_request('get_event_details', {'event_id': 'not-a-uuid'})])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    assert result['tool_results'][0]['status'] == 'error'
    assert 'invalid input' in result['messages'][0].content.lower()

def test_tool_latency_is_measured(user_context):
    state = _state(messages=[_tool_request('my_registrations')])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(state)
    assert result['tool_results'][0]['latency_ms'] >= 0

def test_multiple_tool_calls_in_one_turn_are_all_run(user_context):
    message = AIMessage(content='', tool_calls=[{'name': 'my_registrations', 'args': {}, 'id': 'a'}, {'name': 'search_events', 'args': {'keyword': 'ai'}, 'id': 'b'}])
    with patch('app.agent.nodes.log_tool_call'):
        result = act(_state(messages=[message]))
    assert len(result['tool_calls']) == 2
    assert len(result['messages']) == 2

def test_finalize_takes_the_last_assistant_message(user_context):
    state = _state(messages=[HumanMessage(content='find workshops'), AIMessage(content='', tool_calls=[{'name': 'x', 'args': {}, 'id': '1'}]), ToolMessage(content='Found 2 events', tool_call_id='1', name='x'), AIMessage(content='I found two workshops for you.')])
    with patch('app.agent.nodes.memory.save_turn'):
        result = finalize(state)
    assert result['final_response'] == 'I found two workshops for you.'

def test_model_error_is_reported_as_failed_agent_run():
    from contextlib import nullcontext
    session = MagicMock(session_id=uuid.uuid4())
    run = MagicMock(run_id=uuid.uuid4())
    db = MagicMock()
    state = {'final_response': 'I hit a problem reaching the language model.', 'intent': 'GENERAL', 'loop_count': 0, 'tool_calls': [], 'tool_results': [], 'retrieved_documents': [], 'error': 'provider request failed'}
    graph = MagicMock()
    graph.invoke.return_value = state
    with patch('app.agent.graph.load_actor', return_value=MagicMock(role='USER')), patch('app.agent.graph.memory.get_or_create_session', return_value=session), patch('app.agent.graph.start_agent_run', return_value=run), patch('app.agent.graph.get_graph', return_value=graph), patch('app.agent.graph.use_tool_context', return_value=nullcontext()), patch('app.agent.graph.finish_agent_run') as finish_run:
        result = run_agent(db=db, user_id=uuid.uuid4(), message='find an AI workshop')
    assert result.status == 'error'
    assert result.error == 'provider request failed'
    assert finish_run.call_args.kwargs['status'] == 'error'
    assert finish_run.call_args.kwargs['error'] == 'provider request failed'

def test_deleted_session_does_not_expire_ids_needed_to_finish_agent_run():
    from contextlib import nullcontext

    class ExpiringRecord:

        def __init__(self, value):
            self.value = value
            self.expired = False

        @property
        def session_id(self):
            if self.expired:
                raise RuntimeError('session was deleted')
            return self.value

        @property
        def run_id(self):
            if self.expired:
                raise RuntimeError('run was deleted')
            return self.value

    session_id = uuid.uuid4()
    run_id = uuid.uuid4()
    session = ExpiringRecord(session_id)
    run = ExpiringRecord(run_id)
    db = MagicMock()

    def delete_session_on_commit():
        session.expired = True
        run.expired = True

    db.commit.side_effect = delete_session_on_commit
    graph = MagicMock()
    graph.invoke.return_value = {
        'final_response': 'Here are three workshops.',
        'intent': 'GENERAL',
        'loop_count': 0,
        'tool_calls': [],
        'tool_results': [],
        'retrieved_documents': [],
        'error': '',
    }

    with patch('app.agent.graph.load_actor', return_value=MagicMock(role='USER')), \
         patch('app.agent.graph.memory.get_or_create_session', return_value=session), \
         patch('app.agent.graph.start_agent_run', return_value=run), \
         patch('app.agent.graph.get_graph', return_value=graph), \
         patch('app.agent.graph.use_tool_context', return_value=nullcontext()), \
         patch('app.agent.graph.finish_agent_run') as finish_run:
        result = run_agent(db=db, user_id=uuid.uuid4(), message='find workshops')

    assert result.reply == 'Here are three workshops.'
    assert result.session_id == session_id
    assert result.run_id == run_id
    assert result.status == 'success'
    assert finish_run.call_args.kwargs['run_id'] == run_id

def test_finalize_produces_a_fallback_when_there_is_no_answer(user_context):
    state = _state(messages=[HumanMessage(content='hi')])
    with patch('app.agent.nodes.memory.save_turn'):
        result = finalize(state)
    assert result['final_response']
    assert 'could not complete' in result['final_response'].lower()

def test_memory_failure_does_not_lose_the_answer(user_context):
    state = _state(messages=[AIMessage(content='Here you go.')])
    with patch('app.agent.nodes.memory.save_turn', side_effect=RuntimeError('db down')):
        result = finalize(state)
    assert result['final_response'] == 'Here you go.'
    assert user_context.db.rolled_back

def test_system_prompt_states_the_routing_rule():
    prompt = build_system_prompt(role='USER', today='Friday, 18 September 2026')
    assert 'search_event_policy' in prompt
    assert 'USER' in prompt
    assert '18 September 2026' in prompt

def test_system_prompt_forbids_inventing_ids():
    prompt = build_system_prompt(role='USER', today='today')
    assert 'never invent' in prompt.lower()