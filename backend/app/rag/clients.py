from __future__ import annotations
from functools import lru_cache
import logging
import math
from typing import List
import httpx
from huggingface_hub import InferenceClient
from openai import APIError, OpenAI
from app.core.ai_config import ai_settings
from app.llm.config import llm_settings
from app.llm.exceptions import LLMProviderError, normalize_provider_exception

logger = logging.getLogger(__name__)

def _huggingface_embedding_token() -> str:
    token = ai_settings.HUGGINGFACE_API_KEY.strip()
    if not token:
        raise RuntimeError('HUGGINGFACE_API_KEY is empty. Set a Hugging Face token for embeddings in .env and restart the backend.')
    if any((marker in token.upper() for marker in ('REPLACE', 'PLACEHOLDER', 'YOUR_'))):
        raise RuntimeError('HUGGINGFACE_API_KEY is still a placeholder. Set a valid Hugging Face token for embeddings in .env and restart the backend.')
    return token

@lru_cache(maxsize=1)
def _embedding_client() -> InferenceClient:
    token = _huggingface_embedding_token()
    return InferenceClient(model=ai_settings.EMBEDDING_MODEL, token=token, provider='hf-inference', timeout=ai_settings.CHAT_TIMEOUT_SECONDS)

def _openrouter_embedding_token() -> str:
    token = llm_settings.OPENROUTER_API_KEY.strip()
    if not token or any(marker in token.upper() for marker in ('REPLACE', 'PLACEHOLDER', 'YOUR_')):
        raise LLMProviderError('openrouter-embeddings', 'OPENROUTER_API_KEY is not configured.', retryable=False)
    return token

@lru_cache(maxsize=1)
def _openrouter_embedding_client() -> OpenAI:
    return OpenAI(
        api_key=_openrouter_embedding_token(),
        base_url=llm_settings.OPENROUTER_BASE_URL,
        timeout=llm_settings.LLM_TIMEOUT_SECONDS,
        max_retries=llm_settings.LLM_MAX_RETRIES,
    )

def clear_ai_client_caches() -> None:
    _embedding_client.cache_clear()
    _openrouter_embedding_client.cache_clear()

def _normalize_openrouter_embedding(values: List[float], *, model: str) -> List[float]:
    vector = [float(value) for value in values]
    if len(vector) != ai_settings.OPENROUTER_EMBEDDING_DIM:
        raise ValueError(
            f'Embedding model {model} returned {len(vector)} dims but '
            f'OPENROUTER_EMBEDDING_DIM is {ai_settings.OPENROUTER_EMBEDDING_DIM}.'
        )
    if not all(math.isfinite(value) for value in vector):
        raise ValueError(f'Embedding model {model} returned a non-finite vector.')
    norm = math.sqrt(math.fsum(value * value for value in vector))
    if norm == 0:
        raise ValueError(f'Embedding model {model} returned a zero vector.')
    return [value / norm for value in vector]

def embed_texts_openrouter_model(texts: List[str], model: str) -> List[List[float]]:
    if not texts:
        return []
    client = _openrouter_embedding_client()
    vectors: List[List[float]] = []
    batch_size = ai_settings.EMBEDDING_BATCH_SIZE
    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]
        try:
            response = client.embeddings.create(
                model=model,
                input=batch,
                encoding_format='float',
            )
        except (APIError, httpx.HTTPError, TimeoutError, ConnectionError) as exc:
            normalized = normalize_provider_exception(exc, provider='openrouter-embeddings')
            raise LLMProviderError(
                provider='openrouter-embeddings',
                message='Embedding provider request failed.',
                status_code=normalized.status_code,
                retryable=normalized.retryable,
            ) from None
        data = sorted(response.data, key=lambda item: item.index)
        if len(data) != len(batch):
            raise ValueError(f'Embedding model returned {len(data)} vectors for {len(batch)} inputs.')
        for item in data:
            vectors.append(_normalize_openrouter_embedding(list(item.embedding), model=model))
    return vectors

def embed_texts_openrouter(texts: List[str]) -> List[List[float]]:
    return embed_texts_openrouter_model(texts, ai_settings.OPENROUTER_EMBEDDING_MODEL)

def embed_query_openrouter(text: str) -> List[float]:
    return embed_texts_openrouter([text])[0]

def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    client = _embedding_client()
    vectors: List[List[float]] = []
    batch_size = ai_settings.EMBEDDING_BATCH_SIZE
    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]
        response = client.feature_extraction(batch, normalize=True)
        batch_vectors = response.tolist() if hasattr(response, 'tolist') else response
        if len(batch_vectors) != len(batch):
            raise ValueError(f'Embedding model returned {len(batch_vectors)} vectors for {len(batch)} inputs.')
        for item in batch_vectors:
            vector = list(item)
            if len(vector) != ai_settings.EMBEDDING_DIM:
                raise ValueError(f'Embedding model returned {len(vector)} dims but EMBEDDING_DIM is {ai_settings.EMBEDDING_DIM}. Update ai_config and write a new migration.')
            vectors.append(vector)
    return vectors

def embed_query(text: str) -> List[float]:
    return embed_texts([text])[0]