from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


UserRoleType = Literal[
    "REPORTER",
    "MAINTENANCE_PERSONNEL",
    "MAINTENANCE_SUPERVISOR",
    "ADMINISTRATOR",
]

UserTypeType = Literal["STUDENT", "FACULTY", "MAINTENANCE", "SUPERVISOR", "ADMINISTRATOR"]


# ── Request schemas ───────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Literal["REPORTER"] = "REPORTER"
    user_type: Literal["STUDENT", "FACULTY"] = "STUDENT"
    department: str | None = None
    phone: str | None = None


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    department: str | None = None


class UserAdminUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    role: UserRoleType | None = None
    user_type: UserTypeType | None = None
    department: str | None = None
    is_active: bool | None = None


# ── Response schemas ──────────────────────────────────────────────────────────

class UserPublic(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    user_type: str
    department: str | None
    phone: str | None
    avatar_url: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Auth schemas ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str  # email — OAuth2PasswordRequestForm uses "username"
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
