"""
Parsing tests for the reranker and the hallucination checker.

These two stages ask a small free model to reply in a fixed format, and small
free models drift from fixed formats constantly - fences, prose preambles,
"Passage 1:" instead of "[1]", missing entries. Every one of those drifts has
to degrade into something sane rather than raising or silently scoring
everything zero.
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from app.rag.generator import NO_ANSWER, build_context, check_grounding
from app.rag.reranker import _parse_scores, rerank
from tests.ai.conftest import make_chunk






def test_parses_the_documented_format():
    assert _parse_scores("[1] 8\n[2] 3\n[3] 10", expected=3) == [8.0, 3.0, 10.0]


def test_tolerates_prose_around_the_scores():
    raw = "Sure, here are my ratings:\n\n[1] 9\n[2] 1\n\nHope that helps."
    assert _parse_scores(raw, expected=2) == [9.0, 1.0]


def test_tolerates_alternate_separators():
    assert _parse_scores("1: 7\n2. 4", expected=2) == [7.0, 4.0]


def test_missing_entries_default_to_neutral():
    """
    A skipped passage keeps its fused position rather than being buried.

    Defaulting to 0 would be worse than not reranking at all: retrieval
    already thought this chunk was good, and the reranker simply failed to
    say anything about it.
    """
    assert _parse_scores("[1] 9\n[3] 2", expected=3) == [9.0, 5.0, 2.0]


def test_out_of_range_values_are_ignored():
    """A hallucinated '[2] 87' must not dominate the ordering."""
    assert _parse_scores("[1] 5\n[2] 87", expected=2) == [5.0, 5.0]


def test_garbage_response_yields_all_neutral():
    scores = _parse_scores("I cannot help with that request.", expected=3)
    assert scores == [5.0, 5.0, 5.0]






def test_reranker_reorders_by_score():
    candidates = [make_chunk("a"), make_chunk("b"), make_chunk("c")]

    with patch("app.rag.reranker.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(
            content="[1] 2\n[2] 10\n[3] 5"
        )
        result = rerank("refund policy", candidates, top_k=3)

    assert [c.chunk_id for c in result] == ["b", "c", "a"]


def test_reranker_truncates_to_top_k():
    candidates = [make_chunk(f"c{i}") for i in range(10)]

    with patch("app.rag.reranker.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(
            content="\n".join(f"[{i}] {i}" for i in range(1, 11))
        )
        result = rerank("q", candidates, top_k=4)

    assert len(result) == 4


def test_reranker_failure_falls_back_to_fused_order():
    """
    A dead reranker must not take the chat endpoint down with it.

    Worse ordering is survivable. A 500 is not.
    """
    candidates = [make_chunk("a"), make_chunk("b"), make_chunk("c")]

    with patch("app.rag.reranker.get_chat_model", side_effect=RuntimeError("429")):
        result = rerank("q", candidates, top_k=2)

    assert [c.chunk_id for c in result] == ["a", "b"]


def test_reranker_short_circuits_on_empty_input():
    assert rerank("q", []) == []






def test_grounded_yes_is_accepted():
    with patch("app.rag.generator.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(content="GROUNDED: yes")
        grounded, _ = check_grounding("Refunds are issued.", "context")

    assert grounded is True


def test_grounded_no_returns_the_reason():
    with patch("app.rag.generator.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(
            content="GROUNDED: no | the 90 percent figure is not in the context"
        )
        grounded, note = check_grounding("You get 90% back.", "context")

    assert grounded is False
    assert "90 percent" in note


def test_unparseable_verdict_accepts_the_answer():
    """
    A broken verifier must not block every answer the system produces.

    Failing open is the right call here: the checker is a safety net, and a
    net that rejects everything is the same as no net plus an outage.
    """
    with patch("app.rag.generator.get_chat_model") as get_model:
        get_model.return_value.invoke.return_value = MagicMock(content="hmm, maybe?")
        grounded, note = check_grounding("answer", "context")

    assert grounded is True
    assert "unparseable" in note


def test_checker_exception_accepts_the_answer():
    with patch("app.rag.generator.get_chat_model", side_effect=RuntimeError("timeout")):
        grounded, note = check_grounding("answer", "context")

    assert grounded is True
    assert "unavailable" in note






def test_context_labels_every_chunk_with_its_source():
    """Without the label the model cannot cite, and a reader cannot trace."""
    chunks = [make_chunk("a", content="Refunds apply to paid events.")]

    context = build_context(chunks)

    assert "Cancellation Policy > Refunds" in context
    assert "Refunds apply to paid events." in context


def test_empty_context_is_empty_string():
    assert build_context([]) == ""


def test_no_answer_text_is_a_refusal():
    """The refusal must not read as an answer if it reaches the user."""
    assert "could not find" in NO_ANSWER.lower()
