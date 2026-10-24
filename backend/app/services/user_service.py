from sqlalchemy.orm import Session
from app.core.permissions import (
    AuthorizationError,
    ADMIN_ROLE,
    MAIN_ADMIN_ROLE,
    PRIVILEGED_ROLES,
    USER_ROLE,
    require_admin_actor,
    require_main_admin_actor,
)
from app.models.user import User

def get_all_users(db: Session, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(User).all()

def get_user_by_id(db: Session, user_id, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str, *, actor_id):
    require_admin_actor(db, actor_id)
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, name: str, email: str, password_hash: str, role: str=USER_ROLE, *, actor_id):
    actor = require_admin_actor(db, actor_id)
    if role not in PRIVILEGED_ROLES:
        raise ValueError('Unsupported user role.')
    if role in {MAIN_ADMIN_ROLE, ADMIN_ROLE} and actor.role != MAIN_ADMIN_ROLE:
        raise AuthorizationError('Only MAIN_ADMIN can create administrator accounts.')
    if db.query(User).filter(User.email == email).first():
        raise ValueError('Email already registered.')
    user = User(name=name, email=email, password_hash=password_hash, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id, *, actor_id):
    actor = require_admin_actor(db, actor_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if user.role in {ADMIN_ROLE, MAIN_ADMIN_ROLE} and actor.role != MAIN_ADMIN_ROLE:
        raise AuthorizationError('Only MAIN_ADMIN can delete administrator accounts.')
    db.delete(user)
    db.commit()
    return user

def update_user_role(db: Session, user_id, role: str, *, actor_id):
    require_main_admin_actor(db, actor_id)
    if role not in PRIVILEGED_ROLES:
        raise ValueError('Unsupported user role.')
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    user.role = role
    db.commit()
    db.refresh(user)
    return user