from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings


BACKEND_DIR = Path(__file__).resolve().parents[2]
LOCAL_DATABASE_PATH = BACKEND_DIR / "fixtrack_dev.db"
LOCAL_UPLOAD_DIR = BACKEND_DIR / "uploads"


class Settings(BaseSettings):
    # ── App ─────────────────────────────────────────────────────────────────
    APP_NAME: str = "FixTrack"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_openssl_rand_hex_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # ── Database ─────────────────────────────────────────────────────────────
    # PostgreSQL in production, SQLite for local zero-config dev
    DATABASE_URL: str = f"sqlite+aiosqlite:///{LOCAL_DATABASE_PATH.as_posix()}"

    # ── Storage ──────────────────────────────────────────────────────────────
    UPLOAD_DIR: str = str(LOCAL_UPLOAD_DIR)
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── CORS ─────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
