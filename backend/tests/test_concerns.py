"""Tests for concern lifecycle workflow."""
from __future__ import annotations

import re
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1 import concerns as concerns_api
from app.models.concern import Concern
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
    "building_id": "bld_test",
    "room_id": "rm_test",
    "other_location": None,
    "is_safety_hazard": False,
    "affects_many_people": True,
}


async def _seed_tracking_numbers(
    db: AsyncSession,
    reporter_id: str,
    sequences: list[tuple[int, bool]],
) -> None:
    year = datetime.now(timezone.utc).year
    db.add_all(
        [
            Concern(
                tracking_number=f"FC-{year}-{sequence:04d}",
                title=f"Existing concern {sequence}",
                description="Existing concern for tracking-number test.",
                reporter_id=reporter_id,
                deleted_at=datetime.now(timezone.utc) if archived else None,
            )
            for sequence, archived in sequences
        ]
    )
    await db.flush()


async def _submit_concern(client: AsyncClient, token: str):
    return await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {token}"},
    )


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
    assert data["building_id"] == "bld_test"
    assert data["room_id"] == "rm_test"
    assert data["other_location"] is None
    assert data["building_name"] == "Test Building"
    assert data["building_code"] == "TB"
    assert data["room_name"] == "Test Room 101"
    assert data["room_floor"] == 1
    list_response = await client.get(
        "/api/v1/concerns/",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert list_response.status_code == 200
    assert list_response.json()[0]["building_name"] == "Test Building"


async def test_create_concern_uses_highest_existing_tracking_number(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    student_token: str,
):
    await _seed_facility(db_session)
    await _seed_tracking_numbers(
        db_session, student_user.id, [(1, False), (3, False), (14, False)]
    )

    response = await _submit_concern(client, student_token)

    assert response.status_code == 201, response.text
    generated_number = response.json()["tracking_number"]
    year = datetime.now(timezone.utc).year
    assert generated_number == f"FC-{year}-0015"
    assert re.fullmatch(r"FC-\d{4}-\d{4,}", generated_number)

    result = await db_session.execute(select(Concern.tracking_number))
    tracking_numbers = result.scalars().all()
    assert len(tracking_numbers) == len(set(tracking_numbers))


async def test_archived_concern_keeps_its_tracking_number_reserved(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    student_token: str,
):
    await _seed_facility(db_session)
    await _seed_tracking_numbers(
        db_session, student_user.id, [(8, False), (14, True)]
    )

    response = await _submit_concern(client, student_token)

    assert response.status_code == 201, response.text
    year = datetime.now(timezone.utc).year
    assert response.json()["tracking_number"] == f"FC-{year}-0015"


async def test_create_concern_retries_tracking_number_unique_collision(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    student_token: str,
    monkeypatch,
):
    await _seed_facility(db_session)
    await _seed_tracking_numbers(db_session, student_user.id, [(1, False)])

    original_generator = concerns_api._next_tracking_number
    year = datetime.now(timezone.utc).year
    calls = 0

    async def collide_once(db: AsyncSession, *, after_sequence: int = 0) -> str:
        nonlocal calls
        calls += 1
        if calls == 1:
            return f"FC-{year}-0001"
        return await original_generator(db, after_sequence=after_sequence)

    monkeypatch.setattr(concerns_api, "_next_tracking_number", collide_once)
    response = await _submit_concern(client, student_token)

    assert response.status_code == 201, response.text
    assert response.json()["tracking_number"] == f"FC-{year}-0002"
    assert calls == 2


async def test_other_location_concern_can_be_submitted(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    payload = {
        **CONCERN_PAYLOAD,
        "room_id": None,
        "other_location": "  Hallway beside Conference Room  ",
    }

    response = await client.post(
        "/api/v1/concerns/",
        json=payload,
        headers={"Authorization": f"Bearer {student_token}"},
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["building_id"] == "bld_test"
    assert data["building_name"] == "Test Building"
    assert data["building_code"] == "TB"
    assert data["room_id"] is None
    assert data["room_name"] is None
    assert data["other_location"] == "Hallway beside Conference Room"


async def test_other_location_without_text_is_rejected(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": None, "other_location": "  "},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_other_location_without_building_is_rejected(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    payload = {
        key: value for key, value in CONCERN_PAYLOAD.items()
        if key != "building_id"
    }
    payload.update(room_id=None, other_location="Hallway beside Conference Room")
    response = await client.post(
        "/api/v1/concerns/",
        json=payload,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_room_from_different_building_is_rejected(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    db_session.add_all([
        Building(id="bld_other", name="Other Building", code="OB", floors=1),
        Room(id="rm_other", building_id="bld_other", name="Other Room", floor=1),
    ])
    await db_session.commit()
    response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": "rm_other"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_unknown_room_is_rejected(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": "missing-room"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_unknown_building_is_rejected(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "building_id": "missing-building"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_normal_room_rejects_other_location_text(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "other_location": "Near the window"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 422


async def test_room_only_update_preserves_normal_location(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    supervisor_token: str,
):
    await _seed_facility(db_session)
    db_session.add(
        Room(
            id="rm_test_2",
            building_id="bld_test",
            name="Test Room 102",
            floor=1,
            room_type="Classroom",
        )
    )
    await db_session.commit()
    create_response = await client.post(
        "/api/v1/concerns/",
        json=CONCERN_PAYLOAD,
        headers={"Authorization": f"Bearer {student_token}"},
    )
    concern_id = create_response.json()["id"]

    response = await client.patch(
        f"/api/v1/concerns/{concern_id}",
        json={"room_id": "rm_test_2"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert response.status_code == 200
    assert response.json()["room_id"] == "rm_test_2"
    assert response.json()["building_id"] == "bld_test"
    assert response.json()["other_location"] is None


async def test_reporter_can_view_own_other_location_concern(
    client: AsyncClient, db_session: AsyncSession, student_token: str
):
    await _seed_facility(db_session)
    create_response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": None, "other_location": "North stairwell"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert create_response.status_code == 201

    response = await client.get(
        f"/api/v1/concerns/{create_response.json()['id']}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    assert response.json()["other_location"] == "North stairwell"


async def test_assigned_maintenance_personnel_can_view_other_location_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    supervisor_token: str,
    tech_token: str,
    tech_user: User,
):
    await _seed_facility(db_session)
    create_response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": None, "other_location": "North stairwell"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    concern_id = create_response.json()["id"]
    assign_response = await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": tech_user.id},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert assign_response.status_code == 200

    response = await client.get(
        f"/api/v1/concerns/{concern_id}",
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert response.status_code == 200
    assert response.json()["other_location"] == "North stairwell"


async def test_supervisor_and_administrator_can_view_other_location_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    supervisor_token: str,
    admin_token: str,
):
    await _seed_facility(db_session)
    create_response = await client.post(
        "/api/v1/concerns/",
        json={**CONCERN_PAYLOAD, "room_id": None, "other_location": "North stairwell"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    concern_id = create_response.json()["id"]

    for token in (supervisor_token, admin_token):
        response = await client.get(
            f"/api/v1/concerns/{concern_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["other_location"] == "North stairwell"


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
