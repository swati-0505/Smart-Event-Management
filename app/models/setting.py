from sqlalchemy import Column, String, DateTime, JSON, func
from app.db.database import Base


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String, primary_key=True)  # always "global"
    value = Column(JSON, nullable=False, default=dict)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )