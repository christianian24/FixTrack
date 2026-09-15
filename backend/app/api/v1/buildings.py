from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user, require_roles
from ...db.session import get_db
from ...models.facility import Building
from ...schemas.facility import BuildingCreate, BuildingResponse, BuildingUpdate
from ...models.user import User

router = APIRouter()


@router.get("", response_model=list[BuildingResponse], include_in_schema=False)
@router.get("/", response_model=list[BuildingResponse])
async def list_buildings(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Building).order_by(Building.name))
    return [BuildingResponse.model_validate(b) for b in result.scalars()]


@router.post("", response_model=BuildingResponse, status_code=201, include_in_schema=False)
@router.post("/", response_model=BuildingResponse, status_code=201)
async def create_building(
    payload: BuildingCreate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    building = Building(**payload.model_dump())
    db.add(building)
    await db.flush()
    await db.refresh(building)
    return BuildingResponse.model_validate(building)


@router.get("/{building_id}", response_model=BuildingResponse)
async def get_building(
    building_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Building).where(Building.id == building_id))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return BuildingResponse.model_validate(building)


@router.patch("/{building_id}", response_model=BuildingResponse)
async def update_building(
    building_id: str,
    payload: BuildingUpdate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Building).where(Building.id == building_id))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(building, field, val)
    await db.flush()
    await db.refresh(building)
    return BuildingResponse.model_validate(building)


@router.delete("/{building_id}", status_code=204)
async def delete_building(
    building_id: str,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Building).where(Building.id == building_id))
    building = result.scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    await db.delete(building)
