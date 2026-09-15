from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user, require_roles
from ...db.session import get_db
from ...models.user import User
from ...schemas.user import UserAdminUpdate, UserPublic, UserUpdate

router = APIRouter()


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
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(user, field, val)
    await db.flush()
    await db.refresh(user)
    return UserPublic.model_validate(user)
