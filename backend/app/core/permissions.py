from __future__ import annotations
from enum import Enum
from typing import TYPE_CHECKING
from uuid import UUID
from sqlalchemy.orm import Session

if TYPE_CHECKING:
    from app.models.user import User
class Role(str, Enum):
    USER = 'USER'
    ADMIN = 'ADMIN'
    MAIN_ADMIN = 'MAIN_ADMIN'

USER_ROLE = Role.USER.value
ADMIN_ROLE = Role.ADMIN.value
MAIN_ADMIN_ROLE = Role.MAIN_ADMIN.value
ADMIN_ROLES = frozenset({ADMIN_ROLE, MAIN_ADMIN_ROLE})
PRIVILEGED_ROLES = frozenset({USER_ROLE, *ADMIN_ROLES})
GUEST_ROLE = 'GUEST'

class AuthorizationError(PermissionError):
    pass

def is_admin_role(role: str | None) -> bool:
    return role in ADMIN_ROLES

def load_actor(db: Session, actor_id: UUID | None) -> User:
    from app.models.user import User
    if actor_id is None:
        raise AuthorizationError('An authenticated user is required.')
    actor = db.query(User).filter(User.id == actor_id).first()
    if actor is None:
        raise AuthorizationError('The authenticated user no longer exists.')
    return actor


def require_admin_actor(db: Session, actor_id: UUID | None) -> User:
    actor = load_actor(db, actor_id)
    if not is_admin_role(actor.role):
        raise AuthorizationError('Admin access required.')
    return actor

def require_main_admin_actor(db: Session, actor_id: UUID | None) -> User:
    actor = load_actor(db, actor_id)
    if actor.role != MAIN_ADMIN_ROLE:
        raise AuthorizationError('Main Admin access required.')
    return actor

def require_participant_actor(
    db: Session,
    actor_id: UUID | None,
    target_user_id: UUID) -> User:
    actor = load_actor(db, actor_id)
    if actor.role != USER_ROLE:
        raise AuthorizationError('Administrators cannot register as participants.')
    if actor.id != target_user_id:
        raise AuthorizationError('Users can only access their own registrations.')
    return actor


def require_registration_read_access(
    db: Session,
    actor_id: UUID | None,
    target_user_id: UUID,
) -> User:
    actor = load_actor(db, actor_id)
    if not is_admin_role(actor.role) and (
        actor.role != USER_ROLE or actor.id != target_user_id
    ):
        raise AuthorizationError('Registration access denied.')
    return actor


def require_owner_or_admin_actor(
    db: Session,
    actor_id: UUID | None,
    target_user_id: UUID,
) -> User:
    actor = load_actor(db, actor_id)
    if not is_admin_role(actor.role) and (
        actor.role != USER_ROLE or actor.id != target_user_id
    ):
        raise AuthorizationError('Users can only access their own records.')
    return actor
