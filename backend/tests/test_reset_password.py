from types import SimpleNamespace

import pytest

from app.core.permissions import MAIN_ADMIN_ROLE, USER_ROLE
from app.models.user import User
import reset_password


@pytest.fixture(autouse=True)
def setup_db():
    yield


class FakeQuery:
    def __init__(self, user):
        self.user = user

    def filter(self, _criterion):
        return self

    def first(self):
        return self.user


class FakeSession:
    def __init__(self, user):
        self.user = user
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def query(self, model):
        assert model is User
        return FakeQuery(self.user)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


def test_set_main_admin_changes_only_role(monkeypatch):
    user = SimpleNamespace(
        email='nithin@gmail.com',
        role=USER_ROLE,
        password_hash='unchanged-hash',
    )
    session = FakeSession(user)
    monkeypatch.setattr(reset_password, 'SessionLocal', lambda: session)

    assert reset_password.set_main_admin('nithin@gmail.com') is True

    assert user.role == MAIN_ADMIN_ROLE
    assert user.password_hash == 'unchanged-hash'
    assert session.committed is True
    assert session.closed is True


def test_set_main_admin_reports_missing_user(monkeypatch):
    session = FakeSession(None)
    monkeypatch.setattr(reset_password, 'SessionLocal', lambda: session)

    assert reset_password.set_main_admin('missing@gmail.com') is False

    assert session.committed is False
    assert session.closed is True
