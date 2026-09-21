from sqlalchemy.orm import Session

from app.models.registration import Registration
from app.models.event import Event
def get_all_registrations(db: Session):
    return db.query(Registration).all()
def get_registration_by_id(db: Session, registration_id):
    return (
        db.query(Registration)
        .filter(
            Registration.registration_id == registration_id
        )
        .first()
    )
def get_user_registrations(db: Session, user_id):
    return (
        db.query(Registration)
        .filter(Registration.user_id == user_id)
        .all()
    )
def get_event_registrations(db: Session, event_id):
    return (
        db.query(Registration)
        .filter(Registration.event_id == event_id)
        .all()
    )
def create_registration(
    db: Session,
    user_id,
    event_id,
):

    event = (
        db.query(Event)
        .filter(Event.event_id == event_id)
        .first()
    )
    if not event:
        raise ValueError("Event not found")


    existing = (
        db.query(Registration)
        .filter(
            Registration.user_id == user_id,
            Registration.event_id == event_id,
        )
        .first()
    )
    if existing:
        raise ValueError(
            "User is already registered for this event"
        )

    if event.available_seats <= 0:
        raise ValueError("No seats available")

    registration = Registration(
        user_id=user_id,
        event_id=event_id,
        status="confirmed",
    )

    event.available_seats -= 1

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return registration


def cancel_registration(
    db: Session,
    registration_id,
):
    registration = get_registration_by_id(
        db,
        registration_id
    )

    if not registration:
        return None

    event = (
        db.query(Event)
        .filter(Event.event_id == registration.event_id)
        .first()
    )

    if event:
        event.available_seats += 1

    registration.status = "cancelled"

    db.commit()
    db.refresh(registration)

    return registration