from __future__ import annotations
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.permissions import AuthorizationError
from app.db.database import Base
from app.models import User, Event, Registration, Venue

from app.routers.event import router as event_router
from app.routers.registration import router as registration_router
from app.routers.venue import router as venue_router
from app.routers.feedback import router as feedback_router
from app.routers.payment import router as payment_router
from app.routers.user import router as user_router
from app.api.admin import router as admin_router
from app.api import auth
from app.api.chat import router as ai_router

_docs_url = '/docs' if settings.ENABLE_API_DOCS else None
_redoc_url = '/redoc' if settings.ENABLE_API_DOCS else None

app = FastAPI(
    title='Smart Event Management System',
    version='1.0.0',
    docs_url="/docs",
    redoc_url=_redoc_url,
)

@app.exception_handler(AuthorizationError)
async def authorization_error_handler(_, exc: AuthorizationError):
    return JSONResponse(status_code=403, content={'detail': str(exc)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(event_router)
app.include_router(registration_router)
app.include_router(venue_router)
app.include_router(feedback_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(user_router)
app.include_router(ai_router)

@app.get('/health', tags=['Health'])
def health_check():
    return {'status': 'ok'}

def main() -> None:
    uvicorn.run(app, host='0.0.0.0', port=8000)