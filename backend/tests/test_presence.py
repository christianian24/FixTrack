"""Tests for authenticated user presence tracking."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

pytestmark = pytest.mark.asyncio


async def test_heartbeat_requires_authentication(client: AsyncClient):
    response = await client.post("/api/v1/users/me/heartbeat")
    assert response.status_code == 401


async def test_heartbeat_updates_only_authenticated_user(
    client: AsyncClient,
    student_token: str,
    student_user,
    tech_user,
):
    response = await client.post(
        "/api/v1/users/me/heartbeat",
        json={"user_id": tech_user.id},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    assert response.json() == {"is_online": True}

    assert student_user.is_online is True
    assert tech_user.last_seen is None


async def test_user_listing_reports_online_and_offline_states(
    client: AsyncClient,
    admin_token: str,
    student_user,
    tech_user,
    db_session: AsyncSession,
):
    student_user.last_seen = datetime.now(timezone.utc)
    tech_user.last_seen = datetime.now(timezone.utc) - timedelta(minutes=3)
    await db_session.commit()

    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    users = {user["id"]: user for user in response.json()}
    assert users[student_user.id]["is_online"] is True
    assert users[tech_user.id]["is_online"] is False
    assert "last_seen" not in users[student_user.id]


async def test_inactive_user_is_never_reported_online(
    client: AsyncClient,
    admin_token: str,
    student_user,
    db_session: AsyncSession,
):
    student_user.is_active = False
    student_user.last_seen = datetime.now(timezone.utc)
    await db_session.commit()

    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    users = {user["id"]: user for user in response.json()}
    assert users[student_user.id]["is_online"] is False
