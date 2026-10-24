from __future__ import annotations
from typing import Any
from langchain_openai import ChatOpenAI
from app.llm.config import llm_settings
from app.llm.exceptions import LLMConfigurationError

def _validate_openrouter_key() -> str:
    token = llm_settings.OPENROUTER_API_KEY.strip()
    if not token:
        raise LLMConfigurationError('openrouter', 'OPENROUTER_API_KEY is empty.')
    if any(marker in token.upper() for marker in ('REPLACE', 'PLACEHOLDER', 'YOUR_')):
        raise LLMConfigurationError('openrouter', 'OPENROUTER_API_KEY is still a placeholder.')
    return token

def get_openrouter_chat_model(model: str | None = None, temperature: float = 0.0, **kwargs: Any) -> ChatOpenAI:
    token = _validate_openrouter_key()
    return ChatOpenAI(
        model=model or llm_settings.OPENROUTER_MODEL,
        temperature=temperature,
        max_tokens=kwargs.pop('max_tokens', 1024),
        timeout=kwargs.pop('timeout', llm_settings.LLM_TIMEOUT_SECONDS),
        api_key=token,
        base_url=llm_settings.OPENROUTER_BASE_URL,
        max_retries=kwargs.pop('max_retries', max(0, llm_settings.LLM_MAX_RETRIES)),
        **kwargs)
