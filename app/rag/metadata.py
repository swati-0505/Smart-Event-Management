"""
Stage 3 of the indexing pipeline: LLM metadata extraction.

For each chunk we ask the LLM for a one-line summary and a few keywords. Two
payoffs:

  * The keywords are appended to the text that gets indexed into the tsvector,
    which strengthens the sparse arm of hybrid search - a chunk about "refund
    within 48 hours" also becomes findable via "money back", "cancel fee".
  * The summary is shown to the generator alongside the raw chunk, so the
    model knows what it is looking at.

This runs at ingest time only, never on the query path, so its latency does
not affect users.

It is best-effort. If the LLM is rate-limited or returns malformed JSON we log
it and fall back to empty metadata rather than failing the whole ingest -
losing metadata degrades retrieval slightly; losing the ingest loses everything.
"""

from __future__ import annotations

import json
import logging
import re

from app.core.ai_config import ai_settings
from app.rag.clients import get_chat_model

logger = logging.getLogger(__name__)

_PROMPT = """You are indexing a chunk of an event-management policy document.

Return ONLY a JSON object, no markdown fences and no commentary, shaped like:
{{"summary": "<one sentence, max 20 words>", "keywords": ["<3 to 6 lowercase terms>"]}}

Keywords should include synonyms and phrasings a user might search for that do
not literally appear in the text.

Document: {title}
Section: {section}

Chunk:
\"\"\"
{content}
\"\"\"
"""

EMPTY = {"summary": "", "keywords": []}


def extract_metadata(content: str, title: str = "", section: str = "") -> dict:
    """Return {"summary": str, "keywords": [str]}. Never raises."""
    if not ai_settings.ENABLE_METADATA_EXTRACTION:
        return dict(EMPTY)

    try:
        model = get_chat_model(temperature=0.0)
        response = model.invoke(
            _PROMPT.format(
                title=title or "unknown",
                section=section or "unknown",
                content=content[:2000],
            )
        )
        parsed = _parse_json(str(response.content))
    except Exception as exc:
        logger.warning("Metadata extraction failed, continuing without it: %s", exc)
        return dict(EMPTY)

    if not parsed:
        return dict(EMPTY)

    keywords = parsed.get("keywords") or []
    if not isinstance(keywords, list):
        keywords = []

    return {
        "summary": str(parsed.get("summary", ""))[:300],
        "keywords": [str(k).lower().strip() for k in keywords][:8],
    }


def _parse_json(raw: str) -> dict | None:
    """
    Pull a JSON object out of an LLM response.

    Small free models routinely wrap JSON in ```json fences or add a sentence
    before it, so we strip fences and then grab the outermost {...}.
    """
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None
