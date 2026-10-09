from __future__ import annotations
from app.core.ai_config import ai_settings
from app.rag.chunker import Chunk, build_embedding_text, chunk_markdown, _split_by_heading
MARKDOWN = '# Cancellation Policy\n\nIntro paragraph about cancelling.\n\n## Refunds\n\nRefunds apply only to paid events.\n\n### Late cancellation\n\nLess than 48 hours before the event, no refund is issued.\n\n## No-shows\n\nA participant who neither attends nor cancels is recorded as a no-show.\n'

def test_headings_become_sections():
    sections = _split_by_heading(MARKDOWN)
    trails = [trail for trail, _ in sections]
    assert 'Cancellation Policy' in trails
    assert 'Cancellation Policy > Refunds' in trails
    assert 'Cancellation Policy > Refunds > Late cancellation' in trails

def test_sibling_heading_pops_the_trail():
    sections = dict(_split_by_heading(MARKDOWN))
    assert 'Cancellation Policy > No-shows' in sections

def test_chunks_carry_their_section():
    markdown = '# Cancellation Policy\n\n## Refunds\n\n' + 'Refunds apply only to paid events. ' * 20 + '\n\n## No-shows\n\n' + 'A no-show forfeits the fee entirely. ' * 20
    chunks = chunk_markdown(markdown)
    assert all((isinstance(c, Chunk) for c in chunks))
    sections = {c.section for c in chunks}
    assert 'Cancellation Policy > Refunds' in sections
    assert 'Cancellation Policy > No-shows' in sections

def test_a_short_document_becomes_one_chunk():
    chunks = chunk_markdown(MARKDOWN)
    assert len(chunks) == 1
    assert 'no-show' in chunks[0].content.lower()
    assert 'Refunds apply' in chunks[0].content

def test_chunk_indices_are_sequential():
    chunks = chunk_markdown(MARKDOWN)
    assert [c.index for c in chunks] == list(range(len(chunks)))

def test_no_chunk_exceeds_the_size_limit():
    long_text = '# Policy\n\n' + 'This is a sentence about refunds. ' * 400
    chunks = chunk_markdown(long_text, chunk_size=500, overlap=50)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.content) <= 500 + 50 + 1

def test_unbroken_text_is_hard_cut():
    chunks = chunk_markdown('x' * 5000, chunk_size=400, overlap=0)
    assert len(chunks) > 1
    assert all((len(c.content) <= 400 for c in chunks))

def test_overlap_carries_context_forward():
    text = '# T\n\n' + 'alpha beta gamma delta. ' * 200
    with_overlap = chunk_markdown(text, chunk_size=400, overlap=100)
    without_overlap = chunk_markdown(text, chunk_size=400, overlap=0)
    assert len(with_overlap) >= len(without_overlap)
    assert len(with_overlap[1].content) > 0

def test_short_sections_are_merged_not_dropped():
    markdown = '# Cancellation Policy\n\n## Late cancellation\n\nLess than 48 hours before the event, no refund is issued.\n'
    chunks = chunk_markdown(markdown)
    assert chunks, 'short section was dropped entirely'
    assert any(('48 hours' in c.content for c in chunks))

def test_structural_noise_is_still_dropped():
    assert chunk_markdown('# A\n\n-\n\n## B\n\n|', min_size=50) == []

def test_explicit_zero_overlap_is_respected():
    chunks = chunk_markdown('x' * 2000, chunk_size=400, overlap=0)
    assert all((len(c.content) <= 400 for c in chunks))

def test_text_before_any_heading_is_kept():
    chunks = chunk_markdown('Preamble text that appears before any heading at all in this file.\n\n# Later Heading\n\nBody text under the heading.')
    assert any(('Preamble' in c.content for c in chunks))

def test_embedding_text_prepends_the_citation_trail():
    chunk = Chunk(index=0, content='A full refund is issued.', section='Refunds')
    result = build_embedding_text(chunk, document_title='Cancellation Policy')
    assert result.startswith('Cancellation Policy > Refunds')
    assert 'A full refund is issued.' in result

def test_embedding_text_without_a_section():
    chunk = Chunk(index=0, content='Body only.', section='')
    assert build_embedding_text(chunk, document_title='') == 'Body only.'

def test_default_chunk_size_respects_the_embedding_limit():
    worst_case_chars = ai_settings.CHUNK_SIZE_CHARS + ai_settings.CHUNK_OVERLAP_CHARS
    approx_tokens = worst_case_chars / 4
    assert approx_tokens < ai_settings.EMBEDDING_MAX_TOKENS, f'CHUNK_SIZE_CHARS + CHUNK_OVERLAP_CHARS is ~{approx_tokens:.0f} tokens, over the {ai_settings.EMBEDDING_MAX_TOKENS}-token embedding limit. Chunks would be silently truncated.'