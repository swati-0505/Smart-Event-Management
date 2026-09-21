from sqlalchemy.orm import Session
from app.models.payment import Payment
def get_all_payments(db: Session):
    return db.query(Payment).all()
def get_payment_by_id(
    db: Session,
    payment_id,
):
    return (
        db.query(Payment)
        .filter(Payment.payment_id == payment_id)
        .first()
    )
def get_user_payments(
    db: Session,
    user_id,
):
    return (
        db.query(Payment)
        .filter(Payment.user_id == user_id)
        .all()
    )
def get_event_payments(
    db: Session,
    event_id,
):
    return (
        db.query(Payment)
        .filter(Payment.event_id == event_id)
        .all()
    )
def create_payment(
    db: Session,
    user_id,
    event_id,
    amount,
    currency: str = "INR",
    transaction_id: str | None = None,
):
    payment = Payment(
        user_id=user_id,
        event_id=event_id,
        amount=amount,
        currency=currency,
        payment_status="pending",
        transaction_id=transaction_id,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment
def update_payment_status(
    db: Session,
    payment_id,
    status: str,
):
    payment = get_payment_by_id(db, payment_id)

    if not payment:
        return None
    payment.payment_status = status
    db.commit()
    db.refresh(payment)
    return payment