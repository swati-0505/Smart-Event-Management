from __future__ import annotations
import hashlib
import logging
from langchain_core.tools import tool
from app.core.redis_cache import redis_cache
from app.rag import pipeline
from app.tools.context import get_tool_context
logger = logging.getLogger(__name__)
_RAG_TTL = 1800
VALID_DOC_TYPES = {'event_policy', 'registration_policy', 'cancellation_policy', 'venue_policy', 'attendance_policy', 'faq'}

def _rag_cache_key(question: str, doc_type: str | None) -> str:
    raw = f"{doc_type or 'all'}::{question.strip().lower()}"
    digest = hashlib.sha256(raw.encode()).hexdigest()[:24]
    return f'policy:rag:{digest}'

@tool
def search_event_policy(question: str, policy_area: str='') -> str:
    """Search event management policies, FAQs, deadlines, and rules."""
    db = get_tool_context().db
    doc_type = policy_area.strip().lower() if policy_area else None
    if doc_type and doc_type not in VALID_DOC_TYPES:
        logger.info('Ignoring unknown policy_area %r', policy_area)
        doc_type = None
    cache_key = _rag_cache_key(question, doc_type)
    cached = redis_cache.get(cache_key)
    if cached is not None:
        logger.debug('RAG cache HIT for key: %s', cache_key)
        return cached
    try:
        response = pipeline.answer(db, question, doc_type=doc_type)
    except Exception as exc:
        logger.exception('RAG pipeline failed')
        return f'The policy knowledge base could not be searched right now. ({exc.__class__.__name__}) Suggest the user contact an administrator.'
    if not response.chunks:
        return 'No policy document covers that. Do not guess an answer - tell the user this is not documented and suggest asking an administrator.'
    result = response.answer
    if response.sources:
        result += f"\n\nSources: {', '.join(response.sources)}"
    if not response.grounded:
        result += '\n\n[Note: this answer failed the grounding check. Tell the user the policy documents do not clearly cover their question.]'
    redis_cache.set(cache_key, result, ttl=_RAG_TTL)
    logger.debug('RAG response cached at key: %s (TTL: %ds)', cache_key, _RAG_TTL)
    return result