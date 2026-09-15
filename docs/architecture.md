# FixTrack — System Architecture & Design Specification

This document details the architectural blueprint for **FixTrack — School Facility Concern Reporting & Maintenance Monitoring System**, covering the current Phase 1 frontend implementation, state management patterns, domain entity relationships, and the future Phase 2 FastAPI + PostgreSQL backend.

---

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                   │
│   React 19 + TypeScript + Tailwind CSS + Recharts      │
│   "Machined Glass Console" Design System               │
└──────────────────────────┬─────────────────────────────┘
                           │ REST / JSON (JWT Protected)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   BACKEND API (Phase 2)                │
│   FastAPI (Python 3.12)                                │
│   • Routers: /auth, /concerns, /tasks, /admin, etc.    │
│   • Core: Security, JWT, RBAC Middleware               │
│   • Services: Duplicate Engine, Priority Advisor       │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLAlchemy 2.0 (Async)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   POSTGRESQL DATABASE                  │
│   Tables: users, buildings, rooms, categories,         │
│   concerns, photos, timeline_events, notifications     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Phase 1)

The frontend application follows a decoupled component-service-store architecture:

```
UI Pages & Modals
      │
      ▼
Domain Components (TimelineView, PhotoGallery, PriorityAdvisorCard)
      │
      ▼
React Contexts (FacilityCareContext, AuthContext)
      │
      ▼
Persistence & Local Storage Synchronizer
(Ready for direct substitution with REST API services in Phase 2)
```

### State Management & Persistence Strategy
- **`AuthContext`**: Manages the active authenticated user, token representation, and role simulation. Provides instant 1-click demo account switching across the 5 primary personas.
- **`FacilityCareContext`**: Serves as the central reactive repository for concerns, buildings, rooms, categories, users, and notifications. Automatically mirrors state modifications into `localStorage` keys (`facilitycare_concerns_v1`, etc.) so tester edits persist across browser reloads.
- **Demo Data Reset**: A global reset action is exposed in the header and profile screen to wipe local storage and re-hydrate pristine demo seed data.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Route | Reporter (Student/Faculty) | Maintenance Personnel | Maintenance Supervisor | Campus Administrator |
| :--- | :---: | :---: | :---: | :---: |
| `/dashboard` | Custom Reporter View | Custom Tech View | Dispatch Overview | Campus Operations KPI |
| `/concerns` | View All / My Reports | Read Only | Full Triage Access | Full Triage Access |
| `/concerns/new` | Full Submission Access | — | Full Submission Access | Full Submission Access |
| `/concerns/:id` | View Progress & History | View Work Order | Override Priority / Assign | Full Access |
| `/tasks` & `/tasks/:id` | — | Work Execution Hub | View All Tasks | View All Tasks |
| `/manage` | — | — | Full Dispatch Console | Full Dispatch Console |
| `/verify/:id` | Faculty Verification | — | Inspection & Sign-off | Inspection & Sign-off |
| `/admin/*` | — | — | — | Full Master Data CRUD |
| `/analytics` | — | — | Operational Charts | Campus-Wide Analytics |
| `/reports` | — | — | Filter & CSV Export | Filter & CSV Export |
| `/notifications` | Personal Notifications | Task Notifications | Triage Notifications | System Alerts |

---

## 4. Domain Data Model (PostgreSQL-Ready)

### Entity-Relationship Diagram (Conceptual)

```
       ┌──────────────────┐
       │     BUILDING     │
       └─────────┬────────┘
                 │ 1
                 │
                 │ has many
                 ▼ N
       ┌──────────────────┐       1 ┌─────────────────────────┐
       │       ROOM       │◀────────┤    FACILITY_CATEGORY    │
       └─────────┬────────┘         └────────────┬────────────┘
                 │ 1                             │ 1
                 │ has many                      │ classifies
                 ▼ N                             ▼ N
       ┌──────────────────────────────────────────────────────┐
       │                       CONCERN                        │
       │  • id, report_number (FC-2026-XXXX)                  │
       │  • reporter_id, category_id, building_id, room_id    │
       │  • priority (LOW|MED|HIGH|CRITICAL)                  │
       │  • status (PENDING -> IN_PROGRESS -> CLOSED)         │
       │  • safety_risk, affected_users, scheduled_date       │
       │  • assigned_personnel_id                             │
       └─────────┬───────────────────────┬────────────────────┘
                 │ 1                     │ 1
                 │ has many              │ has many
                 ▼ N                     ▼ N
       ┌──────────────────┐    ┌──────────────────────────────┐
       │  TIMELINE_EVENT  │    │         CONCERN_PHOTO        │
       │  • actor_id      │    │  • url                       │
       │  • action        │    │  • type (BEFORE|DURING|AFTER)│
       │  • timestamp     │    │  • caption                   │
       │  • notes         │    └──────────────────────────────┘
       └──────────────────┘
```

---

## 5. Major System Workflows

### 5.1 Concern Reporting & Triage Flow
1. **Initiation**: Student or faculty navigates to `/concerns/new`.
2. **Duplicate Interception**: As room, category, and title are typed, `duplicateDetection.ts` computes similarity against open reports. If a match is found, `DuplicateWarningBanner` highlights the existing ticket and allows the user to review it or proceed.
3. **Priority Recommendation**: `priorityEngine.ts` calculates a transparent recommendation based on safety hazards (e.g. electrical shock), room population impact, category risk, and duplicate counts.
4. **Photo Upload**: Evidence photos are attached with client-side previews.
5. **Submission**: Ticket generated with report number `FC-2026-XXXX` and notification routed to supervisors.

### 5.2 Technician Repair Execution Flow
1. **Notification & Intake**: Technician receives notification and views task in `/tasks`.
2. **Task Acceptance**: Technician accepts work order, updating status to `IN_PROGRESS`.
3. **Execution & Material Holds**: If parts are missing, technician toggles `WAITING_FOR_MATERIALS` with order notes.
4. **Completion**: Technician uploads completion photo proof, records repair notes, and transitions status to `COMPLETED`.

### 5.3 Supervisor Inspection & Verification Flow
1. **Triage & Comparison**: Supervisor opens `/verify/:id`.
2. **Photo Verification**: Supervisor views side-by-side Before Photo vs After Completion Photo comparison and reviews technician turnaround time.
3. **Sign-off or Rejection**:
   - If acceptable: Supervisor clicks "Verify Work & Close Request" -> status becomes `CLOSED`.
   - If sub-standard: Supervisor clicks "Reject & Request Re-work", supplying mandatory corrective instructions -> status reverts to `IN_PROGRESS` with alert sent to technician.

---

## 6. Phase 2 Backend Roadmap (FastAPI Implementation)

When instructed to begin Phase 2:
- **FastAPI Directory**: `backend/app/`
- **Modules**:
  - `core/`: Config, JWT security, password hashing, CORS.
  - `models/`: SQLAlchemy ORM definitions mirroring TypeScript models.
  - `schemas/`: Pydantic models with validation for intake and responses.
  - `api/`: REST routes under `/api/v1/` (`/auth`, `/concerns`, `/tasks`, `/buildings`, `/rooms`, `/categories`, `/analytics`, `/reports`).
  - `services/`: Server-side duplicate detection, priority advisor, file uploads.
  - `db/`: Engine session factory and Alembic migration scripts.
