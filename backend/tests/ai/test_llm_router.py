from __future__ import annotations

from importlib import import_module
from unittest.mock import MagicMock, patch

import httpx
import pytest
from openai import APIStatusError
from pydantic import ValidationError

from app.llm.config import LLMSettings, llm_settings
from app.llm.exceptions import (
    LLMProviderError,
    LLMUnavailableError,
    is_retryable_provider_error,
    normalize_provider_exception,
    safe_error_category,
)
from app.llm.router import LLMProviderRouter


class FakeSettings:
    openrouter_fallback_models = ('fallback/model-one', 'fallback/model-two')

    def is_configured(self, provider: str) -> bool:
        return provider == 'openrouter'

    def provider_config(self, provider: str) -> dict[str, str | bool]:
        if provider != 'openrouter':
            return {'name': provider, 'configured': False, 'api_key': '', 'base_url': '', 'model': ''}
        return {
            'name': provider,
            'configured': True,
            'api_key': 'test-openrouter-key',
            'base_url': 'https://openrouter.example/v1',
            'model': 'configured/openrouter-model',
        }


def _status_error(status_code: int, body: object | None = None) -> APIStatusError:
    response = httpx.Response(
        status_code=status_code,
        request=httpx.Request('POST', 'https://openrouter.example/v1/chat/completions'),
    )
    return APIStatusError('Provider request failed', response=response, body=body)


def test_router_supports_configured_providers_and_never_huggingface():
    router = LLMProviderRouter(settings=FakeSettings())

    assert router.provider_order == ('groq', 'gemini', 'openrouter')
    assert router.configured_providers() == ['openrouter']
    assert llm_settings.provider_config('huggingface')['configured'] is False
    assert 'huggingface' not in llm_settings.configured_providers()
    assert {'GROQ_API_KEY', 'GEMINI_API_KEY'} <= LLMSettings.model_fields.keys()


def test_provider_timeout_and_retries_are_bounded():
    with pytest.raises(ValidationError):
        LLMSettings(LLM_TIMEOUT_SECONDS=301)
    with pytest.raises(ValidationError):
        LLMSettings(LLM_MAX_RETRIES=4)


def test_openrouter_chat_model_is_loaded_from_environment(monkeypatch):
    monkeypatch.setenv('OPENROUTER_MODEL', 'openrouter/chat-from-env')
    monkeypatch.setenv('OPENROUTER_FALLBACK_MODELS', 'google/first:free, nvidia/second:free')

    settings = LLMSettings(_env_file=None)

    assert settings.OPENROUTER_MODEL == 'openrouter/chat-from-env'
    assert settings.openrouter_fallback_models == ('google/first:free', 'nvidia/second:free')


def test_openrouter_chat_model_is_required(monkeypatch):
    monkeypatch.delenv('OPENROUTER_MODEL', raising=False)

    with pytest.raises(ValidationError):
        LLMSettings(_env_file=None)


def test_openrouter_client_uses_configured_credentials_endpoint_model_and_timeout(monkeypatch):
    key = 'test-openrouter-key'
    base_url = 'https://openrouter.example/v1'
    model_name = 'configured/openrouter-model'
    monkeypatch.setattr(llm_settings, 'OPENROUTER_API_KEY', key)
    monkeypatch.setattr(llm_settings, 'OPENROUTER_BASE_URL', base_url)
    monkeypatch.setattr(llm_settings, 'OPENROUTER_MODEL', model_name)
    monkeypatch.setattr(llm_settings, 'LLM_TIMEOUT_SECONDS', 23)
    module = import_module('app.llm.providers.openrouter')

    with patch.object(module, 'ChatOpenAI', side_effect=lambda **kwargs: kwargs):
        client_config = module.get_openrouter_chat_model()

    assert client_config['api_key'] == key
    assert client_config['base_url'] == base_url
    assert client_config['model'] == model_name
    assert client_config['timeout'] == 23
    assert client_config['temperature'] == 0.0
    assert client_config['max_tokens'] == 1024
    assert client_config['max_retries'] == llm_settings.LLM_MAX_RETRIES


def test_router_invokes_openrouter_once_with_configured_model_and_tools():
    model = MagicMock()
    model.invoke.return_value = 'OpenRouter response'
    tools = [object()]
    bound_model = MagicMock()
    bound_model.invoke.return_value = 'OpenRouter response'
    model.bind_tools.return_value = bound_model
    router = LLMProviderRouter(settings=FakeSettings())

    with patch('app.llm.router.get_openrouter_chat_model', return_value=model) as factory:
        result = router.invoke('prompt', tools=tools)

    assert result == 'OpenRouter response'
    factory.assert_called_once_with(
        model='configured/openrouter-model',
        temperature=0.0,
    )
    model.bind_tools.assert_called_once_with(tools)
    bound_model.invoke.assert_called_once_with('prompt')


def test_router_uses_fallback_models_in_configured_order_after_failure():
    primary = MagicMock()
    primary.invoke.side_effect = _status_error(404, {'error': 'model not found'})
    fallback_one = MagicMock()
    fallback_one.invoke.side_effect = _status_error(404, {'error': 'model not found'})
    fallback_two = MagicMock()
    fallback_two.invoke.return_value = 'Fallback response'
    router = LLMProviderRouter(settings=FakeSettings())

    with patch(
        'app.llm.router.get_openrouter_chat_model',
        side_effect=[primary, fallback_one, fallback_two],
    ) as factory:
        result = router.invoke('prompt')

    assert result == 'Fallback response'
    assert [call.kwargs['model'] for call in factory.call_args_list] == [
        'configured/openrouter-model',
        'fallback/model-one',
        'fallback/model-two',
    ]
    primary.invoke.assert_called_once_with('prompt')
    fallback_one.invoke.assert_called_once_with('prompt')
    fallback_two.invoke.assert_called_once_with('prompt')


def test_router_falls_back_for_model_specific_bad_request():
    primary = MagicMock()
    bound_primary = MagicMock()
    bound_primary.invoke.side_effect = _status_error(400, {'error': 'model does not support tools'})
    primary.bind_tools.return_value = bound_primary
    fallback = MagicMock()
    bound_fallback = MagicMock()
    bound_fallback.invoke.return_value = 'Fallback response'
    fallback.bind_tools.return_value = bound_fallback
    router = LLMProviderRouter(settings=FakeSettings())

    with patch(
        'app.llm.router.get_openrouter_chat_model',
        side_effect=[primary, fallback],
    ) as factory:
        result = router.invoke('prompt', tools=[object()])

    assert result == 'Fallback response'
    assert [call.kwargs['model'] for call in factory.call_args_list] == [
        'configured/openrouter-model',
        'fallback/model-one',
    ]


def test_openrouter_provider_failure_returns_controlled_unavailable_error():
    model = MagicMock()
    model.invoke.side_effect = _status_error(402, {'error': 'insufficient credits'})

    with patch('app.llm.router.get_openrouter_chat_model', return_value=model):
        with pytest.raises(LLMUnavailableError, match='All configured LLM providers failed'):
            LLMProviderRouter(settings=FakeSettings()).invoke('prompt')


def test_router_uses_fallback_after_structured_openrouter_timeout():
    primary = MagicMock()
    primary.invoke.side_effect = ValueError(
        "{'message': 'Provider timed out after 12920ms', 'code': 504, "
        "'metadata': {'error_type': 'timeout'}}"
    )
    fallback = MagicMock()
    fallback.invoke.return_value = 'Fallback response'

    with patch(
        'app.llm.router.get_openrouter_chat_model',
        side_effect=[primary, fallback],
    ) as factory:
        result = LLMProviderRouter(settings=FakeSettings()).invoke('prompt')

    assert result == 'Fallback response'
    assert [call.kwargs['model'] for call in factory.call_args_list] == [
        'configured/openrouter-model',
        'fallback/model-one',
    ]


def test_structured_openrouter_timeout_returns_controlled_unavailable_error():
    model = MagicMock()
    model.invoke.side_effect = ValueError(
        "{'message': 'Provider timed out after 12920ms', 'code': 504, "
        "'metadata': {'error_type': 'timeout'}}"
    )

    with patch('app.llm.router.get_openrouter_chat_model', return_value=model):
        with pytest.raises(LLMUnavailableError):
            LLMProviderRouter(settings=FakeSettings()).invoke('prompt')


@pytest.mark.parametrize('status_code', [401, 402, 403, 404, 408, 429, 500, 502, 503, 504])
def test_openrouter_eligible_status_is_reported_as_controlled_unavailable(status_code: int, caplog):
    model = MagicMock()
    model.invoke.side_effect = _status_error(status_code, {'error': 'sensitive provider payload'})

    with patch('app.llm.router.get_openrouter_chat_model', return_value=model):
        with pytest.raises(LLMUnavailableError):
            LLMProviderRouter(settings=FakeSettings()).invoke('private prompt')

    assert f'status={status_code}' in caplog.text
    assert 'provider openrouter model ' in caplog.text
    assert 'sensitive provider payload' not in caplog.text
    assert 'private prompt' not in caplog.text


@pytest.mark.parametrize(
    'error',
    [
        httpx.ConnectError('connection failed'),
        httpx.ReadTimeout('request timed out'),
        ConnectionError('connection failed'),
        TimeoutError('request timed out'),
    ],
)
def test_openrouter_connection_and_timeout_errors_are_retryable(error: Exception):
    normalized = normalize_provider_exception(error, provider='openrouter')

    assert normalized.retryable
    assert safe_error_category(error) in {'provider_timeout', 'connection_error'}


def test_unrelated_provider_400_does_not_become_retryable():
    error = _status_error(400, {'error': 'Invalid request body.'})

    assert not is_retryable_provider_error(error)
    assert safe_error_category(normalize_provider_exception(error, provider='openrouter')) == 'invalid_request_or_model'


def test_non_provider_validation_errors_are_not_swallowed():
    model = MagicMock()
    model.invoke.side_effect = ValueError('invalid request configuration')

    with patch('app.llm.router.get_openrouter_chat_model', return_value=model):
        with pytest.raises(ValueError, match='invalid request configuration'):
            LLMProviderRouter(settings=FakeSettings()).invoke('prompt')


def test_unsupported_provider_is_rejected():
    with pytest.raises(ValueError, match='Unsupported provider: huggingface'):
        LLMProviderRouter(settings=FakeSettings()).get_model('huggingface')
