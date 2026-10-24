from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

ConcernStatusType = Literal[
    "SUBMITTED",
    "UNDER_REVIEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_MATERIALS",
    "COMPLETED",
    "VERIFIED",
    "CLOSED",
    "REJECTED",
]

PriorityType = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]


# ── Nested schemas ────────────────────────────────────────────────────────────

class PhotoSchema(BaseModel):
    id: str
    url: str
    filename: str | None
    is_completion_photo: bool
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class TimelineEventSchema(BaseModel):
    id: str
    event_type: str
    old_status: str | None
    new_status: str | None
    note: str | None
    created_at: datetime
    actor_id: str | None

    model_config = {"from_attributes": True}


# ── Request schemas ───────────────────────────────────────────────────────────

class ConcernCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category_id: str | None = None
    building_id: str = Field(..., min_length=1)
    room_id: str | None = None
    other_location: str | None = Field(None, max_length=500)
    priority: PriorityType = "MEDIUM"
    is_safety_hazard: bool = False
    affects_many_people: bool = False
    is_recurring: bool = False

    @field_validator("other_location", mode="before")
    @classmethod
    def normalize_other_location(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Other location must be text.")
        trimmed = value.strip()
        return trimmed or None

    @model_validator(mode="after")
    def validate_location_choice(self) -> "ConcernCreate":
        if self.room_id is not None:
            if not self.room_id.strip():
                raise ValueError("Room ID must not be empty.")
            if self.other_location is not None:
                raise ValueError("Other location must be empty when a room is selected.")
        elif self.other_location is None:
            raise ValueError("Other location is required when no room is selected.")
        return self


class ConcernUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: str | None = None
    room_id: str | None = None
    building_id: str | None = None
    other_location: str | None = Field(None, max_length=500)
    priority: PriorityType | None = None
    is_safety_hazard: bool | None = None
    affects_many_people: bool | None = None
    is_recurring: bool | None = None

    @field_validator("other_location", mode="before")
    @classmethod
    def normalize_other_location(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Other location must be text.")
        trimmed = value.strip()
        return trimmed or None


class ConcernAssign(BaseModel):
    assigned_to_id: str
    note: str | None = None


class ConcernStatusUpdate(BaseModel):
    note: str | None = None


class ConcernComplete(BaseModel):
    resolution_notes: str = Field(..., min_length=10)


class ConcernReject(BaseModel):
    rejection_reason: str = Field(..., min_length=5)


# ── Response schemas ──────────────────────────────────────────────────────────

class ConcernSummary(BaseModel):
    id: str
    tracking_number: str
    title: str
    status: str
    priority: str
    priority_score: float
    is_safety_hazard: bool
    affects_many_people: bool
    reporter_id: str | None
    assigned_to_id: str | None
    category_id: str | None
    room_id: str | None
    building_id: str | None
    other_location: str | None
    building_name: str | None = None
    building_code: str | None = None
    room_name: str | None = None
    room_floor: int | None = None
    submitted_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def include_location_display_fields(cls, value):
        if isinstance(value, dict):
            data = dict(value)
            building = data.get("building")
            room = data.get("room")
        else:
            display_fields = {"building_name", "building_code", "room_name", "room_floor"}
            names = [name for name in cls.model_fields if name not in display_fields]
            data = {name: getattr(value, name) for name in names}
            building = getattr(value, "building", None)
            room = getattr(value, "room", None)

        data["building_name"] = getattr(building, "name", None)
        data["building_code"] = getattr(building, "code", None)
        data["room_name"] = getattr(room, "name", None)
        data["room_floor"] = getattr(room, "floor", None)
        return data


class ConcernDetail(ConcernSummary):
    description: str
    is_recurring: bool
    resolution_notes: str | None
    rejection_reason: str | None
    estimated_cost: float | None
    assigned_at: datetime | None
    started_at: datetime | None
    completed_at: datetime | None
    verified_at: datetime | None
    closed_at: datetime | None
    photos: list[PhotoSchema] = []
    timeline_events: list[TimelineEventSchema] = []


class ArchivedConcernDetail(ConcernDetail):
    deleted_at: datetime
    reporter_name: str | None = None
    assigned_to_name: str | None = None
    category_name: str | None = None
