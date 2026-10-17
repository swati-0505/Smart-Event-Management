from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session
from app.core.time import as_utc
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.registration import Registration

class FeedbackSubmissionError(Exception):
    def __init__(self, status_code: int, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail

def get_all_feedback(db: Session):
    return db.query(Feedback).all()

def get_feedback_by_event(db: Session, event_id):
    return db.query(Feedback).filter(Feedback.event_id == event_id).all()

def get_feedback_by_user(db: Session, user_id):
    return db.query(Feedback).filter(Feedback.user_id == user_id).all()

def create_feedback(db: Session, user_id, event_id, rating: Decimal, comment: str | None=None):
    feedback = Feedback(user_id=user_id, event_id=event_id, rating=rating, comment=comment)
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

def submit_feedback(db: Session, user_id, event_id, rating: Decimal | int | float, comment: str | None, event: Event | None=None, automatic_participant: bool=False):
    try:
        normalized_rating = Decimal(str(rating))
    except (InvalidOperation, ValueError):
        raise FeedbackSubmissionError(422, 'Rating must be a number between 1 and 5 with at most one decimal place')
    if not normalized_rating.is_finite() or normalized_rating < 1 or normalized_rating > 5:
        raise FeedbackSubmissionError(422, 'Rating must be between 1 and 5')
    if normalized_rating.as_tuple().exponent < -1:
        raise FeedbackSubmissionError(422, 'Rating can have at most one decimal place')
    if comment is not None and len(comment) > 2000:
        raise FeedbackSubmissionError(422, 'Feedback comment must be 2000 characters or fewer')
    event = event or db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise FeedbackSubmissionError(404, 'Event not found')
    registration = db.query(Registration).filter(
        Registration.user_id == user_id,
        Registration.event_id == event_id,
    ).first()
    if not automatic_participant and (not registration or (registration.status or '').lower() == 'cancelled'):
        raise FeedbackSubmissionError(403, 'You must have an active registration to submit feedback')
    event_end = event.end_time or event.event_date
    if as_utc(event_end) > datetime.now(timezone.utc):
        raise FeedbackSubmissionError(400, 'Feedback can only be submitted after the event has ended')
    existing_feedback = db.query(Feedback).filter(
        Feedback.user_id == user_id,
        Feedback.event_id == event_id,
    ).first()
    if existing_feedback:
        raise FeedbackSubmissionError(400, 'You have already submitted feedback for this event')
    return create_feedback(db, user_id, event_id, normalized_rating, comment)

def delete_feedback(db: Session, feedback_id):
    feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
    if not feedback:
        return False
    db.delete(feedback)
    db.commit()
    return True