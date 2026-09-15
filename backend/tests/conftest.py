"""
Pytest fixtures for the FixTrack backend test suite.

Uses a temporary SQLite database (in-memory via aiosqlite) so tests
are fully isolated and do not touch the development database.
"""
from __future__ import annotations

import asyncio
import pytest
import pytest_asyncio

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import Base, get_db
from app.core.security import hash_password
from app.models.user import User


# ─── Event loop fixture ───────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the session scope."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


# ─── In-memory test DB ────────────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        import app.models  # noqa: F401 — register all models
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine):
    factory = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    """HTTPX AsyncClient with the app's DB dependency overridden."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ─── Seed helper fixtures ─────────────────────────────────────────────────────

async def _create_user(session: AsyncSession, **kwargs) -> User:
    user = User(**kwargs)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest_asyncio.fixture
async def student_user(db_session):
    return await _create_user(
        db_session,
        id="test_student",
        first_name="Test",
        last_name="Student",
        email="student@test.edu",
        hashed_password=hash_password("test1234"),
        role="REPORTER",
        user_type="STUDENT",
        is_active=True,
    )


@pytest_asyncio.fixture
async def tech_user(db_session):
    return await _create_user(
        db_session,
        id="test_tech",
        first_name="Test",
        last_name="Tech",
        email="tech@test.edu",
        hashed_password=hash_password("test1234"),
        role="MAINTENANCE_PERSONNEL",
        user_type="MAINTENANCE",
        is_active=True,
    )


@pytest_asyncio.fixture
async def supervisor_user(db_session):
    return await _create_user(
        db_session,
        id="test_super",
        first_name="Test",
        last_name="Supervisor",
        email="supervisor@test.edu",
        hashed_password=hash_password("test1234"),
        role="MAINTENANCE_SUPERVISOR",
        user_type="SUPERVISOR",
        is_active=True,
    )


@pytest_asyncio.fixture
async def admin_user(db_session):
    return await _create_user(
        db_session,
        id="test_admin",
        first_name="Test",
        last_name="Admin",
        email="admin@test.edu",
        hashed_password=hash_password("test1234"),
        role="ADMINISTRATOR",
        user_type="ADMINISTRATOR",
        is_active=True,
    )


async def _get_token(client: AsyncClient, email: str, password: str = "test1234") -> str:
    resp = await client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def student_token(client, student_user):
    return await _get_token(client, student_user.email)


@pytest_asyncio.fixture
async def tech_token(client, tech_user):
    return await _get_token(client, tech_user.email)


@pytest_asyncio.fixture
async def supervisor_token(client, supervisor_user):
    return await _get_token(client, supervisor_user.email)


@pytest_asyncio.fixture
async def admin_token(client, admin_user):
    return await _get_token(client, admin_user.email)
