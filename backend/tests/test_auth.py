"""Tests for authentication endpoints."""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient

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
