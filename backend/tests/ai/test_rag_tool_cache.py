from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock

from app.tools import rag_tools


def test_policy_tool_caches_successful_rag_response(user_context, monkeypatch):
    cache_get = MagicMock(return_value=None)
    cache_set = MagicMock(return_value=True)
    pipeline_answer = MagicMock(
        return_value=SimpleNamespace(
            chunks=[object()],
            answer='Refunds are available under the policy.',
            sources=['Cancellation Policy'],
            grounded=True,
        )
    )
    monkeypatch.setattr(rag_tools.redis_cache, 'get', cache_get)
    monkeypatch.setattr(rag_tools.redis_cache, 'set', cache_set)
    monkeypatch.setattr(rag_tools.pipeline, 'answer', pipeline_answer)
    monkeypatch.setattr(rag_tools, 'get_tool_context', lambda: SimpleNamespace(db=user_context.db))

    result = rag_tools.search_event_policy.invoke(
        {'question': 'What is the refund policy?', 'policy_area': ''}
    )
    cache_key = cache_get.call_args.args[0]
    cache_get.return_value = result
    cached_result = rag_tools.search_event_policy.invoke(
        {'question': 'What is the refund policy?', 'policy_area': ''}
    )

    assert result.startswith('Refunds are available under the policy.')
    assert 'Sources: Cancellation Policy' in result
    assert cached_result == result
    assert pipeline_answer.call_count == 1
    cache_set.assert_called_once_with(cache_key, result, ttl=rag_tools._RAG_TTL)
    assert rag_tools._RAG_TTL == 1800
