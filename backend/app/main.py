from fastapi import FastAPI
from app.db.database import Base
from app.models import User, Event, Registration, Venue
from app.routers.event import router as event_router
from app.routers.registration import router as registration_router
from app.routers.venue import router as venue_router
from app.routers.feedback import router as feedback_router
from app.routers.payment import router as payment_router
from app.routers.user import router as user_router
from app.api.admin import router as admin_router
from app.api.events import router as events_router
from app.api import auth, users
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Smart Event Management System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register API routers
app.include_router(event_router)
app.include_router(registration_router)
app.include_router(venue_router)
app.include_router(feedback_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(user_router)
app.include_router(auth.router)
app.include_router(users.router)
@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }
