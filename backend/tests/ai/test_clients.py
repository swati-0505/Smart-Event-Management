from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError

from app.core.ai_config import AISettings, ai_settings
from app.llm.config import llm_settings
from app.rag import clients


@pytest.mark.parametrize(
    ('token', 'error'),
    [
        ('', 'HUGGINGFACE_API_KEY is empty'),
        ('hf_REPLACE_WITH_ROTATED_TOKEN', 'HUGGINGFACE_API_KEY is still a placeholder'),
    ],
)
def test_legacy_huggingface_embedding_token_must_not_be_missing_or_placeholder(
    monkeypatch,
    token,
    error,
):
    monkeypatch.setattr(ai_settings, 'HUGGINGFACE_API_KEY', token)
    with pytest.raises(RuntimeError, match=error):
        clients._huggingface_embedding_token()


def test_legacy_huggingface_embeddings_remain_available_for_rollback(monkeypatch):
    monkeypatch.setattr(ai_settings, 'HUGGINGFACE_API_KEY', 'test-token')
    monkeypatch.setattr(ai_settings, 'EMBEDDING_MODEL', 'test/legacy-embedding-model')
    monkeypatch.setattr(ai_settings, 'EMBEDDING_DIM', 3)
    monkeypatch.setattr(ai_settings, 'EMBEDDING_BATCH_SIZE', 2)
    clients.clear_ai_client_caches()

    class FakeInferenceClient:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
            self.calls = []

        def feature_extraction(self, texts, *, normalize):
            self.calls.append((texts, normalize))
            return [[1.0, 0.0, 0.0] for _ in texts]

    monkeypatch.setattr(clients, 'InferenceClient', FakeInferenceClient)
    try:
        vectors = clients.embed_texts(['first', 'second', 'third'])
        inference_client = clients._embedding_client()
    finally:
        clients.clear_ai_client_caches()

    assert vectors == [[1.0, 0.0, 0.0]] * 3
    assert inference_client.kwargs['model'] == 'test/legacy-embedding-model'
    assert inference_client.kwargs['provider'] == 'hf-inference'
    assert inference_client.calls == [(['first', 'second'], True), (['third'], True)]


def test_legacy_embedding_rejects_wrong_vector_dimension(monkeypatch):
    monkeypatch.setattr(ai_settings, 'HUGGINGFACE_API_KEY', 'test-token')
    monkeypatch.setattr(ai_settings, 'EMBEDDING_DIM', 3)
    clients.clear_ai_client_caches()

    class FakeInferenceClient:
        def __init__(self, **kwargs):
            pass

        def feature_extraction(self, texts, *, normalize):
            return [[1.0, 2.0]]

    monkeypatch.setattr(clients, 'InferenceClient', FakeInferenceClient)
    try:
        with pytest.raises(ValueError, match='returned 2 dims'):
            clients.embed_texts(['text'])
    finally:
        clients.clear_ai_client_caches()


def test_clear_ai_client_caches_clears_both_clients(monkeypatch):
    monkeypatch.setattr(ai_settings, 'HUGGINGFACE_API_KEY', 'test-token')

    class FakeInferenceClient:
        def __init__(self, **kwargs):
            pass

    class FakeOpenAI:
        def __init__(self, **kwargs):
            pass

    monkeypatch.setattr(clients, 'InferenceClient', FakeInferenceClient)
    monkeypatch.setattr(clients, 'OpenAI', FakeOpenAI)
    clients.clear_ai_client_caches()
    clients._embedding_client()
    clients._openrouter_embedding_client()

    clients.clear_ai_client_caches()

    assert clients._embedding_client.cache_info().currsize == 0
    assert clients._openrouter_embedding_client.cache_info().currsize == 0


def test_embedding_model_ids_are_loaded_from_environment(monkeypatch):
    monkeypatch.setenv('EMBEDDING_MODEL', 'legacy/from-env')
    monkeypatch.setenv('OPENROUTER_EMBEDDING_MODEL', 'openrouter/from-env')

    settings = AISettings(_env_file=None)

    assert settings.EMBEDDING_MODEL == 'legacy/from-env'
    assert settings.OPENROUTER_EMBEDDING_MODEL == 'openrouter/from-env'
    assert settings.OPENROUTER_EMBEDDING_DIM == 2048


def test_embedding_model_ids_are_required(monkeypatch):
    monkeypatch.delenv('EMBEDDING_MODEL', raising=False)
    monkeypatch.delenv('OPENROUTER_EMBEDDING_MODEL', raising=False)

    with pytest.raises(ValidationError):
        AISettings(_env_file=None)


def test_openrouter_embedding_dimension_loads_from_env_as_integer(monkeypatch):
    monkeypatch.setenv('OPENROUTER_EMBEDDING_DIM', '2048')

    settings = AISettings(_env_file=None)

    assert settings.OPENROUTER_EMBEDDING_DIM == 2048
    assert isinstance(settings.OPENROUTER_EMBEDDING_DIM, int)


def test_openrouter_embedding_dimension_rejects_schema_mismatch():
    with pytest.raises(ValueError, match='requires 2048-dimensional vectors'):
        AISettings(_env_file=None, OPENROUTER_EMBEDDING_DIM=384)


def test_openrouter_embeddings_use_configured_model_and_normalize_batches(monkeypatch):
    monkeypatch.setattr(llm_settings, 'OPENROUTER_API_KEY', 'test-openrouter-key')
    monkeypatch.setattr(llm_settings, 'OPENROUTER_BASE_URL', 'https://openrouter.example/api/v1')
    monkeypatch.setattr(llm_settings, 'LLM_TIMEOUT_SECONDS', 23)
    monkeypatch.setattr(llm_settings, 'LLM_MAX_RETRIES', 1)
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_MODEL', 'nvidia/test-embedding:free')
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)
    monkeypatch.setattr(ai_settings, 'EMBEDDING_BATCH_SIZE', 2)
    clients.clear_ai_client_caches()

    class FakeOpenAI:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
            self.calls = []
            self.embeddings = self

        def create(self, **kwargs):
            self.calls.append(kwargs)
            return SimpleNamespace(
                data=[
                    SimpleNamespace(index=index, embedding=[3.0, 4.0, 0.0])
                    for index, _ in enumerate(kwargs['input'])
                ]
            )

    monkeypatch.setattr(clients, 'OpenAI', FakeOpenAI)
    try:
        vectors = clients.embed_texts_openrouter(['first', 'second', 'third'])
        client = clients._openrouter_embedding_client()
    finally:
        clients.clear_ai_client_caches()

    assert vectors == [[0.6, 0.8, 0.0]] * 3
    assert client.kwargs == {
        'api_key': 'test-openrouter-key',
        'base_url': 'https://openrouter.example/api/v1',
        'timeout': 23,
        'max_retries': 1,
    }
    assert client.calls == [
        {
            'model': 'nvidia/test-embedding:free',
            'input': ['first', 'second'],
            'encoding_format': 'float',
        },
        {
            'model': 'nvidia/test-embedding:free',
            'input': ['third'],
            'encoding_format': 'float',
        },
    ]


def test_openrouter_embedding_rejects_wrong_vector_dimension(monkeypatch):
    monkeypatch.setattr(llm_settings, 'OPENROUTER_API_KEY', 'test-openrouter-key')
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)
    clients.clear_ai_client_caches()

    class FakeOpenAI:
        def __init__(self, **kwargs):
            self.embeddings = self

        def create(self, **kwargs):
            return SimpleNamespace(data=[SimpleNamespace(index=0, embedding=[1.0, 2.0])])

    monkeypatch.setattr(clients, 'OpenAI', FakeOpenAI)
    try:
        with pytest.raises(ValueError, match='returned 2 dims'):
            clients.embed_texts_openrouter_model(['text'], 'nvidia/test-embedding:free')
    finally:
        clients.clear_ai_client_caches()


@pytest.mark.parametrize('vector', [[0.0, 0.0, 0.0], [float('nan'), 0.0, 0.0]])
def test_openrouter_embedding_rejects_non_normalizable_vectors(monkeypatch, vector):
    monkeypatch.setattr(llm_settings, 'OPENROUTER_API_KEY', 'test-openrouter-key')
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_DIM', 3)
    clients.clear_ai_client_caches()

    class FakeOpenAI:
        def __init__(self, **kwargs):
            self.embeddings = self

        def create(self, **kwargs):
            return SimpleNamespace(data=[SimpleNamespace(index=0, embedding=vector)])

    monkeypatch.setattr(clients, 'OpenAI', FakeOpenAI)
    try:
        with pytest.raises(ValueError, match='zero vector|non-finite'):
            clients.embed_texts_openrouter_model(['text'], 'nvidia/test-embedding:free')
    finally:
        clients.clear_ai_client_caches()


def test_openrouter_query_embedding_uses_same_configured_model(monkeypatch):
    monkeypatch.setattr(ai_settings, 'OPENROUTER_EMBEDDING_MODEL', 'nvidia/test-embedding:free')
    embed = MagicMock(return_value=[[0.6, 0.8]])
    monkeypatch.setattr(clients, 'embed_texts_openrouter', embed)

    assert clients.embed_query_openrouter('query') == [0.6, 0.8]
    embed.assert_called_once_with(['query'])
