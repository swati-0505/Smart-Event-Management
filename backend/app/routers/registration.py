from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_current_user, require_admin
from app.db.database import get_db
from app.models.event import Event
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.services import registration_service
router = APIRouter(prefix='/api/registrations', tags=['Registrations'])

@router.get('/', response_model=list[RegistrationResponse])
def get_registrations(db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return registration_service.get_all_registrations(db)

@router.get('/{registration_id}', response_model=RegistrationResponse)
def get_registration(registration_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    registration = registration_service.get_registration_by_id(db, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail='Registration not found')
    if current_user.role not in ('ADMIN', 'MAIN_ADMIN') and registration.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Registration access denied')
    return registration

@router.post('/', response_model=RegistrationResponse, status_code=201)
def create_registration(registration_data: RegistrationCreate, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if current_user.role not in ('ADMIN', 'MAIN_ADMIN') and registration_data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Cannot register another user')
    user = db.query(User).filter(User.id == registration_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    event = db.query(Event).filter(Event.event_id == registration_data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    try:
        registration = registration_service.create_registration(db=db, user_id=registration_data.user_id, event_id=registration_data.event_id)
        return registration
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get('/user/{user_id}', response_model=list[RegistrationResponse])
def get_user_registrations(user_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    if current_user.role not in ('ADMIN', 'MAIN_ADMIN') and user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Registration access denied')
    return registration_service.get_user_registrations(db, user_id)

@router.get('/event/{event_id}', response_model=list[RegistrationResponse])
def get_event_registrations(event_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return registration_service.get_event_registrations(db, event_id)

@router.put('/{registration_id}/cancel', response_model=RegistrationResponse)
def cancel_registration(registration_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(get_current_user)):
    existing = registration_service.get_registration_by_id(db, registration_id)
    if not existing:
        raise HTTPException(status_code=404, detail='Registration not found')
    if current_user.role not in ('ADMIN', 'MAIN_ADMIN') and existing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Registration access denied')
    registration = registration_service.cancel_registration(db, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail='Registration not found')
    return registration