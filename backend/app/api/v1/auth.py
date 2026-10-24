from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import settings
from ...core.dependencies import get_current_user
from ...core.security import create_access_token, hash_password, verify_password
from ...db.session import get_db
from ...models.user import User
from ...schemas.user import DemoLoginRequest, TokenResponse, UserCreate, UserPublic

router = APIRouter()


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(
        select(User).where(User.email == form_data.username.lower())
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    token = create_access_token(user.id, extra={"role": user.role})
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


# ── Register ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    payload: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Check duplicate email
    result = await db.execute(
        select(User).where(User.email == payload.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        role="REPORTER",
        user_type=payload.user_type,
        department=payload.department,
        phone=payload.phone,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(user.id, extra={"role": user.role})
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


# ── Current user ──────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserPublic)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return UserPublic.model_validate(current_user)


# ── Explicitly enabled demo login ────────────────────────────────────────────

DEMO_USER_IDS = frozenset({
    "usr_student_001",
    "usr_faculty_002",
    "usr_tech_003",
    "usr_tech_006",
    "usr_super_004",
    "usr_admin_005",
})


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(
    payload: DemoLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if (
        not settings.FIXTRACK_DEMO_LOGIN_ENABLED
        or settings.APP_ENV.strip().lower() in {"prod", "production"}
    ):
        raise HTTPException(status_code=404, detail="Not found")

    if payload.user_id not in DEMO_USER_IDS:
        raise HTTPException(status_code=403, detail="This account is not approved for demo login")

    result = await db.execute(select(User).where(User.id == payload.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Demo account is inactive")

    token = create_access_token(user.id, extra={"role": user.role})
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))
