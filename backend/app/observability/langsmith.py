from __future__ import annotations

import logging
from contextlib import contextmanager
from functools import lru_cache
from pathlib import Path
from typing import Iterator

from langsmith import Client, tracing_context
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class LangSmithSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / '.env',
        extra='ignore',
    )

    LANGSMITH_TRACING: bool = False
    LANGSMITH_ENDPOINT: str = 'https://api.smith.langchain.com'
    LANGSMITH_API_KEY: SecretStr = SecretStr('')
    LANGSMITH_PROJECT: str = 'smart'
    LANGSMITH_AGENT_ID: str = 'smart'
    LANGSMITH_AGENT_ENVIRONMENT: str = 'local'


langsmith_settings = LangSmithSettings()
_missing_key_warning_logged = False


@lru_cache(maxsize=1)
def _get_client(api_key: str, endpoint: str) -> Client:
    return Client(api_key=api_key, api_url=endpoint)


@contextmanager
def langsmith_trace(pipeline: str) -> Iterator[None]:
    global _missing_key_warning_logged

    if not langsmith_settings.LANGSMITH_TRACING:
        yield
        return

    api_key = langsmith_settings.LANGSMITH_API_KEY.get_secret_value().strip()
    if not api_key or api_key.startswith('replace_with_'):
        if not _missing_key_warning_logged:
            logger.warning(
                'LangSmith tracing is enabled but LANGSMITH_API_KEY is missing or is a placeholder; '
                'traces will not be sent.'
            )
            _missing_key_warning_logged = True
        yield
        return

    with tracing_context(
        enabled=True,
        client=_get_client(api_key, langsmith_settings.LANGSMITH_ENDPOINT),
        project_name=langsmith_settings.LANGSMITH_PROJECT,
        tags=[f'agent:{langsmith_settings.LANGSMITH_AGENT_ID}', f'pipeline:{pipeline}'],
        metadata={
            'agent_id': langsmith_settings.LANGSMITH_AGENT_ID,
            'environment': langsmith_settings.LANGSMITH_AGENT_ENVIRONMENT,
            'pipeline': pipeline,
        },
    ):
        yield
