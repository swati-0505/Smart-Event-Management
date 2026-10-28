from __future__ import annotations

import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError

from app.core.ai_config import AISettings, ai_settings
from app.llm.config import llm_settings
from app.rag import clients


def test_embedding_model_ids_are_loaded_from_environment(monkeypatch):
    monkeypatch.setenv('OPENROUTER_EMBEDDING_MODEL', 'openrouter/from-env')
    monkeypatch.setenv('RAG_ACTIVE_EMBEDDING_INDEX', 'nvidia')

    settings = AISettings(_env_file=None)

    assert settings.OPENROUTER_EMBEDDING_MODEL == 'openrouter/from-env'
    assert settings.OPENROUTER_EMBEDDING_DIM == 2048
    assert settings.RAG_ACTIVE_EMBEDDING_INDEX == 'nvidia'


def test_embedding_model_ids_are_required(monkeypatch):
    monkeypatch.delenv('OPENROUTER_EMBEDDING_MODEL', raising=False)

    with pytest.raises(ValidationError):
        AISettings(_env_file=None)


def test_openrouter_embedding_dimension_loads_from_env_as_integer(monkeypatch):
    monkeypatch.setenv('OPENROUTER_EMBEDDING_DIM', '2048')
    monkeypatch.setenv('OPENROUTER_EMBEDDING_MODEL', 'openrouter/from-env')

    settings = AISettings(_env_file=None)

    assert settings.OPENROUTER_EMBEDDING_DIM == 2048
    assert isinstance(settings.OPENROUTER_EMBEDDING_DIM, int)


def test_openrouter_embedding_dimension_rejects_schema_mismatch():
    with pytest.raises(ValueError, match='embedding dimension must match the selected model'):
        AISettings(
            _env_file=None,
            OPENROUTER_EMBEDDING_MODEL='test/model',
            OPENROUTER_EMBEDDING_DIM=384,
        )


def test_legacy_index_is_rejected(monkeypatch):
    monkeypatch.setenv('OPENROUTER_EMBEDDING_MODEL', 'openrouter/from-env')
    monkeypatch.setenv('RAG_ACTIVE_EMBEDDING_INDEX', 'legacy')

    with pytest.raises(ValidationError):
        AISettings(_env_file=None)


def test_openrouter_embeddings_use_configured_model_and_normalize_batches(monkeypatch):
    monkeypatch.setattr(llm_settings, 'OPENROUTER_API_KEY', 'test-openrouter-key')
    monkeypatch.setattr(llm_settings, 'OPENROUTER_BASE_URL', 'https://openrouter.example/api/v1')
    monkeypatch.setattr(llm_settings, 'LLM_TIMEOUT_SECONDS', 23)
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)
    monkeypatch.setattr(ai_settings, 'EMBEDDING_BATCH_SIZE', 2)
    monkeypatch.setattr(ai_settings, 'EMBEDDING_MAX_CONCURRENCY', 1)
    requests = []

    class FakeAsyncClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_):
            return None

        async def post(self, url, *, headers, json, timeout):
            requests.append((url, headers, json, timeout))
            items = [
                {'index': index, 'embedding': [3.0, 4.0, 0.0]}
                for index, _ in enumerate(json['input'])
            ]
            return SimpleNamespace(
                raise_for_status=lambda: None,
                json=lambda: {'data': list(reversed(items))},
            )

    monkeypatch.setattr(clients.httpx, 'AsyncClient', FakeAsyncClient)

    vectors = asyncio.run(
        clients.embed_texts_openrouter_model_async(
            ['first', 'second', 'third'],
            'nvidia/test-embedding:free',
        )
    )

    assert vectors == [[0.6, 0.8, 0.0]] * 3
    assert [request[0] for request in requests] == [
        'https://openrouter.example/api/v1/embeddings',
        'https://openrouter.example/api/v1/embeddings',
    ]
    assert [request[2]['input'] for request in requests] == [
        ['first', 'second'],
        ['third'],
    ]
    assert all(request[2]['model'] == 'nvidia/test-embedding:free' for request in requests)
    assert all(request[1]['Authorization'] == 'Bearer test-openrouter-key' for request in requests)
    assert all(request[3] == 23 for request in requests)


def test_embed_texts_alias_uses_openrouter(monkeypatch):
    embed = MagicMock(return_value=[[0.1, 0.2]])
    monkeypatch.setattr(clients, 'embed_texts_openrouter', embed)

    assert clients.embed_texts(['a']) == [[0.1, 0.2]]
    embed.assert_called_once_with(['a'])


def test_openrouter_embedding_rejects_wrong_vector_dimension(monkeypatch):
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)

    with pytest.raises(ValueError, match='returned 2 dimensions'):
        clients._normalize_openrouter_embedding([1.0, 2.0], model='test/model')


@pytest.mark.parametrize('vector', [[0.0, 0.0, 0.0], [float('nan'), 0.0, 0.0]])
def test_openrouter_embedding_rejects_non_normalizable_vectors(monkeypatch, vector):
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)

    with pytest.raises(ValueError, match='zero vector|non-finite'):
        clients._normalize_openrouter_embedding(vector, model='test/model')


def test_openrouter_query_embedding_uses_same_configured_model(monkeypatch):
    embed = MagicMock(return_value=[[0.6, 0.8]])
    monkeypatch.setattr(clients, 'embed_texts_openrouter', embed)

    assert clients.embed_query_openrouter('query') == [0.6, 0.8]
    embed.assert_called_once_with(['query'])
