"""Add direct building and custom location to concerns.

Revision ID: 20261007_1900
Revises: 092d80b7b2de
Create Date: 2026-10-07 19:00:00
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261007_1900"
down_revision: Union[str, None] = "092d80b7b2de"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("concerns")}
    foreign_keys = inspector.get_foreign_keys("concerns")
    indexes = {index["name"] for index in inspector.get_indexes("concerns")}
    has_building_fk = any(
        foreign_key.get("constrained_columns") == ["building_id"]
        and foreign_key.get("referred_table") == "buildings"
        for foreign_key in foreign_keys
    )
    naming_convention = {
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"
    }

    with op.batch_alter_table("concerns", naming_convention=naming_convention) as batch_op:
        if "building_id" not in columns:
            batch_op.add_column(sa.Column("building_id", sa.String(length=36), nullable=True))
        if "other_location" not in columns:
            batch_op.add_column(sa.Column("other_location", sa.String(length=500), nullable=True))
        if not has_building_fk:
            batch_op.create_foreign_key(
                "fk_concerns_building_id_buildings",
                "buildings",
                ["building_id"],
                ["id"],
                ondelete="SET NULL",
            )
        if "ix_concerns_building_id" not in indexes:
            batch_op.create_index("ix_concerns_building_id", ["building_id"], unique=False)

    op.execute(
        sa.text(
            "UPDATE concerns "
            "SET building_id = ("
            "SELECT rooms.building_id FROM rooms WHERE rooms.id = concerns.room_id"
            ") "
            "WHERE room_id IS NOT NULL"
        )
    )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("concerns")}
    indexes = {index["name"] for index in inspector.get_indexes("concerns")}
    foreign_keys = inspector.get_foreign_keys("concerns")
    has_building_fk = any(
        foreign_key.get("constrained_columns") == ["building_id"]
        and foreign_key.get("referred_table") == "buildings"
        for foreign_key in foreign_keys
    )
    naming_convention = {
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"
    }

    with op.batch_alter_table("concerns", naming_convention=naming_convention) as batch_op:
        if "ix_concerns_building_id" in indexes:
            batch_op.drop_index("ix_concerns_building_id")
        if "building_id" in columns and has_building_fk:
            batch_op.drop_constraint(
                "fk_concerns_building_id_buildings", type_="foreignkey"
            )
        if "other_location" in columns:
            batch_op.drop_column("other_location")
        if "building_id" in columns:
            batch_op.drop_column("building_id")
