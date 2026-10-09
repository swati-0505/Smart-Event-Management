from __future__ import annotations
import uuid
import pytest
from app.rag.search import RetrievedChunk
from app.tools.context import ToolContext, use_tool_context

class FakeQuery:

    def __init__(self, rows):
        self._rows = list(rows)

    def filter(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def limit(self, n):
        return FakeQuery(self._rows[:n])

    def all(self):
        return self._rows

    def first(self):
        return self._rows[0] if self._rows else None

    def count(self):
        return len(self._rows)

    def delete(self, **kwargs):
        count = len(self._rows)
        self._rows = []
        return count

class FakeSession:

    def __init__(self, rows_for: dict | None=None):
        self.rows_for = rows_for or {}
        self.added = []
        self.committed = False
        self.rolled_back = False

    def query(self, model, *args):
        return FakeQuery(self.rows_for.get(model, []))

    def add(self, obj):
        self.added.append(obj)

    def flush(self):
        pass

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        pass

    def execute(self, *args, **kwargs):

        class _Result:

            def fetchall(self_inner):
                return []
        return _Result()

@pytest.fixture(scope='function', autouse=True)
def setup_db():
    yield

@pytest.fixture
def fake_db():
    return FakeSession()

@pytest.fixture
def user_id():
    return uuid.uuid4()

@pytest.fixture
def user_context(fake_db, user_id):
    context = ToolContext(db=fake_db, user_id=user_id, role='USER')
    with use_tool_context(context):
        yield context

@pytest.fixture
def admin_context(fake_db, user_id):
    context = ToolContext(db=fake_db, user_id=user_id, role='ADMIN')
    with use_tool_context(context):
        yield context

def make_chunk(chunk_id: str, content: str='some policy text', dense: float | None=None, sparse: float | None=None, doc_type: str='cancellation_policy') -> RetrievedChunk:
    return RetrievedChunk(chunk_id=chunk_id, content=content, source_filename=f'{doc_type}.md', doc_type=doc_type, metadata={'section': 'Refunds', 'document_title': 'Cancellation Policy'}, dense_score=dense, sparse_score=sparse)

@pytest.fixture
def sample_chunks():
    return [make_chunk(f'c{i}', content=f'chunk {i} body') for i in range(1, 6)]