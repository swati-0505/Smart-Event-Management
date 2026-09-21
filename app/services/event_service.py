from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.venue import Venue






def get_all_events(db: Session):
    return db.query(Event).all()


def get_event_by_id(db: Session, event_id):
    return (
        db.query(Event)
        .filter(Event.event_id == event_id)
        .first()
    )


def get_published_events(db: Session):
    return (
        db.query(Event)
        .filter(Event.status == "published")
        .order_by(Event.event_date.asc())
        .all()
    )






def search_events_by_category(db: Session, category: str):
    return (
        db.query(Event)
        .filter(
            Event.category.ilike(f"%{category}%"),
            Event.status == "published"
        )
        .order_by(Event.event_date.asc())
        .all()
    )


def search_events_by_title(db: Session, keyword: str):
    return (
        db.query(Event)
        .filter(
            Event.title.ilike(f"%{keyword}%"),
            Event.status == "published"
        )
        .order_by(Event.event_date.asc())
        .all()
    )


def get_upcoming_events(db: Session):
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    return (
        db.query(Event)
        .filter(
            Event.event_date > now,
            Event.status == "published"
        )
        .order_by(Event.event_date.asc())
        .all()
    )


def get_events_with_available_seats(db: Session):
    return (
        db.query(Event)
        .filter(
            Event.status == "published",
            Event.available_seats > 0
        )
        .order_by(Event.event_date.asc())
        .all()
    )


def get_event_with_venue(db: Session, event_id):
    return (
        db.query(Event)
        .join(Venue, Event.venue_id == Venue.venue_id)
        .filter(Event.event_id == event_id)
        .first()
    )


def get_events_by_city(db: Session, city: str):
    return (
        db.query(Event)
        .join(Venue, Event.venue_id == Venue.venue_id)
        .filter(
            Venue.city.ilike(f"%{city}%"),
            Event.status == "published"
        )
        .order_by(Event.event_date.asc())
        .all()
    )






def create_event(
    db: Session,
    title: str,
    description: str,
    category: str,
    venue_id,
    event_date,
    registration_deadline,
    capacity: int,
    created_by
):
    event = Event(
        title=title,
        description=description,
        category=category,
        venue_id=venue_id,
        event_date=event_date,
        registration_deadline=registration_deadline,
        capacity=capacity,
        available_seats=capacity,
        created_by=created_by,
        status="draft",
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def update_event(db: Session, event_id, **updates):
    event = get_event_by_id(db, event_id)

    if not event:
        return None

    for key, value in updates.items():
        if value is not None and hasattr(event, key):
            setattr(event, key, value)

    db.commit()
    db.refresh(event)

    return event


def delete_event(db: Session, event_id):
    event = get_event_by_id(db, event_id)

    if not event:
        return None

    db.delete(event)
    db.commit()

    return event