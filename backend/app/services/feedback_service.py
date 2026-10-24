from sqlalchemy.orm import Session
from app.core.permissions import require_admin_actor, require_owner_or_admin_actor
from app.models.feedback import Feedback
from app.models.event import Event
from app.models.user import User
from app.core.event_status import is_event_completed

def get_all_feedback(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    entries = (
        db.query(Feedback, User.name, Event.title)
        .join(User, User.id == Feedback.user_id)
        .join(Event, Event.event_id == Feedback.event_id)
        .all()
    )
    return [
        {
            'feedback_id': feedback.feedback_id,
            'user_id': feedback.user_id,
            'event_id': feedback.event_id,
            'rating': feedback.rating,
            'comment': feedback.comment,
            'created_at': feedback.created_at,
            'user_name': user_name,
            'event_title': event_title,
        }
        for feedback, user_name, event_title in entries
    ]

def get_feedback_by_event(db: Session, event_id, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(Feedback).filter(Feedback.event_id == event_id).all()

def get_public_feedback_for_completed_events(db: Session):
    completed_event_ids = [
        event.event_id
        for event in db.query(Event).filter(Event.status == 'published').all()
        if is_event_completed(event.event_date, event.end_time)
    ]
    if not completed_event_ids:
        return []
    return (
        db.query(Feedback)
        .filter(Feedback.event_id.in_(completed_event_ids))
        .order_by(Feedback.created_at.desc())
        .all()
    )

def get_feedback_by_user(db: Session, user_id, *, actor_id):
    require_owner_or_admin_actor(db, actor_id, user_id)
    return db.query(Feedback).filter(Feedback.user_id == user_id).all()

def create_feedback(db: Session, user_id, event_id, rating: int, comment: str | None=None, *, actor_id):
    require_owner_or_admin_actor(db, actor_id, user_id)
    feedback = Feedback(user_id=user_id, event_id=event_id, rating=rating, comment=comment)
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

def delete_feedback(db: Session, feedback_id, *, actor_id):
    require_admin_actor(db, actor_id)
    feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
    if feedback is None:
        return None
    db.delete(feedback)
    db.commit()
    return feedback