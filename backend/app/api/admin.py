from fastapi import APIRouter, Depends
from app.core.security import require_admin
from app.core.redis_cache import redis_cache
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.services.admin_service import get_dashboard_stats

router = APIRouter(prefix='/api/admin', tags=['Admin'])

@router.get('/dashboard')
def get_admin_dashboard(db: Session=Depends(get_db), _: User=Depends(require_admin)):
    return get_dashboard_stats(db)

@router.get('/cache/status', summary='Redis cache health and statistics (ADMIN only)', tags=['Admin'])
def get_cache_status(_: User=Depends(require_admin)):
    return redis_cache.status()

@router.delete('/cache/clear', summary='Flush all Redis cache entries (MAIN_ADMIN only)', tags=['Admin'])
def clear_cache(current_user: User=Depends(require_admin)):
    if current_user.role not in ('MAIN_ADMIN', 'ADMIN'):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='Admins only.')
    ok = redis_cache.clear()
    return {'success': ok, 'message': 'Cache flushed.' if ok else 'Redis not connected — nothing to flush.'}