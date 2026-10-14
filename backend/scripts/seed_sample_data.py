from __future__ import annotations

import hashlib
import logging
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, UUID, uuid5

from sqlalchemy import func
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.agent import AgentRun, AgentSession, ChatMessage, ToolCall
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.knowledge import KnowledgeChunk, KnowledgeChunkNvidia, KnowledgeDocument
from app.models.payment import Payment
from app.models.registration import Registration
from app.models.user import User
from app.models.venue import Venue

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("sample_data")


def _get_or_create(
    db: Session,
    model: type,
    lookup: dict,
    values: dict,
    id_field: str,
    seed_key: str,
):
    record = db.query(model).filter_by(**lookup).one_or_none()
    if record is not None:
        return record, False

    record_id: UUID = uuid5(NAMESPACE_URL, f"smart-event-management.sample.{seed_key}")
    if db.get(model, record_id) is not None:
        raise RuntimeError(f"Sample-data ID collision for {model.__tablename__}")

    record = model(**{id_field: record_id, **values})
    db.add(record)
    db.flush()
    return record, True


def _record(
    db: Session,
    counts: dict[str, list[int]],
    model: type,
    lookup: dict,
    values: dict,
    id_field: str,
    seed_key: str,
):
    record, created = _get_or_create(db, model, lookup, values, id_field, seed_key)
    totals = counts.setdefault(model.__tablename__, [0, 0])
    totals[0 if created else 1] += 1
    return record


def seed(db: Session) -> dict[str, list[int]]:
    counts: dict[str, list[int]] = {}

    organizer = _record(
        db,
        counts,
        User,
        {"email": "sample.organizer@smart-event-management.example"},
        {
            "name": "Jordan Lee",
            "email": "sample.organizer@smart-event-management.example",
            "password_hash": hash_password(secrets.token_urlsafe(32)),
            "role": "ADMIN",
        },
        "id",
        "organizer",
    )
    attendee = _record(
        db,
        counts,
        User,
        {"email": "sample.attendee@smart-event-management.example"},
        {
            "name": "Morgan Patel",
            "email": "sample.attendee@smart-event-management.example",
            "password_hash": hash_password(secrets.token_urlsafe(32)),
            "role": "USER",
        },
        "id",
        "attendee",
    )

    venue = _record(
        db,
        counts,
        Venue,
        {
            "name": "Meridian Convention Centre",
            "address": "120 Market Street",
            "city": "Bengaluru",
        },
        {
            "name": "Meridian Convention Centre",
            "address": "120 Market Street",
            "city": "Bengaluru",
            "capacity": 500,
        },
        "venue_id",
        "venue-meridian",
    )
    second_venue = _record(
        db,
        counts,
        Venue,
        {
            "name": "Riverside Innovation Hub",
            "address": "42 River Road",
            "city": "Pune",
        },
        {
            "name": "Riverside Innovation Hub",
            "address": "42 River Road",
            "city": "Pune",
            "capacity": 180,
        },
        "venue_id",
        "venue-riverside",
    )

    event_date = datetime(2027, 4, 17, 9, 0, tzinfo=timezone.utc)
    event_end = datetime(2027, 4, 17, 17, 0, tzinfo=timezone.utc)
    event_deadline = datetime(2027, 4, 10, 23, 59, tzinfo=timezone.utc)
    event = _record(
        db,
        counts,
        Event,
        {"title": "Smart Cities and Sustainability Forum", "created_by": organizer.id},
        {
            "title": "Smart Cities and Sustainability Forum",
            "description": "A one-day forum on practical urban sustainability and civic technology.",
            "category": "Technology",
            "venue_id": venue.venue_id,
            "event_date": event_date,
            "end_time": event_end,
            "registration_deadline": event_deadline,
            "capacity": 240,
            "available_seats": 239,
            "created_by": organizer.id,
            "status": "published",
            "ticket_price": 1499.00,
        },
        "event_id",
        "event-smart-cities",
    )
    completed_event_date = datetime(2025, 9, 20, 10, 0, tzinfo=timezone.utc)
    completed_event = _record(
        db,
        counts,
        Event,
        {"title": "Community Data and Design Workshop", "created_by": organizer.id},
        {
            "title": "Community Data and Design Workshop",
            "description": "A completed hands-on workshop about inclusive, data-informed service design.",
            "category": "Workshop",
            "venue_id": second_venue.venue_id,
            "event_date": completed_event_date,
            "end_time": datetime(2025, 9, 20, 15, 0, tzinfo=timezone.utc),
            "registration_deadline": datetime(2025, 9, 18, 23, 59, tzinfo=timezone.utc),
            "capacity": 80,
            "available_seats": 79,
            "created_by": organizer.id,
            "status": "completed",
            "ticket_price": 750.00,
        },
        "event_id",
        "event-community-workshop",
    )

    _record(
        db,
        counts,
        Registration,
        {"user_id": attendee.id, "event_id": event.event_id},
        {"user_id": attendee.id, "event_id": event.event_id, "status": "confirmed"},
        "registration_id",
        "registration-forum-attendee",
    )
    _record(
        db,
        counts,
        Registration,
        {"user_id": attendee.id, "event_id": completed_event.event_id},
        {"user_id": attendee.id, "event_id": completed_event.event_id, "status": "confirmed"},
        "registration_id",
        "registration-workshop-attendee",
    )
    _record(
        db,
        counts,
        Payment,
        {"transaction_id": "SAMPLE-FORUM-MORGAN-001"},
        {
            "user_id": attendee.id,
            "event_id": event.event_id,
            "amount": 1499.00,
            "currency": "INR",
            "payment_status": "completed",
            "transaction_id": "SAMPLE-FORUM-MORGAN-001",
        },
        "payment_id",
        "payment-forum-attendee",
    )
    _record(
        db,
        counts,
        Feedback,
        {"user_id": attendee.id, "event_id": completed_event.event_id},
        {
            "user_id": attendee.id,
            "event_id": completed_event.event_id,
            "rating": 5,
            "comment": "Well organized and full of practical examples.",
        },
        "feedback_id",
        "feedback-workshop-attendee",
    )

    agent_session = _record(
        db,
        counts,
        AgentSession,
        {"user_id": attendee.id, "title": "Planning an event visit"},
        {"user_id": attendee.id, "title": "Planning an event visit"},
        "session_id",
        "agent-session-event-visit",
    )
    user_message = "What should I know before attending the sustainability forum?"
    assistant_message = (
        "The forum is scheduled for April 17, 2027, at Meridian Convention Centre "
        "in Bengaluru. Your registration is confirmed."
    )
    for role, content, key in (
        ("user", user_message, "chat-user-event-visit"),
        ("assistant", assistant_message, "chat-assistant-event-visit"),
    ):
        _record(
            db,
            counts,
            ChatMessage,
            {"session_id": agent_session.session_id, "role": role, "content": content},
            {"session_id": agent_session.session_id, "role": role, "content": content},
            "message_id",
            key,
        )

    run = _record(
        db,
        counts,
        AgentRun,
        {"session_id": agent_session.session_id, "user_request": user_message},
        {
            "session_id": agent_session.session_id,
            "user_id": attendee.id,
            "user_request": user_message,
            "detected_intent": "event_information",
            "final_response": assistant_message,
            "tool_loop_count": 1,
            "grounded": True,
            "retry_count": 0,
            "latency_ms": 842.5,
            "status": "success",
        },
        "run_id",
        "agent-run-event-visit",
    )
    _record(
        db,
        counts,
        ToolCall,
        {"run_id": run.run_id, "sequence": 0},
        {
            "run_id": run.run_id,
            "tool_name": "get_event_details",
            "tool_input": {"event_title": event.title},
            "tool_output": "Event details found: published, Bengaluru, April 17, 2027.",
            "latency_ms": 126.0,
            "status": "success",
            "sequence": 0,
        },
        "tool_call_id",
        "tool-call-event-details",
    )

    document_text = (
        "The Smart Cities and Sustainability Forum brings together local planners, "
        "technology teams, and community organizers to share practical approaches "
        "to resilient transport, accessible public spaces, and responsible use of "
        "civic data. Attendees can join talks, case-study sessions, and a facilitated "
        "workshop at Meridian Convention Centre in Bengaluru."
    )
    filename = "sample-smart-cities-forum-guide.md"
    content_hash = hashlib.sha256(document_text.encode("utf-8")).hexdigest()
    document = _record(
        db,
        counts,
        KnowledgeDocument,
        {"filename": filename},
        {
            "filename": filename,
            "title": "Smart Cities Forum Attendee Guide",
            "doc_type": "event_guide",
            "content_hash": content_hash,
            "chunk_count": 1,
        },
        "document_id",
        "knowledge-document-forum-guide",
    )
    chunk_values = {
        "document_id": document.document_id,
        "doc_type": "event_guide",
        "source_filename": filename,
        "chunk_index": 0,
        "content": document_text,
        "search_vec": func.to_tsvector("english", document_text),
        "doc_metadata": {"title": "Smart Cities Forum Attendee Guide", "language": "en"},
    }
    _record(
        db,
        counts,
        KnowledgeChunk,
        {"document_id": document.document_id, "chunk_index": 0},
        chunk_values,
        "chunk_id",
        "knowledge-chunk-forum-guide",
    )
    _record(
        db,
        counts,
        KnowledgeChunkNvidia,
        {"document_id": document.document_id, "chunk_index": 0},
        {
            **chunk_values,
            "content_hash": content_hash,
            "primary_model": "nvidia/nv-embedqa-e5-v5",
            "fallback_model": None,
        },
        "chunk_id",
        "knowledge-nvidia-chunk-forum-guide",
    )

    return counts


def main() -> int:
    with SessionLocal.begin() as db:
        counts = seed(db)

    logger.info("Sample data committed successfully.")
    for table_name in sorted(counts):
        created, reused = counts[table_name]
        logger.info("%s: %d inserted, %d existing record(s) reused", table_name, created, reused)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
