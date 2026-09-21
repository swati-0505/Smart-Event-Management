
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
from app.observability.logger import log_tool_call
from app.rag.clients import get_chat_model, get_chat_model_with_fallback
from app.tools.context import PermissionDenied, get_tool_context
from app.tools.registry import TOOLS_BY_NAME, get_tools_for_role

logger = logging.getLogger(__name__)






def classify_intent(state: AgentState) -> dict:
    """
    Label the request.

    This does not gate anything - the model still picks its own tools. It
    exists because section 15 asks for "detected intent" in the agent activity
    log, and because a run whose intent and tool disagree is the fastest way
    to spot a prompt problem.

    A failure here must not fail the turn, so any error becomes "GENERAL".
    """
    message = state.get("message", "")
    try:
        model = get_chat_model(temperature=0.0)
        response = model.invoke(INTENT_PROMPT.format(message=message))
        label = str(response.content).strip().upper()

        for candidate in VALID_INTENTS:
            if candidate in label:
                return {"intent": candidate}
    except Exception as exc:
        logger.warning("Intent classification failed: %s", exc)

    return {"intent": "GENERAL"}






def load_memory(state: AgentState) -> dict:
    """
    Assemble what the model sees: system prompt, prior turns, current message.

    Note this returns the full list even though `messages` uses an appending
    reducer. That is fine because the channel starts empty on each run - we
    persist memory ourselves rather than relying on a checkpointer.
    """
    context = get_tool_context()

    history = memory.load_history(
        db=context.db,
        session_id=state["session_id"],
        limit=ai_settings.MEMORY_WINDOW_MESSAGES,
    )

    messages = [
        SystemMessage(
            content=build_system_prompt(
                role=state.get("role", "USER"),
                today=date.today().strftime("%A, %d %B %Y"),
            )
        ),
        *history,
        HumanMessage(content=state["message"]),
    ]

    return {"messages": messages}






def reason(state: AgentState) -> dict:
    """
    Ask the model what to do next.

    It returns either a final answer or one or more tool calls. Tools are
    bound per role, so a normal user's model never sees the admin tools.
    """
    tools = get_tools_for_role(state.get("role", "USER"))
    model = get_chat_model_with_fallback().bind_tools(tools)

    try:
        response = model.invoke(state["messages"])
    except Exception as exc:
        logger.exception("Model call failed")
        return {
            "messages": [
                AIMessage(
                    content=(
                        "I hit a problem reaching the language model. "
                        "Please try again in a moment."
                    )
                )
            ],
            "error": str(exc),
        }

    return {
        "messages": [response],
        "loop_count": state.get("loop_count", 0) + 1,
    }






def act(state: AgentState) -> dict:
    """
    Execute the tool calls the model asked for.

    Three things happen per call: run it, time it, record it. Errors are
    converted into ToolMessages rather than raised, because the model can
    often recover - if it passed a bad event_id, telling it so lets it search
    and try again, whereas an exception ends the turn.
    """
    context = get_tool_context()
    last_message = state["messages"][-1]
    requested = getattr(last_message, "tool_calls", None) or []

    tool_messages: list[ToolMessage] = []
    call_records: list[dict] = []
    result_records: list[dict] = []
    citations: list[str] = []

    for sequence, call in enumerate(requested):
        name = call.get("name", "")
        args = call.get("args", {}) or {}
        call_id = call.get("id", "")

        started = time.perf_counter()
        status = "success"
        error = None

        tool = TOOLS_BY_NAME.get(name)
        if tool is None:
            output = (
                f"There is no tool called '{name}'. "
                f"Available tools: {', '.join(sorted(TOOLS_BY_NAME))}."
            )
            status = "error"
            error = "unknown tool"
        else:
            try:
                output = tool.invoke(args)
            except PermissionDenied as exc:

                output = str(exc)
                status = "denied"
                error = str(exc)
            except ValueError as exc:

                output = f"Invalid input: {exc}"
                status = "error"
                error = str(exc)
            except Exception as exc:
                logger.exception("Tool %s raised", name)
                output = (
                    f"The {name} tool failed unexpectedly. "
                    f"Tell the user and do not retry."
                )
                status = "error"
                error = f"{exc.__class__.__name__}: {exc}"

        latency_ms = (time.perf_counter() - started) * 1000
        output = str(output)

        tool_messages.append(ToolMessage(content=output, tool_call_id=call_id, name=name))

        call_records.append({"name": name, "args": args})
        result_records.append(
            {
                "name": name,
                "status": status,
                "latency_ms": round(latency_ms, 2),
                "output_preview": output[:300],
            }
        )

        if name == "search_event_policy" and "Sources:" in output:
            citations.extend(
                part.strip()
                for part in output.split("Sources:", 1)[1].split("\n")[0].split(",")
                if part.strip()
            )

        log_tool_call(
            db=context.db,
            run_id=state["run_id"],
            tool_name=name,
            tool_input=args,
            tool_output=output,
            latency_ms=latency_ms,
            status=status,
            error=error,
            sequence=sequence,
        )

        logger.info("tool=%s status=%s latency=%.0fms", name, status, latency_ms)

    return {
        "messages": tool_messages,
        "tool_calls": state.get("tool_calls", []) + call_records,
        "tool_results": state.get("tool_results", []) + result_records,
        "retrieved_documents": state.get("retrieved_documents", []) + citations,
    }






def finalize(state: AgentState) -> dict:
    """Extract the answer and write the turn to memory."""
    context = get_tool_context()

    answer = ""
    for message in reversed(state["messages"]):
        if isinstance(message, AIMessage) and message.content:
            answer = str(message.content).strip()
            break

    if not answer:


        answer = (
            "I could not complete that request. Could you rephrase it or "
            "break it into smaller steps?"
        )

    try:
        memory.save_turn(
            db=context.db,
            session_id=state["session_id"],
            user_message=state["message"],
            assistant_message=answer,
        )
    except Exception as exc:

        logger.warning("Could not save conversation turn: %s", exc)

    return {"final_response": answer}






def should_continue(state: AgentState) -> str:
    """
    After reason(): run tools, or stop?

    The loop cap is the important part. Without it, a model that keeps calling
    search_events with slightly different arguments will do so until the
    request times out, burning API quota the whole way.
    """
    if state.get("loop_count", 0) >= ai_settings.AGENT_MAX_TOOL_LOOPS:
        logger.warning(
            "Loop cap of %d reached; forcing finalize",
            ai_settings.AGENT_MAX_TOOL_LOOPS,
        )
        return "finalize"

    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "act"

    return "finalize"
