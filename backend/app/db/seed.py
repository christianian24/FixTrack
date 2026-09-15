"""
Seed script — populates the database with realistic demo data.

Run with:
    cd backend
    python -m app.db.seed
"""
from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select

from .session import engine, Base, async_session_factory
from ..core.security import hash_password
from ..models.user import User
from ..models.facility import Building, Room
from ..models.category import FacilityCategory
from ..models.concern import Concern, TimelineEvent


USERS = [
    {"id": "usr_student_001", "first_name": "Alex", "last_name": "Rivera",
     "email": "alex.student@school.edu", "password": "demo1234",
     "role": "REPORTER", "user_type": "STUDENT",
     "department": "Computer Science", "phone": "+63 912 345 6789"},
    {"id": "usr_faculty_002", "first_name": "Dr. Maria", "last_name": "Santos",
     "email": "maria.faculty@school.edu", "password": "demo1234",
     "role": "REPORTER", "user_type": "FACULTY",
     "department": "College of Engineering", "phone": "+63 917 234 5678"},
    {"id": "usr_tech_003", "first_name": "Juan", "last_name": "Dela Cruz",
     "email": "juan.tech@school.edu", "password": "demo1234",
     "role": "MAINTENANCE_PERSONNEL", "user_type": "MAINTENANCE",
     "department": "Physical Plant Office", "phone": "+63 918 345 6780"},
    {"id": "usr_super_004", "first_name": "Engr. Carlos", "last_name": "Mendoza",
     "email": "carlos.supervisor@school.edu", "password": "demo1234",
     "role": "MAINTENANCE_SUPERVISOR", "user_type": "SUPERVISOR",
     "department": "Physical Plant Office", "phone": "+63 919 456 7891"},
    {"id": "usr_admin_005", "first_name": "Elena", "last_name": "Vance",
     "email": "elena.admin@school.edu", "password": "demo1234",
     "role": "ADMINISTRATOR", "user_type": "ADMINISTRATOR",
     "department": "Office of the Registrar", "phone": "+63 920 567 8902"},
]

BUILDINGS = [
    {"id": "bld_001", "name": "Main Academic Building", "code": "MAB", "floors": 5},
    {"id": "bld_002", "name": "Engineering Complex", "code": "ENG", "floors": 4},
    {"id": "bld_003", "name": "Science & Technology Center", "code": "STC", "floors": 3},
    {"id": "bld_004", "name": "Library & Resource Center", "code": "LRC", "floors": 4},
    {"id": "bld_005", "name": "Sports & Recreation Hall", "code": "SRH", "floors": 2},
    {"id": "bld_006", "name": "Administration Building", "code": "ADM", "floors": 3},
]

ROOMS = [
    {"id": "rm_001", "building_id": "bld_001", "name": "Room 101", "floor": 1, "room_type": "Classroom", "capacity": 40},
    {"id": "rm_002", "building_id": "bld_001", "name": "Room 205", "floor": 2, "room_type": "Classroom", "capacity": 35},
    {"id": "rm_003", "building_id": "bld_001", "name": "Faculty Lounge", "floor": 1, "room_type": "Faculty Office", "capacity": 20},
    {"id": "rm_004", "building_id": "bld_001", "name": "Male Restroom 1F", "floor": 1, "room_type": "Restroom", "capacity": 0},
    {"id": "rm_005", "building_id": "bld_001", "name": "Female Restroom 1F", "floor": 1, "room_type": "Restroom", "capacity": 0},
    {"id": "rm_006", "building_id": "bld_002", "name": "Electronics Lab", "floor": 2, "room_type": "Laboratory", "capacity": 30},
    {"id": "rm_007", "building_id": "bld_002", "name": "Workshop Area", "floor": 1, "room_type": "Workshop", "capacity": 25},
    {"id": "rm_008", "building_id": "bld_002", "name": "Drawing Room", "floor": 3, "room_type": "Classroom", "capacity": 40},
    {"id": "rm_009", "building_id": "bld_003", "name": "Chemistry Lab", "floor": 1, "room_type": "Laboratory", "capacity": 28},
    {"id": "rm_010", "building_id": "bld_003", "name": "Biology Lab", "floor": 2, "room_type": "Laboratory", "capacity": 28},
    {"id": "rm_011", "building_id": "bld_003", "name": "Physics Lab", "floor": 3, "room_type": "Laboratory", "capacity": 24},
    {"id": "rm_012", "building_id": "bld_004", "name": "Reading Room A", "floor": 1, "room_type": "Study Room", "capacity": 80},
    {"id": "rm_013", "building_id": "bld_004", "name": "Digital Lab", "floor": 2, "room_type": "Computer Lab", "capacity": 50},
    {"id": "rm_014", "building_id": "bld_005", "name": "Main Gymnasium", "floor": 1, "room_type": "Gymnasium", "capacity": 500},
    {"id": "rm_015", "building_id": "bld_005", "name": "Fitness Center", "floor": 2, "room_type": "Fitness Room", "capacity": 40},
    {"id": "rm_016", "building_id": "bld_006", "name": "Registrar Office", "floor": 1, "room_type": "Office", "capacity": 15},
    {"id": "rm_017", "building_id": "bld_006", "name": "Conference Room", "floor": 2, "room_type": "Conference Room", "capacity": 30},
    {"id": "rm_018", "building_id": "bld_001", "name": "Main Corridor 1F", "floor": 1, "room_type": "Corridor", "capacity": 0},
    {"id": "rm_019", "building_id": "bld_001", "name": "Stairwell A", "floor": 1, "room_type": "Stairwell", "capacity": 0},
    {"id": "rm_020", "building_id": "bld_002", "name": "ENG Lobby", "floor": 1, "room_type": "Lobby", "capacity": 0},
    {"id": "rm_021", "building_id": "bld_003", "name": "STC Canteen", "floor": 1, "room_type": "Canteen", "capacity": 100},
]

CATEGORIES = [
    {"id": "cat_001", "name": "Electrical", "icon": "Zap", "priority_weight": 7},
    {"id": "cat_002", "name": "Plumbing", "icon": "Droplets", "priority_weight": 5},
    {"id": "cat_003", "name": "HVAC & Ventilation", "icon": "Wind", "priority_weight": 5},
    {"id": "cat_004", "name": "Structural", "icon": "Building2", "priority_weight": 8},
    {"id": "cat_005", "name": "Furniture & Fixtures", "icon": "Armchair", "priority_weight": 2},
    {"id": "cat_006", "name": "Doors & Windows", "icon": "DoorOpen", "priority_weight": 4},
    {"id": "cat_007", "name": "Safety & Hazards", "icon": "ShieldAlert", "priority_weight": 10},
    {"id": "cat_008", "name": "Pest Control", "icon": "Bug", "priority_weight": 4},
    {"id": "cat_009", "name": "Cleaning & Sanitation", "icon": "Sparkles", "priority_weight": 4},
    {"id": "cat_010", "name": "Computer & IT Equipment", "icon": "Monitor", "priority_weight": 5},
    {"id": "cat_011", "name": "Painting & Aesthetics", "icon": "Paintbrush", "priority_weight": 2},
    {"id": "cat_012", "name": "Grounds & Landscaping", "icon": "Trees", "priority_weight": 2},
    {"id": "cat_013", "name": "Water & Flooding", "icon": "CloudRain", "priority_weight": 8},
    {"id": "cat_014", "name": "Elevator & Escalator", "icon": "ArrowUpDown", "priority_weight": 10},
    {"id": "cat_015", "name": "Security Systems", "icon": "ShieldCheck", "priority_weight": 7},
    {"id": "cat_016", "name": "Signage & Wayfinding", "icon": "SignpostBig", "priority_weight": 1},
]

NOW = datetime.now(timezone.utc)


def _ago(**kwargs):
    return NOW - timedelta(**kwargs)


CONCERNS = [
    {
        "id": "con_001", "tracking_number": "FC-2026-0001",
        "title": "Flickering fluorescent light in Room 101",
        "description": "The main fluorescent light in Room 101 has been flickering for two weeks causing eye strain.",
        "reporter_id": "usr_student_001", "category_id": "cat_001",
        "room_id": "rm_001", "priority": "MEDIUM", "status": "COMPLETED",
        "is_safety_hazard": False, "affects_many_people": True,
        "assigned_to_id": "usr_tech_003",
        "resolution_notes": "Replaced ballast and two T8 tubes.",
        "submitted_at": _ago(days=14), "completed_at": _ago(days=2),
    },
    {
        "id": "con_002", "tracking_number": "FC-2026-0002",
        "title": "Leaking faucet in Male Restroom 1F",
        "description": "The faucet is dripping constantly and the drain is slow. Floor is slippery.",
        "reporter_id": "usr_faculty_002", "category_id": "cat_002",
        "room_id": "rm_004", "priority": "MEDIUM", "status": "IN_PROGRESS",
        "is_safety_hazard": True, "affects_many_people": True,
        "assigned_to_id": "usr_tech_003",
        "submitted_at": _ago(days=7),
    },
    {
        "id": "con_003", "tracking_number": "FC-2026-0003",
        "title": "Air conditioning not cooling in Electronics Lab",
        "description": "ACU blowing warm air for 3 days. Room temp reaches 35C.",
        "reporter_id": "usr_faculty_002", "category_id": "cat_003",
        "room_id": "rm_006", "priority": "HIGH", "status": "SUBMITTED",
        "is_safety_hazard": False, "affects_many_people": True,
        "submitted_at": _ago(days=3),
    },
    {
        "id": "con_004", "tracking_number": "FC-2026-0004",
        "title": "Exposed electrical wiring near Chemistry Lab entrance",
        "description": "Exposed wiring at shoulder height near lab entrance. Immediate safety hazard.",
        "reporter_id": "usr_student_001", "category_id": "cat_007",
        "room_id": "rm_009", "priority": "CRITICAL", "status": "VERIFIED",
        "is_safety_hazard": True, "affects_many_people": True,
        "assigned_to_id": "usr_tech_003",
        "resolution_notes": "Conduit repaired and wiring properly secured.",
        "submitted_at": _ago(days=10), "completed_at": _ago(days=5),
    },
    {
        "id": "con_005", "tracking_number": "FC-2026-0005",
        "title": "Broken projector screen in Room 205",
        "description": "Motorized projector screen is stuck at halfway. Makes presentations impossible.",
        "reporter_id": "usr_faculty_002", "category_id": "cat_010",
        "room_id": "rm_002", "priority": "MEDIUM", "status": "SUBMITTED",
        "is_safety_hazard": False, "affects_many_people": False,
        "submitted_at": _ago(days=1),
    },
    {
        "id": "con_006", "tracking_number": "FC-2026-0006",
        "title": "Roof leaking into Digital Lab",
        "description": "Heavy rain caused water to leak through roof. Computer stations affected.",
        "reporter_id": "usr_faculty_002", "category_id": "cat_013",
        "room_id": "rm_013", "priority": "CRITICAL", "status": "ASSIGNED",
        "is_safety_hazard": True, "affects_many_people": True,
        "assigned_to_id": "usr_tech_003",
        "submitted_at": _ago(days=2),
    },
    {
        "id": "con_007", "tracking_number": "FC-2026-0007",
        "title": "Multiple broken chairs in Reading Room A",
        "description": "Around 15 chairs have broken or wobbly legs. Students sitting on the floor.",
        "reporter_id": "usr_student_001", "category_id": "cat_005",
        "room_id": "rm_012", "priority": "LOW", "status": "WAITING_FOR_MATERIALS",
        "is_safety_hazard": False, "affects_many_people": True,
        "assigned_to_id": "usr_tech_003",
        "submitted_at": _ago(days=20),
    },
    {
        "id": "con_008", "tracking_number": "FC-2026-0008",
        "title": "Gymnasium floor has multiple raised planks",
        "description": "Several wooden planks are warped — serious trip hazard for athletes.",
        "reporter_id": "usr_student_001", "category_id": "cat_004",
        "room_id": "rm_014", "priority": "HIGH", "status": "SUBMITTED",
        "is_safety_hazard": True, "affects_many_people": True,
        "submitted_at": _ago(hours=6),
    },
]


async def run_seed():
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("[INFO] Database already seeded - skipping.")
            return

        print("[START] Seeding database...")

        for u in USERS:
            db.add(User(
                id=u["id"], first_name=u["first_name"], last_name=u["last_name"],
                email=u["email"], hashed_password=hash_password(u["password"]),
                role=u["role"], user_type=u["user_type"],
                department=u["department"], phone=u["phone"], is_active=True,
            ))
        print(f"  [+] {len(USERS)} users")

        for b in BUILDINGS:
            db.add(Building(id=b["id"], name=b["name"], code=b["code"], floors=b["floors"]))
        print(f"  [+] {len(BUILDINGS)} buildings")

        for r in ROOMS:
            db.add(Room(
                id=r["id"], building_id=r["building_id"], name=r["name"],
                floor=r["floor"], room_type=r["room_type"], capacity=r["capacity"],
            ))
        print(f"  [+] {len(ROOMS)} rooms")

        for c in CATEGORIES:
            db.add(FacilityCategory(
                id=c["id"], name=c["name"], icon=c["icon"],
                priority_weight=c.get("priority_weight", 5),
            ))
        print(f"  [+] {len(CATEGORIES)} categories")

        for c in CONCERNS:
            db.add(Concern(
                id=c["id"], tracking_number=c["tracking_number"],
                title=c["title"], description=c["description"],
                reporter_id=c["reporter_id"], category_id=c["category_id"],
                room_id=c["room_id"], priority=c["priority"], status=c["status"],
                is_safety_hazard=c.get("is_safety_hazard", False),
                affects_many_people=c.get("affects_many_people", False),
                assigned_to_id=c.get("assigned_to_id"),
                resolution_notes=c.get("resolution_notes"),
                completed_at=c.get("completed_at"),
                submitted_at=c["submitted_at"],
            ))
            db.add(TimelineEvent(
                id=str(uuid.uuid4()), concern_id=c["id"],
                actor_id=c["reporter_id"], event_type="SUBMITTED",
                note="Concern submitted via FixTrack.",
                old_status=None, new_status="SUBMITTED",
                created_at=c["submitted_at"],
            ))
        print(f"  [+] {len(CONCERNS)} concerns")

        await db.commit()
        print("[SUCCESS] Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(run_seed())
