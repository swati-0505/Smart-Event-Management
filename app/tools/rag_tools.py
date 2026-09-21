"""
The RAG tool: search_event_policy.

This is the bridge between the agent and the knowledge base. From the agent's
point of view it is just another tool. Behind it sits the whole query
pipeline: dense + sparse retrieval, RRF fusion, reranking, grounded
generation with a hallucination check.

Section 13 of the roadmap defines the routing rule this implements:
transactional requests go to business tools, policy and FAQ questions come
here. The docstring is what teaches the model that split, so it is written to
draw a sharp line - "what is the refund policy" belongs here, "cancel my
registration" does not.
"""

from __future__ import annotations

import logging

from langchain_core.tools import tool

from app.rag import pipeline
from app.tools.context import get_tool_context

logger = logging.getLogger(__name__)


VALID_DOC_TYPES = {
    "event_policy",
    "registration_policy",
    "cancellation_policy",
    "venue_policy",
    "attendance_policy",
    "faq",
}


@tool
def search_event_policy(question: str, policy_area: str = "") -> str:
    """Answer questions about event policies, rules, and FAQs from official documents.

    Use this for questions about how things work rather than requests to do
    something: refunds, cancellation deadlines, attendance rules, what is
    allowed at a venue, eligibility, or anything phrased as "what is the
    policy on...".

    Do not use it to look up actual events, seat counts, or a user's own
    registrations - those live in the database and have their own tools.

    Args:
        question: The user's question, in their own words. Do not rewrite it
            into keywords; the retriever handles natural language.
        policy_area: Optional filter to one document. One of: event_policy,
            registration_policy, cancellation_policy, venue_policy,
            attendance_policy, faq. Leave empty to search everything, which is
            usually better unless the question is clearly about one area.
    """
    db = get_tool_context().db

    doc_type = policy_area.strip().lower() if policy_area else None
    if doc_type and doc_type not in VALID_DOC_TYPES:
        logger.info("Ignoring unknown policy_area %r", policy_area)
        doc_type = None

    try:
        response = pipeline.answer(db, question, doc_type=doc_type)
    except Exception as exc:
        logger.exception("RAG pipeline failed")
        return (
            "The policy knowledge base could not be searched right now. "
            f"({exc.__class__.__name__}) Suggest the user contact an administrator."
        )

    if not response.chunks:
        return (
            "No policy document covers that. Do not guess an answer - tell the "
            "user this is not documented and suggest asking an administrator."
        )

    result = response.answer
    if response.sources:
        result += f"\n\nSources: {', '.join(response.sources)}"


    if not response.grounded:
        result += (
            "\n\n[Note: this answer failed the grounding check. Tell the user "
            "the policy documents do not clearly cover their question.]"
        )

    return result
