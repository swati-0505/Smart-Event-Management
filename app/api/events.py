from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.services import event_service
from app.schemas.event import EventCreate, EventResponse
router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)

@router.get("/")
def get_events(db: Session = Depends(get_db)):
    return event_service.get_all_events(db)

@router.get("/published")
def get_published_events(db: Session = Depends(get_db)):
    return event_service.get_published_events(db)

@router.get("/{event_id}")
def get_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    event = event_service.get_event_by_id(db, event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    return event

@router.post("/", response_model=EventResponse)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db)
):
    return event_service.create_event(
        db=db,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        venue_id=event_data.venue_id,
        event_date=event_data.event_date,
        registration_deadline=event_data.registration_deadline,
        capacity=event_data.capacity,
        created_by=event_data.created_by,
    )