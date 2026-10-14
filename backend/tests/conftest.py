import os
os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5433/event_management_test?sslmode=disable'
os.environ['ENABLE_HALLUCINATION_CHECK'] = 'true'
os.environ['ENABLE_METADATA_EXTRACTION'] = 'true'
os.environ.setdefault('OPENROUTER_API_KEY', 'test-openrouter-key')
os.environ.setdefault('OPENROUTER_MODEL', 'test/openrouter-chat-model')
os.environ.setdefault('OPENROUTER_EMBEDDING_MODEL', 'test/openrouter-embedding-model')
os.environ.setdefault('EMBEDDING_MODEL', 'test/legacy-embedding-model')

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db

engine = create_engine(os.environ['DATABASE_URL'])
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope='function', autouse=True)
def setup_db():
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
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