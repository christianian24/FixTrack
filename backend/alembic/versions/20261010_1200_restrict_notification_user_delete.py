"""Prevent deleting notifications with their user account.

Revision ID: 20261010_1200
Revises: 20261008_1650
Create Date: 2026-10-10 12:00:00
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261010_1200"
down_revision: Union[str, None] = "20261008_1650"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_FK_NAME = "fk_notifications_user_id_users"
_NAMING_CONVENTION = {
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s"
}


def _replace_user_fk(ondelete: str) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_fk = next(
        (
            foreign_key
            for foreign_key in inspector.get_foreign_keys("notifications")
            if foreign_key.get("constrained_columns") == ["user_id"]
            and foreign_key.get("referred_table") == "users"
        ),
        None,
    )
    if user_fk and user_fk.get("options", {}).get("ondelete", "").upper() == ondelete:
        return

    constraint_name = (
        user_fk.get("name") or _FK_NAME
        if user_fk
        else None
    )
    with op.batch_alter_table(
        "notifications",
        naming_convention=_NAMING_CONVENTION,
    ) as batch_op:
        if constraint_name:
            batch_op.drop_constraint(constraint_name, type_="foreignkey")
        batch_op.create_foreign_key(
            _FK_NAME,
            "users",
            ["user_id"],
            ["id"],
            ondelete=ondelete,
        )


def upgrade() -> None:
    _replace_user_fk("RESTRICT")


def downgrade() -> None:
    _replace_user_fk("CASCADE")
