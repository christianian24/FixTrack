"""Tests for concern lifecycle workflow."""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.facility import Building, Room
from app.models.category import FacilityCategory
from app.models.user import User
from app.core.security import hash_password

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


async def test_notification_workflow_targets_actual_recipients(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    student_user,
    supervisor_token: str,
    supervisor_user,
    tech_token: str,
    tech_user,
):
    await _seed_facility(db_session)
    other_tech = User(
        id="test_other_tech",
        first_name="Other",
        last_name="Tech",
        email="other-tech@test.edu",
        hashed_password=hash_password("test1234"),
        role="MAINTENANCE_PERSONNEL",
        user_type="MAINTENANCE",
        is_active=True,
    )
    db_session.add(other_tech)
    await db_session.commit()
    login_response = await client.post(
        "/api/v1/auth/login",
        data={"username": other_tech.email, "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login_response.status_code == 200
    other_tech_token = login_response.json()["access_token"]

    response = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 201
    concern_id = response.json()["id"]

    async def notifications_for(token: str):
        result = await client.get(
            "/api/v1/notifications/",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert result.status_code == 200
        return result.json()

    supervisor_notifications = await notifications_for(supervisor_token)
    assert any(
        item["concern_id"] == concern_id
        and item["title"] == "New Facility Concern"
        and item["user_id"] == supervisor_user.id
        for item in supervisor_notifications
    )
    assert not await notifications_for(tech_token)
    assert not await notifications_for(other_tech_token)

    response = await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": tech_user.id},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert response.status_code == 200
    technician_notifications = await notifications_for(tech_token)
    assert any(
        item["concern_id"] == concern_id
        and item["title"] == "New Work Order Assigned"
        and item["user_id"] == tech_user.id
        for item in technician_notifications
    )
    assert not await notifications_for(other_tech_token)

    response = await client.post(
        f"/api/v1/concerns/{concern_id}/start",
        json={"note": "Starting repair"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert response.status_code == 200
    response = await client.post(
        f"/api/v1/concerns/{concern_id}/hold",
        json={"note": "Waiting for replacement part"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert response.status_code == 200
    supervisor_notifications = await notifications_for(supervisor_token)
    assert any(
        item["concern_id"] == concern_id
        and item["title"] == "Maintenance Task Waiting for Materials"
        for item in supervisor_notifications
    )
    reporter_notifications = await notifications_for(student_token)
    assert any(item["concern_id"] == concern_id and item["title"] == "Repairs Started" for item in reporter_notifications)
    assert any(item["concern_id"] == concern_id and item["title"] == "Repair Temporarily On Hold" for item in reporter_notifications)

    response = await client.post(
        f"/api/v1/concerns/{concern_id}/start",
        json={"note": "Parts received"},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert response.status_code == 200
    response = await client.post(
        f"/api/v1/concerns/{concern_id}/complete",
        json={"resolution_notes": "Replaced the damaged fixture and tested the repair."},
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert response.status_code == 200
    supervisor_notifications = await notifications_for(supervisor_token)
    assert any(item["concern_id"] == concern_id and item["title"] == "Maintenance Task Completed" for item in supervisor_notifications)
    reporter_notifications = await notifications_for(student_token)
    assert any(item["concern_id"] == concern_id and item["title"] == "Repair Completed" for item in reporter_notifications)

    response = await client.post(
        f"/api/v1/concerns/{concern_id}/verify",
        json={"note": "Verified"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert response.status_code == 200
    reporter_notifications = await notifications_for(student_token)
    assert any(item["concern_id"] == concern_id and item["title"] == "Concern Resolved" for item in reporter_notifications)

    before_close = len(reporter_notifications)
    response = await client.post(
        f"/api/v1/concerns/{concern_id}/close",
        json={},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert response.status_code == 200
    assert len(await notifications_for(student_token)) == before_close


async def test_rework_notification_targets_assigned_technician(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    supervisor_token: str,
    tech_token: str,
    tech_user,
):
    await _seed_facility(db_session)
    response = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    concern_id = response.json()["id"]
    await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": tech_user.id},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )

    response = await client.post(
        f"/api/v1/concerns/{concern_id}/reject",
        json={"rejection_reason": "Additional work is required before acceptance."},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert response.status_code == 200
    result = await client.get(
        "/api/v1/notifications/",
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert any(
        item["concern_id"] == concern_id
        and item["title"] == "Maintenance Task Requires Rework"
        and item["user_id"] == tech_user.id
        for item in result.json()
    )
