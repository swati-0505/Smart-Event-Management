from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.permissions import USER_ROLE
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.services import registration_service
router = APIRouter(prefix='/api/registrations', tags=['Registrations'])

@router.get('/', response_model=list[RegistrationResponse])
def get_registrations(db: Session=Depends(get_db), admin: User=Depends(require_admin)):
    return registration_service.get_all_registrations(db, actor_id=admin.id)

@router.get('/{registration_id}', response_model=RegistrationResponse)
def get_registration(registration_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    registration = registration_service.get_registration_by_id(db, registration_id, actor_id=current_user.id)
    if not registration:
        raise HTTPException(status_code=404, detail='Registration not found')
    return registration

@router.post('/', response_model=RegistrationResponse, status_code=201)
def create_registration(registration_data: RegistrationCreate, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if current_user.role != USER_ROLE:
        raise HTTPException(status_code=403, detail='Administrators cannot register as participants')
    if registration_data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Cannot register another user')
    user = db.query(User).filter(User.id == registration_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    event = db.query(Event).filter(Event.event_id == registration_data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    try:
        registration = registration_service.create_registration(db=db, user_id=registration_data.user_id, event_id=registration_data.event_id, actor_id=current_user.id)
        return registration
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/user/{user_id}', response_model=list[RegistrationResponse])
def get_user_registrations(user_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    return registration_service.get_user_registrations(db, user_id, actor_id=current_user.id)

@router.get('/event/{event_id}', response_model=list[RegistrationResponse])
def get_event_registrations(event_id: UUID, db: Session=Depends(get_db), admin: User=Depends(require_admin)):
    return registration_service.get_event_registrations(db, event_id, actor_id=admin.id)

@router.put('/{registration_id}/cancel', response_model=RegistrationResponse)
def cancel_registration(registration_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if current_user.role != USER_ROLE:
        raise HTTPException(status_code=403, detail='Only participants can cancel their own registrations')
    existing = registration_service.get_registration_by_id(db, registration_id, actor_id=current_user.id)
    if not existing:
        raise HTTPException(status_code=404, detail='Registration not found')
    if existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Registration access denied')
    registration = registration_service.cancel_registration(db, registration_id, actor_id=current_user.id)
    if not registration:
        raise HTTPException(status_code=404, detail='Registration not found')
    return registration