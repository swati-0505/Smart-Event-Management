from __future__ import annotations
import logging
from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.core.ai_config import ai_settings
from app.rag.embeddings import embed_texts as local_embed_texts

logger = logging.getLogger(__name__)

def _headers() -> dict:
    """OpenRouter uses these for attribution on your dashboard."""
    return {
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": ai_settings.OPENROUTER_APP_NAME,
    }

@lru_cache(maxsize=4)
def get_chat_model(
    model: str | None = None,
    temperature: float | None = None,
) -> ChatOpenAI:
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
            ai_settings.CHAT_TEMPERATURE
            if temperature is None
            else temperature
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

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate local embeddings using all-MiniLM-L6-v2.

    The model produces 384-dimensional vectors, matching the existing
    pgvector embeddings stored in the knowledge_chunks table.
    """
    return local_embed_texts(texts)

def embed_query(text: str) -> list[float]:
    """Embed a single query string using the local embedding model."""
    return embed_texts([text])[0]