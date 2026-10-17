from __future__ import annotations
import sys
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_SECRETS = {
    'change-this-in-production',
    'secret',
    'changeme',
    '',
}

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    DATABASE_URL: str = 'postgresql://postgres:password@localhost:5432/eventdb'
    SECRET_KEY: str = 'change-this-in-production'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    APP_TIMEZONE: str = 'Asia/Kolkata'
    EVENT_DEFAULT_DURATION_HOURS: float = Field(default=3, gt=0)
    REDIS_URL: str = Field(default='redis://localhost:6379/0')
    ENABLE_REDIS_CACHE: bool = Field(default=True)
    REDIS_CACHE_TTL_SECONDS: int = Field(default=300)

    # Comma-separated list of allowed CORS origins, e.g.:
    # CORS_ORIGINS=https://app.example.com,https://admin.example.com
    CORS_ORIGINS: str = Field(
        default='http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1'
    )

    # Set to 'false' in production to hide /docs and /redoc
    ENABLE_API_DOCS: bool = Field(default=True)

    @field_validator('SECRET_KEY')
    @classmethod
    def secret_key_must_be_secure(cls, v: str) -> str:
        if v.lower() in _INSECURE_SECRETS or len(v) < 32:
            # Allow insecure keys in local dev but block in production
            import os
            env = os.environ.get('APP_ENV', 'development').lower()
            if env == 'production':
                print(
                    'FATAL: SECRET_KEY is insecure or too short for production. '
                    'Set a random 64-character SECRET_KEY and restart.',
                    file=sys.stderr,
                )
                sys.exit(1)
        return v

    @field_validator('APP_TIMEZONE')
    @classmethod
    def timezone_must_be_valid(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError(f'APP_TIMEZONE must be a valid IANA timezone, got {value!r}.') from exc
        return value

    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',') if origin.strip()]

settings = Settings()