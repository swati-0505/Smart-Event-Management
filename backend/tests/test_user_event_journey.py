from __future__ import annotations
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4
from app.agent.graph import AgentResult
from app.core.security import hash_password
from app.models.event import Event
from app.models.user import User
from app.models.venue import Venue
from app.rag import pipeline
from app.tools.context import ToolContext, use_tool_context
from app.tools.rag_tools import search_event_policy
from app.services import availability_service
from tests.conftest import TestingSessionLocal

def _seed_published_event():
    db = TestingSessionLocal()
    try:
        admin = User(name='Journey Admin', email=f'journey-admin-{uuid4()}@example.test', password_hash=hash_password('test-password'), role='ADMIN')
        venue = Venue(name='Journey Venue', address='1 Test Road', city='Test City', capacity=100)
        db.add_all([admin, venue])
        db.flush()
        event = Event(title='Journey Test Event', description='An event for the end-to-end user journey.', category='Workshop', venue_id=venue.venue_id, event_date=datetime.now(timezone.utc) + timedelta(days=14), end_time=datetime.now(timezone.utc) + timedelta(days=14, hours=2), registration_deadline=datetime.now(timezone.utc) + timedelta(days=12), capacity=20, available_seats=20, created_by=admin.id, status='published')
        db.add(event)
        db.commit()
        db.refresh(event)
        return (venue.venue_id, event.event_id)
    finally:
        db.close()

def test_login_event_search_registration_confirmation_and_policy(client, monkeypatch):
    _, event_id = _seed_published_event()
    email = f'journey-user-{uuid4()}@example.com'
    registered = client.post('/api/auth/register', json={'name': 'Journey User', 'email': email, 'password': 'test-password'})
    assert registered.status_code == 200
    login = client.post('/api/auth/login', json={'email': email, 'password': 'test-password'})
    assert login.status_code == 200
    headers = {'Authorization': f"Bearer {login.json()['access_token']}"}
    events = client.get('/api/events/published')
    assert events.status_code == 200
    assert any((event['event_id'] == str(event_id) for event in events.json()))
    registration = client.post('/api/registrations/', json={'user_id': registered.json()['id'], 'event_id': str(event_id)}, headers=headers)
    assert registration.status_code == 201
    assert registration.json()['status'] == 'confirmed'
    db = TestingSessionLocal()
    try:
        assert db.query(Event).filter(Event.event_id == event_id).one().available_seats == 19
    finally:
        db.close()
    policy_answer = SimpleNamespace(chunks=[SimpleNamespace()], answer='Cancellations are accepted up to 48 hours before the event.', sources=['cancellation_policy.pdf'], grounded=True)
    monkeypatch.setattr(pipeline, 'answer', lambda *args, **kwargs: policy_answer)

    def run_policy_query(*, db, user_id, message, session_id=None):
        with use_tool_context(ToolContext(db=db, user_id=user_id, role='USER')):
            reply = search_event_policy.invoke({'question': message})
        return AgentResult(reply=reply, session_id=uuid4(), run_id=uuid4(), intent='POLICY', tools_used=['search_event_policy'], tool_results=[], sources=['cancellation_policy.pdf'], latency_ms=1, status='success')
    monkeypatch.setattr('app.api.chat.run_agent', run_policy_query)
    policy = client.post('/api/chat', json={'message': 'What is the cancellation policy?'}, headers=headers)
    assert policy.status_code == 200
    assert '48 hours' in policy.json()['reply']
    assert policy.json()['sources'] == ['cancellation_policy.pdf']

def test_venue_availability_uses_event_end_times(client):
    venue_id, _ = _seed_published_event()
    db = TestingSessionLocal()
    try:
        existing = db.query(Event).filter(Event.venue_id == venue_id).one()
        start = existing.event_date
        end = existing.end_time
        adjacent = availability_service.check_venue_availability(db, venue_id, requested_time=end, requested_end_time=end + timedelta(hours=1))
        overlapping = availability_service.check_venue_availability(db, venue_id, requested_time=start + timedelta(minutes=30), requested_end_time=end + timedelta(minutes=30))
        assert adjacent.available
        assert not overlapping.available
        assert 'Journey Test Event' in overlapping.conflicting_events
        existing.end_time = None
        db.commit()
        legacy_overlap = availability_service.check_venue_availability(db, venue_id, requested_time=start + timedelta(hours=1), requested_end_time=start + timedelta(hours=2))
        assert not legacy_overlap.available
    finally:
        db.close()

def test_event_create_rejects_end_time_before_start(client):
    venue_id, _ = _seed_published_event()
    admin = User(name='Timing Admin', email=f'timing-admin-{uuid4()}@example.com', password_hash=hash_password('test-password'), role='ADMIN')
    admin_email = admin.email
    db = TestingSessionLocal()
    try:
        db.add(admin)
        db.commit()
    finally:
        db.close()
    login = client.post('/api/auth/login', json={'email': admin_email, 'password': 'test-password'})
    token = login.json()['access_token']
    start = datetime.now(timezone.utc) + timedelta(days=30)
    response = client.post('/api/events/', headers={'Authorization': f'Bearer {token}'}, json={'title': 'Invalid event', 'category': 'Workshop', 'venue_id': str(venue_id), 'event_date': start.isoformat(), 'end_time': (start - timedelta(hours=1)).isoformat(), 'capacity': 10})
    assert response.status_code == 422