# FixTrack Architecture

FixTrack is a React single-page application backed by a FastAPI REST API. The API is the source of truth for authenticated users and facility data.

## Runtime flow

```text
Browser (React + TypeScript + Vite)
  ├── AuthContext ── JWT login/demo-login and /auth/me
  └── FacilityCareContext ── API hydration and domain actions
             │
             ▼
       FastAPI /api/v1
  ├── Authentication and role-protected routes
  ├── SQLAlchemy async models and services
  └── SQLite for local development; configured SQL database for deployment
```

The frontend API client in `src/services/api/client.ts` attaches the stored
bearer token to API requests. `AuthContext` uses `/auth/login` for regular
email/password login. The login page's six approved demo accounts call
`/auth/demo-login`, store the returned JWT, then hydrate the account using
`/auth/me`. Demo login is feature-gated and explicitly blocked in production.

## Frontend organization

- `src/pages/` contains route-level screens registered in `src/App.tsx`.
- `src/components/` contains shared layouts, dialogs, form controls, and concern
  presentation components.
- `src/services/api/` contains typed clients grouped by backend resource.
- `src/store/AuthContext.tsx` manages the authenticated API user and token
  lifecycle.
- `src/store/FacilityCareContext.tsx` hydrates concerns, facilities, users, and
  notifications from the API and exposes application actions.
- `src/lib/` contains shared formatting, validation, priority, permissions, and
  personnel availability helpers.
- `src/data/demoAccounts.ts` contains only the approved real-account demo-login
  choices; it is not a mock user store.

## Backend organization

- `backend/app/main.py` creates the FastAPI application, configures middleware,
  and mounts the API router under `/api/v1`.
- `backend/app/api/v1/` groups HTTP routers by resource, including auth, users,
  facilities, concerns, notifications, analytics, and reports.
- `backend/app/core/` contains configuration, security, and authentication /
  authorization dependencies.
- `backend/app/models/` and `backend/app/schemas/` define SQLAlchemy entities
  and Pydantic request/response models.
- `backend/app/services/` contains duplicate detection, priority, notifications,
  and file storage logic.
- `backend/alembic/` contains the ordered schema migration history. Applied
  migrations must remain in place.

## Important workflows

### Concern reporting and repair

The user submits a concern from `/concerns/new`. The frontend checks for
potential duplicates and recommends a priority, then sends the concern and
photos to the API. Supervisors triage and assign concerns. Technicians update
repair progress, record material holds, and submit completion evidence.
Supervisors verify or reject completed work. API state is reflected in
`FacilityCareContext` and rendered by the pages.

### Personnel availability

The shared `getPersonnelAvailability` helper is the source of truth for
maintenance technicians:

- Offline: `NOT AVAILABLE`
- Online with active assigned unfinished work: `BUSY`
- Online without active assigned unfinished work: `AVAILABLE`

The Admin User Directory displays account status, online status, and personnel
availability separately. Non-maintenance roles have no personnel availability.

### Archiving concerns

Concern archiving, restoration, and permanent deletion use the backend concern
API. The `deleted_at` timestamp is managed by the existing model and migration
history; the frontend has no separate mock archive store.

## Local development

From the repository root, install frontend dependencies with `npm install` and
start the Vite server with `npm run dev`. In a separate terminal, use the
backend virtual environment, install `backend/requirements.txt`, and start
FastAPI from the `backend/` directory with:

```powershell
uvicorn app.main:app --reload --env-file .env --port 8000
```

The backend's `.env` controls its database URL, security settings, CORS, and
local demo-login gate. Do not commit `.env` files or replace the active local
database as part of routine code cleanup.
