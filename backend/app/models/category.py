from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class FacilityCategory(Base):
    __tablename__ = "facility_categories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String(60), default="Wrench")
    color: Mapped[str] = mapped_column(String(40), default="blue")
    # Weight used by the priority engine (higher = more severe category)
    priority_weight: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    concerns: Mapped[list["Concern"]] = relationship("Concern", back_populates="category")  # noqa: F821
