from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.database import get_db
from app.services import venue_service
from app.schemas.venue import VenueCreate, VenueUpdate, VenueResponse


router = APIRouter(
    prefix="/api/venues",
    tags=["Venues"]
)



@router.post("/", response_model=VenueResponse, status_code=201)
def create_venue(
    venue_data: VenueCreate,
    db: Session = Depends(get_db)
):
    return venue_service.create_venue(
        db=db,
        name=venue_data.name,
        address=venue_data.address,
        city=venue_data.city,
        capacity=venue_data.capacity
    )



@router.get("/", response_model=list[VenueResponse])
def get_venues(
    db: Session = Depends(get_db)
):
    return venue_service.get_all_venues(db)



@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(
    venue_id: UUID,
    db: Session = Depends(get_db)
):
    venue = venue_service.get_venue_by_id(db, venue_id)

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return venue



@router.put("/{venue_id}", response_model=VenueResponse)
def update_venue(
    venue_id: UUID,
    venue_data: VenueUpdate,
    db: Session = Depends(get_db)
):
    venue = venue_service.update_venue(
        db,
        venue_id,
        name=venue_data.name,
        address=venue_data.address,
        city=venue_data.city,
        capacity=venue_data.capacity
    )

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return venue



@router.delete("/{venue_id}")
def delete_venue(
    venue_id: UUID,
    db: Session = Depends(get_db)
):
    venue = venue_service.delete_venue(db, venue_id)

    if not venue:
        raise HTTPException(
            status_code=404,
            detail="Venue not found"
        )

    return {
        "message": "Venue deleted successfully"
    }