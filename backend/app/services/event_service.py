from __future__ import annotations
import logging
from datetime import timezone
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.redis_cache import redis_cache
from app.core.event_status import is_event_completed
from app.core.permissions import AuthorizationError, require_admin_actor
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.payment import Payment
from app.models.registration import Registration
from app.models.venue import Venue
logger = logging.getLogger('app.services.event_service')
_TTL_LIST = 300
_TTL_ITEM = 300
_TTL_SEARCH = 120

class EventDeletionConflict(Exception):
    """Raised when an event has records that must be preserved."""


def _event_to_dict(e: Event) -> dict:
    return {'event_id': str(e.event_id), 
            'title': e.title, 
            'description': e.description, 
            'category': e.category, 
            'venue_id': str(e.venue_id) if e.venue_id else None,
            'address': e.address,
            'event_date': e.event_date.isoformat() 
            if e.event_date else None, 'end_time': e.end_time.isoformat() if e.end_time else None, 'registration_deadline': e.registration_deadline.isoformat() if e.registration_deadline else None, 'capacity': e.capacity, 'available_seats': e.available_seats, 'created_by': str(e.created_by), 'status': e.status, 'ticket_price': float(e.ticket_price) if e.ticket_price is not None else 0.0, 'created_at': e.created_at.isoformat() if e.created_at else None}

def _invalidate_events():
    redis_cache.delete_pattern('events:*')

def get_all_events(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    cache_key = 'events:all'
    cached = redis_cache.get(cache_key)
    
    if cached is not None:
        return _reload_events(db, cached)
    
    result = db.query(Event).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_LIST)
    return result

def get_event_by_id(db: Session, event_id, *, actor_id=None):
    cache_key = f'events:id:{event_id}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        event = _dict_to_event_orm(cached, db)
        if event and event.status != 'published':
            if not actor_id:
                return None
            try:
                require_admin_actor(db, actor_id)
            except AuthorizationError:
                return None
        return event
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if event:
        if event.status != 'published':
            if not actor_id:
                return None
            try:
                require_admin_actor(db, actor_id)
            except AuthorizationError:
                return None
        redis_cache.set(cache_key, _event_to_dict(event), ttl=_TTL_ITEM)
    return event

def get_published_events(db: Session):
    cache_key = 'events:published:v2'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    
    result = [
        event
        for event in db.query(Event).filter(Event.status == 'published').order_by(Event.event_date.asc()).all()
        if not is_event_completed(event.event_date, event.end_time)
    ]
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_LIST)
    return result

def get_completed_events(db: Session):
    cache_key = 'events:completed:v1'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)

    result = [
        event
        for event in db.query(Event).filter(Event.status == 'published').order_by(Event.event_date.desc()).all()
        if is_event_completed(event.event_date, event.end_time)
    ]
    redis_cache.set(cache_key, [_event_to_dict(event) for event in result], ttl=_TTL_LIST)
    return result

def search_events_by_category(db: Session, category: str):
    safe = category.lower().replace(' ', '_')
    cache_key = f'events:cat:v2:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    result = [
        event
        for event in db.query(Event).filter(Event.category.ilike(f'%{category}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
        if not is_event_completed(event.event_date, event.end_time)
    ]
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def search_events_by_title(db: Session, keyword: str):
    safe = keyword.lower().replace(' ', '_')
    cache_key = f'events:title:v2:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    result = [
        event
        for event in db.query(Event).filter(Event.title.ilike(f'%{keyword}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
        if not is_event_completed(event.event_date, event.end_time)
    ]
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_upcoming_events(db: Session):
    from datetime import datetime
    cache_key = 'events:upcoming'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    now = datetime.now(timezone.utc)
    result = db.query(Event).filter(Event.event_date > now, Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_events_with_available_seats(db: Session):
    cache_key = 'events:available'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    result = db.query(Event).filter(Event.status == 'published', Event.available_seats > 0).order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_event_with_venue(db: Session, event_id):
    return db.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(Event.event_id == event_id).first()

def get_events_by_city(db: Session, city: str):
    safe = city.lower().replace(' ', '_')
    cache_key = f'events:city:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_events(db, cached)
    result = db.query(Event).outerjoin(Venue, Event.venue_id == Venue.venue_id).filter(or_(Venue.city.ilike(f'%{city}%'), Event.address.ilike(f'%{city}%')), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def create_event(db: Session, title: str, description: str, category: str, venue_id, event_date, registration_deadline, capacity: int, actor_id, end_time=None, ticket_price=0.0, address=None):
    actor = require_admin_actor(db, actor_id)
    if end_time is not None:
        start_utc = event_date.replace(tzinfo=timezone.utc) if event_date.tzinfo is None else event_date.astimezone(timezone.utc)
        end_utc = end_time.replace(tzinfo=timezone.utc) if end_time.tzinfo is None else end_time.astimezone(timezone.utc)
        if end_utc <= start_utc:
            raise ValueError('end_time must be later than event_date')
    event = Event(title=title, description=description, category=category, venue_id=venue_id, address=address, event_date=event_date, end_time=end_time, registration_deadline=registration_deadline, capacity=capacity, available_seats=capacity, created_by=actor.id, ticket_price=ticket_price, status='draft')
    db.add(event)
    db.commit()
    db.refresh(event)
    _invalidate_events()
    logger.debug('Cache invalidated after create_event: %s', event.event_id)
    return event

def update_event(db: Session, event_id, *, actor_id, **updates):
    require_admin_actor(db, actor_id)
    event = get_event_by_id(db, event_id, actor_id=actor_id)
    if not event:
        return None
    start_time = updates.get('event_date', event.event_date)
    end_time = updates.get('end_time', event.end_time)
    if end_time is not None:
        start_utc = start_time.replace(tzinfo=timezone.utc) if start_time.tzinfo is None else start_time.astimezone(timezone.utc)
        end_utc = end_time.replace(tzinfo=timezone.utc) if end_time.tzinfo is None else end_time.astimezone(timezone.utc)
        if end_utc <= start_utc:
            raise ValueError('end_time must be later than event_date')
    if 'venue_id' in updates or 'address' in updates:
        if 'venue_id' in updates:
            event.venue_id = updates['venue_id']
            if updates['venue_id'] is not None:
                event.address = None
        if 'address' in updates:
            address = updates['address']
            event.address = address.strip() if address else None
            if event.address:
                event.venue_id = None
        if event.venue_id is None and not event.address:
            raise ValueError('An event must have a venue or custom address')

    for key, value in updates.items():
        if key in {'venue_id', 'address'}:
            continue
        if key == 'end_time' and hasattr(event, key):
            event.end_time = value
        elif value is not None and hasattr(event, key):
            setattr(event, key, value)
    db.commit()
    db.refresh(event)
    _invalidate_events()
    logger.debug('Cache invalidated after update_event: %s', event_id)
    return event

def delete_event(db: Session, event_id, *, actor_id):
    require_admin_actor(db, actor_id)
    event = get_event_by_id(db, event_id, actor_id=actor_id)
    if not event:
        return None
    references = (
        ('registration(s)', db.query(Registration).filter(Registration.event_id == event_id).count()),
        ('payment(s)', db.query(Payment).filter(Payment.event_id == event_id).count()),
        ('feedback record(s)', db.query(Feedback).filter(Feedback.event_id == event_id).count()),
    )
    existing_references = [
        f'{count} {label}' for label, count in references if count
    ]
    if existing_references:
        raise EventDeletionConflict(
            f"Cannot permanently delete '{event.title}': it is referenced by "
            f"{', '.join(existing_references)}. Cancel the event instead to "
            'preserve its history.'
        )
    db.delete(event)
    db.commit()
    _invalidate_events()
    logger.debug('Cache invalidated after delete_event: %s', event_id)
    return event

def _dict_to_event_orm(data: dict, db: Session) -> Event | None:
    from uuid import UUID
    try:
        eid = UUID(data['event_id'])
    except (KeyError, ValueError):
        return None
    return db.query(Event).filter(Event.event_id == eid).first()

def _reload_events(db: Session, cached: list[dict]) -> list[Event]:
    events = []
    for item in cached:
        event = _dict_to_event_orm(item, db)
        if event is not None:
            events.append(event)
    return events