from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user
from ...core.config import settings
from ...db.session import get_db
from ...models.concern import Concern, ConcernPhoto
from ...models.user import User
from ...services.storage import save_upload

router = APIRouter()


@router.post("/photo", status_code=201)
async def upload_photo(
    concern_id: str,
    file: UploadFile = File(...),
    is_completion_photo: bool = False,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    # Verify concern exists
    result = await db.execute(select(Concern).where(Concern.id == concern_id))
    concern = result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")
    if concern.status == "CLOSED":
        raise HTTPException(
            status_code=409,
            detail="Photo evidence is immutable after a concern is closed.",
        )
    if is_completion_photo and (
        current_user.role != "MAINTENANCE_PERSONNEL"
        or concern.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Only the assigned maintenance technician can upload completion evidence.",
        )

    try:
        url = await save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    photo = ConcernPhoto(
        concern_id=concern_id,
        url=url,
        filename=file.filename,
        is_completion_photo=is_completion_photo,
    )
    db.add(photo)
    await db.flush()
    await db.refresh(photo)
    return {
        "id": photo.id,
        "url": url,
        "filename": photo.filename,
        "is_completion_photo": photo.is_completion_photo,
        "uploaded_at": photo.uploaded_at,
    }


@router.delete("/photo/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(ConcernPhoto).where(ConcernPhoto.id == photo_id)
    )
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    concern_result = await db.execute(
        select(Concern).where(Concern.id == photo.concern_id)
    )
    concern = concern_result.scalar_one_or_none()
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")
    if concern.status == "CLOSED":
        raise HTTPException(
            status_code=409,
            detail="Photo evidence is immutable after a concern is closed.",
        )
    if current_user.role == "MAINTENANCE_PERSONNEL":
        if concern.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your work order")
    elif current_user.role not in {"MAINTENANCE_SUPERVISOR", "ADMINISTRATOR"}:
        raise HTTPException(status_code=403, detail="Photo deletion is not permitted")

    stored_path = Path(settings.UPLOAD_DIR) / "concerns" / Path(photo.url).name
    if stored_path.is_file():
        stored_path.unlink()
    await db.delete(photo)
