"""Add user last-seen presence timestamp.

Revision ID: 20261008_1617
Revises: 20261007_1900
Create Date: 2026-10-08 16:17:00
"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261008_1617"
down_revision: Union[str, None] = "20261007_1900"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "last_seen" not in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(
                sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True)
            )


def downgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("users")}
    if "last_seen" in columns:
        with op.batch_alter_table("users") as batch_op:
            batch_op.drop_column("last_seen")
