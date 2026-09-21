from sqlalchemy.orm import Session
from app.models.feedback import Feedback
def get_all_feedback(db: Session):
    return db.query(Feedback).all()
def get_feedback_by_event(
    db: Session,
    event_id,
):
    return (
        db.query(Feedback)
        .filter(Feedback.event_id == event_id)
        .all()
    )
def get_feedback_by_user(
    db: Session,
    user_id,
):
    return (
        db.query(Feedback)
        .filter(Feedback.user_id == user_id)
        .all()
    )
def create_feedback(
    db: Session,
    user_id,
    event_id,
    rating: int,
    comment: str | None = None,
):
    feedback = Feedback(
        user_id=user_id,
        event_id=event_id,
        rating=rating,
        comment=comment,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback