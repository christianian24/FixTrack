from __future__ import annotations

from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user, require_roles
from ...core.config import settings
from ...db.session import get_db
from ...models.user import User
from ...schemas.user import UserAdminUpdate, UserPublic, UserUpdate
from ...services.storage import save_upload

router = APIRouter()


def _user_type_for_role(role: str, requested: str | None = None) -> str:
    if role == "REPORTER":
        if requested in {None, "STUDENT", "FACULTY"}:
            return requested or "STUDENT"
        raise HTTPException(
            status_code=422,
            detail="Reporter accounts must use user type STUDENT or FACULTY.",
        )
    expected = {
        "MAINTENANCE_PERSONNEL": "MAINTENANCE",
        "MAINTENANCE_SUPERVISOR": "SUPERVISOR",
        "ADMINISTRATOR": "ADMINISTRATOR",
    }
    if role not in expected:
        raise HTTPException(status_code=422, detail=f"Unsupported role '{role}'.")
    return expected[role]


def _validate_role_user_type(role: str, user_type: str) -> None:
    if _user_type_for_role(role, user_type) != user_type:
        raise HTTPException(
            status_code=422,
            detail=f"User type '{user_type}' is not valid for role '{role}'.",
        )


@router.get("", response_model=list[UserPublic], include_in_schema=False)
@router.get("/", response_model=list[UserPublic])
async def list_users(
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR", "MAINTENANCE_SUPERVISOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).order_by(User.last_name))
    return [UserPublic.model_validate(u) for u in result.scalars()]


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(
    user_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic.model_validate(user)


@router.patch("/me", response_model=UserPublic)
async def update_me(
    payload: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, val)
    await db.flush()
    await db.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.post("/me/avatar", response_model=UserPublic)
async def update_my_avatar(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    try:
        avatar_url = await save_upload(file, subfolder="profiles")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    old_avatar_url = current_user.avatar_url
    current_user.avatar_url = avatar_url
    await db.flush()
    await db.refresh(current_user)

    if old_avatar_url and old_avatar_url.startswith("/uploads/profiles/"):
        old_path = Path(settings.UPLOAD_DIR) / "profiles" / Path(old_avatar_url).name
        if old_path.is_file():
            old_path.unlink()

    return UserPublic.model_validate(current_user)


@router.patch("/{user_id}", response_model=UserPublic)
async def admin_update_user(
    user_id: str,
    payload: UserAdminUpdate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    values = payload.model_dump(exclude_none=True)
    next_role = values.get("role", user.role)
    next_user_type = _user_type_for_role(
        next_role,
        values.get("user_type", user.user_type),
    )
    values["user_type"] = next_user_type
    if user.role == "ADMINISTRATOR" and (
        next_role != "ADMINISTRATOR" or values.get("is_active") is False
    ):
        result = await db.execute(
            select(User).where(
                User.role == "ADMINISTRATOR",
                User.is_active.is_(True),
            )
        )
        if len(result.scalars().all()) <= 1:
            raise HTTPException(
                status_code=409,
                detail="At least one active administrator account must remain.",
            )
    for field, val in values.items():
        setattr(user, field, val)
    await db.flush()
    await db.refresh(user)
    return UserPublic.model_validate(user)


@router.post("/{user_id}/avatar", response_model=UserPublic)
async def update_user_avatar(
    user_id: str,
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        avatar_url = await save_upload(file, subfolder="profiles")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    old_avatar_url = user.avatar_url
    user.avatar_url = avatar_url
    await db.flush()
    await db.refresh(user)

    if old_avatar_url and old_avatar_url.startswith("/uploads/profiles/"):
        old_path = Path(settings.UPLOAD_DIR) / "profiles" / Path(old_avatar_url).name
        if old_path.is_file():
            old_path.unlink()

    return UserPublic.model_validate(user)
