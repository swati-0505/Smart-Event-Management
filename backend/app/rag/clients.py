from __future__ import annotations
import asyncio
import logging
import math
from typing import List
import httpx
from app.core.ai_config import ai_settings
from app.llm.config import llm_settings
from app.llm.exceptions import LLMProviderError, normalize_provider_exception

logger = logging.getLogger(__name__)


def _openrouter_embedding_token() -> str:
    token = llm_settings.OPENROUTER_API_KEY.strip()
    if not token or any(marker in token.upper() for marker in ('REPLACE', 'PLACEHOLDER', 'YOUR_')):
        raise LLMProviderError('openrouter-embeddings', 'OPENROUTER_API_KEY is not configured.', retryable=False)
    return token

def _normalize_openrouter_embedding(values: List[float], *, model: str) -> List[float]:
    vector = [float(value) for value in values]
    if len(vector) != ai_settings.OPENROUTER_EMBEDDING_DIM:
        raise ValueError(
            f'Embedding model {model} returned {len(vector)} dimensions but '
            f'OPENROUTER_EMBEDDING_DIM is {ai_settings.OPENROUTER_EMBEDDING_DIM}.'
        )
    if not all(math.isfinite(value) for value in vector):
        raise ValueError(f'Embedding model {model} returned a non-finite vector.')
    norm = math.sqrt(math.fsum(value * value for value in vector))
    if norm == 0:
        raise ValueError(f'Embedding model {model} returned a zero vector.')
    return [value / norm for value in vector]


async def _embed_batch_openrouter_async(client: httpx.AsyncClient, batch: List[str], model: str) -> List[List[float]]:
    token = _openrouter_embedding_token()
    url = f"{llm_settings.OPENROUTER_BASE_URL}/embeddings"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "input": batch,
        "encoding_format": "float",
    }
    try:
        response = await client.post(url, headers=headers, json=payload, timeout=llm_settings.LLM_TIMEOUT_SECONDS)
        response.raise_for_status()
    except (httpx.HTTPError, TimeoutError, ConnectionError) as exc:
        normalized = normalize_provider_exception(exc, provider='openrouter-embeddings')
        raise LLMProviderError(
            provider='openrouter-embeddings',
            message='Embedding provider request failed.',
            status_code=normalized.status_code,
            retryable=normalized.retryable,
        ) from None
    data = sorted(response.json()["data"], key=lambda item: item["index"])
    if len(data) != len(batch):
        raise ValueError(f'Embedding model returned {len(data)} vectors for {len(batch)} inputs.')
    return [_normalize_openrouter_embedding(list(item["embedding"]), model=model) for item in data]


async def embed_texts_openrouter_model_async(texts: List[str], model: str) -> List[List[float]]:
    if not texts:
        return []
    batch_size = max(1, ai_settings.EMBEDDING_BATCH_SIZE)
    batches = [texts[start:start + batch_size] for start in range(0, len(texts), batch_size)]
    if len(batches) == 1:
        async with httpx.AsyncClient() as client:
            return await _embed_batch_openrouter_async(client, batches[0], model)

    concurrency = max(1, min(ai_settings.EMBEDDING_MAX_CONCURRENCY, len(batches)))
    semaphore = asyncio.Semaphore(concurrency)
    ordered: list[List[List[float]] | None] = [None] * len(batches)

    async def process_batch(batch: List[str], index: int):
        async with semaphore:
            async with httpx.AsyncClient() as client:
                ordered[index] = await _embed_batch_openrouter_async(client, batch, model)

    await asyncio.gather(*[process_batch(batch, i) for i, batch in enumerate(batches)])

    vectors: List[List[float]] = []
    for batch_vectors in ordered:
        if batch_vectors is None:
            raise RuntimeError('Embedding batch completed without a result.')
        vectors.extend(batch_vectors)
    return vectors


def embed_texts_openrouter_model(texts: List[str], model: str) -> List[List[float]]:
    """Synchronous wrapper for backward compatibility."""
    return asyncio.run(embed_texts_openrouter_model_async(texts, model))


def embed_texts_openrouter(texts: List[str]) -> List[List[float]]:
    return embed_texts_openrouter_model(texts, ai_settings.OPENROUTER_EMBEDDING_MODEL)


def embed_query_openrouter(text: str) -> List[float]:
    return embed_texts_openrouter([text])[0]


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed texts with the active OpenRouter embedding model."""
    return embed_texts_openrouter(texts)


def embed_query(text: str) -> List[float]:
    """Embed a query with the active OpenRouter embedding model."""
    return embed_query_openrouter(text)