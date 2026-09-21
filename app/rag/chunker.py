"""
Stage 2 of the indexing pipeline: smart chunking.

"Smart" means the splitter tries boundaries in order of how much meaning they
preserve, and only falls back to a cruder one when a piece is still too big:

    1. Markdown headings  (##, ###)  - keeps a policy section intact
    2. Blank lines        (paragraphs)
    3. Sentence ends
    4. Hard character cut (last resort)

Size matters more than usual here. lfm-2.5-embedding-350m truncates at 512
tokens, so anything past that is silently thrown away by the embedding model -
you would get a vector that does not represent the whole chunk and you would
never see an error. CHUNK_SIZE_CHARS is set to 1400 (~350 tokens) to stay
comfortably inside that ceiling.

Each chunk keeps its heading trail (e.g. "Cancellation Policy > Refunds") so a
retrieved fragment still says what part of what document it came from.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from app.core.ai_config import ai_settings

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
SENTENCE_END_RE = re.compile(r"(?<=[.!?])\s+")


@dataclass
class Chunk:
    index: int
    content: str
    section: str = ""
    metadata: dict = field(default_factory=dict)


def chunk_markdown(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
    min_size: int | None = None,
) -> list[Chunk]:
    """Split Markdown into embedding-sized chunks. Returns them in order."""


    chunk_size = chunk_size if chunk_size is not None else ai_settings.CHUNK_SIZE_CHARS
    overlap = overlap if overlap is not None else ai_settings.CHUNK_OVERLAP_CHARS
    min_size = min_size if min_size is not None else ai_settings.CHUNK_MIN_CHARS

    sections = _split_by_heading(text)

    chunks: list[Chunk] = []
    for section_title, body in sections:
        for piece in _split_to_size(body, chunk_size, overlap):
            piece = piece.strip()
            if not piece:
                continue
            chunks.append(
                Chunk(index=0, content=piece, section=section_title)
            )

    chunks = _merge_small_chunks(chunks, chunk_size=chunk_size, min_size=min_size)


    for position, chunk in enumerate(chunks):
        chunk.index = position

    return chunks




HARD_FLOOR_CHARS = 15


def _merge_small_chunks(
    chunks: list[Chunk],
    chunk_size: int,
    min_size: int,
) -> list[Chunk]:
    """
    Fold undersized chunks into a neighbour instead of throwing them away.

    This matters more than it looks. Splitting by heading means a short
    section gets its own chunk, and policy documents are full of short
    sections that carry the actual rule - "Less than 48 hours before the
    event, no refund is issued" is 56 characters. Dropping it for being below
    min_size removes the answer from the index while leaving the surrounding
    prose in place, so retrieval returns something plausible and wrong.

    Merging forward keeps the text and gives it enough surrounding context to
    embed meaningfully.
    """
    if not chunks:
        return []

    merged: list[Chunk] = []

    for chunk in chunks:
        content = chunk.content.strip()

        if len(content) < HARD_FLOOR_CHARS:
            continue

        if len(content) >= min_size:
            merged.append(chunk)
            continue


        if merged and len(merged[-1].content) + len(content) + 2 <= chunk_size:
            previous = merged[-1]
            previous.content = f"{previous.content}\n\n{content}"

            continue


        merged.append(chunk)



    if len(merged) > 1 and len(merged[0].content) < min_size:
        first, second = merged[0], merged[1]
        if len(first.content) + len(second.content) + 2 <= chunk_size:
            second.content = f"{first.content}\n\n{second.content}"
            second.section = first.section or second.section
            merged.pop(0)

    return merged






def _split_by_heading(text: str) -> list[tuple[str, str]]:
    """
    Group lines under their heading trail.

    Returns [(heading_trail, body_text), ...]. Text before the first heading
    is returned under an empty trail.
    """
    sections: list[tuple[str, str]] = []
    trail: list[str] = []
    buffer: list[str] = []

    def flush() -> None:
        body = "\n".join(buffer).strip()
        if body:
            sections.append((" > ".join(trail), body))
        buffer.clear()

    for line in text.splitlines():
        match = HEADING_RE.match(line)
        if match:
            flush()
            level = len(match.group(1))
            title = match.group(2).strip()

            trail = trail[: level - 1]
            while len(trail) < level - 1:
                trail.append("")
            trail.append(title)
        else:
            buffer.append(line)

    flush()
    return sections or [("", text.strip())]






def _split_to_size(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split `text` so every piece is <= chunk_size, preferring good boundaries."""
    if len(text) <= chunk_size:
        return [text]


    pieces = _pack(text.split("\n\n"), chunk_size, joiner="\n\n")
    if all(len(p) <= chunk_size for p in pieces):
        return _apply_overlap(pieces, overlap)


    refined: list[str] = []
    for piece in pieces:
        if len(piece) <= chunk_size:
            refined.append(piece)
        else:
            refined.extend(_pack(SENTENCE_END_RE.split(piece), chunk_size, joiner=" "))



    final: list[str] = []
    for piece in refined:
        if len(piece) <= chunk_size:
            final.append(piece)
        else:
            final.extend(
                piece[i : i + chunk_size] for i in range(0, len(piece), chunk_size)
            )

    return _apply_overlap(final, overlap)


def _pack(parts: list[str], chunk_size: int, joiner: str) -> list[str]:
    """Greedily combine small parts until adding the next would exceed the limit."""
    packed: list[str] = []
    current = ""

    for part in parts:
        part = part.strip()
        if not part:
            continue
        candidate = f"{current}{joiner}{part}" if current else part
        if len(candidate) <= chunk_size:
            current = candidate
        else:
            if current:
                packed.append(current)
            current = part

    if current:
        packed.append(current)
    return packed


def _apply_overlap(pieces: list[str], overlap: int) -> list[str]:
    """
    Prefix each chunk with the tail of the previous one.

    Without overlap, a sentence sitting exactly on a boundary loses its
    context and neither chunk retrieves well for it.
    """
    if overlap <= 0 or len(pieces) < 2:
        return pieces

    result = [pieces[0]]
    for previous, current in zip(pieces, pieces[1:]):
        tail = previous[-overlap:].lstrip()
        result.append(f"{tail} {current}" if tail else current)
    return result


def build_embedding_text(chunk: Chunk, document_title: str) -> str:
    """
    What we actually send to the embedding model.

    Prepending the document title and section trail measurably improves
    retrieval: a chunk that reads "a full refund is issued" becomes
    "Cancellation Policy > Refunds: a full refund is issued", which matches
    a query about refunds far better.
    """
    header_parts = [p for p in (document_title, chunk.section) if p]
    header = " > ".join(header_parts)
    return f"{header}\n\n{chunk.content}" if header else chunk.content
