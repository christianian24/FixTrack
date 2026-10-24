# FixTrack

FixTrack is a facility concern reporting and maintenance monitoring system for educational institutions. Reporters can submit concerns with room-level locations and photos, while maintenance personnel, supervisors, and administrators can manage work orders, repairs, notifications, and operational reporting.

The repository contains a React frontend and a FastAPI backend. The frontend uses the backend as its source of truth, including for one-click demo-account login.

## Features

- Concern submission with building and room selection, descriptions, safety flags, and photo uploads
- Duplicate concern detection and explainable priority recommendations
- Concern timelines, repair history, notifications, and status tracking
- Technician task workflow for accepting work, recording progress, material holds, and completion evidence
- Supervisor triage, assignment, scheduling, priority overrides, and repair verification
- Administrator management for users, buildings, rooms, and facility categories
- Analytics dashboards and filterable CSV/print reports
- JWT authentication with role-based access control
- Local file uploads and SQLite development storage, with Alembic migrations for deployed databases

## Technology

### Frontend

- React 19, TypeScript, and Vite 8
- Tailwind CSS
- React Router 7
- Recharts
- Lucide React
- Typed fetch API client with JWT bearer-token support
- React contexts for authentication and facility data

### Backend

- Python 3.12, FastAPI, and Uvicorn
- SQLAlchemy 2.0 with async sessions
- Pydantic Settings and Alembic
- SQLite with `aiosqlite` for zero-configuration local development
- JWT authentication, bcrypt password hashing, and server-side RBAC
- Duplicate detection, priority scoring, notifications, analytics, reports, and upload endpoints
- Pytest and pytest-asyncio test suite

## Project Layout

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/       # Auth, users, buildings, rooms, categories, concerns, etc.
│   │   ├── core/         # Settings, security, and dependencies
│   │   ├── db/            # Async database session and seed data
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Duplicate, priority, notification, and storage services
│   ├── alembic/           # Database migrations
│   ├── tests/             # Backend automated tests
│   └── requirements.txt
├── src/
│   ├── components/        # Shared UI, forms, layouts, and concern components
│   ├── data/              # Approved real-account demo login list
│   ├── pages/             # Application screens
│   ├── services/api/      # Backend API clients
│   ├── store/             # AuthContext and FacilityCareContext
│   └── types/             # Frontend domain types
├── .env.example           # Frontend environment variables
└── package.json
```

## Prerequisites

- Node.js 20 or newer and npm
- Python 3.12 or newer

## Local Development

### 1. Configure the frontend

From the repository root:

```bash
copy .env.example .env.local
npm install
```

The default frontend API URL is `http://localhost:8000/api/v1`. Start the backend before using the frontend, including when signing in through a demo account.

### 2. Set up and run the backend

From the repository root, create a virtual environment and install the backend dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

For macOS/Linux, activate the environment with `source .venv/bin/activate` instead.

SQLite tables are created automatically when the application starts. Seed the local database with demo data, then start the API:

```bash
python -m app.db.seed
python -m alembic upgrade head
uvicorn app.main:app --reload --env-file .env --port 8000
```

The backend `.env.example` sets `APP_ENV=development` and enables `FIXTRACK_DEMO_LOGIN_ENABLED` for local demo login. Copy it to `backend/.env` and restart the backend after changing the setting. For production, set `APP_ENV=production` and `FIXTRACK_DEMO_LOGIN_ENABLED=false`; the endpoint rejects demo login in production regardless of the flag.

Apply Alembic migrations after seeding and before starting the API, including when upgrading an existing SQLite database. The migration records the new concern location fields and preserves building IDs for existing room-based concerns.

The backend provides:

- Health check: `http://localhost:8000/health`
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- API base URL: `http://localhost:8000/api/v1`
- Uploaded files: `http://localhost:8000/uploads/`

For production databases, configure `DATABASE_URL` and run `alembic upgrade head` instead of relying on SQLite's automatic table creation. PostgreSQL deployments also need an appropriate async PostgreSQL driver installed.

### 3. Start the frontend

In a second terminal from the repository root:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Demo Accounts

The seed script creates six backend demo users. When demo login is enabled in a development environment, each account is available through its one-click login card. Normal email/password login remains available.

| Role | Name | Email |
| --- | --- | --- |
| Reporter / Student | Alex Rivera | `alex.student@school.edu` |
| Reporter / Faculty | Maria Santos | `maria.faculty@school.edu` |
| Maintenance Personnel | Juan Dela Cruz | `juan.tech@school.edu` |
| Maintenance Personnel | Robert Taylor | `robert.taylor@school.edu` |
| Maintenance Supervisor | Carlos Mendoza | `carlos.supervisor@school.edu` |
| Administrator | Elena Vance | `elena.admin@school.edu` |

Demo login uses the explicitly allowlisted account IDs in the backend auth endpoint and issues the same JWT used by normal login. The frontend then loads the signed-in account from `/auth/me`; user data always comes from the API.

## Verification

Run these commands from the repository root:

```bash
# Frontend typecheck and production build
npm run build

# Frontend linting
npm run lint
```

Run backend tests with the virtual environment activated:

```bash
cd backend
pytest tests -v
```

## Deployment

The frontend is a Vite single-page application and the backend is a FastAPI service. Build the frontend with `npm run build` and serve the generated `dist/` directory from the chosen static web server. Configure the backend service to run `uvicorn app.main:app`, and set `VITE_API_BASE_URL` to the backend API URL including `/api/v1`.

```text
VITE_API_BASE_URL=https://<backend-host>/api/v1
```

Configure backend `CORS_ORIGINS`, `SECRET_KEY`, `DATABASE_URL`, and upload storage for the deployment environment. Do not use the development secret key or enable demo login in production.
