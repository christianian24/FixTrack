"""
Event-driven notification generator.

Called from concern lifecycle endpoints to persist in-app notifications
for all affected parties whenever a concern changes state.
"""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.notification import Notification


async def _notify(
    db: AsyncSession,
    *,
    user_id: str,
    title: str,
    message: str,
    notif_type: str,
    concern_id: str | None = None,
    report_number: str | None = None,
) -> None:
    """Persist a single notification record (fire-and-forget)."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        concern_id=concern_id,
        report_number=report_number,
    )
    db.add(notif)
    # Caller is responsible for commit


async def notify_concern_submitted(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await _notify(
        db,
        user_id=reporter_id,
        title="Concern Submitted",
        message=f"Your concern \"{title}\" has been received as {report_number}.",
        notif_type="CONCERN_SUBMITTED",
        concern_id=concern_id,
        report_number=report_number,
    )


async def notify_concern_assigned(
    db: AsyncSession,
    *,
    personnel_id: str,
    supervisor_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await _notify(
        db,
        user_id=personnel_id,
        title="New Work Order Assigned",
        message=f"You have been assigned to repair: \"{title}\" ({report_number}).",
        notif_type="ASSIGNED",
        concern_id=concern_id,
        report_number=report_number,
    )
    await _notify(
        db,
        user_id=supervisor_id,
        title="Assignment Confirmed",
        message=f"{report_number} assigned to maintenance personnel.",
        notif_type="ASSIGNED",
        concern_id=concern_id,
        report_number=report_number,
    )


async def notify_work_started(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await _notify(
        db,
        user_id=reporter_id,
        title="Repairs Started",
        message=f"Maintenance has begun on your concern: \"{title}\" ({report_number}).",
        notif_type="STATUS_UPDATE",
        concern_id=concern_id,
        report_number=report_number,
    )


async def notify_work_completed(
    db: AsyncSession,
    *,
    reporter_id: str,
    supervisor_id: str,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await _notify(
        db,
        user_id=reporter_id,
        title="Repair Completed",
        message=f"The repair for \"{title}\" ({report_number}) has been completed and is pending verification.",
        notif_type="STATUS_UPDATE",
        concern_id=concern_id,
        report_number=report_number,
    )
    await _notify(
        db,
        user_id=supervisor_id,
        title="Ready for Verification",
        message=f"{report_number} has been marked completed and requires your verification.",
        notif_type="VERIFICATION_NEEDED",
        concern_id=concern_id,
        report_number=report_number,
    )


async def notify_concern_verified(
    db: AsyncSession,
    *,
    reporter_id: str,
    personnel_id: str | None,
    report_number: str,
    concern_id: str,
    title: str,
) -> None:
    await _notify(
        db,
        user_id=reporter_id,
        title="Concern Closed",
        message=f"Your concern \"{title}\" ({report_number}) has been verified and closed.",
        notif_type="RESOLVED",
        concern_id=concern_id,
        report_number=report_number,
    )
    if personnel_id:
        await _notify(
            db,
            user_id=personnel_id,
            title="Work Order Verified",
            message=f"Your repair on {report_number} has been verified by the supervisor.",
            notif_type="RESOLVED",
            concern_id=concern_id,
            report_number=report_number,
        )


async def notify_concern_rejected(
    db: AsyncSession,
    *,
    reporter_id: str,
    report_number: str,
    concern_id: str,
    title: str,
    reason: str,
) -> None:
    await _notify(
        db,
        user_id=reporter_id,
        title="Concern Rejected",
        message=f"Your concern \"{title}\" ({report_number}) was rejected. Reason: {reason}",
        notif_type="REJECTED",
        concern_id=concern_id,
        report_number=report_number,
    )
