def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "name": "Susi", "email": "susi@test.com", "password": "secret123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "susi@test.com"
    assert data["role"] == "USER"
    assert "password" not in data

def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={"name": "A", "email": "dup@test.com", "password": "secret123"})
    response = client.post("/api/auth/register", json={"name": "B", "email": "dup@test.com", "password": "secret456"})
    assert response.status_code == 400

def test_login_success(client):
    client.post("/api/auth/register", json={"name": "Susi", "email": "login@test.com", "password": "secret123"})
    response = client.post("/api/auth/login", json={"email": "login@test.com", "password": "secret123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client):
    client.post("/api/auth/register", json={"name": "Susi", "email": "wrongpw@test.com", "password": "secret123"})
    response = client.post("/api/auth/login", json={"email": "wrongpw@test.com", "password": "wrongpass"})
    assert response.status_code == 401

def test_me_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_me_with_valid_token(client):
    client.post("/api/auth/register", json={"name": "Susi", "email": "me@test.com", "password": "secret123"})
    login_resp = client.post("/api/auth/login", json={"email": "me@test.com", "password": "secret123"})
    token = login_resp.json()["access_token"]
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@test.com"

def test_list_users_requires_admin(client):
    client.post("/api/auth/register", json={"name": "Reg", "email": "regular@test.com", "password": "secret123"})
    login = client.post("/api/auth/login", json={"email": "regular@test.com", "password": "secret123"})
    token = login.json()["access_token"]
    response = client.get("/api/users/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403