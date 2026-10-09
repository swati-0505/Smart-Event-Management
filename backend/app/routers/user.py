from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import hash_password, require_admin, require_main_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserRoleUpdate
from app.services import user_service
router = APIRouter(prefix='/api/users', tags=['Users'])

@router.get('/', response_model=list[UserResponse])
def get_users(db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return user_service.get_all_users(db)

@router.get('/email/{email}', response_model=UserResponse)
def get_user_by_email(email: str, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    user = user_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

@router.get('/{user_id}', response_model=UserResponse)
def get_user(user_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

@router.post('/', response_model=UserResponse, status_code=201)
def create_user(user_data: UserCreate, db: Session=Depends(get_db), current_admin: User=Depends(require_admin)):
    assigned_role = user_data.role
    if assigned_role in ['ADMIN', 'MAIN_ADMIN'] and current_admin.role != 'MAIN_ADMIN':
        raise HTTPException(status_code=403, detail='Only MAIN_ADMIN can create ADMIN or MAIN_ADMIN accounts')
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    user = user_service.create_user(db=db, name=user_data.name, email=user_data.email, password_hash=hash_password(user_data.password), role=assigned_role)
    return user

@router.patch('/{user_id}/role', response_model=UserResponse)
def update_user_role(user_id: UUID, role_data: UserRoleUpdate, db: Session=Depends(get_db), _: User=Depends(require_main_admin)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    updated_user = user_service.update_user_role(db, user_id, role_data.role)
    return updated_user

@router.delete('/{user_id}')
def delete_user(user_id: UUID, db: Session=Depends(get_db), _: User=Depends(require_admin)):
    user = user_service.delete_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return {'message': 'User deleted successfully', 'user_id': str(user_id)}