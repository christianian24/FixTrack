from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


ONLINE_TIMEOUT = timedelta(seconds=30)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        Enum(
            "REPORTER",
            "MAINTENANCE_PERSONNEL",
            "MAINTENANCE_SUPERVISOR",
            "ADMINISTRATOR",
            name="user_role_enum",
        )
    )
    user_type: Mapped[str] = mapped_column(
        Enum(
            "STUDENT",
            "FACULTY",
            "MAINTENANCE",
            "SUPERVISOR",
            "ADMINISTRATOR",
            name="user_type_enum",
        ),
        default="STUDENT",
    )
    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_seen: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )

    @property
    def is_online(self) -> bool:
        if not self.is_active or self.last_seen is None:
            return False

        last_seen = self.last_seen
        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)
        elapsed = datetime.now(timezone.utc) - last_seen
        return timedelta(0) <= elapsed <= ONLINE_TIMEOUT

    # Relationships
    submitted_concerns: Mapped[list["Concern"]] = relationship(  # noqa: F821
        "Concern",
        back_populates="reporter",
        foreign_keys="Concern.reporter_id",
    )
    assigned_concerns: Mapped[list["Concern"]] = relationship(  # noqa: F821
        "Concern",
        back_populates="assigned_to",
        foreign_keys="Concern.assigned_to_id",
    )
    timeline_events: Mapped[list["TimelineEvent"]] = relationship(  # noqa: F821
        "TimelineEvent", back_populates="actor"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        "Notification", back_populates="user"
    )
