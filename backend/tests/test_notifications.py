"""Tests for authenticated notification ownership and transaction boundaries."""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification

pytestmark = pytest.mark.asyncio


async def test_notifications_are_user_scoped_and_read_operations_are_isolated(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    student_token: str,
    tech_user,
    tech_token: str,
):
    student_notification = Notification(
        user_id=student_user.id,
        title="Student notice",
        message="For the student only.",
        type="STATUS_UPDATE",
    )
    technician_notification = Notification(
        user_id=tech_user.id,
        title="Technician notice",
        message="For the technician only.",
        type="ACTION_REQUIRED",
    )
    db_session.add_all([student_notification, technician_notification])
    await db_session.commit()

    student_response = await client.get(
        "/api/v1/notifications/",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert [item["user_id"] for item in student_response.json()] == [student_user.id]

    cross_read = await client.post(
        f"/api/v1/notifications/{student_notification.id}/read",
        headers={"Authorization": f"Bearer {tech_token}"},
    )
    assert cross_read.status_code == 404

    mark_all = await client.post(
        "/api/v1/notifications/read-all",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert mark_all.status_code == 204
    await db_session.refresh(student_notification)
    await db_session.refresh(technician_notification)
    assert student_notification.is_read is True
    assert technician_notification.is_read is False


async def test_failed_assignment_creates_no_notification(
    client: AsyncClient,
    db_session: AsyncSession,
    student_token: str,
    supervisor_token: str,
    supervisor_user,
):
    from app.models.category import FacilityCategory
    from app.models.facility import Building, Room

    db_session.add_all([
        Building(id="bld_notification", name="Notification Building", code="NB", floors=1),
        Room(id="rm_notification", building_id="bld_notification", name="Room 1", floor=1),
        FacilityCategory(id="cat_notification", name="Notification Category", icon="Zap", priority_weight=5),
    ])
    await db_session.commit()

    response = await client.post(
        "/api/v1/concerns/",
        json={
            "title": "Broken fixture in notification room",
            "description": "The fixture is broken and needs maintenance attention.",
            "category_id": "cat_notification",
            "room_id": "rm_notification",
            "is_safety_hazard": False,
            "affects_many_people": False,
        },
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 201
    concern_id = response.json()["id"]

    failed = await client.post(
        f"/api/v1/concerns/{concern_id}/assign",
        json={"assigned_to_id": "missing-maintenance-user"},
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )
    assert failed.status_code == 404

    result = await db_session.execute(
        select(Notification).where(Notification.concern_id == concern_id)
    )
    notifications = list(result.scalars())
    assert len(notifications) == 1
    assert notifications[0].user_id == supervisor_user.id