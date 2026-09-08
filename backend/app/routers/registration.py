from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.schemas.registration import (
    RegistrationCreate,
    RegistrationResponse
)


router = APIRouter(
    prefix="/registrations",
    tags=["Registrations"]
)


@router.post(
    "/",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED
)
def register_for_event(
    registration_data: RegistrationCreate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == registration_data.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    event = db.query(Event).filter(
        Event.id == registration_data.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    if event.available_seats <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No seats available"
        )

    existing_registration = db.query(Registration).filter(
        Registration.user_id == registration_data.user_id,
        Registration.event_id == registration_data.event_id
    ).first()

    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already registered for this event"
        )

    registration = Registration(
    event_id=registration_data.event_id,
    user_id=registration_data.user_id,
    status="REGISTERED"
)

    event.available_seats -= 1

    db.add(registration)
    db.commit()
    db.refresh(registration)

    return registration


@router.get(
    "/",
    response_model=list[RegistrationResponse]
)
def get_registrations(
    db: Session = Depends(get_db)
):
    return db.query(Registration).all()


@router.get(
    "/user/{user_id}",
    response_model=list[RegistrationResponse]
)
def get_user_registrations(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    return db.query(Registration).filter(
        Registration.user_id == user_id
    ).all()


@router.get(
    "/event/{event_id}",
    response_model=list[RegistrationResponse]
)
def get_event_registrations(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    return db.query(Registration).filter(
        Registration.event_id == event_id
    ).all()


@router.delete(
    "/{registration_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def cancel_registration(
    registration_id: UUID,
    db: Session = Depends(get_db)
):
    registration = db.query(Registration).filter(
        Registration.id == registration_id
    ).first()

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    event = db.query(Event).filter(
        Event.id == registration.event_id
    ).first()

    if event:
        event.available_seats += 1

    db.delete(registration)
    db.commit()

    return None