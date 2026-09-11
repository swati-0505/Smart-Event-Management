from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.event import Event
from app.schemas.payment import (
    PaymentCreate,
    PaymentStatusUpdate,
    PaymentResponse,
)
from app.services import payment_service


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.get("/", response_model=list[PaymentResponse])
def get_all_payments(
    db: Session = Depends(get_db)
):
    return payment_service.get_all_payments(db)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db)
):
    payment = payment_service.get_payment_by_id(db, payment_id)

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


@router.get("/user/{user_id}", response_model=list[PaymentResponse])
def get_user_payments(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    return payment_service.get_user_payments(db, user_id)


@router.get("/event/{event_id}", response_model=list[PaymentResponse])
def get_event_payments(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    return payment_service.get_event_payments(db, event_id)


@router.post("/", response_model=PaymentResponse, status_code=201)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db)
):
    # Check user
    user = db.query(User).filter(
        User.id == payment_data.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check event
    event = db.query(Event).filter(
        Event.event_id == payment_data.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return payment_service.create_payment(
        db=db,
        user_id=payment_data.user_id,
        event_id=payment_data.event_id,
        amount=payment_data.amount,
        currency=payment_data.currency,
        transaction_id=payment_data.transaction_id,
    )


@router.put(
    "/{payment_id}/status",
    response_model=PaymentResponse
)
def update_payment_status(
    payment_id: UUID,
    status_data: PaymentStatusUpdate,
    db: Session = Depends(get_db)
):
    payment = payment_service.update_payment_status(
        db=db,
        payment_id=payment_id,
        status=status_data.payment_status
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment