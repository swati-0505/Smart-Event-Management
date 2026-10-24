from sqlalchemy.orm import Session
from app.core.permissions import (
    require_admin_actor,
    require_participant_actor,
    require_registration_read_access,
)
from app.models.registration import Registration
from app.models.event import Event

def get_all_registrations(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Registration).all()

def get_registration_by_id(db: Session, registration_id, *, actor_id):
    registration = db.query(Registration).filter(Registration.registration_id == registration_id).first()
    if registration:
        require_registration_read_access(db, actor_id, registration.user_id)
    return registration

def get_user_registrations(db: Session, user_id, *, actor_id):
    require_registration_read_access(db, actor_id, user_id)
    return db.query(Registration).filter(Registration.user_id == user_id).all()

def get_event_registrations(db: Session, event_id, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Registration).filter(Registration.event_id == event_id).all()

def create_registration(db: Session, user_id, event_id, *, actor_id):
    require_participant_actor(db, actor_id, user_id)
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise ValueError('Event not found')
    if event.status != 'published':
        raise ValueError('This event is not open for registration.')
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    event_dt = event.event_date
    if event_dt:
        if event_dt.tzinfo is None:
            event_dt = event_dt.replace(tzinfo=timezone.utc)
        else:
            event_dt = event_dt.astimezone(timezone.utc)
        if event_dt < now:
            formatted_date = event.event_date.strftime('%d %B %Y')
            raise ValueError(f"This event ('{event.title}') has already been completed on {formatted_date}, so registration is closed.")
    existing = db.query(Registration).filter(Registration.user_id == user_id, Registration.event_id == event_id).first()
    if existing:
        if existing.status and existing.status.lower() != 'cancelled':
            raise ValueError('User is already registered for this event')
        if event.available_seats <= 0:
            raise ValueError('No seats available')
        existing.status = 'confirmed'
        event.available_seats -= 1
        db.commit()
        db.refresh(existing)
        return existing
    if event.available_seats <= 0:
        raise ValueError('No seats available')
    registration = Registration(user_id=user_id, event_id=event_id, status='confirmed')
    event.available_seats -= 1
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration

def cancel_registration(db: Session, registration_id, *, actor_id):
    registration = db.query(Registration).filter(Registration.registration_id == registration_id).first()
    if not registration:
        return None
    require_participant_actor(db, actor_id, registration.user_id)
    event = db.query(Event).filter(Event.event_id == registration.event_id).first()
    if event:
        event.available_seats += 1
    registration.status = 'cancelled'
    db.commit()
    db.refresh(registration)
    return registration