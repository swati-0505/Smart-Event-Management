from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.security import hash_password
from app.models.user import User
from app.models.venue import Venue
from tests.conftest import TestingSessionLocal


def test_event_custom_address_is_stored_only_on_that_event(client):
    admin = User(
        name='Address Admin',
        email=f'address-admin-{uuid4()}@example.com',
        password_hash=hash_password('test-password'),
        role='ADMIN',
    )
    db = TestingSessionLocal()
    try:
        db.add(admin)
        db.commit()
        admin_email = admin.email
    finally:
        db.close()

    login = client.post(
        '/api/auth/login',
        json={'email': admin_email, 'password': 'test-password'},
    )
    token = login.json()['access_token']
    address = '123 Custom Event Road, Example City'
    event_date = datetime.now(timezone.utc) + timedelta(days=30)
    response = client.post(
        '/api/events/',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'title': 'Custom Address Event',
            'category': 'Workshop',
            'address': address,
            'event_date': event_date.isoformat(),
            'capacity': 25,
        },
    )

    assert response.status_code == 201
    assert response.json()['venue_id'] is None
    assert response.json()['address'] == address
    event_id = response.json()['event_id']

    updated_address = '456 Other Road, Example City'
    updated = client.put(
        f'/api/events/{event_id}',
        headers={'Authorization': f'Bearer {token}'},
        json={'address': updated_address},
    )

    assert updated.status_code == 200
    assert updated.json()['venue_id'] is None
    assert updated.json()['address'] == updated_address

    db = TestingSessionLocal()
    try:
        assert db.query(Venue).count() == 0
    finally:
        db.close()
