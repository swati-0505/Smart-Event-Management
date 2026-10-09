from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

import httpx
from openai import APIError

from app.llm.config import llm_settings
from app.llm.exceptions import LLMUnavailableError, LLMProviderError, normalize_provider_exception, safe_error_category
from app.llm.providers.openrouter import get_openrouter_chat_model

logger = logging.getLogger(__name__)
_PROVIDER_ORDER = ('openrouter',)


class LLMProviderRouter:
    def __init__(self, *, settings: Any | None = None) -> None:
        self.settings = settings or llm_settings
        self.provider_order = _PROVIDER_ORDER

    def configured_providers(self) -> list[str]:
        return [provider for provider in self.provider_order if self.settings.is_configured(provider)]

    def get_model(self, provider: str, *, model: str | None = None, temperature: float = 0.0, tools: Any | None = None, **kwargs: Any):
        if provider.lower() != 'openrouter':
            raise ValueError(f'Unsupported provider: {provider}')
        built_model = get_openrouter_chat_model(
            model=model or self.settings.provider_config(provider)['model'],
            temperature=temperature,
            **kwargs,
        )
        if tools is not None and hasattr(built_model, 'bind_tools'):
            built_model = built_model.bind_tools(tools)
        return built_model

    def invoke(
        self,
        messages: Any,
        *,
        model_overrides: Mapping[str, str] | None = None,
        temperature: float = 0.0,
        tools: Any | None = None,
        **kwargs: Any,
    ):
        last_error:Exception | None = None
        for provider in self.provider_order:
            if not self.settings.is_configured(provider):
                continue
            primary_model = (model_overrides or {}).get(provider) or self.settings.provider_config(provider)['model']
            models = (primary_model, *self.settings.openrouter_fallback_models)
            for index, model_name in enumerate(models):
                try:
                    provider_model = self.get_model(
                        provider,
                        model=model_name,
                        temperature=temperature,
                        tools=tools,
                        **kwargs,
                    )
                    return provider_model.invoke(messages)
                except (LLMProviderError, APIError, httpx.HTTPError, TimeoutError, ConnectionError) as exc:
                    normalized = normalize_provider_exception(exc, provider=provider)
                    last_error = normalized
                    category = safe_error_category(normalized)
                    logger.warning(
                        'LLM provider %s model %s failed (status=%s, category=%s)',
                        provider,
                        model_name,
                        normalized.status_code if normalized.status_code is not None else 'unavailable',
                        category,
                    )
                    has_fallback = index + 1 < len(models)
                    model_specific_bad_request = normalized.status_code == 400 and has_fallback
                    if not normalized.retryable and not model_specific_bad_request:
                        raise LLMProviderError(
                            provider=provider,
                            message='Provider request failed.',
                            status_code=normalized.status_code,
                            retryable=False,
                        ) from None

        if last_error is not None:
            raise LLMUnavailableError(
                provider='multi-provider',
                message='All configured LLM providers failed. The service is unavailable right now.',
                retryable=True,
                cause=last_error,
            )

        raise LLMUnavailableError('multi-provider', 'No configured LLM providers are available for this request.')

    route = invoke
    __call__ = invoke
