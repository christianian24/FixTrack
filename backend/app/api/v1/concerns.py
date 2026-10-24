from __future__ import annotations

from datetime import datetime, timezone
import logging
from pathlib import Path, PurePosixPath
import re
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...core.dependencies import get_current_user, require_roles
from ...core.config import settings
from ...db.session import get_db
from ...models.category import FacilityCategory
from ...models.concern import Concern, ConcernPhoto, TimelineEvent
from ...models.facility import Building, Room
from ...models.notification import Notification
from ...models.user import User
from ...schemas.concern import (
    ArchivedConcernDetail,
    ConcernAssign,
    ConcernComplete,
    ConcernCreate,
    ConcernDetail,
    ConcernReject,
    ConcernStatusUpdate,
    ConcernSummary,
    ConcernUpdate,
)
from ...services.duplicate_engine import find_duplicates
from ...services.notification_service import (
    notify_concern_assigned,
    notify_concern_closed,
    notify_concern_rejected,
    notify_concern_reviewed,
    notify_concern_submitted,
    notify_concern_verified,
    notify_materials_hold,
    notify_priority_changed,
    notify_work_completed,
    notify_work_resumed,
    notify_work_started,
)
from ...services.priority_engine import recommend_priority

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Helper: generate tracking number ─────────────────────────────────────────

async def _next_tracking_number(
    db: AsyncSession, *, after_sequence: int = 0
) -> str:
    year = datetime.now(timezone.utc).year
    result = await db.execute(
        select(Concern.tracking_number).where(
            Concern.tracking_number.like(f"FC-{year}-%")
        )
    )
    highest_sequence = after_sequence
    for tracking_number in result.scalars():
        match = re.fullmatch(rf"FC-{year}-(\d+)", tracking_number)
        if match:
            highest_sequence = max(highest_sequence, int(match.group(1)))
    return f"FC-{year}-{highest_sequence + 1:04d}"


def _is_tracking_number_collision(error: IntegrityError) -> bool:
    return "tracking_number" in str(error.orig).lower()


async def _responsible_supervisor_id(db: AsyncSession) -> str | None:
    result = await db.execute(
        select(User.id)
        .where(User.role == "MAINTENANCE_SUPERVISOR", User.is_active.is_(True))
        .order_by(User.id)
        .limit(1)
    )
    return result.scalar_one_or_none()


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


async def _validate_location(
    db: AsyncSession,
    building_id: str | None,
    room_id: str | None,
    other_location: str | None,
) -> None:
    if not building_id:
        raise HTTPException(status_code=422, detail="Building is required")

    building_result = await db.execute(
        select(Building).where(Building.id == building_id)
    )
    if building_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=422, detail="Building not found")

    if room_id is not None:
        room_result = await db.execute(select(Room).where(Room.id == room_id))
        room = room_result.scalar_one_or_none()
        if room is None:
            raise HTTPException(status_code=422, detail="Room not found")
        if room.building_id != building_id:
            raise HTTPException(
                status_code=422,
                detail="Room does not belong to the selected building",
            )
        if other_location is not None:
            raise HTTPException(
                status_code=422,
                detail="Other location must be empty when a room is selected",
            )
    elif not other_location or not other_location.strip():
        raise HTTPException(
            status_code=422,
            detail="Other location is required when no room is selected",
        )


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
    q = select(Concern).where(Concern.deleted_at.is_(None))

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
    await _validate_location(
        db, payload.building_id, payload.room_id, payload.other_location
    )

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

    after_sequence = 0
    while True:
        tracking = await _next_tracking_number(db, after_sequence=after_sequence)
        concern = Concern(
            tracking_number=tracking,
            title=payload.title,
            description=payload.description,
            category_id=payload.category_id,
            room_id=payload.room_id,
            building_id=payload.building_id,
            other_location=payload.other_location,
            reporter_id=current_user.id,
            priority=priority_label,
            priority_score=priority_score,
            is_safety_hazard=payload.is_safety_hazard,
            affects_many_people=payload.affects_many_people,
            is_recurring=payload.is_recurring,
        )
        try:
            async with db.begin_nested():
                db.add(concern)
                await db.flush()
            break
        except IntegrityError as error:
            if not _is_tracking_number_collision(error):
                raise
            after_sequence = int(tracking.rsplit("-", 1)[1])

    await _add_event(db, concern, current_user, "SUBMITTED", f"Concern submitted as {tracking}")
    if current_user.role == "REPORTER":
        supervisor_id = await _responsible_supervisor_id(db)
        if supervisor_id:
            await notify_concern_submitted(
                db, supervisor_id=supervisor_id, concern_id=concern.id
            )
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

@router.get(
    "/archived",
    response_model=list[ArchivedConcernDetail],
)
async def list_archived_concerns(
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Concern)
        .options(
            selectinload(Concern.photos),
            selectinload(Concern.timeline_events),
            selectinload(Concern.reporter),
            selectinload(Concern.assigned_to),
            selectinload(Concern.category),
        )
        .where(Concern.deleted_at.is_not(None))
        .order_by(Concern.deleted_at.desc())
    )
    archived = []
    for concern in result.scalars():
        record = ConcernDetail.model_validate(concern).model_dump()
        record.update(
            deleted_at=concern.deleted_at,
            reporter_name=(
                f"{concern.reporter.first_name} {concern.reporter.last_name}"
                if concern.reporter
                else None
            ),
            assigned_to_name=(
                f"{concern.assigned_to.first_name} {concern.assigned_to.last_name}"
                if concern.assigned_to
                else None
            ),
            category_name=concern.category.name if concern.category else None,
        )
        archived.append(ArchivedConcernDetail.model_validate(record))
    return archived


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
        .where(Concern.id == concern_id, Concern.deleted_at.is_(None))
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


@router.patch(
    "/{concern_id}/restore",
    response_model=ConcernDetail,
)
async def restore_concern(
    concern_id: str,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    restored_id = await db.scalar(
        update(Concern)
        .where(
            Concern.id == concern_id,
            Concern.deleted_at.is_not(None),
        )
        .values(deleted_at=None)
        .returning(Concern.id)
    )
    if restored_id is None:
        existing = await db.scalar(select(Concern.id).where(Concern.id == concern_id))
        if existing is None:
            raise HTTPException(status_code=404, detail="Concern not found")
        raise HTTPException(status_code=409, detail="Concern is already active")

    concern = await db.get(Concern, restored_id)
    if concern is None:
        raise HTTPException(status_code=404, detail="Concern not found")
    await _add_event(
        db,
        concern,
        current_user,
        "RESTORED",
        note="Concern restored to active records by an administrator.",
    )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)


def _managed_photo_path(url: str) -> Path | None:
    parts = PurePosixPath(url).parts
    if len(parts) != 4 or parts[:3] != ("/", "uploads", "concerns"):
        return None

    upload_root = (Path(settings.UPLOAD_DIR) / "concerns").resolve()
    path = upload_root / parts[3]
    if path.is_symlink() or path.resolve().parent != upload_root:
        return None
    return path


@router.delete(
    "/{concern_id}/permanent",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def permanently_delete_concern(
    concern_id: str,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Concern)
        .options(selectinload(Concern.photos))
        .where(Concern.id == concern_id)
    )
    concern = result.scalar_one_or_none()
    if concern is None:
        raise HTTPException(status_code=404, detail="Concern not found")
    if concern.deleted_at is None:
        raise HTTPException(
            status_code=409,
            detail="Only archived concerns can be permanently deleted.",
        )

    photo_urls = {photo.url for photo in concern.photos}
    shared_urls = set()
    if photo_urls:
        shared_urls = set(
            (
                await db.scalars(
                    select(ConcernPhoto.url).where(
                        ConcernPhoto.url.in_(photo_urls),
                        ConcernPhoto.concern_id != concern_id,
                    )
                )
            ).all()
        )
    physical_paths = {
        path
        for url in photo_urls - shared_urls
        if (path := _managed_photo_path(url)) is not None and path.is_file()
    }

    staged_files: list[tuple[Path, Path]] = []
    for path in physical_paths:
        staged_path = path.with_name(f".{path.name}.{uuid.uuid4().hex}.deleting")
        try:
            path.replace(staged_path)
        except OSError as exc:
            for original, staged in reversed(staged_files):
                if staged.exists():
                    staged.replace(original)
            raise HTTPException(
                status_code=500,
                detail="Unable to safely stage concern evidence for deletion.",
            ) from exc
        staged_files.append((path, staged_path))

    try:
        await db.execute(
            delete(TimelineEvent).where(TimelineEvent.concern_id == concern_id)
        )
        await db.execute(
            delete(ConcernPhoto).where(ConcernPhoto.concern_id == concern_id)
        )
        await db.execute(
            update(Notification)
            .where(Notification.concern_id == concern_id)
            .values(concern_id=None)
        )
        deleted_id = await db.scalar(
            delete(Concern)
            .where(
                Concern.id == concern_id,
                Concern.deleted_at.is_not(None),
            )
            .returning(Concern.id)
        )
        if deleted_id is None:
            raise HTTPException(
                status_code=409,
                detail="Concern is no longer archived and cannot be permanently deleted.",
            )
        await db.commit()
    except Exception:
        await db.rollback()
        restore_errors = []
        for original, staged in reversed(staged_files):
            if staged.exists():
                try:
                    staged.replace(original)
                except OSError as exc:
                    restore_errors.append(exc)
        if restore_errors:
            logger.error(
                "Could not restore staged evidence files after failed concern deletion: %s",
                restore_errors[0],
            )
            raise HTTPException(
                status_code=500,
                detail="Deletion failed and some staged evidence could not be restored.",
            ) from restore_errors[0]
        raise

    cleanup_errors = []
    for _, staged in staged_files:
        try:
            staged.unlink()
        except OSError as exc:
            cleanup_errors.append(exc)
    if cleanup_errors:
        logger.error(
            "Concern %s was permanently deleted, but staged evidence cleanup failed: %s",
            concern_id,
            cleanup_errors[0],
        )
        raise HTTPException(
            status_code=500,
            detail="Concern was deleted, but some associated evidence files could not be removed.",
        ) from cleanup_errors[0]
    return None


@router.delete("/{concern_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_concern(
    concern_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if current_user.role == "MAINTENANCE_PERSONNEL":
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user.role not in {
        "REPORTER",
        "MAINTENANCE_SUPERVISOR",
        "ADMINISTRATOR",
    }:
        raise HTTPException(status_code=403, detail="Access denied")

    archive_conditions = [
        Concern.id == concern_id,
        Concern.deleted_at.is_(None),
    ]
    if current_user.role == "REPORTER":
        archive_conditions.extend(
            [
                Concern.reporter_id == current_user.id,
                Concern.status == "SUBMITTED",
                Concern.assigned_to_id.is_(None),
            ]
        )

    archived_id = await db.scalar(
        update(Concern)
        .where(*archive_conditions)
        .values(deleted_at=datetime.now(timezone.utc))
        .returning(Concern.id)
    )
    if archived_id is None:
        existing_result = await db.execute(
            select(Concern).where(Concern.id == concern_id)
        )
        existing = existing_result.scalar_one_or_none()
        if existing is None:
            raise HTTPException(status_code=404, detail="Concern not found")
        if existing.deleted_at is not None:
            raise HTTPException(status_code=409, detail="Concern is already archived")
        if current_user.role == "REPORTER":
            raise HTTPException(
                status_code=403,
                detail="Only your own submitted, unassigned concerns can be archived.",
            )
        raise HTTPException(status_code=409, detail="Concern could not be archived")

    db.add(
        TimelineEvent(
            concern_id=archived_id,
            actor_id=current_user.id,
            event_type="ARCHIVED",
            note="Concern archived and removed from active records.",
        )
    )
    return None


@router.patch("/{concern_id}", response_model=ConcernDetail)
async def update_concern(
    concern_id: str,
    payload: ConcernUpdate,
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    location_fields = {"building_id", "room_id", "other_location"}
    if payload.model_fields_set & location_fields:
        updates = payload.model_dump(exclude_unset=True)
        updates = {
            field: value
            for field, value in updates.items()
            if value is not None or field in location_fields
        }
        next_room_id = updates.get("room_id", concern.room_id)
        next_building_id = updates.get("building_id", concern.building_id)
        next_other_location = updates.get("other_location", concern.other_location)

        if "room_id" in updates and "building_id" not in updates and next_room_id:
            room_result = await db.execute(select(Room).where(Room.id == next_room_id))
            room = room_result.scalar_one_or_none()
            if room is None:
                raise HTTPException(status_code=422, detail="Room not found")
            next_building_id = room.building_id
            if "other_location" not in updates:
                next_other_location = None

        await _validate_location(
            db, next_building_id, next_room_id, next_other_location
        )
        updates["room_id"] = next_room_id
        updates["building_id"] = next_building_id
        updates["other_location"] = next_other_location
    else:
        updates = payload.model_dump(exclude_none=True)
    old_priority = concern.priority
    for field, value in updates.items():
        setattr(concern, field, value)
    if "priority" in updates and updates["priority"] != old_priority:
        await _add_event(
            db,
            concern,
            current_user,
            "PRIORITY_CHANGED",
            note=f"Priority changed from {old_priority} to {updates['priority']}",
        )
        await notify_priority_changed(
            db,
            personnel_id=concern.assigned_to_id,
            report_number=concern.tracking_number,
            priority=updates["priority"],
            concern_id=concern.id,
        )
    await db.flush()
    await db.refresh(concern)
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    technician_result = await db.execute(
        select(User).where(
            User.id == payload.assigned_to_id,
            User.role == "MAINTENANCE_PERSONNEL",
            User.is_active.is_(True),
        )
    )
    if technician_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Maintenance personnel not found")

    old_status = concern.status
    previous_assignee_id = concern.assigned_to_id
    concern.assigned_to_id = payload.assigned_to_id
    concern.status = "ASSIGNED"
    concern.assigned_at = datetime.now(timezone.utc)
    await _add_event(
        db, concern, current_user, "ASSIGNED",
        note=payload.note or "Assigned to technician",
        old_status=old_status, new_status="ASSIGNED",
    )
    if old_status == "SUBMITTED" and concern.reporter_id:
        await notify_concern_reviewed(
            db, reporter_id=concern.reporter_id, concern_id=concern.id
        )
    if previous_assignee_id != payload.assigned_to_id:
        await notify_concern_assigned(
            db,
            personnel_id=payload.assigned_to_id,
            reporter_id=concern.reporter_id,
            report_number=concern.tracking_number,
            concern_id=concern.id,
            title=concern.title,
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
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
    if concern.reporter_id:
        if old_status == "WAITING_FOR_MATERIALS":
            await notify_work_resumed(
                db,
                reporter_id=concern.reporter_id,
                report_number=concern.tracking_number,
                concern_id=concern.id,
            )
        elif old_status == "ASSIGNED":
            await notify_work_started(
                db,
                reporter_id=concern.reporter_id,
                report_number=concern.tracking_number,
                concern_id=concern.id,
                title=concern.title,
            )
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "WAITING_FOR_MATERIALS"
    await _add_event(db, concern, current_user, "STATUS_CHANGE",
                     note=payload.note, old_status=old_status, new_status="WAITING_FOR_MATERIALS")
    supervisor_id = await _responsible_supervisor_id(db)
    await notify_materials_hold(
        db,
        supervisor_id=supervisor_id,
        reporter_id=concern.reporter_id,
        report_number=concern.tracking_number,
        concern_id=concern.id,
    )
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
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
    await notify_work_completed(
        db,
        reporter_id=concern.reporter_id,
        supervisor_id=await _responsible_supervisor_id(db),
        report_number=concern.tracking_number,
        concern_id=concern.id,
        title=concern.title,
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "VERIFIED"
    concern.verified_at = datetime.now(timezone.utc)
    await _add_event(db, concern, current_user, "VERIFIED",
                     note=payload.note or "Repair verified and accepted",
                     old_status=old_status, new_status="VERIFIED")
    if concern.reporter_id and old_status == "COMPLETED":
        await notify_concern_verified(
            db,
            reporter_id=concern.reporter_id,
            report_number=concern.tracking_number,
            concern_id=concern.id,
            title=concern.title,
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "CLOSED"
    concern.closed_at = datetime.now(timezone.utc)
    await _add_event(db, concern, current_user, "CLOSED",
                     note=payload.note, old_status=old_status, new_status="CLOSED")
    if concern.reporter_id and old_status != "VERIFIED":
        await notify_concern_closed(
            db,
            reporter_id=concern.reporter_id,
            report_number=concern.tracking_number,
            concern_id=concern.id,
        )
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
    result = await db.execute(
        select(Concern).where(
            Concern.id == concern_id, Concern.deleted_at.is_(None)
        )
    )
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")

    old_status = concern.status
    concern.status = "REJECTED"
    concern.rejection_reason = payload.rejection_reason
    await _add_event(db, concern, current_user, "REJECTED",
                     note=payload.rejection_reason, old_status=old_status, new_status="REJECTED")
    if concern.assigned_to_id:
        await notify_concern_rejected(
            db,
            personnel_id=concern.assigned_to_id,
            report_number=concern.tracking_number,
            concern_id=concern.id,
        )
    await db.flush()
    await db.refresh(concern)
    return ConcernDetail.model_validate(concern)
