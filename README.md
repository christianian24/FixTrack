# FixTrack — School Facility Concern Reporting & Maintenance Monitoring System

FixTrack is an enterprise-grade, centralized web-based maintenance operations platform engineered specifically for educational institutions. It empowers students and faculty to rapidly report facility hazards, upload photographic documentation, and pinpoint exact room locations, while providing maintenance supervisors and technicians with end-to-end dispatching, repair milestone tracking, transparent duplicate detection, smart priority recommendations, before/after photographic verification, and campus infrastructure analytics.

---

## 🚀 Key System Capabilities

### 1. Reporter Experience (Students & Faculty)
- **Interactive Reporting Form** (`/concerns/new`): Cascading building & room selectors, detailed description, safety severity rating, and photo upload zone with drag-and-drop & preset samples.
- **Explainable Duplicate Report Detection**: Live rule-based scanning that compares building, room, category, and title keywords against open work orders, warning reporters before redundant submissions.
- **Smart Priority Advisor**: Multi-factor algorithm weighing life-safety hazards, affected population, facility category, and recurring frequency with transparent reasoning bullets.
- **Concern Progress Tracking** (`/concerns/:id`): Visual progress pipeline, chronological audit timeline, and location repair history for past incidents in the same room.

### 2. Maintenance Personnel Experience
- **Dedicated Task Board** (`/tasks`): Filter by assigned, pending acceptance, in progress, waiting for materials, and completed.
- **Work Order Console** (`/tasks/:id`): One-click task acceptance, progress logging, material hold toggle, and completion submission requiring resolution notes and photo proof.

### 3. Maintenance Supervisor Experience
- **Supervisory Dispatch Hub** (`/manage`): Triage unassigned reports, dispatch technicians, schedule target dates, and override priorities.
- **Inspection & Verification Console** (`/verify/:id`): Side-by-side Before vs. After completion photo comparison viewer, technician turnaround metrics, and actions to "Verify & Close" or "Reject & Request Re-work" with required rationale.

### 4. Campus Administrator Experience
- **Master Data Management**: Full CRUD suites for Campus Users (`/admin/users`), Buildings (`/admin/buildings`), Rooms (`/admin/rooms`), and Facility Categories (`/admin/categories`).
- **Interactive Analytics Dashboard** (`/analytics`): Recharts visualizations for monthly incident velocity trends, building incident distribution, top hazard categories, completion rate donuts, and technician throughput benchmarks.
- **Exportable Compliance Reports** (`/reports`): Filterable reports with client-side CSV downloads and print/PDF formatting.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS with clean, modern school portal UI (white/light-slate backgrounds, sky blue `#0284c7` accents, subtle borders, Inter typography)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Routing**: React Router v7 with RBAC route protection (`ProtectedRoute`)
- **API Services**: Unified typed API client with JWT interceptor (`src/services/api/`)
- **State & Persistence**: Dual-mode `AuthContext` and `FacilityCareContext` supporting live backend and offline fallback.

### Backend (FastAPI + SQLAlchemy 2.0)
- **API Framework**: Python 3.12 + FastAPI (REST API, OpenAPI/Swagger at `/api/docs`)
- **Database & ORM**: SQLAlchemy 2.0 (asyncio) + Alembic migrations
- **Databases**: SQLite (zero-config local dev) / PostgreSQL (production)
- **Security**: JWT Bearer Tokens + bcrypt password hashing + 5-role RBAC server dependencies
- **Engines**: Server-side duplicate detection (token Jaccard) and multi-factor priority advisor
- **File Storage**: Local uploads with static serving + S3-ready cloud abstraction
- **Testing**: 30 comprehensive automated tests with pytest and pytest-asyncio

---

## 👥 Demo Accounts (1-Click Switcher Available in Header)

FixTrack includes 5 pre-configured demo personas:

| Role | Demo User | Email | Password | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Reporter (Student)** | Alex Rivera | `alex.student@school.edu` | `demo1234` | Report concerns, track submissions, receive updates |
| **Reporter (Faculty)** | Dr. Maria Santos | `maria.santos@school.edu` | `demo1234` | Report hazards, verify repairs for classroom/lab |
| **Maintenance Personnel** | Juan Dela Cruz | `juan.tech@school.edu` | `demo1234` | Accept tasks, update progress notes, upload after photos |
| **Maintenance Supervisor** | Engr. Carlos Mendoza | `carlos.supervisor@school.edu` | `demo1234` | Triage, assign technicians, inspect before/after photos, close requests |
| **Administrator** | Elena Vance | `elena.admin@school.edu` | `demo1234` | Manage campus master data, users, rooms, analytics |

*Use the **Role Dropdown** in the top header bar to instantly switch between demo roles without logging out.*

---

## 📦 Project Structure

```
c:\code_vs\Faculty\
├── vercel.json                      # Vercel SPA routing & security headers
├── .env.example                     # Frontend environment variables template
├── backend/                         # FastAPI Full-Stack Backend
│   ├── requirements.txt             # Python dependencies
│   ├── alembic.ini                  # Alembic migration configuration
│   ├── .env.example                 # Backend environment variables template
│   ├── alembic/                     # Database migrations
│   │   ├── env.py                   # Async Alembic runner
│   │   └── versions/                # Versioned migration scripts
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & CORS
│   │   ├── core/                    # Settings, security, JWT, RBAC dependencies
│   │   ├── db/                      # Session, Base, seed scripts
│   │   ├── models/                  # SQLAlchemy 2.0 async models
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   ├── services/                # Duplicate engine, priority engine, storage
│   │   └── api/v1/                  # REST routers for auth, concerns, buildings, etc.
│   └── tests/                       # Pytest automated test suite (30 tests)
├── src/
│   ├── main.tsx                     # React entry point
│   ├── App.tsx                      # Route declarations & role guards
│   ├── services/api/                # Axios/Fetch backend API client & endpoints
│   ├── store/                       # AuthContext & FacilityCareContext
│   ├── components/                  # Badges, Layout, ProtectedRoute, Forms
│   └── pages/                       # Screens for all 5 roles
```

---

## ⚡ Development & Running Instructions

### 1. Backend Setup & Startup

```bash
cd backend

# Create virtual environment (Python 3.12)
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
alembic upgrade head
python -m app.db.seed

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/api/docs`.

### 2. Frontend Setup & Startup

```bash
# In the repository root
npm install

# Start development server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🧪 Verification & Automated Testing

```bash
# 1. Run backend pytest suite (30 tests across Auth, RBAC, Concerns, Engines)
backend\.venv\Scripts\pytest backend/tests -v

# 2. Run frontend typecheck & production build
npm run build

# 3. Run frontend linter
npm run lint
```

---

## 🚀 Deployment (Vercel)

The frontend is fully configured for deployment on **Vercel**:
- Configuration file: [`vercel.json`](file:///c:/code_vs/Faculty/vercel.json) handles SPA routing rewrites to `/index.html` and sets HTTP security headers.
- Set environment variable on Vercel:
  `VITE_API_BASE_URL=https://your-backend-api.domain.com/api/v1`
