"""Tests for safe administrator account deletion."""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest
from httpx import AsyncClient
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import (
    Column,
    ForeignKey,
    MetaData,
    String,
    Table,
    create_engine,
    event,
    inspect,
    select,
    text,
)
from sqlalchemy.exc import IntegrityError

from app.models.concern import Concern, TimelineEvent
from app.models.notification import Notification
from app.models.user import User

pytestmark = pytest.mark.asyncio


async def test_notification_user_foreign_key_prevents_cascade_delete():
    user_foreign_key = next(
        foreign_key
        for foreign_key in Notification.__table__.foreign_keys
        if foreign_key.parent.name == "user_id"
    )

    assert user_foreign_key.ondelete == "RESTRICT"


async def test_notification_fk_migration_is_reversible_and_preserves_rows():
    migration_path = (
        Path(__file__).parents[1]
        / "alembic"
        / "versions"
        / "20261010_1200_restrict_notification_user_delete.py"
    )
    spec = importlib.util.spec_from_file_location(
        "notification_delete_migration", migration_path
    )
    migration = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(migration)

    engine = create_engine("sqlite://")
    event.listen(
        engine,
        "connect",
        lambda connection, _: connection.execute("PRAGMA foreign_keys=ON"),
    )
    metadata = MetaData()
    Table("users", metadata, Column("id", String(36), primary_key=True))
    Table(
        "notifications",
        metadata,
        Column("id", String(36), primary_key=True),
        Column(
            "user_id",
            String(36),
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
    )

    with engine.begin() as connection:
        metadata.create_all(connection)
        connection.execute(text("INSERT INTO users (id) VALUES ('user-1')"))
        connection.execute(
            text(
                "INSERT INTO notifications (id, user_id) "
                "VALUES ('notification-1', 'user-1')"
            )
        )
        migration.op = Operations(MigrationContext.configure(connection))
        migration.upgrade()

        user_fk = inspect(connection).get_foreign_keys("notifications")[0]
        assert user_fk["options"]["ondelete"] == "RESTRICT"
        assert connection.execute(
            text("SELECT COUNT(*) FROM notifications")
        ).scalar_one() == 1
        with pytest.raises(IntegrityError):
            connection.execute(text("DELETE FROM users WHERE id = 'user-1'"))

        migration.op = Operations(MigrationContext.configure(connection))
        migration.downgrade()
        user_fk = inspect(connection).get_foreign_keys("notifications")[0]
        assert user_fk["options"]["ondelete"] == "CASCADE"

    engine.dispose()


async def test_admin_can_delete_eligible_account(
    client: AsyncClient,
    admin_token: str,
    student_user: User,
    db_session,
):
    response = await client.delete(
        f"/api/v1/users/{student_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 204
    assert await db_session.get(User, student_user.id) is None


async def test_reporter_cannot_delete_account(
    client: AsyncClient,
    student_token: str,
    admin_user: User,
):
    response = await client.delete(
        f"/api/v1/users/{admin_user.id}",
        headers={"Authorization": f"Bearer {student_token}"},
    )

    assert response.status_code == 403


async def test_maintenance_personnel_cannot_delete_account(
    client: AsyncClient,
    tech_token: str,
    admin_user: User,
):
    response = await client.delete(
        f"/api/v1/users/{admin_user.id}",
        headers={"Authorization": f"Bearer {tech_token}"},
    )

    assert response.status_code == 403


async def test_supervisor_cannot_delete_account(
    client: AsyncClient,
    supervisor_token: str,
    admin_user: User,
):
    response = await client.delete(
        f"/api/v1/users/{admin_user.id}",
        headers={"Authorization": f"Bearer {supervisor_token}"},
    )

    assert response.status_code == 403


async def test_unauthenticated_user_cannot_delete_account(
    client: AsyncClient,
    student_user: User,
):
    response = await client.delete(f"/api/v1/users/{student_user.id}")

    assert response.status_code == 401


async def test_admin_cannot_delete_own_account(
    client: AsyncClient,
    admin_token: str,
    admin_user: User,
    db_session,
):
    response = await client.delete(
        f"/api/v1/users/{admin_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 403
    assert await db_session.get(User, admin_user.id) is not None


async def test_deleting_nonexistent_account_returns_404(
    client: AsyncClient,
    admin_token: str,
):
    response = await client.delete(
        "/api/v1/users/not-a-real-account",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found."


async def test_protected_notifications_block_deletion(
    client: AsyncClient,
    admin_token: str,
    student_user: User,
    db_session,
):
    notification = Notification(
        id="protected_notification",
        user_id=student_user.id,
        title="Historical notice",
        message="Keep this notification.",
    )
    db_session.add(notification)
    await db_session.commit()

    response = await client.delete(
        f"/api/v1/users/{student_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 409
    assert "notifications that must be retained" in response.json()["detail"]
    assert await db_session.get(User, student_user.id) is not None
    assert await db_session.get(Notification, notification.id) is not None


async def test_concerns_and_timeline_history_survive_account_deletion(
    client: AsyncClient,
    admin_token: str,
    student_user: User,
    tech_user: User,
    db_session,
):
    concern = Concern(
        id="historical_concern",
        tracking_number="FC-TEST-0001",
        title="Historical facility concern",
        description="Concern retained after account removal.",
        status="SUBMITTED",
        priority="MEDIUM",
        reporter_id=student_user.id,
        assigned_to_id=tech_user.id,
    )
    reporter_event = TimelineEvent(
        id="historical_reporter_event",
        concern_id=concern.id,
        actor_id=student_user.id,
        event_type="SUBMITTED",
    )
    technician_event = TimelineEvent(
        id="historical_technician_event",
        concern_id=concern.id,
        actor_id=tech_user.id,
        event_type="ASSIGNED",
    )
    db_session.add_all([concern, reporter_event, technician_event])
    await db_session.commit()

    reporter_response = await client.delete(
        f"/api/v1/users/{student_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    technician_response = await client.delete(
        f"/api/v1/users/{tech_user.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert reporter_response.status_code == 204
    assert technician_response.status_code == 204
    assert await db_session.get(User, student_user.id) is None
    assert await db_session.get(User, tech_user.id) is None
    saved_concern = await db_session.get(Concern, concern.id)
    saved_reporter_event = await db_session.get(TimelineEvent, reporter_event.id)
    saved_technician_event = await db_session.get(TimelineEvent, technician_event.id)
    assert saved_concern is not None
    assert saved_concern.reporter_id is None
    assert saved_concern.assigned_to_id is None
    assert saved_reporter_event is not None
    assert saved_reporter_event.actor_id is None
    assert saved_technician_event is not None
    assert saved_technician_event.actor_id is None


async def test_database_integrity_failure_returns_safe_conflict(
    client: AsyncClient,
    admin_token: str,
    student_user: User,
    db_session,
    monkeypatch,
):
    student_id = student_user.id
    original_flush = db_session.flush

    async def fail_flush(*args, **kwargs):
        if db_session.deleted:
            raise IntegrityError(
                "DELETE FROM users",
                {},
                RuntimeError("sensitive database details"),
            )
        await original_flush(*args, **kwargs)

    monkeypatch.setattr(db_session, "flush", fail_flush)
    response = await client.delete(
        f"/api/v1/users/{student_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    monkeypatch.undo()

    assert response.status_code == 409
    assert "protected records" in response.json()["detail"]
    assert "sensitive database details" not in response.text
    assert await db_session.get(User, student_id) is not None
