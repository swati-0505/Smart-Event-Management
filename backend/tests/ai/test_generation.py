from __future__ import annotations
import pytest
from unittest.mock import MagicMock, patch
from app.rag import generator
from app.rag import metadata
from app.rag.generator import NO_ANSWER, build_context, check_grounding
from app.rag.reranker import _parse_scores, rerank
from tests.ai.conftest import make_chunk

def test_generate_answer_uses_central_router_for_answer_and_grounding():
    router = MagicMock()
    router.invoke.side_effect = [
        MagicMock(content='Refunds apply to paid events. [Cancellation Policy]'),
        MagicMock(content='GROUNDED: yes'),
    ]
    with patch('app.rag.generator.LLMProviderRouter', return_value=router) as router_class:
        result = generator.generate_answer('What is the refund policy?', [make_chunk('a', content='Refunds apply to paid events.')])
    assert result.answer == 'Refunds apply to paid events. [Cancellation Policy]'
    assert router_class.call_count == 2
    assert [call.kwargs for call in router.invoke.call_args_list] == [
        {'temperature': 0.0},
        {'temperature': 0.0},
    ]

def test_generate_answer_rejects_an_empty_model_response():
    with patch('app.rag.generator.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='   ')
        with pytest.raises(RuntimeError, match='returned an empty answer'):
            generator.generate_answer('What is the refund policy?', [make_chunk('a', content='Refunds apply to paid events.')])

def test_parses_the_documented_format():
    assert _parse_scores('[1] 8\n[2] 3\n[3] 10', expected=3) == [8.0, 3.0, 10.0]

def test_tolerates_prose_around_the_scores():
    raw = 'Sure, here are my ratings:\n\n[1] 9\n[2] 1\n\nHope that helps.'
    assert _parse_scores(raw, expected=2) == [9.0, 1.0]

def test_tolerates_alternate_separators():
    assert _parse_scores('1: 7\n2. 4', expected=2) == [7.0, 4.0]

def test_missing_entries_default_to_neutral():
    assert _parse_scores('[1] 9\n[3] 2', expected=3) == [9.0, 5.0, 2.0]

def test_out_of_range_values_are_ignored():
    assert _parse_scores('[1] 5\n[2] 87', expected=2) == [5.0, 5.0]

def test_garbage_response_yields_all_neutral():
    scores = _parse_scores('I cannot help with that request.', expected=3)
    assert scores == [5.0, 5.0, 5.0]

def test_reranker_reorders_by_score():
    candidates = [make_chunk('a'), make_chunk('b'), make_chunk('c')]
    with patch('app.rag.reranker.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='[1] 2\n[2] 10\n[3] 5')
        result = rerank('refund policy', candidates, top_k=3)
    assert [c.chunk_id for c in result] == ['b', 'c', 'a']

def test_reranker_truncates_to_top_k():
    candidates = [make_chunk(f'c{i}') for i in range(10)]
    with patch('app.rag.reranker.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='\n'.join((f'[{i}] {i}' for i in range(1, 11))))
        result = rerank('q', candidates, top_k=4)
    assert len(result) == 4

def test_reranker_failure_falls_back_to_fused_order():
    candidates = [make_chunk('a'), make_chunk('b'), make_chunk('c')]
    from app.llm.exceptions import LLMUnavailableError
    with patch('app.rag.reranker.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = LLMUnavailableError(
            'multi-provider', 'All configured LLM providers failed.'
        )
        result = rerank('q', candidates, top_k=2)
    assert [c.chunk_id for c in result] == ['a', 'b']

def test_reranker_short_circuits_on_empty_input():
    assert rerank('q', []) == []

def test_metadata_extraction_uses_central_router():
    with patch('app.rag.metadata.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(
            content='{"summary": "Refund terms", "keywords": ["refund", "cancellation"]}'
        )
        result = metadata.extract_metadata('Policy details', title='Refunds')
    assert result == {'summary': 'Refund terms', 'keywords': ['refund', 'cancellation']}
    router.return_value.invoke.assert_called_once()
    assert router.return_value.invoke.call_args.kwargs == {'temperature': 0.0}

def test_grounded_yes_is_accepted():
    with patch('app.rag.generator.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='GROUNDED: yes')
        grounded, _ = check_grounding('Refunds are issued.', 'context')
    assert grounded is True

def test_grounded_no_returns_the_reason():
    with patch('app.rag.generator.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='GROUNDED: no | the 90 percent figure is not in the context')
        grounded, note = check_grounding('You get 90% back.', 'context')
    assert grounded is False
    assert '90 percent' in note

def test_unparseable_verdict_accepts_the_answer():
    with patch('app.rag.generator.LLMProviderRouter') as router:
        router.return_value.invoke.return_value = MagicMock(content='hmm, maybe?')
        grounded, note = check_grounding('answer', 'context')
    assert grounded is True
    assert 'unparseable' in note

def test_checker_exception_accepts_the_answer():
    from app.llm.exceptions import LLMUnavailableError
    with patch('app.rag.generator.LLMProviderRouter') as router:
        router.return_value.invoke.side_effect = LLMUnavailableError(
            'multi-provider', 'All configured LLM providers failed.'
        )
        grounded, note = check_grounding('answer', 'context')
    assert grounded is True
    assert 'unavailable' in note

def test_context_labels_every_chunk_with_its_source():
    chunks = [make_chunk('a', content='Refunds apply to paid events.')]
    context = build_context(chunks)
    assert 'Cancellation Policy > Refunds' in context
    assert 'Refunds apply to paid events.' in context

def test_empty_context_is_empty_string():
    assert build_context([]) == ''

def test_no_answer_text_is_a_refusal():
    assert 'could not find' in NO_ANSWER.lower()