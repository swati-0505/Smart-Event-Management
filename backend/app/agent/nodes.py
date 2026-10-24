from __future__ import annotations
import json
import logging
import time
from datetime import date
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from app.agent import memory
from app.agent.prompts import INTENT_PROMPT, VALID_INTENTS, build_system_prompt
from app.agent.state import AgentState
from app.core.ai_config import ai_settings
from app.core.permissions import AuthorizationError, GUEST_ROLE
from app.llm.exceptions import LLMProviderError
from app.llm.router import LLMProviderRouter
from app.observability.logger import log_tool_call
from app.tools.context import PermissionDenied, get_tool_context
from app.tools.registry import TOOLS_BY_NAME, get_tools_for_role
logger = logging.getLogger(__name__)
_SENSITIVE_TOOL_ARGUMENTS = frozenset({'password', 'secret', 'token', 'api_key', 'authorization'})

def _redact_tool_arguments(arguments: dict) -> dict:
    return {
        key: '[REDACTED]' if key.lower() in _SENSITIVE_TOOL_ARGUMENTS else value
        for key, value in arguments.items()
    }

def classify_intent(state: AgentState) -> dict:
    message = state.get('message', '')
    try:
        response = LLMProviderRouter().invoke(
            INTENT_PROMPT.format(message=message),
            temperature=0.0,
        )
        label = str(response.content).strip().upper()
        for candidate in VALID_INTENTS:
            if candidate in label:
                return {'intent': candidate}
    except LLMProviderError:
        logger.warning('Intent classification providers unavailable; using GENERAL.')
    return {'intent': 'GENERAL'}

def load_memory(state: AgentState) -> dict:
    context = get_tool_context()
    history = memory.load_history(db=context.db, session_id=state['session_id'], limit=ai_settings.MEMORY_WINDOW_MESSAGES)
    messages = [SystemMessage(content=build_system_prompt(role=context.role, today=date.today().strftime('%A, %d %B %Y'))), *history, HumanMessage(content=state['message'])]
    return {'messages': messages}

def reason(state: AgentState) -> dict:
    role = get_tool_context().role
    tools = get_tools_for_role(role)
    logger.info('reason(): routing agent request through primary provider chain for role=%s', role)
    try:
        router = LLMProviderRouter()
        response = router.invoke(state['messages'], temperature=ai_settings.CHAT_TEMPERATURE, tools=tools)
    except LLMProviderError:
        logger.warning('Configured chat providers unavailable during agent reasoning.')
        return {
            'messages': [AIMessage(content="I'm having trouble reaching all available AI models right now. Our team has been notified. Please try again in a few minutes — the service is usually restored quickly.")],
            'error': 'Configured chat providers unavailable.',
        }
    return {'messages': [response], 'loop_count': state.get('loop_count', 0) + 1}

def act(state: AgentState) -> dict:
    context = get_tool_context()
    last_message = state['messages'][-1]
    requested = getattr(last_message, 'tool_calls', None) or []
    tool_messages: list[ToolMessage] = []
    call_records: list[dict] = []
    result_records: list[dict] = []
    citations: list[str] = []
    allowed_tool_names = {allowed_tool.name for allowed_tool in get_tools_for_role(context.role)}
    for sequence, call in enumerate(requested):
        name = call.get('name', '')
        args = call.get('args', {}) or {}
        logged_args = _redact_tool_arguments(args)
        call_id = call.get('id', '')
        started = time.perf_counter()
        status = 'success'
        error = None
        tool = TOOLS_BY_NAME.get(name)
        if tool is None:
            output = f"There is no tool called '{name}'. Available tools: {', '.join(sorted(TOOLS_BY_NAME))}."
            status = 'error'
            error = 'unknown tool'
        elif name not in allowed_tool_names:
            output = 'Sign in to use this tool.' if context.role == GUEST_ROLE else 'Only an administrator can use this tool.'
            status = 'denied'
            error = 'role not permitted'
        else:
            try:
                output = tool.invoke(args)
            except PermissionDenied as exc:
                output = str(exc)
                status = 'denied'
                error = str(exc)
            except AuthorizationError as exc:
                output = str(exc)
                status = 'denied'
                error = str(exc)
            except ValueError as exc:
                output = f'Invalid input: {exc}'
                status = 'error'
                error = str(exc)
            except Exception as exc:
                context.db.rollback()
                logger.exception('Tool %s raised', name)
                output = f'The {name} tool failed unexpectedly. Tell the user and do not retry.'
                status = 'error'
                error = f'{exc.__class__.__name__}: {exc}'
        latency_ms = (time.perf_counter() - started) * 1000
        output = str(output)
        tool_messages.append(ToolMessage(content=output, tool_call_id=call_id, name=name))
        call_records.append({'name': name, 'args': logged_args})
        result_records.append({'name': name, 'status': status, 'latency_ms': round(latency_ms, 2), 'output_preview': output[:300]})
        if name == 'search_event_policy' and 'Sources:' in output:
            citations.extend((part.strip() for part in output.split('Sources:', 1)[1].split('\n')[0].split(',') if part.strip()))
        log_tool_call(db=context.db, run_id=state['run_id'], tool_name=name, tool_input=logged_args, tool_output=output, latency_ms=latency_ms, status=status, error=error, sequence=sequence)
        logger.info('tool=%s status=%s latency=%.0fms', name, status, latency_ms)
    return {'messages': tool_messages, 'tool_calls': state.get('tool_calls', []) + call_records, 'tool_results': state.get('tool_results', []) + result_records, 'retrieved_documents': state.get('retrieved_documents', []) + citations}

def finalize(state: AgentState) -> dict:
    context = get_tool_context()
    answer = ''
    for message in reversed(state['messages']):
        if isinstance(message, AIMessage) and message.content:
            answer = str(message.content).strip()
            break
    if not answer:
        answer = 'I could not complete that request. Could you rephrase it or break it into smaller steps?'
    try:
        memory.save_turn(db=context.db, session_id=state['session_id'], user_message=state['message'], assistant_message=answer)
    except Exception as exc:
        context.db.rollback()
        logger.warning('Could not save conversation turn: %s', exc)
    return {'final_response': answer}

def should_continue(state: AgentState) -> str:
    if state.get('loop_count', 0) >= ai_settings.AGENT_MAX_TOOL_LOOPS:
        logger.warning('Loop cap of %d reached; forcing finalize', ai_settings.AGENT_MAX_TOOL_LOOPS)
        return 'finalize'
    last_message = state['messages'][-1]
    if getattr(last_message, 'tool_calls', None):
        return 'act'
    return 'finalize'