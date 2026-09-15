"""Tests for concern lifecycle workflow."""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.facility import Building, Room
from app.models.category import FacilityCategory

pytestmark = pytest.mark.asyncio


async def _seed_facility(db: AsyncSession):
    bld = Building(id="bld_test", name="Test Building", code="TB", floors=3)
    rm = Room(
        id="rm_test", building_id="bld_test", name="Test Room 101",
        floor=1, room_type="Classroom", capacity=40,
    )
    cat = FacilityCategory(
        id="cat_test", name="Electrical Test",
        icon="Zap", priority_weight=7,
    )
    db.add_all([bld, rm, cat])
    await db.commit()


CONCERN_PAYLOAD = {
    "title": "Broken light fixture in Test Room",
    "description": "The main light in Test Room 101 is broken and flickering badly.",
    "category_id": "cat_test",
    "room_id": "rm_test",
    "is_safety_hazard": False,
    "affects_many_people": True,
}


async def test_student_can_submit_concern(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)

    resp = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "SUBMITTED"
    assert data["tracking_number"].startswith("FC-")


async def test_full_concern_lifecycle(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    tech_user,
    supervisor_token: str,
    tech_token: str,
):
    await _seed_facility(db_session)

    # 1. Submit
    resp = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 201
    concern_id = resp.json()["id"]

    # 2. Assign (supervisor)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": tech_user.id, "note": "Please fix ASAP"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ASSIGNED"

    # 3. Start (tech)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/start",
        json={"note": "Starting repairs now"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "IN_PROGRESS"

    # 4. Hold (tech)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/hold",
        json={"note": "Waiting for spare parts"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "WAITING_FOR_MATERIALS"

    # 5. Resume (tech)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/start",
        json={"note": "Parts arrived, resuming"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "IN_PROGRESS"

    # 6. Complete (tech)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/complete",
        json={"resolution_notes": "Replaced fluorescent tube and ballast. All working."},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETED"

    # 7. Verify (supervisor)
    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/verify",
        json={"note": "Confirmed fixed. Closing."},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "VERIFIED"


async def test_student_cannot_assign_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    tech_user,
):
    await _seed_facility(db_session)

    resp = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    concern_id = resp.json()["id"]

    resp = await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": tech_user.id},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403
