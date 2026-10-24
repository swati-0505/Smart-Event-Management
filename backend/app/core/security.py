import uuid
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.permissions import ADMIN_ROLES, MAIN_ADMIN_ROLE
from app.db.database import get_db
from app.models.user import User
security_scheme = HTTPBearer()
optional_security_scheme = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials=Depends(security_scheme), db: Session=Depends(get_db)) -> User:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials', headers={'WWW-Authenticate': 'Bearer'})
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_user(credentials: HTTPAuthorizationCredentials | None=Depends(optional_security_scheme), db: Session=Depends(get_db)) -> User | None:
    if credentials is None:
        return None
    return get_current_user(credentials=credentials, db=db)

def require_admin(current_user: User=Depends(get_current_user)) -> User:
    if current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail='Admin access required')
    return current_user

def require_main_admin(current_user: User=Depends(get_current_user)) -> User:
    if current_user.role != MAIN_ADMIN_ROLE:
        raise HTTPException(status_code=403, detail='Main Admin access required')
    return current_user


pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None=None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)