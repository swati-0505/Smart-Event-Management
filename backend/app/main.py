from fastapi import FastAPI

from app.db.database import Base, engine
from app.models import User, Event, Registration, Venue

from app.routers.event import router as event_router
from app.routers.registration import router as registration_router
from app.routers.venue import router as venue_router
from app.routers.feedback import router as feedback_router
from app.routers.payment import router as payment_router
from app.routers.user import router as user_router
from app.api.admin import router as admin_router
from app.api.events import router as events_router


# Create tables if they do not already exist
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Event Management System",
    version="1.0.0"
)


# Register API routers
app.include_router(event_router)
app.include_router(registration_router)
app.include_router(venue_router)
app.include_router(feedback_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(user_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }