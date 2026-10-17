from __future__ import annotations
import logging
from datetime import datetime, time, timedelta, timezone
from typing import Literal
from uuid import UUID
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.time import APP_TIMEZONE, as_utc, now_local
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

def _events_from_cache(cached: list[dict], db: Session) -> list[Event]:
    event_ids = []
    for record in cached:
        try:
            event_ids.append(UUID(record['event_id']))
        except (KeyError, ValueError, TypeError):
            logger.warning('Skipping invalid event record in cache.')
    if not event_ids:
        return []
    events = db.query(Event).filter(Event.event_id.in_(event_ids)).all()
    events_by_id = {event.event_id: event for event in events}
    return [events_by_id[event_id] for event_id in event_ids if event_id in events_by_id]

def get_all_events(db: Session):
    cache_key = 'events:all'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _events_from_cache(cached, db)
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
        return _events_from_cache(cached, db)
    result = db.query(Event).filter(Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_LIST)
    return result

def search_events_by_category(db: Session, category: str):
    safe = category.lower().replace(' ', '_')
    cache_key = f'events:cat:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _events_from_cache(cached, db)
    result = db.query(Event).filter(Event.category.ilike(f'%{category}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def search_events_by_title(db: Session, keyword: str):
    safe = keyword.lower().replace(' ', '_')
    cache_key = f'events:title:{safe}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _events_from_cache(cached, db)
    result = db.query(Event).filter(Event.title.ilike(f'%{keyword}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def get_upcoming_events(db: Session):
    now = as_utc(now_local())
    return db.query(Event).filter(
        func.coalesce(Event.end_time, Event.event_date) > now,
        Event.status == 'published',
    ).order_by(Event.event_date.asc()).all()

def get_events_by_period(db: Session, period: Literal['upcoming', 'completed', 'completed_today', 'today', 'all']):
    query = db.query(Event).filter(Event.status.in_(('published', 'completed')))
    now = as_utc(now_local())
    event_end = func.coalesce(Event.end_time, Event.event_date)
    if period == 'upcoming':
        query = query.filter(event_end > now)
    elif period == 'completed':
        query = query.filter(event_end <= now)
    elif period in ('today', 'completed_today'):
        local_today = now_local().date()
        start = datetime.combine(local_today, time.min, tzinfo=APP_TIMEZONE)
        end = start + timedelta(days=1)
        if period == 'completed_today':
            query = query.filter(
                event_end >= start.astimezone(timezone.utc),
                event_end <= now,
            )
        else:
            query = query.filter(
                Event.event_date < end.astimezone(timezone.utc),
                event_end >= start.astimezone(timezone.utc),
            )
    return query.order_by(Event.event_date.asc()).all()

def get_events_with_available_seats(db: Session):
    cache_key = 'events:available'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _events_from_cache(cached, db)
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
        return _events_from_cache(cached, db)
    result = db.query(Event).join(Venue, Event.venue_id == Venue.venue_id).filter(Venue.city.ilike(f'%{city}%'), Event.status == 'published').order_by(Event.event_date.asc()).all()
    redis_cache.set(cache_key, [_event_to_dict(e) for e in result], ttl=_TTL_SEARCH)
    return result

def create_event(db: Session, title: str, description: str, category: str, venue_id, event_date, registration_deadline, capacity: int, created_by, end_time=None, ticket_price=0.0):
    if end_time is not None:
        if as_utc(end_time) <= as_utc(event_date):
            raise ValueError('end_time must be later than event_date')
    event = Event(title=title, description=description, category=category, venue_id=venue_id, event_date=as_utc(event_date), end_time=as_utc(end_time) if end_time else None, registration_deadline=as_utc(registration_deadline) if registration_deadline else None, capacity=capacity, available_seats=capacity, created_by=created_by, ticket_price=ticket_price, status='draft')
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
        if as_utc(end_time) <= as_utc(start_time):
            raise ValueError('end_time must be later than event_date')
    for key, value in updates.items():
        if key in {'event_date', 'end_time', 'registration_deadline'} and value is not None:
            value = as_utc(value)
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