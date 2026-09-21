from sqlalchemy.orm import Session
from app.models.venue import Venue
def get_all_venues(db: Session):
    return db.query(Venue).all()


def get_venue_by_id(db: Session, venue_id):
    return (
        db.query(Venue)
        .filter(Venue.venue_id == venue_id)
        .first()
    )
def create_venue(
    db: Session,
    name: str,
    address: str,
    city: str,
    capacity: int,
):
    venue = Venue(
        name=name,
        address=address,
        city=city,
        capacity=capacity,
    )
    db.add(venue)
    db.commit()
    db.refresh(venue)
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
    return venue
def delete_venue(db: Session, venue_id):
    venue = get_venue_by_id(db, venue_id)

    if not venue:
        return None

    db.delete(venue)
    db.commit()

    return venue