"""Tests for authentication endpoints."""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.core.config import settings
from app.core.security import decode_access_token, hash_password
from app.models.user import User

pytestmark = pytest.mark.asyncio


async def test_health(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


async def test_login_success(client: AsyncClient, student_user):
    resp = await client.post(
        "/api/v1/auth/login",
        data={"username": student_user.email, "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(client: AsyncClient, student_user):
    resp = await client.post(
        "/api/v1/auth/login",
        data={"username": student_user.email, "password": "wrongpass"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 401


async def test_login_unknown_email(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@test.edu", "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 401


async def test_me_authenticated(client: AsyncClient, student_token: str, student_user):
    resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == student_user.email
    assert data["role"] == "REPORTER"


async def test_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


async def test_register(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "New",
            "last_name": "Student",
            "email": "new.student@school.edu",
            "password": "securepass123",
            "user_type": "STUDENT",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new.student@school.edu"
    assert data["user"]["role"] == "REPORTER"


async def test_register_duplicate_email(client: AsyncClient, student_user):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Duplicate",
            "last_name": "User",
            "email": student_user.email,
            "password": "pass1234",
            "user_type": "STUDENT",
        },
    )
    assert resp.status_code == 409


async def test_public_registration_cannot_create_privileged_role(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Attempted",
            "last_name": "Technician",
            "email": "attempted.tech@school.edu",
            "password": "securepass123",
            "role": "MAINTENANCE_PERSONNEL",
            "user_type": "MAINTENANCE",
        },
    )
    assert resp.status_code == 422


async def test_demo_login_is_disabled_by_default(client: AsyncClient, monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", False)
    resp = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": "usr_admin_005"},
    )
    assert resp.status_code == 404


async def test_demo_login_is_disabled_in_production_even_when_enabled(
    client: AsyncClient, monkeypatch
):
    monkeypatch.setattr(settings, "APP_ENV", "production")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    resp = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": "usr_admin_005"},
    )
    assert resp.status_code == 404


async def test_demo_login_rejects_unapproved_user_id(
    client: AsyncClient, student_user, monkeypatch
):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    resp = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": student_user.id},
    )
    assert resp.status_code == 403


async def test_demo_login_rejects_maxim_dahan_id(client: AsyncClient, monkeypatch):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    response = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": "1bde3025-ee46-468d-a4b1-651d06d8d08f"},
    )
    assert response.status_code == 403


@pytest.mark.parametrize(
    ("user_id", "first_name", "last_name", "email", "role", "user_type"),
    [
        ("usr_student_001", "Alex", "Rivera", "alex.student@school.edu", "REPORTER", "STUDENT"),
        ("usr_faculty_002", "Maria", "Santos", "maria.faculty@school.edu", "REPORTER", "FACULTY"),
        ("usr_tech_003", "Juan", "Dela Cruz", "juan.tech@school.edu", "MAINTENANCE_PERSONNEL", "MAINTENANCE"),
        ("usr_tech_006", "Robert", "Taylor", "robert.taylor@school.edu", "MAINTENANCE_PERSONNEL", "MAINTENANCE"),
        ("usr_super_004", "Carlos", "Mendoza", "carlos.supervisor@school.edu", "MAINTENANCE_SUPERVISOR", "SUPERVISOR"),
        ("usr_admin_005", "Elena", "Vance", "elena.admin@school.edu", "ADMINISTRATOR", "ADMINISTRATOR"),
    ],
)
async def test_demo_login_returns_token_for_approved_real_user(
    client: AsyncClient,
    db_session,
    monkeypatch,
    user_id: str,
    first_name: str,
    last_name: str,
    email: str,
    role: str,
    user_type: str,
):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    user = User(
        id=user_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        hashed_password=hash_password("unchanged-test-password"),
        role=role,
        user_type=user_type,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": user.id},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["user"]["id"] == user.id
    assert body["user"]["email"] == user.email
    assert body["user"]["role"] == user.role
    assert "hashed_password" not in body["user"]

    token_payload = decode_access_token(body["access_token"])
    assert token_payload["sub"] == user.id
    me = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["id"] == user.id
    assert me.json()["email"] == user.email
    assert me.json()["role"] == user.role


async def test_demo_login_returns_404_for_missing_approved_user(
    client: AsyncClient, monkeypatch
):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    response = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": "usr_admin_005"},
    )
    assert response.status_code == 404


async def test_demo_login_rejects_inactive_approved_user(
    client: AsyncClient, db_session, monkeypatch
):
    monkeypatch.setattr(settings, "APP_ENV", "development")
    monkeypatch.setattr(settings, "FIXTRACK_DEMO_LOGIN_ENABLED", True)
    user = User(
        id="usr_admin_005",
        first_name="Elena",
        last_name="Vance",
        email="elena.admin@school.edu",
        hashed_password=hash_password("inactive-test-password"),
        role="ADMINISTRATOR",
        user_type="ADMINISTRATOR",
        is_active=False,
    )
    db_session.add(user)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/demo-login",
        json={"user_id": user.id},
    )
    assert response.status_code == 403
