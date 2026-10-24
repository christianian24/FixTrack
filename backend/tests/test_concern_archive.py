"""Tests for concern soft deletion and active-workflow filtering."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.concern import Concern, ConcernPhoto, TimelineEvent
from app.models.notification import Notification
from app.models.user import User

pytestmark = pytest.mark.asyncio


async def _make_concern(
    db: AsyncSession,
    reporter_id: str,
    *,
    status: str = "SUBMITTED",
    assigned_to_id: str | None = None,
    with_records: bool = False,
) -> Concern:
    concern = Concern(
        tracking_number=f"FC-2026-{uuid.uuid4().hex[:8]}",
        title="Broken fixture in room",
        description="The fixture is broken and needs repair.",
        status=status,
        reporter_id=reporter_id,
        assigned_to_id=assigned_to_id,
    )
    db.add(concern)
    await db.flush()

    if with_records:
        db.add_all(
            [
                TimelineEvent(
                    concern_id=concern.id,
                    actor_id=reporter_id,
                    event_type="SUBMITTED",
                    note="Original history remains.",
                ),
                ConcernPhoto(
                    concern_id=concern.id,
                    url="/uploads/concerns/archive-test.jpg",
                    filename="archive-test.jpg",
                ),
            ]
        )
    await db.commit()
    await db.refresh(concern)
    return concern


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_reporter_can_archive_own_submitted_unassigned_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
):
    concern = await _make_concern(db_session, student_user.id)

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(
            await _token_for(client, student_user.email)
        )
    )

    assert response.status_code == 204
    await db_session.refresh(concern)
    assert concern.deleted_at is not None


async def _token_for(client: AsyncClient, email: str) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


async def test_reporter_cannot_archive_another_reporters_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
):
    other_reporter = User(
        id="other_reporter",
        first_name="Other",
        last_name="Reporter",
        email="other.reporter@test.edu",
        hashed_password=hash_password("test1234"),
        role="REPORTER",
        user_type="STUDENT",
        is_active=True,
    )
    db_session.add(other_reporter)
    await db_session.flush()
    concern = await _make_concern(db_session, other_reporter.id)

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}",
        headers=_headers(await _token_for(client, student_user.email)),
    )

    assert response.status_code == 403
    assert concern.deleted_at is None


@pytest.mark.parametrize("status", ["ASSIGNED", "IN_PROGRESS", "COMPLETED"])
async def test_reporter_cannot_archive_after_submission(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    student_token: str,
    status: str,
):
    concern = await _make_concern(db_session, student_user.id, status=status)

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(student_token)
    )

    assert response.status_code == 403
    assert concern.deleted_at is None


async def test_reporter_cannot_archive_submitted_concern_with_assignee(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    tech_user,
    student_token: str,
):
    concern = await _make_concern(
        db_session,
        student_user.id,
        assigned_to_id=tech_user.id,
    )

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(student_token)
    )

    assert response.status_code == 403
    assert concern.deleted_at is None


async def test_supervisor_can_archive_any_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    supervisor_token: str,
):
    concern = await _make_concern(db_session, student_user.id, status="IN_PROGRESS")

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(supervisor_token)
    )

    assert response.status_code == 204
    await db_session.refresh(concern)
    assert concern.deleted_at is not None


async def test_admin_can_archive_any_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
):
    concern = await _make_concern(db_session, student_user.id, status="CLOSED")

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(admin_token)
    )

    assert response.status_code == 204
    await db_session.refresh(concern)
    assert concern.deleted_at is not None


async def test_maintenance_personnel_cannot_archive(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    tech_token: str,
):
    concern = await _make_concern(db_session, student_user.id)

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(tech_token)
    )

    assert response.status_code == 403
    assert concern.deleted_at is None


async def test_archived_concern_is_hidden_but_records_are_preserved(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    supervisor_token: str,
    admin_token: str,
):
    concern = await _make_concern(
        db_session,
        student_user.id,
        with_records=True,
    )

    archived = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(supervisor_token)
    )
    listed = await client.get(
        "/api/v1/concerns", headers=_headers(admin_token)
    )
    stored = await db_session.get(Concern, concern.id)
    timeline_count = await db_session.scalar(
        select(func.count()).select_from(TimelineEvent).where(
            TimelineEvent.concern_id == concern.id
        )
    )
    photo_count = await db_session.scalar(
        select(func.count()).select_from(ConcernPhoto).where(
            ConcernPhoto.concern_id == concern.id
        )
    )

    assert archived.status_code == 204
    assert all(item["id"] != concern.id for item in listed.json())
    assert stored is not None and stored.deleted_at is not None
    assert timeline_count == 2
    assert photo_count == 1


async def test_already_archived_concern_is_not_archived_again(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
):
    concern = await _make_concern(db_session, student_user.id)
    concern.deleted_at = datetime.now(timezone.utc)
    await db_session.commit()

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(admin_token)
    )

    assert response.status_code == 409


async def test_archiving_nonexistent_concern_returns_404(
    client: AsyncClient,
    admin_token: str,
):
    response = await client.delete(
        "/api/v1/concerns/not-a-concern", headers=_headers(admin_token)
    )

    assert response.status_code == 404


async def test_archived_concern_cannot_be_assigned_or_started(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    tech_user,
    supervisor_token: str,
    tech_token: str,
):
    concern = await _make_concern(db_session, student_user.id)
    concern.assigned_to_id = tech_user.id
    await db_session.commit()
    archived = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(supervisor_token)
    )
    assert archived.status_code == 204

    assign_response = await client.post(
        f"/api/v1/concerns/{concern.id}/assign",
        json={"assigned_to_id": tech_user.id},
        headers=_headers(supervisor_token),
    )
    start_response = await client.post(
        f"/api/v1/concerns/{concern.id}/start",
        json={"note": "Start work"},
        headers=_headers(tech_token),
    )

    assert assign_response.status_code == 404
    assert start_response.status_code == 404


async def test_archived_concern_cannot_be_updated_or_advanced(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    tech_user,
    supervisor_token: str,
    admin_token: str,
    tech_token: str,
):
    concern = await _make_concern(
        db_session,
        student_user.id,
        assigned_to_id=tech_user.id,
    )
    archived = await client.delete(
        f"/api/v1/concerns/{concern.id}", headers=_headers(supervisor_token)
    )
    assert archived.status_code == 204

    operations = [
        ("patch", f"/api/v1/concerns/{concern.id}", {"priority": "HIGH"}, admin_token),
        ("post", f"/api/v1/concerns/{concern.id}/assign", {"assigned_to_id": tech_user.id}, supervisor_token),
        ("post", f"/api/v1/concerns/{concern.id}/start", {"note": "Start"}, tech_token),
        ("post", f"/api/v1/concerns/{concern.id}/hold", {"note": "Hold"}, tech_token),
        ("post", f"/api/v1/concerns/{concern.id}/complete", {"resolution_notes": "Completed repair notes."}, tech_token),
        ("post", f"/api/v1/concerns/{concern.id}/verify", {"note": "Verified"}, supervisor_token),
        ("post", f"/api/v1/concerns/{concern.id}/close", {"note": "Closed"}, supervisor_token),
        ("post", f"/api/v1/concerns/{concern.id}/reject", {"rejection_reason": "Needs rework"}, supervisor_token),
    ]
    responses = []
    for method, url, payload, token in operations:
        response = await client.request(
            method,
            url,
            json=payload,
            headers=_headers(token),
        )
        responses.append(response.status_code)

    assert responses == [404] * len(operations)


async def test_admin_can_list_only_archived_concerns_with_related_display_fields(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
):
    archived = await _make_concern(db_session, student_user.id)
    archived.deleted_at = datetime.now(timezone.utc)
    active = await _make_concern(db_session, student_user.id)
    await db_session.commit()

    response = await client.get(
        "/api/v1/concerns/archived",
        headers=_headers(admin_token),
    )

    assert response.status_code == 200
    records = response.json()
    assert [record["id"] for record in records] == [archived.id]
    assert records[0]["deleted_at"] is not None
    assert records[0]["reporter_name"] == "Test Student"
    assert active.id not in {record["id"] for record in records}


@pytest.mark.parametrize("role", ["reporter", "supervisor", "maintenance"])
async def test_non_admin_cannot_list_archived_concerns(
    client: AsyncClient,
    role: str,
    student_token: str,
    supervisor_token: str,
    tech_token: str,
):
    token = {
        "reporter": student_token,
        "supervisor": supervisor_token,
        "maintenance": tech_token,
    }[role]
    response = await client.get(
        "/api/v1/concerns/archived",
        headers=_headers(token),
    )
    assert response.status_code == 403


async def test_admin_can_restore_archived_concern_and_retain_history(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
):
    concern = await _make_concern(db_session, student_user.id, with_records=True)
    concern.deleted_at = datetime.now(timezone.utc)
    await db_session.commit()

    response = await client.patch(
        f"/api/v1/concerns/{concern.id}/restore",
        headers=_headers(admin_token),
    )
    active_list = await client.get(
        "/api/v1/concerns",
        headers=_headers(admin_token),
    )
    await db_session.refresh(concern)
    history_count = await db_session.scalar(
        select(func.count()).select_from(TimelineEvent).where(
            TimelineEvent.concern_id == concern.id
        )
    )
    photo_count = await db_session.scalar(
        select(func.count()).select_from(ConcernPhoto).where(
            ConcernPhoto.concern_id == concern.id
        )
    )
    restore_event = await db_session.scalar(
        select(TimelineEvent).where(
            TimelineEvent.concern_id == concern.id,
            TimelineEvent.event_type == "RESTORED",
        )
    )

    assert response.status_code == 200
    assert concern.deleted_at is None
    assert concern.id in {item["id"] for item in active_list.json()}
    assert history_count == 2
    assert photo_count == 1
    assert restore_event is not None
    assert restore_event.actor_id == "test_admin"


async def test_restore_rejects_active_missing_and_non_admin_concerns(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
    supervisor_token: str,
):
    active = await _make_concern(db_session, student_user.id)
    archived = await _make_concern(db_session, student_user.id)
    archived.deleted_at = datetime.now(timezone.utc)
    await db_session.commit()

    active_response = await client.patch(
        f"/api/v1/concerns/{active.id}/restore",
        headers=_headers(admin_token),
    )
    role_response = await client.patch(
        f"/api/v1/concerns/{archived.id}/restore",
        headers=_headers(supervisor_token),
    )
    missing_response = await client.patch(
        "/api/v1/concerns/missing/restore",
        headers=_headers(admin_token),
    )

    assert active_response.status_code == 409
    assert role_response.status_code == 403
    assert missing_response.status_code == 404


async def test_only_admin_can_permanently_delete_archived_concerns(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    supervisor_token: str,
):
    concern = await _make_concern(db_session, student_user.id)
    concern.deleted_at = datetime.now(timezone.utc)
    await db_session.commit()

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}/permanent",
        headers=_headers(supervisor_token),
    )

    assert response.status_code == 403
    assert await db_session.get(Concern, concern.id) is not None


async def test_permanent_delete_requires_archived_existing_concern(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
):
    active = await _make_concern(db_session, student_user.id)

    active_response = await client.delete(
        f"/api/v1/concerns/{active.id}/permanent",
        headers=_headers(admin_token),
    )
    missing_response = await client.delete(
        "/api/v1/concerns/missing/permanent",
        headers=_headers(admin_token),
    )

    assert active_response.status_code == 409
    assert await db_session.get(Concern, active.id) is not None
    assert missing_response.status_code == 404


async def test_admin_permanent_delete_removes_only_archived_records_and_managed_files(
    client: AsyncClient,
    db_session: AsyncSession,
    student_user,
    admin_token: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    photo_dir = tmp_path / "concerns"
    photo_dir.mkdir()
    photo_file = photo_dir / "archive-test.jpg"
    photo_file.write_bytes(b"test evidence")

    concern = await _make_concern(
        db_session,
        student_user.id,
        with_records=True,
    )
    concern.deleted_at = datetime.now(timezone.utc)
    other_concern = await _make_concern(db_session, student_user.id)
    db_session.add(
        Notification(
            user_id=student_user.id,
            concern_id=concern.id,
            title="Archived concern notification",
            message="This notification should remain without a concern link.",
            type="INFO",
        )
    )
    await db_session.commit()

    response = await client.delete(
        f"/api/v1/concerns/{concern.id}/permanent",
        headers=_headers(admin_token),
    )
    notification = await db_session.scalar(
        select(Notification).where(Notification.title == "Archived concern notification")
    )
    timeline_count = await db_session.scalar(
        select(func.count()).select_from(TimelineEvent).where(
            TimelineEvent.concern_id == concern.id
        )
    )
    photo_count = await db_session.scalar(
        select(func.count()).select_from(ConcernPhoto).where(
            ConcernPhoto.concern_id == concern.id
        )
    )

    assert response.status_code == 204
    assert await db_session.get(Concern, concern.id) is None
    assert await db_session.get(Concern, other_concern.id) is not None
    assert timeline_count == 0
    assert photo_count == 0
    assert notification is not None and notification.concern_id is None
    assert not photo_file.exists()
