from typing import Literal
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
class AISettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    CHAT_TEMPERATURE: float = 0.0
    OPENROUTER_EMBEDDING_MODEL: str = Field(min_length=1)
    OPENROUTER_EMBEDDING_DIM: int = 2048
    RAG_ACTIVE_EMBEDDING_INDEX: Literal['nvidia'] = 'nvidia'
    EMBEDDING_MAX_TOKENS: int = 512

    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_MAX_CONCURRENCY: int = 2

    CHUNK_SIZE_CHARS: int = 1800
    CHUNK_OVERLAP_CHARS: int = 180
    CHUNK_MIN_CHARS: int = 80
    DENSE_TOP_K: int = 16
    SPARSE_TOP_K: int = 16
    RRF_K: int = 60
    FUSED_TOP_K: int = 8
    FINAL_TOP_K: int = 4
    ENABLE_RERANKER: bool = True
    ENABLE_METADATA_EXTRACTION: bool = True
    ENABLE_HALLUCINATION_CHECK: bool = True
    MAX_GENERATION_RETRIES: int = 1
    AGENT_MAX_TOOL_LOOPS: int = 6
    MEMORY_WINDOW_MESSAGES: int = 10
    KNOWLEDGE_DOCS_DIR: str = 'documents'

    @field_validator('OPENROUTER_EMBEDDING_DIM')
    @classmethod
    def validate_openrouter_embedding_dim(cls, value: int) -> int:
        if value not in [1024, 2048]:
            raise ValueError('embedding dimension must match the selected model (1024 or 2048).')
        return value
ai_settings = AISettings()