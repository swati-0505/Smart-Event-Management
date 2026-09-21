"""
Stage 1 of the indexing pipeline: load -> parse.

MarkItDown gives us one converter for PDF, DOCX, PPTX, XLSX, HTML, CSV and
plain text, and it emits Markdown. Markdown matters here because the heading
structure (`#`, `##`) survives conversion, and the chunker uses those headings
as natural split points instead of cutting mid-sentence.

Plain .md and .txt files are read directly - running them through MarkItDown
would be a pointless round trip.
"""

from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)


CONVERTIBLE = {".pdf", ".docx", ".pptx", ".xlsx", ".html", ".htm", ".csv", ".json", ".xml"}

PLAINTEXT = {".md", ".txt", ".markdown"}

SUPPORTED = CONVERTIBLE | PLAINTEXT


@dataclass
class ConvertedDocument:
    """A source file after conversion to Markdown."""

    filename: str
    doc_type: str
    title: str
    text: str
    content_hash: str


def infer_doc_type(filename: str) -> str:
    """
    Map a filename to a doc_type used for metadata filtering at query time.

    'cancellation_policy.pdf' -> 'cancellation_policy'

    The agent can pass doc_type to search_event_policy() to narrow retrieval
    when the question is clearly about one policy area.
    """
    stem = Path(filename).stem.lower().replace("-", "_").replace(" ", "_")
    known = {
        "event_policy",
        "registration_policy",
        "cancellation_policy",
        "venue_policy",
        "attendance_policy",
        "faq",
    }
    return stem if stem in known else "general"


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def convert_file(path: str | Path) -> ConvertedDocument:
    """Convert one file to Markdown. Raises on unsupported extensions."""
    path = Path(path)
    suffix = path.suffix.lower()

    if suffix not in SUPPORTED:
        raise ValueError(
            f"Unsupported file type '{suffix}' for {path.name}. "
            f"Supported: {sorted(SUPPORTED)}"
        )

    if suffix in PLAINTEXT:
        text = path.read_text(encoding="utf-8", errors="replace")
    else:


        from markitdown import MarkItDown

        result = MarkItDown().convert(str(path))
        text = result.text_content or ""

    text = text.strip()
    if not text:
        raise ValueError(f"{path.name} converted to empty text - is the PDF scanned?")

    return ConvertedDocument(
        filename=path.name,
        doc_type=infer_doc_type(path.name),
        title=_extract_title(text, fallback=path.stem),
        text=text,
        content_hash=_hash(text),
    )


def convert_directory(directory: str | Path) -> list[ConvertedDocument]:
    """Convert every supported file in a directory. Skips what it cannot read."""
    directory = Path(directory)
    if not directory.is_dir():
        raise ValueError(f"{directory} is not a directory")

    documents: list[ConvertedDocument] = []
    for path in sorted(directory.iterdir()):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED:
            continue
        try:
            documents.append(convert_file(path))
        except Exception as exc:
            logger.warning("Skipping %s: %s", path.name, exc)

    return documents


def _extract_title(text: str, fallback: str) -> str:
    """Use the first Markdown H1 as the title, else the filename."""
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return fallback.replace("_", " ").title()
