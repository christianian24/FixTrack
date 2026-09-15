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
