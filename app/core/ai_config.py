"""
AI / RAG / Agent configuration.

Kept in its own file (rather than editing app/core/config.py) so the AI work
does not create merge conflicts with the rest of the team. It reads the same
.env file as the main Settings class.
"""

from pydantic_settings import BaseSettings

class AISettings(BaseSettings):

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_APP_NAME: str = "RAG"


    CHAT_MODEL: str = "openrouter/free"
    CHAT_MODEL_FALLBACK: str = "meta-llama/llama-3.3-70b-instruct:free"
    CHAT_TEMPERATURE: float = 0.0
    CHAT_MAX_TOKENS: int = 1024
    CHAT_TIMEOUT_SECONDS: int = 60
    CHAT_NUM_GPU: int = 0


    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIM: int = 384
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

    KNOWLEDGE_DOCS_DIR: str = "documents"

    class Config:
        env_file = "backend/.env"
        extra = "ignore"

ai_settings = AISettings()