"""Create concern workflow notifications within the caller's transaction."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.notification import Notification


async def _notify(
    db: AsyncSession,
    *,
    recipient_user_id: str,
    title: str,
    message: str,
    notif_type: str,
    concern_id: str | None = None,
) -> None:
    """Add one notification; the lifecycle endpoint owns commit/rollback."""
    notif = Notification(
        user_id=recipient_user_id,
        title=title,
        message=message,
        type=notif_type,
        concern_id=concern_id,
    )
    db.add(notif)


async def create_notification(
    db: AsyncSession,
    *,
    recipient_user_id: str,
    concern_id: str | None,
    title: str,
    message: str,
    notification_type: str,
) -> None:
    await _notify(
        db,
        recipient_user_id=recipient_user_id,
        concern_id=concern_id,
        title=title,
        message=message,
        notif_type=notification_type,
    )


async def notify_concern_submitted(
    db: AsyncSession,
    *,
    supervisor_id: str,
    concern_id: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=supervisor_id,
        concern_id=concern_id,
        title="New Facility Concern",
        message="A new facility concern requires your review and assignment.",
        notification_type="ACTION_REQUIRED",
    )


async def notify_concern_reviewed(
    db: AsyncSession,
    *,
    reporter_id: str,
    concern_id: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=reporter_id,
        concern_id=concern_id,
        title="Concern Under Review",
        message="Your facility concern is now being reviewed by the maintenance team.",
        notification_type="STATUS_UPDATE",
    )


async def notify_concern_assigned(
    db: AsyncSession,
    *,
    personnel_id: str,
    reporter_id: str | None,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=personnel_id,
        title="New Work Order Assigned",
        message=f"You have been assigned to repair: \"{title}\" ({report_number}).",
        concern_id=concern_id,
        notification_type="ACTION_REQUIRED",
    )
    if reporter_id:
        await create_notification(
            db,
            recipient_user_id=reporter_id,
            title="Concern Assigned",
            message=f"Your concern {report_number} has been assigned to a technician.",
            concern_id=concern_id,
            notification_type="STATUS_UPDATE",
        )


async def notify_work_started(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=reporter_id,
        title="Repairs Started",
        message=f"Maintenance has begun on your concern: \"{title}\" ({report_number}).",
        concern_id=concern_id,
        notification_type="STATUS_UPDATE",
    )


async def notify_materials_hold(
    db: AsyncSession,
    *,
    supervisor_id: str | None,
    reporter_id: str | None,
    report_number: str,
    concern_id: str,
) -> None:
    if supervisor_id:
        await create_notification(
            db,
            recipient_user_id=supervisor_id,
            title="Maintenance Task Waiting for Materials",
            message=f"The maintenance task {report_number} is waiting for materials and requires your attention.",
            concern_id=concern_id,
            notification_type="ACTION_REQUIRED",
        )
    if reporter_id:
        await create_notification(
            db,
            recipient_user_id=reporter_id,
            title="Repair Temporarily On Hold",
            message=f"Work on your reported concern {report_number} is temporarily on hold while materials are being arranged.",
            concern_id=concern_id,
            notification_type="STATUS_UPDATE",
        )


async def notify_work_resumed(
    db: AsyncSession,
    *,
    reporter_id: str | None,
    report_number: str,
    concern_id: str,
) -> None:
    if reporter_id:
        await create_notification(
            db,
            recipient_user_id=reporter_id,
            title="Repair Resumed",
            message=f"Work has resumed on your reported facility concern {report_number}.",
            concern_id=concern_id,
            notification_type="STATUS_UPDATE",
        )


async def notify_work_completed(
    db: AsyncSession,
    *,
    reporter_id: str | None,
    supervisor_id: str | None,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    if reporter_id:
        await create_notification(
            db,
            recipient_user_id=reporter_id,
            title="Repair Completed",
            message=f"The repair for \"{title}\" ({report_number}) has been completed and is pending verification.",
            concern_id=concern_id,
            notification_type="STATUS_UPDATE",
        )
    if supervisor_id:
        await create_notification(
            db,
            recipient_user_id=supervisor_id,
            title="Maintenance Task Completed",
            message=f"The maintenance task {report_number} has been completed and is ready for verification.",
            concern_id=concern_id,
            notification_type="ACTION_REQUIRED",
        )


async def notify_concern_verified(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=reporter_id,
        title="Concern Resolved",
        message=f"Your reported facility concern {report_number} has been resolved.",
        concern_id=concern_id,
        notification_type="SUCCESS",
    )


async def notify_concern_rejected(
    db: AsyncSession,
    *,
    personnel_id: str,
    report_number: str,
    concern_id: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=personnel_id,
        title="Maintenance Task Requires Rework",
        message=f"The completed maintenance task {report_number} requires additional work. Please review the concern and continue the repair.",
        concern_id=concern_id,
        notification_type="ACTION_REQUIRED",
    )


async def notify_concern_closed(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
) -> None:
    await create_notification(
        db,
        recipient_user_id=reporter_id,
        title="Concern Closed",
        message=f"Your facility concern {report_number} has been closed.",
        concern_id=concern_id,
        notification_type="SUCCESS",
    )


async def notify_priority_changed(
    db: AsyncSession,
    *,
    report_number: str,
    priority: str,
    concern_id: str,
) -> None:
    if personnel_id:
        await create_notification(
            db,
            recipient_user_id=personnel_id,
            title="Maintenance Priority Updated",
            message=f"The priority of your assigned maintenance concern {report_number} has been changed to {priority.title()}.",
            concern_id=concern_id,
            notification_type="STATUS_UPDATE",
        )
