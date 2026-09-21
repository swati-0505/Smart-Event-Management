from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import require_admin
from app.models.event import Event
from app.models.user import User
from app.models.venue import Venue
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services import event_service
router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


@router.get("/", response_model=list[EventResponse])
def get_events(
    db: Session = Depends(get_db)
):
    return event_service.get_all_events(db)


@router.get("/published", response_model=list[EventResponse])
def get_published_events(
    db: Session = Depends(get_db)
):
    return event_service.get_published_events(db)


@router.get("/{event_id}", response_model=EventResponse)
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


@router.post("/", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):

    venue = db.query(Venue).filter(
        Venue.venue_id == event_data.venue_id
    ).first()

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return event_service.create_event(
        db=db,
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        venue_id=event_data.venue_id,
        event_date=event_data.event_date,
        registration_deadline=event_data.registration_deadline,
        capacity=event_data.capacity,
        created_by=current_user.id,
    )

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: Session = Depends(get_db)
):
    event = event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event_data.venue_id is not None:

        venue = db.query(Venue).filter(
            Venue.venue_id == event_data.venue_id
        ).first()

        if not venue:
            raise HTTPException(
                status_code=404,
                detail="Venue not found"
            )

    updates = event_data.model_dump(
        exclude_unset=True
    )
    updated_event = event_service.update_event(
        db,
        event_id,
        **updates
    )

    return updated_event

@router.delete("/{event_id}")
def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    event = event_service.delete_event(
        db,
        event_id
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return {
        "message": "Event deleted successfully",
        "event_id": str(event_id)
    }