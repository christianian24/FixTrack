"""Tests for category creation and persistence."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_admin_can_create_category_without_description(
    client: AsyncClient, admin_token: str
):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "name": "Other",
        "icon": "Wrench",
        "color": "blue",
        "priority_weight": 5,
        "is_active": True,
    }
    created = await client.post("/api/v1/categories", json=payload, headers=headers)

    assert created.status_code == 201
    assert created.json()["name"] == "Other"
    assert created.json()["description"] is None
    assert created.json()["is_active"] is True
    assert created.json()["priority_weight"] == 5

    listed = await client.get("/api/v1/categories", headers=headers)
    assert any(category["id"] == created.json()["id"] for category in listed.json())

    duplicate = await client.post(
        "/api/v1/categories", json=payload, headers=headers
    )
    assert duplicate.status_code == 409
