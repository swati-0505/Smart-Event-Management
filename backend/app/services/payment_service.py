from sqlalchemy.orm import Session
from app.core.permissions import require_admin_actor, require_owner_or_admin_actor
from app.models.payment import Payment

def get_all_payments(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Payment).all()

def get_payment_by_id(db: Session, payment_id, *, actor_id):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if payment:
        require_owner_or_admin_actor(db, actor_id, payment.user_id)
    return payment

def get_user_payments(db: Session, user_id, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Payment).filter(Payment.user_id == user_id).all()

def get_event_payments(db: Session, event_id, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Payment).filter(Payment.event_id == event_id).all()

def create_payment(db: Session, user_id, event_id, amount, currency: str='INR', transaction_id: str | None=None, *, actor_id):
    require_owner_or_admin_actor(db, actor_id, user_id)
    payment = Payment(user_id=user_id, event_id=event_id, amount=amount, currency=currency, payment_status='pending', transaction_id=transaction_id)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def update_payment_status(db: Session, payment_id, status: str, *, actor_id):
    require_admin_actor(db, actor_id)
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        return None
    payment.payment_status = status
    db.commit()
    db.refresh(payment)
    return payment