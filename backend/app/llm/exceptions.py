from __future__ import annotations

from typing import Any

import httpx


class LLMProviderError(RuntimeError):
    def __init__(
        self,
        provider: str | None = None,
        message: str = '',
        *,
        status_code: int | None = None,
        retryable: bool = False,
        cause: Exception | None = None,
    ) -> None:
        self.provider = provider
        self.status_code = status_code
        self.retryable = retryable
        self.cause = cause
        detail = message or 'LLM provider request failed.'
        if provider:
            detail = f'{provider}: {detail}'
        super().__init__(detail)


class LLMConfigurationError(LLMProviderError):
    pass


class LLMUnavailableError(LLMProviderError):
    pass


def _error_body_text(error: Any) -> str:
    body = getattr(error, 'body', None)
    if isinstance(body, dict):
        parts = []
        for key in ('code', 'type', 'error', 'message'):
            value = body.get(key)
            if isinstance(value, str):
                parts.append(value)
            elif isinstance(value, dict):
                parts.extend(
                    str(value.get(nested_key))
                    for nested_key in ('code', 'type', 'error', 'message')
                    if isinstance(value.get(nested_key), str)
                )
        return ' '.join(parts).lower()
    if isinstance(body, str):
        return body.lower()
    return ''


def _is_invalid_api_key_response(error: Any) -> bool:
    cause = getattr(error, 'cause', None)
    candidates = (_error_body_text(error), _error_body_text(cause), str(error).lower())
    return any(
        marker in text
        for text in candidates
        for marker in ('incorrect api key', 'invalid api key')
    )


def is_retryable_provider_error(error: Any) -> bool:
    if isinstance(error, LLMProviderError):
        return error.retryable
    if isinstance(error, (TimeoutError, ConnectionError, OSError)):
        return True

    response = getattr(error, 'response', None)
    status_code = getattr(response, 'status_code', None)
    if status_code == 400 and _is_invalid_api_key_response(error):
        return True
    if status_code in {401, 402, 403, 404, 408, 429, 500, 502, 503, 504}:
        return True
    if isinstance(error, httpx.HTTPError) and status_code is None:
        return True

    text = str(error).lower()
    retryable_codes = {401, 402, 403, 404, 408, 429, 500, 502, 503, 504}
    for code in retryable_codes:
        if f'http {code}' in text or f' {code} ' in text or text.startswith(f'{code}'):
            return True

    retryable_phrases = (
        'timeout',
        'timed out',
        'rate limit',
        'too many requests',
        'temporarily unavailable',
        'service unavailable',
        'overloaded',
        'quota exceeded',
        'credit exhausted',
        'inference failed',
        'model unavailable',
        'provider unavailable',
        'connection error',
        'authentication',
        'unauthorized',
        'forbidden',
        'not allowed',
    )
    return any(phrase in text for phrase in retryable_phrases)


def normalize_provider_exception(error: Exception, *, provider: str | None = None) -> LLMProviderError:
    if isinstance(error, LLMProviderError):
        if provider and not error.provider:
            error.provider = provider
        return error

    status_code = None
    response = getattr(error, 'response', None)
    if response is not None:
        status_code = getattr(response, 'status_code', None)
    if status_code is None:
        for code in (401, 402, 403, 404, 408, 429, 500, 502, 503, 504):
            if f'http {code}' in str(error).lower() or f' {code} ' in str(error):
                status_code = code
                break

    retryable = is_retryable_provider_error(error)
    message = str(error)
    if not message:
        message = error.__class__.__name__
    return LLMProviderError(provider=provider, message=message, status_code=status_code, retryable=retryable, cause=error)


def safe_error_category(error: Exception) -> str:
    if isinstance(error, LLMConfigurationError):
        return 'invalid_provider_configuration'

    status_code = getattr(error, 'status_code', None)
    if status_code is None:
        response = getattr(error, 'response', None)
        status_code = getattr(response, 'status_code', None)
    if status_code == 400 and _is_invalid_api_key_response(error):
        return 'authentication_failed'
    status_categories = {
        400: 'invalid_request_or_model',
        401: 'authentication_failed',
        402: 'billing_or_credits',
        403: 'permission_denied',
        404: 'model_or_endpoint_not_found',
        408: 'provider_timeout',
        429: 'rate_limited',
    }
    if status_code in status_categories:
        return status_categories[status_code]
    if status_code is not None and status_code >= 500:
        return 'provider_server_error'
    if isinstance(error, (TimeoutError, httpx.TimeoutException)):
        return 'provider_timeout'
    if isinstance(error, (ConnectionError, httpx.TransportError, OSError)):
        return 'connection_error'
    if isinstance(error, LLMProviderError):
        return 'provider_error'
    return 'api_error'
