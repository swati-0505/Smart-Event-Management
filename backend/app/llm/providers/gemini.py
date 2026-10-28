from __future__ import annotations
from typing import Any
from langchain_openai import ChatOpenAI
from app.llm.config import llm_settings
from app.llm.exceptions import LLMConfigurationError

def get_gemini_chat_model(model: str | None = None, temperature: float = 0.0, **kwargs: Any) -> ChatOpenAI:
    token = llm_settings.GEMINI_API_KEY.strip()
    if not token:
        raise LLMConfigurationError('gemini', 'GEMINI_API_KEY is empty.')
    return ChatOpenAI(
        model=model or llm_settings.GEMINI_MODEL,
        temperature=temperature,
        max_tokens=kwargs.pop('max_tokens', 1024),
        timeout=kwargs.pop('timeout', llm_settings.LLM_TIMEOUT_SECONDS),
        api_key=token,
        base_url=llm_settings.GEMINI_BASE_URL,
        max_retries=kwargs.pop('max_retries', max(0, llm_settings.LLM_MAX_RETRIES)),
        **kwargs)