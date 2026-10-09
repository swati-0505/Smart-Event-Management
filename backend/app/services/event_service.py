from __future__ import annotations
import logging
from datetime import timezone
from sqlalchemy.orm import Session
from app.core.redis_cache import redis_cache
from app.models.event import Event
from app.models.venue import Venue
logger = logging.getLogger('app.services.event_service')
_TTL_LIST = 300
_TTL_ITEM = 300
_TTL_SEARCH = 120

def _event_to_dict(e: Event) -> dict:
    return {'event_id': str(e.event_id), 'title': e.title, 'description': e.description, 'category': e.category, 'venue_id': str(e.venue_id), 'event_date': e.event_date.isoformat() if e.event_date else None, 'end_time': e.end_time.isoformat() if e.end_time else None, 'registration_deadline': e.registration_deadline.isoformat() if e.registration_deadline else None, 'capacity': e.capacity, 'available_seats': e.available_seats, 'created_by': str(e.created_by), 'status': e.status, 'ticket_price': float(e.ticket_price) if e.ticket_price is not None else 0.0, 'created_at': e.created_at.isoformat() if e.created_at else None}

def _invalidate_events():
    redis_cache.delete_pattern('events:*')

def get_all_events(db: Session):
    cache_key = 'events:all'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
    result = db.query(Event).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_LIST)
    return result

def get_event_by_id(db: Session, event_id):
    cache_key = f'events:id:{event_id}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _dict_to_event_orm(cached, db)
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if event:
        redis_cache.set(cache_key, _event_to_dict(event), ttl=_TTL_ITEM)
    return event

def get_published_events(db: Session):
    cache_key = 'events:published'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
    result = db.query(Event).filter(Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_LIST)
    return result

def search_events_by_category(db: Session, category: str):
    safe = category.lower().replace(' ', '_')
    cache_key = f'events:cat:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
    result = db.query(Event).filter(Event.category.ilike(f'%{category}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def search_events_by_title(db: Session, keyword: str):
    safe = keyword.lower().replace(' ', '_')
    cache_key = f'events:title:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
    result = db.query(Event).filter(Event.title.ilike(f'%{keyword}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_upcoming_events(db: Session):
    from datetime import datetime
    cache_key = 'events:upcoming'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
    now = datetime.now(timezone.utc)
    result = db.query(Event).filter(Event.event_date > now, Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_events_with_available_seats(db: Session):
    cache_key = 'events:available'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return cached
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
        return cached
    result = db.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(Venue.city.ilike(f'%{city}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def create_event(db: Session, title: str, description: str, category: str, venue_id, event_date, registration_deadline, capacity: int, created_by, end_time=None, ticket_price=0.0):
    if end_time is not None:
        start_utc = event_date.replace(tzinfo=timezone.utc) if event_date.tzinfo is None else event_date.astimezone(timezone.utc)
        end_utc = end_time.replace(tzinfo=timezone.utc) if end_time.tzinfo is None else end_time.astimezone(timezone.utc)
        if end_utc <= start_utc:
            raise ValueError('end_time must be later than event_date')
    event = Event(title=title, description=description, category=category, venue_id=venue_id, event_date=event_date, end_time=end_time, registration_deadline=registration_deadline, capacity=capacity, available_seats=capacity, created_by=created_by, ticket_price=ticket_price, status='draft')
    db.add(event)
    db.commit()
    db.refresh(event)
    _invalidate_events()
    logger.debug('Cache invalidated after create_event: %s', event.event_id)
    return event

def update_event(db: Session, event_id, **updates):
    event = get_event_by_id(db, event_id)
    if not event:
        return None
    start_time = updates.get('event_date', event.event_date)
    end_time = updates.get('end_time', event.end_time)
    if end_time is not None:
        start_utc = start_time.replace(tzinfo=timezone.utc) if start_time.tzinfo is None else start_time.astimezone(timezone.utc)
        end_utc = end_time.replace(tzinfo=timezone.utc) if end_time.tzinfo is None else end_time.astimezone(timezone.utc)
        if end_utc <= start_utc:
            raise ValueError('end_time must be later than event_date')
    for key, value in updates.items():
        if key == 'end_time' and hasattr(event, key):
            event.end_time = value
        elif value is not None and hasattr(event, key):
            setattr(event, key, value)
    db.commit()
    db.refresh(event)
    _invalidate_events()
    logger.debug('Cache invalidated after update_event: %s', event_id)
    return event

def delete_event(db: Session, event_id):
    event = get_event_by_id(db, event_id)
    if not event:
        return None
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