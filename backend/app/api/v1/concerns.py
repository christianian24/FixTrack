from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...core.dependencies import get_current_user, require_roles
from ...db.session import get_db
from ...models.category import FacilityCategory
from ...models.concern import Concern, ConcernPhoto, TimelineEvent
from ...models.notification import Notification
from ...models.user import User
from ...schemas.concern import (
    ConcernAssign,
    ConcernComplete,
    ConcernCreate,
    ConcernDetail,
    ConcernReject,
    ConcernStatusUpdate,
    ConcernSummary,
)
from ...services.duplicate_engine import find_duplicates
from ...services.priority_engine import recommend_priority

router = APIRouter()


# ── Helper: generate tracking number ─────────────────────────────────────────

async def _next_tracking_number(db: AsyncSession) -> str:
    year = datetime.now(timezone.utc).year
    result = await db.execute(
        select(func.count()).select_from(Concern)
        .where(Concern.tracking_number.like(f"FC-{year}-%"))
    )
    count = result.scalar() or 0
    return f"FC-{year}-{count + 1:04d}"


# ── Helper: add timeline event + optional notification ────────────────────────

async def _add_event(
    db: AsyncSession,
    concern: Concern,
    actor: User,
    event_type: str,
    note: str | None = None,
    old_status: str | None = None,
    new_status: str | None = None,
):
    event = TimelineEvent(
        concern_id=concern.id,
        actor_id=actor.id,
        event_type=event_type,
        old_status=old_status,
        new_status=new_status,
        note=note,
    )
    db.add(event)


async def _notify_user(
    db: AsyncSession,
    user_id: str,
    concern: Concern,
    title: str,
    message: str,
    notif_type: str = "INFO",
):
    notif = Notification(
        user_id=user_id,
        concern_id=concern.id,
        title=title,
        message=message,
        type=notif_type,
    )
    db.add(notif)


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ConcernSummary], include_in_schema=False)
@router.get("/", response_model=list[ConcernSummary])
async def list_concerns(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str | None = None,
    priority: str | None = None,
    assigned_to_me: bool = False,
):
    q = select(Concern)

    # RBAC filter: reporters only see their own concerns
    if current_user.role == "REPORTER":
        q = q.where(Concern.reporter_id == current_user.id)
    elif current_user.role == "MAINTENANCE_PERSONNEL":
        q = q.where(Concern.assigned_to_id == current_user.id)

    if status:
        q = q.where(Concern.status == status)
    if priority:
        q = q.where(Concern.priority == priority)
    if assigned_to_me:
        q = q.where(Concern.assigned_to_id == current_user.id)

    q = q.order_by(Concern.submitted_at.desc())
    result = await db.execute(q)
    return [ConcernSummary.model_validate(c) for c in result.scalars()]


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=ConcernDetail, status_code=201, include_in_schema=False)
@router.post("/", response_model=ConcernDetail, status_code=201)
async def create_concern(
    payload: ConcernCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Priority engine
    cat_weight = 5
    if payload.category_id:
        cat_result = await db.execute(
            select(FacilityCategory).where(FacilityCategory.id == payload.category_id)
        )
        cat = cat_result.scalar_one_or_none()
        if cat:
            cat_weight = cat.priority_weight

    priority_label, priority_score = recommend_priority(
        is_safety_hazard=payload.is_safety_hazard,
        affects_many_people=payload.affects_many_people,
        is_recurring=payload.is_recurring,
        category_weight=cat_weight,
    )

    tracking = await _next_tracking_number(db)
    concern = Concern(
        tracking_number=tracking,
        title=payload.title,
        description=payload.description,
        category_id=payload.category_id,
        room_id=payload.room_id,
        reporter_id=current_user.id,
        priority=priority_label,
        priority_score=priority_score,
        is_safety_hazard=payload.is_safety_hazard,
        affects_many_people=payload.affects_many_people,
        is_recurring=payload.is_recurring,
    )
    db.add(concern)
    await db.flush()
    await _add_event(db, concern, current_user, "SUBMITTED", f"Concern submitted as {tracking}")
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


# ── Check duplicates (pre-submission) ─────────────────────────────────────────

@router.get("/check-duplicate")
async def check_duplicate(
    title: str,
    room_id: str | None = None,
    category_id: str | None = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    matches = await find_duplicates(db, title, room_id, category_id)
    return {
        "has_duplicates": len(matches) > 0,
        "matches": [
            {
                "concern_id": m.concern_id,
                "tracking_number": m.tracking_number,
                "title": m.title,
                "similarity": m.similarity,
                "reason": m.reason,
            }
            for m in matches
        ],
    }


# ── Get detail ────────────────────────────────────────────────────────────────

@router.get("/{concern_id}", response_model=ConcernDetail)
async def get_concern(
    concern_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Concern)
        .options(
            selectinload(Concern.photos),
            selectinload(Concern.timeline_events),
        )
        .where(Concern.id == concern_id)
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    # Access control
    if current_user.role == "REPORTER" and concern.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if (
        current_user.role == "MAINTENANCE_PERSONNEL"
        and concern.assigned_to_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return ConcernDetail.model_validate(concern)


# ── Workflow transitions ───────────────────────────────────────────────────────

@router.post("/{concern_id}/assign", response_model=ConcernDetail)
async def assign_concern(
    concern_id: str,
    payload: ConcernAssign,
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.assigned_to_id = payload.assigned_to_id
    concern.status = "ASSIGNED"
    concern.assigned_at = datetime.now(timezone.utc)
    await _add_event(
        db, concern, current_user, "ASSIGNED",
        note=payload.note or "Assigned to technician",
        old_status=old_status, new_status="ASSIGNED",
    )
    # Notify reporter
    await _notify_user(
        db, concern.reporter_id, concern,
        title="Concern Assigned",
        message=f"Your concern {concern.tracking_number} has been assigned to a technician.",
        notif_type="INFO",
    )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/start", response_model=ConcernDetail)
async def start_concern(
    concern_id: str,
    payload: ConcernStatusUpdate,
    current_user: Annotated[User, Depends(require_roles("MAINTENANCE_PERSONNEL"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")
    if concern.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your work order")

    old_status = concern.status
    concern.status = "IN_PROGRESS"
    concern.started_at = datetime.now(timezone.utc)
    await _add_event(db, concern, current_user, "STATUS_CHANGE",
                     note=payload.note or "Work started", old_status=old_status, new_status="IN_PROGRESS")
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/hold", response_model=ConcernDetail)
async def hold_concern(
    concern_id: str,
    payload: ConcernStatusUpdate,
    current_user: Annotated[User, Depends(require_roles("MAINTENANCE_PERSONNEL"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "WAITING_FOR_MATERIALS"
    await _add_event(db, concern, current_user, "STATUS_CHANGE",
                     note=payload.note, old_status=old_status, new_status="WAITING_FOR_MATERIALS")
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/complete", response_model=ConcernDetail)
async def complete_concern(
    concern_id: str,
    payload: ConcernComplete,
    current_user: Annotated[User, Depends(require_roles("MAINTENANCE_PERSONNEL"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")
    if concern.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your work order")

    old_status = concern.status
    concern.status = "COMPLETED"
    concern.completed_at = datetime.now(timezone.utc)
    concern.resolution_notes = payload.resolution_notes
    await _add_event(db, concern, current_user, "STATUS_CHANGE",
                     note=payload.resolution_notes, old_status=old_status, new_status="COMPLETED")
    # Notify supervisor
    if concern.reporter_id:
        await _notify_user(
            db, concern.reporter_id, concern,
            title="Work Completed — Pending Verification",
            message=f"Repair on {concern.tracking_number} is complete and awaiting verification.",
            notif_type="SUCCESS",
        )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/verify", response_model=ConcernDetail)
async def verify_concern(
    concern_id: str,
    payload: ConcernStatusUpdate,
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "VERIFIED"
    concern.verified_at = datetime.now(timezone.utc)
    await _add_event(db, concern, current_user, "VERIFIED",
                     note=payload.note or "Repair verified and accepted",
                     old_status=old_status, new_status="VERIFIED")
    if concern.reporter_id:
        await _notify_user(
            db, concern.reporter_id, concern,
            title="Concern Resolved ✓",
            message=f"Your concern {concern.tracking_number} has been verified and resolved.",
            notif_type="SUCCESS",
        )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/close", response_model=ConcernDetail)
async def close_concern(
    concern_id: str,
    payload: ConcernStatusUpdate,
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "CLOSED"
    concern.closed_at = datetime.now(timezone.utc)
    await _add_event(db, concern, current_user, "CLOSED",
                     note=payload.note, old_status=old_status, new_status="CLOSED")
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


@router.post("/{concern_id}/reject", response_model=ConcernDetail)
async def reject_concern(
    concern_id: str,
    payload: ConcernReject,
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "REJECTED"
    concern.rejection_reason = payload.rejection_reason
    await _add_event(db, concern, current_user, "REJECTED",
                     note=payload.rejection_reason, old_status=old_status, new_status="REJECTED")
    if concern.reporter_id:
        await _notify_user(
            db, concern.reporter_id, concern,
            title="Concern Not Approved",
            message=f"Your concern {concern.tracking_number} was not approved: {payload.rejection_reason}",
            notif_type="WARNING",
        )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)
