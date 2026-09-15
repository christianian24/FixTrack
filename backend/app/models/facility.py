from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(120), unique=True)
    code: Mapped[str] = mapped_column(String(20), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    floors: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="building")


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    building_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("buildings.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(120))
    floor: Mapped[int] = mapped_column(Integer, default=1)
    room_type: Mapped[str] = mapped_column(String(60), default="Classroom")
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    building: Mapped[Building] = relationship("Building", back_populates="rooms")
    concerns: Mapped[list["Concern"]] = relationship("Concern", back_populates="room")  # noqa: F821
