from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.registration import Registration
from app.services import registration_service

def get_all_payments(db: Session):
    return db.query(Payment).all()

def get_payment_by_id(db: Session, payment_id):
    return db.query(Payment).filter(Payment.payment_id == payment_id).first()

def get_user_payments(db: Session, user_id):
    return db.query(Payment).filter(Payment.user_id == user_id).all()

def get_event_payments(db: Session, event_id):
    return db.query(Payment).filter(Payment.event_id == event_id).all()

def create_payment(db: Session, user_id, event_id, amount, currency: str='INR', transaction_id: str | None=None):
    payment = Payment(user_id=user_id, event_id=event_id, amount=amount, currency=currency, payment_status='pending', transaction_id=transaction_id)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def update_payment_status(db: Session, payment_id, status: str):
    payment = get_payment_by_id(db, payment_id)
    if not payment:
        return None
    try:
        if status == 'completed' and payment.payment_status != 'completed':
            registration = db.query(Registration).filter(
                Registration.user_id == payment.user_id,
                Registration.event_id == payment.event_id,
            ).first()
            if not registration or (registration.status or '').lower() == 'cancelled':
                registration_service.create_registration(
                    db=db,
                    user_id=payment.user_id,
                    event_id=payment.event_id,
                    commit=False,
                )
        payment.payment_status = status
        db.commit()
        db.refresh(payment)
        return payment
    except Exception:
        db.rollback()
        raise