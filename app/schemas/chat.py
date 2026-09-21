"""Request and response models for the AI endpoints."""
from __future__ import annotations
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)

    session_id: UUID | None = None


class ChatResponse(BaseModel):
    """
    Shaped to match what the frontend's aiService.js already expects
    (reply, tool_used, latency, conversation_id), with the extra fields the
    AI Assistant page needs to show its activity panel.
    """

    reply: str
    session_id: UUID
    run_id: UUID
    intent: str = ""
    tools_used: list[str] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    latency_ms: float = 0.0
    status: str = "success"


    @property
    def tool_used(self) -> str | None:
        return self.tools_used[0] if self.tools_used else None


class SessionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: UUID
    title: str | None = None
    created_at: datetime | None = None
    last_active_at: datetime | None = None


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    content: str
    created_at: datetime | None = None


class ToolCallOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tool_name: str
    tool_input: dict | None = None
    tool_output: str | None = None
    latency_ms: float | None = None
    status: str
    error: str | None = None
    sequence: int


class AgentRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    run_id: UUID
    user_id: UUID
    user_request: str
    detected_intent: str | None = None
    final_response: str | None = None
    tool_loop_count: int = 0
    latency_ms: float | None = None
    status: str
    error: str | None = None
    created_at: datetime | None = None
    tool_calls: list[ToolCallOut] = Field(default_factory=list)


class IngestResponse(BaseModel):
    filename: str
    status: str
    chunk_count: int = 0
    detail: str = ""
