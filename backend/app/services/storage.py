from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from ..core.config import settings


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


async def save_upload(file: UploadFile, subfolder: str = "concerns") -> str:
    """
    Save an uploaded file to disk and return its public URL path.

    Returns a relative URL like ``/uploads/concerns/<uuid>.<ext>``.
    Raises ``ValueError`` on type/size violations.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(
            f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(ALLOWED_TYPES)}"
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise ValueError(
            f"File too large ({len(data) // 1024} KB). "
            f"Max allowed: {settings.MAX_UPLOAD_SIZE_MB} MB"
        )

    ext = Path(file.filename or "upload.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = Path(settings.UPLOAD_DIR) / subfolder
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename

    dest_path.write_bytes(data)
    return f"/uploads/{subfolder}/{filename}"
