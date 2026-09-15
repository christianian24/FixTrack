from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field


class BuildingCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    code: str = Field(..., min_length=1, max_length=20)
    description: str | None = None
    floors: int = 1


class BuildingUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    floors: int | None = None
    is_active: bool | None = None


class BuildingResponse(BaseModel):
    id: str
    name: str
    code: str
    description: str | None
    floors: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomCreate(BaseModel):
    building_id: str
    name: str = Field(..., min_length=1, max_length=120)
    floor: int = 1
    room_type: str = "Classroom"
    capacity: int | None = None


class RoomUpdate(BaseModel):
    name: str | None = None
    floor: int | None = None
    room_type: str | None = None
    capacity: int | None = None
    is_active: bool | None = None


class RoomResponse(BaseModel):
    id: str
    building_id: str
    name: str
    floor: int
    room_type: str
    capacity: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = None
    icon: str = "Wrench"
    color: str = "blue"
    priority_weight: int = Field(5, ge=1, le=10)


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    priority_weight: int | None = Field(None, ge=1, le=10)
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: str | None
    icon: str
    color: str
    priority_weight: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    concern_id: str | None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
