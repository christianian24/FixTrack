from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

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
    room_id: str | None = None
    priority: PriorityType = "MEDIUM"
    is_safety_hazard: bool = False
    affects_many_people: bool = False
    is_recurring: bool = False


class ConcernUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: str | None = None
    room_id: str | None = None
    priority: PriorityType | None = None
    is_safety_hazard: bool | None = None
    affects_many_people: bool | None = None
    is_recurring: bool | None = None


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
    submitted_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


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
