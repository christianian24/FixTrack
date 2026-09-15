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

### Frontend (Phase 1 — Current)
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS configured with the custom **Machined Glass Console** design system (dark technical slate `#090d16`, glass cards with backdrop blur, subtle borders `#233354`, and luminous status accents)
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Routing**: React Router v7
- **State & Persistence**: React Context API (`FacilityCareContext`, `AuthContext`) synced to `localStorage` with initial seed fallback and a 1-click **Reset Demo Data** action.

### Backend (Phase 2 — Future Architecture)
- **API Framework**: Python 3.12 + FastAPI
- **Database & ORM**: PostgreSQL + SQLAlchemy + Alembic migrations
- **Data Validation**: Pydantic v2
- **Authentication**: JWT Bearer Tokens + Password Hashing (Argon2 / bcrypt) + RBAC

---

## 👥 Demo Accounts (1-Click Switcher Available in Header)

FixTrack includes 5 pre-configured demo personas:

| Role | Demo User | Email | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Reporter (Student)** | Alex Rivera | `alex.student@school.edu` | Report concerns, track submissions, receive updates |
| **Reporter (Faculty)** | Dr. Maria Santos | `maria.santos@school.edu` | Report hazards, verify repairs for classroom/lab |
| **Maintenance Personnel** | Juan Dela Cruz | `juan.tech@school.edu` | Accept tasks, update progress notes, upload after photos |
| **Maintenance Personnel** | Robert Taylor | `robert.taylor@school.edu` | HVAC & Plumbing repair execution |
| **Maintenance Supervisor** | Engr. Carlos Mendoza | `carlos.supervisor@school.edu` | Triage, assign technicians, inspect before/after photos, close requests |
| **Administrator** | Elena Vance | `elena.admin@school.edu` | Manage campus master data, users, rooms, analytics |

*Use the **Role Dropdown** in the top header bar to instantly switch between demo roles without logging out.*

---

## 📦 Project Structure

```
c:\code_vs\Faculty\
├── docs/
│   └── architecture.md              # Detailed architecture & Phase 2 backend blueprint
├── src/
│   ├── main.tsx                     # React entry point
│   ├── App.tsx                      # Route declarations & provider nesting
│   ├── index.css                    # Machined Glass design tokens & glass utilities
│   ├── types/                       # Core TypeScript domain models (PostgreSQL-ready)
│   │   ├── user.ts
│   │   ├── concern.ts
│   │   ├── building.ts
│   │   ├── room.ts
│   │   ├── category.ts
│   │   ├── notification.ts
│   │   └── analytics.ts
│   ├── data/                        # Realistic mock seed data
│   │   ├── mockUsers.ts
│   │   ├── mockBuildings.ts         # 6 campus buildings
│   │   ├── mockRooms.ts             # 21 campus rooms
│   │   ├── mockCategories.ts        # 16 required facility categories
│   │   ├── mockConcerns.ts          # 14 realistic sample concern records
│   │   └── mockNotifications.ts
│   ├── lib/                         # Domain calculation & rule engines
│   │   ├── priorityEngine.ts        # Rule-based priority advisor with explanation rationale
│   │   ├── duplicateDetection.ts    # Rule-based duplicate detector (room + category + title)
│   │   ├── formatting.ts            # Relative time, badge color mappings
│   │   └── permissions.ts           # Role capabilities
│   ├── services/                    # Service layer abstractions (ready for FastAPI API swap)
│   │   ├── analyticsService.ts
│   │   └── exportService.ts
│   ├── store/                       # Reactive state & persistence
│   │   ├── AuthContext.tsx
│   │   └── FacilityCareContext.tsx
│   ├── components/
│   │   ├── common/                  # Badges, StatCards, Modals, ConfirmDialogs, EmptyStates
│   │   ├── layout/                  # AppLayout, AuthLayout, Sidebar, Demo Role Switcher
│   │   ├── concerns/                # TimelineView, RoomRepairHistory
│   │   └── forms/                   # PhotoUploadZone, DuplicateWarningBanner, PriorityAdvisorCard
│   └── pages/                       # Screen views
│       ├── auth/                    # Login, Register
│       ├── dashboard/               # Role-specific dashboard consoles
│       ├── concerns/                # List, Detail, New Concern
│       ├── tasks/                   # Technician task board & detail workspace
│       ├── supervisor/              # Dispatch hub & Verification detail console
│       ├── admin/                   # Users, Buildings, Rooms, Categories
│       ├── analytics/               # Recharts dashboard
│       ├── reports/                 # Filterable reports with CSV export
│       ├── notifications/           # Notification center
│       └── profile/                 # Profile & demo data reset
```

---

## ⚡ Development & Build Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript compilation & Vite production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔄 Resetting Demo Data
At any point during testing or client demonstration, click the **Reset Data** button in the header toolbar or navigate to **Profile (`/profile`)** to restore pristine seed records.
