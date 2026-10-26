import os

from sqlalchemy.engine import make_url

test_database_url = os.environ.get(
    'TEST_DATABASE_URL',
    'postgresql://postgres:password@localhost:5432/event_management_test',
)
test_database_name = make_url(test_database_url).database
if not test_database_name or not test_database_name.endswith('_test'):
    raise ValueError('TEST_DATABASE_URL must point to a dedicated database whose name ends in "_test".')

os.environ['DATABASE_URL'] = test_database_url
import pytest
os.environ.setdefault('OPENROUTER_MODEL', 'test/openrouter-chat-model')
os.environ.setdefault('OPENROUTER_EMBEDDING_MODEL', 'test/openrouter-embedding-model')
os.environ.setdefault('RAG_ACTIVE_EMBEDDING_INDEX', 'nvidia')
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.database import Base, get_db
engine = create_engine(os.environ['postgresql://neondb_owner:npg_LKi0CZuD1vOx@ep-flat-silence-b4o2k2xn-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'])
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