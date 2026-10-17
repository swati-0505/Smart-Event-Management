from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.registration import Registration
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services import feedback_service
router = APIRouter(prefix='/api/feedback', tags=['Feedback'])

@router.get('/', response_model=list[FeedbackResponse])
def get_all_feedback(db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return feedback_service.get_all_feedback(db)

@router.get('/event/{event_id}', response_model=list[FeedbackResponse])
def get_event_feedback(event_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return feedback_service.get_feedback_by_event(db, event_id)

@router.get('/user/{user_id}', response_model=list[FeedbackResponse])
def get_user_feedback(user_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return feedback_service.get_feedback_by_user(db, user_id)

@router.get('/mine', response_model=list[FeedbackResponse])
def get_my_feedback(db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    return feedback_service.get_feedback_by_user(db, current_user.id)

@router.delete('/{feedback_id}', status_code=204)
def delete_feedback(feedback_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    if not feedback_service.delete_feedback(db, feedback_id):
        raise HTTPException(status_code=404, detail='Feedback not found')

@router.post('/', response_model=FeedbackResponse, status_code=201)
def create_feedback(
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.event_id == feedback_data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    registration = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.event_id == feedback_data.event_id,
    ).first()
    if not registration or (registration.status or '').lower() == 'cancelled':
        raise HTTPException(status_code=403, detail='You must have an active registration to submit feedback')

    event_end = event.end_time or event.event_date
    if event_end.tzinfo is None:
        event_end = event_end.replace(tzinfo=timezone.utc)
    if event_end > datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail='Feedback can only be submitted after the event has ended')

    existing_feedback = db.query(Feedback).filter(
        Feedback.user_id == current_user.id,
        Feedback.event_id == feedback_data.event_id,
    ).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail='You have already submitted feedback for this event')

    return feedback_service.create_feedback(
        db=db,
        user_id=current_user.id,
        event_id=feedback_data.event_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
    )