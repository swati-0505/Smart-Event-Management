from fastapi import FastAPI

from app.db.database import Base
from app.models import User, Event, Registration, Venue

from app.routers.event import router as event_router
from app.routers.registration import router as registration_router
from app.api import auth, users


# Create tables if they do not already exist
# Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart Event Management System",
    version="1.0.0"
)


# Register API routers
app.include_router(event_router)
app.include_router(registration_router)
app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }