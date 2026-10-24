from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.permissions import is_admin_role
from app.core.security import get_optional_user, require_admin
from app.models.user import User
from app.models.venue import Venue
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services import event_service

router = APIRouter(prefix='/api/events', tags=['Events'])

@router.get('/', response_model=list[EventResponse])
def get_events(db: Session=Depends(get_db), current_user: User | None=Depends(get_optional_user)):
    if current_user and is_admin_role(current_user.role):
        return event_service.get_all_events(db, actor_id=current_user.id)
    return event_service.get_published_events(db)

@router.get('/published', response_model=list[EventResponse])
def get_published_events(db: Session=Depends(get_db)):
    return event_service.get_published_events(db)

@router.get('/completed', response_model=list[EventResponse])
def get_completed_events(db: Session=Depends(get_db)):
    return event_service.get_completed_events(db)

@router.get('/{event_id}', response_model=EventResponse)
def get_event(event_id: UUID, db: Session=Depends(get_db), current_user: User | None=Depends(get_optional_user)):
    event = event_service.get_event_by_id(db, event_id, actor_id=current_user.id if current_user else None)
    if not event or (event.status != 'published' and not (current_user and is_admin_role(current_user.role))):
        raise HTTPException(status_code=404, detail='Event not found')
    return event

@router.post('/', response_model=EventResponse, status_code=201)
def create_event(event_data: EventCreate, db: Session=Depends(get_db), current_user: User=Depends(require_admin)):
    if event_data.venue_id is not None:
        venue = db.query(Venue).filter(Venue.venue_id == event_data.venue_id).first()
        if not venue:
            raise HTTPException(status_code=404, detail='Venue not found')
    return event_service.create_event(db=db, title=event_data.title, description=event_data.description, category=event_data.category, venue_id=event_data.venue_id, address=event_data.address, event_date=event_data.event_date, end_time=event_data.end_time, registration_deadline=event_data.registration_deadline, capacity=event_data.capacity, ticket_price=event_data.ticket_price, actor_id=current_user.id)

@router.put('/{event_id}', response_model=EventResponse)
def update_event(event_id: UUID, event_data: EventUpdate, db: Session=Depends(get_db), current_user: User=Depends(require_admin)):
    event = event_service.get_event_by_id(db, event_id, actor_id=current_user.id)
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    if event_data.venue_id is not None:
        venue = db.query(Venue).filter(Venue.venue_id == event_data.venue_id).first()
        if not venue:
            raise HTTPException(status_code=404, detail='Venue not found')
    updates = event_data.model_dump(exclude_unset=True)
    try:
        updated_event = event_service.update_event(db, event_id, actor_id=current_user.id, **updates)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return updated_event

@router.delete('/{event_id}')
def delete_event(event_id: UUID, db: Session=Depends(get_db), current_user: User=Depends(require_admin)):
    try:
        event = event_service.delete_event(db, event_id, actor_id=current_user.id)
    except event_service.EventDeletionConflict as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not event:
        raise HTTPException(status_code=404, detail='Event not found')
    return {'message': 'Event deleted successfully', 'event_id': str(event_id)}