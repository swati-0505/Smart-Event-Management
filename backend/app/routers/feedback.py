from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.models.event import Event
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
    if current_user.role not in ('ADMIN', 'MAIN_ADMIN') and feedback_data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='You can only submit feedback on your own behalf')

    user = db.query(User).filter(User.id == feedback_data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    event = db.query(Event).filter(Event.event_id == feedback_data.event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    existing_feedback = feedback_service.get_feedback_by_user(db, feedback_data.user_id)

    for feedback in existing_feedback:
        if feedback.event_id == feedback_data.event_id:
            raise HTTPException(
                status_code=400,
                detail='User has already submitted feedback for this event',
            )

    return feedback_service.create_feedback(
        db=db,
        user_id=feedback_data.user_id,
        event_id=feedback_data.event_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
    )