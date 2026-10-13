import os
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_l6MOGRpf1JXY@ep-round-glitter-b5q2flme-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
import pytest
os.environ.setdefault('OPENROUTER_MODEL', 'test/openrouter-chat-model')
os.environ.setdefault('OPENROUTER_EMBEDDING_MODEL', 'test/openrouter-embedding-model')
os.environ.setdefault('EMBEDDING_MODEL', 'test/legacy-embedding-model')
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db
engine = create_engine(os.environ['DATABASE_URL'])
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope='function', autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)