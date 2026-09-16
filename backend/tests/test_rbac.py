"""Tests for RBAC role-permission isolation."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_admin_can_list_users(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


async def test_student_cannot_list_users(client: AsyncClient, student_token: str):
    resp = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403


async def test_tech_cannot_list_users(client: AsyncClient, tech_token: str):
    resp = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert resp.status_code == 403


async def test_supervisor_can_list_users(client: AsyncClient, supervisor_token: str):
    resp = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert resp.status_code == 200


async def test_admin_role_change_is_returned_by_auth_me(
    client: AsyncClient,
    admin_token: str,
    tech_user,
):
    update = await client.patch(
        f"/api/v1/users/{tech_user.id}",
        json={"role": "REPORTER", "user_type": "FACULTY"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert update.status_code == 200

    login = await client.post(
        "/api/v1/auth/login",
        data={"username": tech_user.email, "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login.status_code == 200
    me = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["role"] == "REPORTER"
    assert me.json()["user_type"] == "FACULTY"


async def test_admin_role_change_derives_supervisor_affiliation(
    client: AsyncClient,
    admin_token: str,
    student_user,
):
    response = await client.patch(
        f"/api/v1/users/{student_user.id}",
        json={"role": "MAINTENANCE_SUPERVISOR", "user_type": "STUDENT"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["role"] == "MAINTENANCE_SUPERVISOR"
    assert response.json()["user_type"] == "SUPERVISOR"


async def test_admin_rejects_invalid_reporter_affiliation(
    client: AsyncClient,
    admin_token: str,
    student_user,
):
    response = await client.patch(
        f"/api/v1/users/{student_user.id}",
        json={"role": "REPORTER", "user_type": "SUPERVISOR"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 422


async def test_second_admin_allows_original_admin_to_change_role(
    client: AsyncClient,
    admin_token: str,
    admin_user,
    student_user,
):
    promote = await client.patch(
        f"/api/v1/users/{student_user.id}",
        json={"role": "ADMINISTRATOR"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert promote.status_code == 200
    assert promote.json()["user_type"] == "ADMINISTRATOR"

    demote = await client.patch(
        f"/api/v1/users/{admin_user.id}",
        json={"role": "MAINTENANCE_SUPERVISOR"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert demote.status_code == 200
    assert demote.json()["user_type"] == "SUPERVISOR"


async def test_normal_user_cannot_manage_own_role(client: AsyncClient, student_token: str, student_user):
    response = await client.patch(
        f"/api/v1/users/{student_user.id}",
        json={"role": "ADMINISTRATOR", "user_type": "ADMINISTRATOR"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 403


async def test_normal_user_cannot_manage_another_user_role(
    client: AsyncClient,
    student_token: str,
    tech_user,
):
    response = await client.patch(
        f"/api/v1/users/{tech_user.id}",
        json={"role": "REPORTER", "user_type": "STUDENT"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 403


async def test_last_active_administrator_cannot_be_removed(
    client: AsyncClient,
    admin_token: str,
    admin_user,
):
    response = await client.patch(
        f"/api/v1/users/{admin_user.id}",
        json={"is_active": False},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 409


async def test_admin_can_create_building(client: AsyncClient, admin_token: str):
    resp = await client.post(
        "/api/v1/buildings",
        json={"name": "New Block", "code": "NB", "floors": 3},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201


async def test_student_cannot_create_building(client: AsyncClient, student_token: str):
    resp = await client.post(
        "/api/v1/buildings",
        json={"name": "New Block", "code": "NB", "floors": 3},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403


async def test_unauthenticated_cannot_access_concerns(client: AsyncClient):
    resp = await client.get("/api/v1/concerns")
    assert resp.status_code == 401


async def test_analytics_requires_supervisor_or_admin(
    client: AsyncClient,
    student_token: str,
    supervisor_token: str,
    admin_token: str,
):
    student_resp = await client.get(
        "/api/v1/analytics/summary",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert student_resp.status_code == 403

    for token in (supervisor_token, admin_token):
        resp = await client.get(
            "/api/v1/analytics/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
