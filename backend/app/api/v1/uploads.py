from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user
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
    return {"id": photo.id, "url": url, "filename": photo.filename}
