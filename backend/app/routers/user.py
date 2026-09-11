from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services import user_service


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# Get all users
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db)
):
    return user_service.get_all_users(db)

# Get user by email
@router.get("/email/{email}", response_model=UserResponse)
def get_user_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    user = user_service.get_user_by_email(db, email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user

# Get user by ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user = user_service.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# Create user
@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = user_service.get_user_by_email(
        db,
        user_data.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = user_service.create_user(
        db=db,
        name=user_data.name,
        email=user_data.email,
        password_hash=user_data.password_hash,
        role=user_data.role
    )

    return user


# Delete user
@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user = user_service.delete_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully",
        "user_id": str(user_id)
    }