from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.admin_service import get_dashboard_stats
router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)
@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db)