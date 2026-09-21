"""
Thin clients for OpenRouter.

Everything that talks to a model goes through this file. Two entry points:

    get_chat_model()   -> a LangChain ChatOpenAI bound to OpenRouter
    embed_texts([...]) -> list of 1024-dim vectors

OpenRouter is OpenAI-compatible, so we point the OpenAI SDK at its base URL
instead of writing a custom HTTP layer.
"""

from __future__ import annotations
import logging
from functools import lru_cache
from typing import List

from langchain_openai import ChatOpenAI
from openai import OpenAI

from app.core.ai_config import ai_settings

logger = logging.getLogger(__name__)


def _headers() -> dict:
    """OpenRouter uses these for attribution on your dashboard."""
    return {
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": ai_settings.OPENROUTER_APP_NAME,
    }
    
@lru_cache(maxsize=4)
def get_chat_model(model: str | None = None, temperature: float | None = None) -> ChatOpenAI:
    """
    Return a chat model. Cached so we are not rebuilding the client on every
    request. Pass an explicit model to override the configured default.
    """
    if not ai_settings.OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is not set. Copy .env.example to .env and fill it in."
        )

    return ChatOpenAI(
        model=model or ai_settings.CHAT_MODEL,
        temperature=(
            ai_settings.CHAT_TEMPERATURE if temperature is None else temperature
        ),
        max_tokens=ai_settings.CHAT_MAX_TOKENS,
        timeout=ai_settings.CHAT_TIMEOUT_SECONDS,
        api_key=ai_settings.OPENROUTER_API_KEY,
        base_url=ai_settings.OPENROUTER_BASE_URL,
        default_headers=_headers(),
        max_retries=2,
    )


def get_chat_model_with_fallback() -> ChatOpenAI:
    """
    Primary model with an automatic fallback.

    This matters because CHAT_MODEL defaults to `openrouter/free`, which routes
    to a randomly chosen free model and can be rate-limited or unavailable.
    """
    primary = get_chat_model()
    if not ai_settings.CHAT_MODEL_FALLBACK:
        return primary
    fallback = get_chat_model(model=ai_settings.CHAT_MODEL_FALLBACK)
    return primary.with_fallbacks([fallback])






@lru_cache(maxsize=1)
def _embedding_client() -> OpenAI:
    if not ai_settings.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not set.")
    return OpenAI(
        api_key=ai_settings.OPENROUTER_API_KEY,
        base_url=ai_settings.OPENROUTER_BASE_URL,
        default_headers=_headers(),
        timeout=ai_settings.CHAT_TIMEOUT_SECONDS,
    )


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Embed a list of strings, batched.

    Returns one vector per input, in the same order. Raises if the model
    returns a vector whose size does not match EMBEDDING_DIM, because a
    mismatch would silently corrupt the pgvector column.
    """
    if not texts:
        return []

    client = _embedding_client()
    vectors: List[List[float]] = []
    batch_size = ai_settings.EMBEDDING_BATCH_SIZE

    for start in range(0, len(texts), batch_size):
        batch = texts[start : start + batch_size]
        response = client.embeddings.create(
            model=ai_settings.EMBEDDING_MODEL,
            input=batch,
        )

        ordered = sorted(response.data, key=lambda item: item.index)
        for item in ordered:
            vector = list(item.embedding)
            if len(vector) != ai_settings.EMBEDDING_DIM:
                raise ValueError(
                    f"Embedding model returned {len(vector)} dims but "
                    f"EMBEDDING_DIM is {ai_settings.EMBEDDING_DIM}. "
                    f"Update ai_config and write a new migration."
                )
            vectors.append(vector)

    return vectors


def embed_query(text: str) -> List[float]:
    """Embed a single query string."""
    return embed_texts([text])[0]
