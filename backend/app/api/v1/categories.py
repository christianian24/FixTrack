from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.dependencies import get_current_user, require_roles
from ...db.session import get_db
from ...models.category import FacilityCategory
from ...models.user import User
from ...schemas.facility import CategoryCreate, CategoryResponse, CategoryUpdate

router = APIRouter()


@router.get("/", response_model=list[CategoryResponse])
async def list_categories(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(FacilityCategory).order_by(FacilityCategory.name))
    return [CategoryResponse.model_validate(c) for c in result.scalars()]


@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(
    payload: CategoryCreate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    cat = FacilityCategory(**payload.model_dump())
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.patch("/{cat_id}", response_model=CategoryResponse)
async def update_category(
    cat_id: str,
    payload: CategoryUpdate,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(FacilityCategory).where(FacilityCategory.id == cat_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(cat, field, val)
    await db.flush()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.delete("/{cat_id}", status_code=204)
async def delete_category(
    cat_id: str,
    current_user: Annotated[User, Depends(require_roles("ADMINISTRATOR"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(FacilityCategory).where(FacilityCategory.id == cat_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.delete(cat)
