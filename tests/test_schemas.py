from app.schemas.registration import RegistrationResponse
from app.schemas.user import UserCreate


def test_user_create_accepts_password_and_default_role():
    user = UserCreate.model_validate({
        "name": "Alice",
        "email": "alice@example.com",
        "password": "strong-pass-123",
    })

    assert user.name == "Alice"
    assert user.password == "strong-pass-123"
    assert user.role == "USER"


def test_registration_response_maps_orm_aliases():
    payload = {
        "registration_id": "123e4567-e89b-12d3-a456-426614174000",
        "event_id": "123e4567-e89b-12d3-a456-426614174001",
        "user_id": "123e4567-e89b-12d3-a456-426614174002",
        "status": "confirmed",
        "registration_date": "2024-01-01T12:00:00Z",
    }

    response = RegistrationResponse.model_validate(payload)

    assert response.id == payload["registration_id"]
    assert response.registered_at.isoformat().startswith("2024-01-01T12:00:00")
