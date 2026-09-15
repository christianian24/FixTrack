from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import require_roles
from ...db.session import get_db
from ...models.concern import Concern
from ...models.user import User

router = APIRouter()


@router.get("/summary")
async def analytics_summary(
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Count by status
    status_rows = await db.execute(
        select(Concern.status, func.count().label("count"))
        .group_by(Concern.status)
    )
    by_status = {row.status: row.count for row in status_rows}

    # Count by priority
    priority_rows = await db.execute(
        select(Concern.priority, func.count().label("count"))
        .group_by(Concern.priority)
    )
    by_priority = {row.priority: row.count for row in priority_rows}

    # Total
    total_result = await db.execute(select(func.count()).select_from(Concern))
    total = total_result.scalar() or 0

    # Open (not closed/rejected/verified)
    open_result = await db.execute(
        select(func.count()).select_from(Concern).where(
            Concern.status.not_in(["CLOSED", "REJECTED", "VERIFIED"])
        )
    )
    open_count = open_result.scalar() or 0

    return {
        "total": total,
        "open": open_count,
        "by_status": by_status,
        "by_priority": by_priority,
    }
