from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Concern(Base):
    """
    Central entity.  Tracks a reported facility concern from submission
    through resolution and verification.
    """

    __tablename__ = "concerns"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # Human-readable tracking number: FC-2026-0001
    tracking_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    # Core fields
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Enum(
            "SUBMITTED",
            "UNDER_REVIEW",
            "ASSIGNED",
            "IN_PROGRESS",
            "WAITING_FOR_MATERIALS",
            "COMPLETED",
            "VERIFIED",
            "CLOSED",
            "REJECTED",
            name="concern_status_enum",
        ),
        default="SUBMITTED",
    )
    priority: Mapped[str] = mapped_column(
        Enum("LOW", "MEDIUM", "HIGH", "CRITICAL", name="concern_priority_enum"),
        default="MEDIUM",
    )
    priority_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Safety / impact flags stored for the priority engine
    is_safety_hazard: Mapped[bool] = mapped_column(Boolean, default=False)
    affects_many_people: Mapped[bool] = mapped_column(Boolean, default=False)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)

    # Foreign keys
    reporter_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    assigned_to_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("facility_categories.id", ondelete="SET NULL"), nullable=True
    )
    room_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True
    )

    # Workflow timestamps
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )

    # Completion / resolution data
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    reporter: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="submitted_concerns", foreign_keys=[reporter_id]
    )
    assigned_to: Mapped["User | None"] = relationship(  # noqa: F821
        "User", back_populates="assigned_concerns", foreign_keys=[assigned_to_id]
    )
    category: Mapped["FacilityCategory | None"] = relationship(  # noqa: F821
        "FacilityCategory", back_populates="concerns"
    )
    room: Mapped["Room | None"] = relationship("Room", back_populates="concerns")  # noqa: F821
    photos: Mapped[list["ConcernPhoto"]] = relationship(
        "ConcernPhoto", back_populates="concern", cascade="all, delete-orphan",
        lazy="selectin",
    )
    timeline_events: Mapped[list["TimelineEvent"]] = relationship(
        "TimelineEvent", back_populates="concern", cascade="all, delete-orphan",
        order_by="TimelineEvent.created_at",
        lazy="selectin",
    )


class ConcernPhoto(Base):
    __tablename__ = "concern_photos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    concern_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concerns.id", ondelete="CASCADE")
    )
    url: Mapped[str] = mapped_column(String(500))
    filename: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_completion_photo: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    concern: Mapped[Concern] = relationship("Concern", back_populates="photos")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    concern_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concerns.id", ondelete="CASCADE")
    )
    actor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    event_type: Mapped[str] = mapped_column(String(60))  # e.g. STATUS_CHANGE, NOTE
    old_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    concern: Mapped[Concern] = relationship("Concern", back_populates="timeline_events")
    actor: Mapped["User | None"] = relationship("User", back_populates="timeline_events")  # noqa: F821
