"""Add soft-delete timestamp to concerns.

Revision ID: 20261008_1650
Revises: 20261008_1617
Create Date: 2026-10-08 16:50:00
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261008_1650"
down_revision: Union[str, None] = "20261008_1617"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("concerns")}
    if "deleted_at" not in columns:
        with op.batch_alter_table("concerns") as batch_op:
            batch_op.add_column(
                sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True)
            )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("concerns")}
    if "deleted_at" in columns:
        with op.batch_alter_table("concerns") as batch_op:
            batch_op.drop_column("deleted_at")
