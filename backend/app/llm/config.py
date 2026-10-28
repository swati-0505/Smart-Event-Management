from __future__ import annotations
from typing import Any
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class LLMSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    OPENROUTER_API_KEY: str = ''
    OPENROUTER_BASE_URL: str = 'https://openrouter.ai/api/v1'
    OPENROUTER_MODEL: str = Field(min_length=1)
    OPENROUTER_FALLBACK_MODELS: str = ''

    GROQ_API_KEY: str = ''
    GROQ_BASE_URL: str = 'https://api.groq.com/openai/v1'
    GROQ_MODEL: str = 'llama-3.3-70b-versatile'

    GEMINI_API_KEY: str = ''
    GEMINI_BASE_URL: str = 'https://generativelanguage.googleapis.com/v1beta/openai/'
    GEMINI_MODEL: str = 'gemini-2.5-flash'

    LLM_TIMEOUT_SECONDS: int = Field(default=60, ge=5, le=300)
    LLM_MAX_RETRIES: int = Field(default=1, ge=0, le=3)

    def provider_config(self, provider: str) -> dict[str, Any]:
        provider_name = provider.lower().strip()

        if provider_name == 'groq':
            return {
                'name': provider_name,
                'configured': bool(self.GROQ_API_KEY.strip()) and not self._is_placeholder(self.GROQ_API_KEY),
                'api_key': self.GROQ_API_KEY.strip(),
                'base_url': self.GROQ_BASE_URL,
                'model': self.GROQ_MODEL,
            }

        if provider_name == 'gemini':
            return {
                'name': provider_name,
                'configured': bool(self.GEMINI_API_KEY.strip()) and not self._is_placeholder(self.GEMINI_API_KEY),
                'api_key': self.GEMINI_API_KEY.strip(),
                'base_url': self.GEMINI_BASE_URL,
                'model': self.GEMINI_MODEL,
            }

        if provider_name == 'openrouter':
            return {
                'name': provider_name,
                'configured': bool(self.OPENROUTER_API_KEY.strip()) and not self._is_placeholder(self.OPENROUTER_API_KEY),
                'api_key': self.OPENROUTER_API_KEY.strip(),
                'base_url': self.OPENROUTER_BASE_URL,
                'model': self.OPENROUTER_MODEL,
            }
        return {'name': provider_name, 'configured': False, 'api_key': '', 'base_url': '', 'model': ''}

    def is_configured(self, provider: str) -> bool:
        return bool(self.provider_config(provider).get('configured'))

    def configured_providers(self) -> list[str]:
        providers = ['groq', 'gemini', 'openrouter']
        return [provider for provider in providers if self.is_configured(provider)]

    @property
    def openrouter_fallback_models(self) -> tuple[str, ...]:
        return tuple(
            model.strip()
            for model in self.OPENROUTER_FALLBACK_MODELS.split(',')
            if model.strip())

    @staticmethod
    def _is_placeholder(value: str) -> bool:
        token = value.strip()
        if not token:
            return True
        upper = token.upper()
        return any(marker in upper for marker in ('REPLACE', 'PLACEHOLDER', 'YOUR_', 'CHANGE_ME', 'YOUR_API_KEY'))

    def safe_summary(self) -> dict[str, list[str]]:
        return {
            'configured': self.configured_providers(),
            'available': [
                provider
                for provider in ['groq', 'gemini', 'openrouter']
                if self.provider_config(provider)['configured']
            ],
        }

llm_settings = LLMSettings()