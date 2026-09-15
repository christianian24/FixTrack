from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user, require_roles
from ...db.session import get_db
from ...models.facility import Room
from ...models.user import User
from ...schemas.facility import RoomCreate, RoomResponse, RoomUpdate

router = APIRouter()


@router.get("/", response_model=list[RoomResponse])
async def list_rooms(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    building_id: str | None = None,
):
    q = select(Room)
    if building_id:
        q = q.where(Room.building_id == building_id)
    result = await db.execute(q.order_by(Room.name))
    return [RoomResponse.model_validate(r) for r in result.scalars()]


@router.post("/", response_model=RoomResponse, status_code=201)
async def create_room(
    payload: RoomCreate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    room = Room(**payload.model_dump())
    db.add(room)
    await db.flush()
    await db.refresh(room)
    return RoomResponse.model_validate(room)


@router.patch("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: str,
    payload: RoomUpdate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(room, field, val)
    await db.flush()
    await db.refresh(room)
    return RoomResponse.model_validate(room)


@router.delete("/{room_id}", status_code=204)
async def delete_room(
    room_id: str,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Room).where(Room.id == room_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.delete(room)
