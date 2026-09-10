from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from datetime import datetime, timezone
from app.models.user import User

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


@router.post(
    "/",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED
)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db)
):
    # Check that the organizer exists
    organizer = db.query(User).filter(
        User.id == event_data.organizer_id
    ).first()

    if not organizer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizer not found"
        )

    # Check event date
    if event_data.event_date <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date must be in the future"
        )

    # Check registration deadline
    if (
        event_data.registration_deadline is not None
        and event_data.registration_deadline >= event_data.event_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline must be before event date"
        )

    event = Event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        event_date=event_data.event_date,
        registration_deadline=event_data.registration_deadline,
        capacity=event_data.capacity,
        available_seats=event_data.capacity,
        organizer_id=event_data.organizer_id,
        status="UPCOMING"
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

@router.get(
    "/",
    response_model=list[EventResponse]
)
def get_events(
    db: Session = Depends(get_db)
):
    return db.query(Event).all()


@router.get(
    "/{event_id}",
    response_model=EventResponse
)
def get_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return event


@router.put(
    "/{event_id}",
    response_model=EventResponse
)
def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    update_data = event_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(event, field, value)

    if "capacity" in update_data:
        registered_count = event.capacity - event.available_seats

        if event.capacity < registered_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Capacity cannot be lower than current registrations"
            )

        event.available_seats = (
            event.capacity - registered_count
        )

    db.commit()
    db.refresh(event)

    return event


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(
        Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    db.delete(event)
    db.commit()

    return None