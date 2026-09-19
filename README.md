# FixTrack

FixTrack is a facility concern reporting and maintenance monitoring system for educational institutions. Reporters can submit concerns with room-level locations and photos, while maintenance personnel, supervisors, and administrators can manage work orders, repairs, notifications, and operational reporting.

The repository contains a React frontend and a FastAPI backend. The frontend can run against the backend or in an offline demo mode backed by local mock data.

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
│   ├── data/              # Offline demo data
│   ├── pages/             # Application screens
│   ├── services/api/      # Backend API clients
│   ├── store/             # AuthContext and FacilityCareContext
│   └── types/             # Frontend domain types
├── .env.example           # Frontend environment variables
├── vercel.json            # SPA rewrites and security headers
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

The default frontend API URL is `http://localhost:8000/api/v1`. Set `VITE_OFFLINE_DEMO=true` in `.env.local` when the backend is not needed.

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
uvicorn app.main:app --reload --port 8000
```

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

The seed script creates six backend demo users. They all use the password `demo1234`.

| Role | Name | Email |
| --- | --- | --- |
| Reporter / Student | Alex Rivera | `alex.student@school.edu` |
| Reporter / Faculty | Maria Santos | `maria.faculty@school.edu` |
| Maintenance Personnel | Juan Dela Cruz | `juan.tech@school.edu` |
| Maintenance Personnel | Robert Taylor | `robert.taylor@school.edu` |
| Maintenance Supervisor | Carlos Mendoza | `carlos.supervisor@school.edu` |
| Administrator | Elena Vance | `elena.admin@school.edu` |

The application also supports demo-persona login and role switching through the UI. In offline demo mode, the frontend uses the mock data under `src/data/` and does not require the API.

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

The frontend is configured for Vercel through `vercel.json`. Set `VITE_API_BASE_URL` to the deployed backend URL including the `/api/v1` path, for example:

```text
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Configure the backend `CORS_ORIGINS`, `SECRET_KEY`, `DATABASE_URL`, and upload storage settings for the deployed environment. Do not use the development secret key in production.
