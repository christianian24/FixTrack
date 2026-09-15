from __future__ import annotations

import csv
import io
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import require_roles
from ...db.session import get_db
from ...models.concern import Concern
from ...models.user import User

router = APIRouter()


@router.get("/concerns/csv")
async def export_concerns_csv(
    current_user: Annotated[
        User, Depends(require_roles("MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"))
    ],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Stream a CSV export of all concerns."""
    result = await db.execute(select(Concern).order_by(Concern.submitted_at.desc()))
    concerns = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Tracking Number", "Title", "Status", "Priority", "Priority Score",
        "Safety Hazard", "Affects Many", "Recurring",
        "Reporter ID", "Assigned To ID", "Category ID", "Room ID",
        "Submitted At", "Completed At", "Verified At",
    ])
    for c in concerns:
        writer.writerow([
            c.tracking_number, c.title, c.status, c.priority, c.priority_score,
            c.is_safety_hazard, c.affects_many_people, c.is_recurring,
            c.reporter_id, c.assigned_to_id, c.category_id, c.room_id,
            c.submitted_at, c.completed_at, c.verified_at,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fixtrack_concerns_export.csv"},
    )
