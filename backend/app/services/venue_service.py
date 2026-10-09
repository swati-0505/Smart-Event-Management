from __future__ import annotations
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.redis_cache import redis_cache
from app.models.venue import Venue
logger = logging.getLogger('app.services.venue_service')
_TTL_VENUE = 600

def _venue_to_dict(v: Venue) -> dict:
    return {'venue_id': str(v.venue_id), 'name': v.name, 'address': v.address, 'city': v.city, 'capacity': v.capacity}

def _invalidate_venues():
    redis_cache.delete_pattern('venues:*')

def get_all_venues(db: Session):
    cache_key = 'venues:all'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_venues(db, [c['venue_id'] for c in cached])
    result = db.query(Venue).all()
    redis_cache.set(cache_key, [_venue_to_dict(v) for v in result], ttl=_TTL_VENUE)
    return result

def get_venue_by_id(db: Session, venue_id):
    cache_key = f'venues:id:{venue_id}'
    cached = redis_cache.get(cache_key)
    if cached is not None:
        return _reload_venue(db, cached['venue_id'])
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if venue:
        redis_cache.set(cache_key, _venue_to_dict(venue), ttl=_TTL_VENUE)
    return venue

def create_venue(db: Session, name: str, address: str, city: str, capacity: int):
    venue = Venue(name=name, address=address, city=city, capacity=capacity)
    db.add(venue)
    db.commit()
    db.refresh(venue)
    _invalidate_venues()
    return venue

def update_venue(db: Session, venue_id, **updates):
    venue = get_venue_by_id(db, venue_id)
    if not venue:
        return None
    for key, value in updates.items():
        if value is not None and hasattr(venue, key):
            setattr(venue, key, value)
    db.commit()
    db.refresh(venue)
    _invalidate_venues()
    return venue

def delete_venue(db: Session, venue_id):
    venue = get_venue_by_id(db, venue_id)
    if not venue:
        return None
    db.delete(venue)
    db.commit()
    _invalidate_venues()
    return venue

def _reload_venue(db: Session, venue_id_str: str) -> Venue | None:
    try:
        vid = UUID(venue_id_str)
    except (ValueError, AttributeError):
        return None
    return db.query(Venue).filter(Venue.venue_id == vid).first()

def _reload_venues(db: Session, id_list: list) -> list:
    if not id_list:
        return []
    try:
        uuids = [UUID(i) for i in id_list]
    except (ValueError, TypeError):
        return db.query(Venue).all()
    return db.query(Venue).filter(Venue.venue_id.in_(uuids)).all()