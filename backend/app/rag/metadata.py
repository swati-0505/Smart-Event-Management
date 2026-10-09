from __future__ import annotations
import json
import logging
import re
from app.core.ai_config import ai_settings
from app.llm.exceptions import LLMUnavailableError
from app.llm.router import LLMProviderRouter
logger = logging.getLogger(__name__)
_PROMPT = 'You are indexing a chunk of an event-management policy document.\n\nReturn ONLY a JSON object, no markdown fences and no commentary, shaped like:\n{{"summary": "<one sentence, max 20 words>", "keywords": ["<3 to 6 lowercase terms>"]}}\n\nKeywords should include synonyms and phrasings a user might search for that do\nnot literally appear in the text.\n\nDocument: {title}\nSection: {section}\n\nChunk:\n"""\n{content}\n"""\n'
EMPTY = {'summary': '', 'keywords': []}

def extract_metadata(content: str, title: str='', section: str='') -> dict:
    if not ai_settings.ENABLE_METADATA_EXTRACTION:
        return dict(EMPTY)
    try:
        response = LLMProviderRouter().invoke(
            _PROMPT.format(title=title or 'unknown', section=section or 'unknown', content=content[:2000]),
            temperature=0.0,
        )
        parsed = _parse_json(str(response.content))
    except LLMUnavailableError:
        logger.warning('Metadata extraction failed, continuing without it.')
        return dict(EMPTY)
    if not parsed:
        return dict(EMPTY)
    keywords = parsed.get('keywords') or []
    if not isinstance(keywords, list):
        keywords = []
    return {'summary': str(parsed.get('summary', ''))[:300], 'keywords': [str(k).lower().strip() for k in keywords][:8]}

def _parse_json(raw: str) -> dict | None:
    text = raw.strip()
    text = re.sub('^```(?:json)?\\s*', '', text)
    text = re.sub('\\s*```$', '', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search('\\{.*\\}', text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None