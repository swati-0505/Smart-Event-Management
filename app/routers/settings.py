from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.setting import AppSetting
from app.core.security import get_current_user
router = APIRouter(prefix="/api/admin", tags=["Settings"])

KEY = "global"
def require_admin(current_user=Depends(get_current_user)):
    role = getattr(current_user, "role", None)
    role = getattr(role, "value", role)
    if str(role).lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
@router.get("/settings")
def get_settings(db: Session = Depends(get_db), _=Depends(require_admin)):
    row = db.query(AppSetting).filter(AppSetting.key == KEY).first()
    return row.value if row else {}
@router.api_route("/settings", methods=["PUT", "PATCH"])
def save_settings(
    payload: dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    row = db.query(AppSetting).filter(AppSetting.key == KEY).first()
    if row:
        row.value = {**(row.value or {}), **payload}
    else:
        row = AppSetting(key=KEY, value=payload)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row.value