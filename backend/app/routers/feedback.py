from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.event_status import is_event_completed
from app.core.permissions import USER_ROLE
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, PublicFeedbackResponse
from app.services import feedback_service
router = APIRouter(prefix='/api/feedback', tags=['Feedback'])

@router.get('/', response_model=list[FeedbackResponse])
def get_all_feedback(db: Session=Depends(get_db), admin: User=Depends(require_admin)):
    return feedback_service.get_all_feedback(db, actor_id=admin.id)

@router.get('/public/completed', response_model=list[PublicFeedbackResponse])
def get_public_completed_feedback(db: Session=Depends(get_db)):
    return feedback_service.get_public_feedback_for_completed_events(db)

@router.get('/event/{event_id}', response_model=list[FeedbackResponse])
def get_event_feedback(event_id: UUID, db: Session=Depends(get_db), admin: User=Depends(require_admin)):
    return feedback_service.get_feedback_by_event(db, event_id, actor_id=admin.id)

@router.get('/user/{user_id}', response_model=list[FeedbackResponse])
def get_user_feedback(user_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    return feedback_service.get_feedback_by_user(db, user_id, actor_id=current_user.id)

@router.post('/', response_model=FeedbackResponse, status_code=201)
def create_feedback(feedback_data: FeedbackCreate, 
            db: Session=Depends(get_db),
            current_user: User=Depends(get_current_user)):
    
    if current_user.role != USER_ROLE or feedback_data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='You can only submit feedback on your own behalf')

    event = db.query(Event).filter(Event.event_id == feedback_data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')

    if not is_event_completed(event.event_date, event.end_time):
        raise HTTPException(status_code=400, detail='Feedback is available after the event is completed')

    existing_feedback = db.query(Feedback).filter(
        Feedback.user_id == current_user.id,
        Feedback.event_id == event.event_id,
    ).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail='You have already submitted feedback for this event')

    return feedback_service.create_feedback(
        db=db,
        user_id=current_user.id,
        event_id=feedback_data.event_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
        actor_id=current_user.id)

@router.delete('/{feedback_id}', status_code=204)
def delete_feedback(feedback_id: UUID, db: Session=Depends(get_db), admin: User=Depends(require_admin)):
    feedback = feedback_service.delete_feedback(db, feedback_id, actor_id=admin.id)
    if feedback is None:
        raise HTTPException(status_code=404, detail='Feedback not found')
    return None