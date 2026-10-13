from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class AISettings(BaseSettings):
    HUGGINGFACE_API_KEY: str = ''
    CHAT_TEMPERATURE: float = 0.0
    CHAT_TIMEOUT_SECONDS: int = 60
    EMBEDDING_MODEL: str = Field(min_length=1)
    EMBEDDING_DIM: int = 384
    OPENROUTER_EMBEDDING_MODEL: str = Field(min_length=1)
    OPENROUTER_EMBEDDING_DIM: int = 2048
    RAG_ACTIVE_EMBEDDING_INDEX: Literal['legacy', 'nvidia'] = 'legacy'
    EMBEDDING_MAX_TOKENS: int = 512
    EMBEDDING_BATCH_SIZE: int = 16
    CHUNK_SIZE_CHARS: int = 1400
    CHUNK_OVERLAP_CHARS: int = 200
    CHUNK_MIN_CHARS: int = 80
    DENSE_TOP_K: int = 20
    SPARSE_TOP_K: int = 20
    RRF_K: int = 60
    FUSED_TOP_K: int = 10
    FINAL_TOP_K: int = 4
    ENABLE_RERANKER: bool = True
    ENABLE_METADATA_EXTRACTION: bool = True
    ENABLE_HALLUCINATION_CHECK: bool = True
    MAX_GENERATION_RETRIES: int = 1
    AGENT_MAX_TOOL_LOOPS: int = 6
    MEMORY_WINDOW_MESSAGES: int = 10
    KNOWLEDGE_DOCS_DIR: str = 'documents'

    model_config = SettingsConfigDict(
    env_file=".env",
    extra="ignore",
)

    @field_validator('OPENROUTER_EMBEDDING_DIM')
    @classmethod
    def validate_openrouter_embedding_dim(cls, value: int) -> int:
        if value != 2048:
            raise ValueError('The staged embedding index requires 2048-dimensional vectors.')
        return value

ai_settings = AISettings()