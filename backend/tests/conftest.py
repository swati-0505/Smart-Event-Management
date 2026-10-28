import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

_DEFAULT_TEST_DATABASE_URL = 'postgresql://localhost:5432/event_management_test'
test_database_url = os.environ.get('TEST_DATABASE_URL', _DEFAULT_TEST_DATABASE_URL)
test_database = make_url(test_database_url)
if (
    test_database.get_backend_name() != 'postgresql'
    or test_database.host not in {'localhost', '127.0.0.1', '::1'}
    or not test_database.database
    or not test_database.database.endswith('_test')
):
    raise ValueError('TEST_DATABASE_URL must point to a local PostgreSQL database whose name ends in "_test".')

os.environ['DATABASE_URL'] = test_database_url
os.environ.setdefault('OPENROUTER_MODEL', 'test/openrouter-chat-model')
os.environ.setdefault('OPENROUTER_EMBEDDING_MODEL', 'test/openrouter-embedding-model')
os.environ.setdefault('RAG_ACTIVE_EMBEDDING_INDEX', 'nvidia')

from app.db.database import Base, get_db
from app.main import app

engine = create_engine(test_database_url)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def setup_db():
    if not os.environ.get('TEST_DATABASE_URL'):
        pytest.skip('Set TEST_DATABASE_URL to a local *_test PostgreSQL database to run database-backed tests.')
    with engine.begin() as connection:
        connection.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
    Base.metadata.create_all(bind=engine)
    try:
        yield
    finally:
        Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client(setup_db):
    return TestClient(app)
