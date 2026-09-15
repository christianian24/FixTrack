import { Concern } from '../types/concern';

export const mockConcerns: Concern[] = [
  {
    id: 'cn-001',
    reportNumber: 'FC-2026-0001',
    title: 'Faulty electrical outlet sparking near student desks',
    description: 'Wall duplex receptacle at the back row of Room 201 emits visible sparks and buzzing sound when laptops are plugged in. Burn marks visible on faceplate.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-electrical',
    categoryName: 'Electrical',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-201',
    roomName: 'Room 201 (Smart Classroom)',
    priority: 'CRITICAL',
    priorityReason: [
      'Immediate safety hazard: Electrical sparks and visible burn marks',
      'High density area: Class of 50 students seated adjacent',
      'Direct risk of electrical shock and fire'
    ],
    status: 'IN_PROGRESS',
    safetyRisk: 'IMMEDIATE_DANGER',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-14',
    repairNotes: 'Isolated breaker #14 at Panelboard B. Replacing melted duplex receptacle and testing load balance.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-1',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T08:15:00Z',
        notes: 'Submitted with photo proof.'
      },
      {
        id: 'tl-2',
        action: 'Supervisor Review & Priority Escalated',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T08:30:00Z',
        notes: 'Priority confirmed as CRITICAL. Immediate personnel dispatch requested.',
        statusBefore: 'PENDING',
        statusAfter: 'UNDER_REVIEW'
      },
      {
        id: 'tl-3',
        action: 'Assigned to Senior Electrician',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T08:45:00Z',
        notes: 'Assigned to Juan Dela Cruz. Target completion today.',
        statusBefore: 'UNDER_REVIEW',
        statusAfter: 'ASSIGNED'
      },
      {
        id: 'tl-4',
        action: 'Task Accepted & Repair Started',
        actorId: 'user-tech-1',
        actorName: 'Juan Dela Cruz',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-14T09:10:00Z',
        notes: 'On site with multimeter and replacement outlet.',
        statusBefore: 'ASSIGNED',
        statusAfter: 'IN_PROGRESS'
      }
    ],
    createdAt: '2026-09-14T08:15:00Z',
    updatedAt: '2026-09-14T09:10:00Z'
  },
  {
    id: 'cn-002',
    reportNumber: 'FC-2026-0002',
    title: 'Severe water leak under sink flooding Comfort Room floor',
    description: 'Main flex-hose under basin #2 is cracked and spraying water continuously across the floor tiles, creating slipping hazard.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-plumbing',
    categoryName: 'Plumbing',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-cr1',
    roomName: 'Comfort Room 1 (Floor 1 East)',
    priority: 'HIGH',
    priorityReason: [
      'Severe slipping hazard on high-traffic corridor rest area',
      'Ongoing water wastage and potential subfloor water intrusion',
      'Affects all occupants of 1st floor academic wing'
    ],
    status: 'WAITING_FOR_MATERIALS',
    safetyRisk: 'SIGNIFICANT',
    affectedUsers: 'FLOOR',
    duplicateCount: 1,
    assignedPersonnelId: 'user-tech-2',
    assignedPersonnelName: 'Robert Taylor',
    scheduledDate: '2026-09-15',
    repairNotes: 'Shut off angle valve to stop water overflow. Heavy-duty 1/2-inch stainless braided flex-hose requested from supplier.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-5',
        action: 'Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-13T14:20:00Z',
        notes: 'Reported water pooling near doorway.'
      },
      {
        id: 'tl-6',
        action: 'Assigned to Technician',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-13T14:45:00Z',
        notes: 'Assigned to Robert Taylor for emergency isolation.',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      },
      {
        id: 'tl-7',
        action: 'Inspected & Set to Waiting for Materials',
        actorId: 'user-tech-2',
        actorName: 'Robert Taylor',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-13T16:00:00Z',
        notes: 'Angle valve shut down safely. Awaiting delivery of replacement commercial fitting.',
        statusBefore: 'ASSIGNED',
        statusAfter: 'WAITING_FOR_MATERIALS'
      }
    ],
    createdAt: '2026-09-13T14:20:00Z',
    updatedAt: '2026-09-13T16:00:00Z'
  },
  {
    id: 'cn-003',
    reportNumber: 'FC-2026-0003',
    title: 'Ceiling acoustic tile collapsed and dangling in Science Lab 2',
    description: 'Water staining from upper floor caused gypsum ceiling panel to fracture and drop, exposing HVAC ducting and wiring.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-lab',
    categoryName: 'Laboratory',
    buildingId: 'bld-sci',
    buildingName: 'Science Building',
    roomId: 'rm-sci-lab2',
    roomName: 'Laboratory 2 (Chemistry Wet Lab)',
    priority: 'HIGH',
    priorityReason: [
      'Falling debris risk directly above chemistry experiment benches',
      'Exposure of overhead ventilation fixtures',
      'Disrupts scheduled laboratory sections'
    ],
    status: 'COMPLETED',
    safetyRisk: 'SIGNIFICANT',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-12',
    repairNotes: 'Cleared fractured tile pieces. Re-anchored T-runner ceiling grid with galvanized wire hangers and installed moisture-resistant 2x4 Armstrong acoustic tile.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
    ],
    timeline: [
      {
        id: 'tl-8',
        action: 'Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-11T10:00:00Z',
        notes: 'Warning tape placed around bench.'
      },
      {
        id: 'tl-9',
        action: 'Personnel Assigned',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-11T11:10:00Z',
        notes: 'Assigned to Juan Dela Cruz.',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      },
      {
        id: 'tl-10',
        action: 'Repair Started',
        actorId: 'user-tech-1',
        actorName: 'Juan Dela Cruz',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-12T08:30:00Z',
        notes: 'Work ongoing with stepladder and grid clips.',
        statusBefore: 'ASSIGNED',
        statusAfter: 'IN_PROGRESS'
      },
      {
        id: 'tl-11',
        action: 'Marked Completed by Technician',
        actorId: 'user-tech-1',
        actorName: 'Juan Dela Cruz',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-12T13:45:00Z',
        notes: 'Tile securely placed and vacuumed work area. Ready for supervisor inspection.',
        statusBefore: 'IN_PROGRESS',
        statusAfter: 'COMPLETED'
      }
    ],
    createdAt: '2026-09-11T10:00:00Z',
    updatedAt: '2026-09-12T13:45:00Z',
    completedAt: '2026-09-12T13:45:00Z'
  },
  {
    id: 'cn-004',
    reportNumber: 'FC-2026-0004',
    title: 'Ceiling mounted projector in Room 101 not powering on',
    description: 'Epson ceiling projector does not power on with remote or manual power button. Power status LED blinks red error code 4.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-classroom',
    categoryName: 'Classroom',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-101',
    roomName: 'Room 101 (Lecture Hall A)',
    priority: 'MEDIUM',
    priorityReason: [
      'Affects visual instructional delivery for classes',
      'No immediate physical safety threat',
      'Alternative whiteboard is available'
    ],
    status: 'CLOSED',
    safetyRisk: 'NONE',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-08',
    repairNotes: 'Replaced expired 240W UHE projector lamp and cleaned intake air filter screen. Reset lamp timer counter and verified HDMI projection from podium.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&auto=format&fit=crop&q=80'
    ],
    timeline: [
      {
        id: 'tl-12',
        action: 'Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-07T09:00:00Z',
        notes: 'Prof. needs for Engineering Math lectures.'
      },
      {
        id: 'tl-13',
        action: 'Assigned',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-07T10:00:00Z',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      },
      {
        id: 'tl-14',
        action: 'Repaired and Completed',
        actorId: 'user-tech-1',
        actorName: 'Juan Dela Cruz',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-08T11:00:00Z',
        notes: 'Lamp module replaced. Clean projection achieved.',
        statusBefore: 'IN_PROGRESS',
        statusAfter: 'COMPLETED'
      },
      {
        id: 'tl-15',
        action: 'Verified and Closed by Supervisor',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-08T15:30:00Z',
        notes: 'Inspected projection quality in Room 101. Verified fully operational.',
        statusBefore: 'COMPLETED',
        statusAfter: 'CLOSED'
      }
    ],
    createdAt: '2026-09-07T09:00:00Z',
    updatedAt: '2026-09-08T15:30:00Z',
    completedAt: '2026-09-08T11:00:00Z',
    closedAt: '2026-09-08T15:30:00Z',
    verifiedBy: 'Engr. Carlos Mendoza',
    verifiedAt: '2026-09-08T15:30:00Z'
  },
  {
    id: 'cn-005',
    reportNumber: 'FC-2026-0005',
    title: 'Broken classroom chair with exposed metal rivet in Room 102',
    description: 'Armchair in column 3 row 4 has fractured wooden writing tablet and a sharp protruding metal bracket that tears clothing.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-furniture',
    categoryName: 'Furniture',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-102',
    roomName: 'Room 102 (General Classroom)',
    priority: 'LOW',
    priorityReason: [
      'Minor localized snag hazard',
      'Chair can be temporarily segregated to corner of room',
      'Adequate surplus seating exists in classroom'
    ],
    status: 'PENDING',
    safetyRisk: 'MINOR',
    affectedUsers: 'INDIVIDUAL',
    duplicateCount: 0,
    beforePhotos: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a7884d?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-16',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T07:40:00Z',
        notes: 'Marked chair with DO NOT USE tape.'
      }
    ],
    createdAt: '2026-09-14T07:40:00Z',
    updatedAt: '2026-09-14T07:40:00Z'
  },
  {
    id: 'cn-006',
    reportNumber: 'FC-2026-0006',
    title: 'Broken Comfort Room door lock mechanism in 2nd floor west',
    description: 'Stall #3 cylindrical privacy latch is completely jammed in unlocked state; students cannot secure stall.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-doors',
    categoryName: 'Doors',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-cr2',
    roomName: 'Comfort Room 2 (Floor 2 West)',
    priority: 'MEDIUM',
    priorityReason: [
      'Privacy impact for student facilities',
      'Restricts usable restroom capacity',
      'No immediate structural danger'
    ],
    status: 'UNDER_REVIEW',
    safetyRisk: 'MINOR',
    affectedUsers: 'FLOOR',
    duplicateCount: 0,
    beforePhotos: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-17',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T08:05:00Z',
        notes: 'Reported privacy issue.'
      },
      {
        id: 'tl-18',
        action: 'Triage Started by Supervisor',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T08:50:00Z',
        notes: 'Verifying hardware inventory for heavy-duty stall turn-latch.',
        statusBefore: 'PENDING',
        statusAfter: 'UNDER_REVIEW'
      }
    ],
    createdAt: '2026-09-14T08:05:00Z',
    updatedAt: '2026-09-14T08:50:00Z'
  },
  {
    id: 'cn-007',
    reportNumber: 'FC-2026-0007',
    title: 'Oscillating electric wall fan blade vibrating violently with burnt smell',
    description: 'Wall fan #2 in Room 103 makes loud grinding noise and motor housing feels excessively hot with burning plastic odor.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-electrical',
    categoryName: 'Electrical',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-103',
    roomName: 'Room 103 (Multimedia Room)',
    priority: 'HIGH',
    priorityReason: [
      'Overheating electrical motor with odor indicates imminent coil burnout/fire risk',
      'Vibration could loosen wall anchor bracket',
      'Active multimedia classroom'
    ],
    status: 'ASSIGNED',
    safetyRisk: 'SIGNIFICANT',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-14',
    beforePhotos: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-19',
        action: 'Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T07:15:00Z',
        notes: 'Unplugged immediately from power outlet.'
      },
      {
        id: 'tl-20',
        action: 'Assigned to Electrician',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T07:55:00Z',
        notes: 'Dispatched Juan Dela Cruz to dismount and test motor bearings.',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      }
    ],
    createdAt: '2026-09-14T07:15:00Z',
    updatedAt: '2026-09-14T07:55:00Z'
  },
  {
    id: 'cn-008',
    reportNumber: 'FC-2026-0008',
    title: 'Cracked glass window pane vibrating on 2nd floor corridor',
    description: 'Upper pane on exterior window near Engineering lockers is fractured from top to bottom; risks shattering during heavy wind gusts.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-windows',
    categoryName: 'Windows',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    roomId: 'rm-eng-hall',
    roomName: '2nd Floor North Corridor & Lockers',
    priority: 'HIGH',
    priorityReason: [
      'Elevated glass fragmentation hazard directly above student lockers',
      'Wind suction pressure increases risk of sudden blowout',
      'Corridor serves over 300 engineering students daily'
    ],
    status: 'IN_PROGRESS',
    safetyRisk: 'SIGNIFICANT',
    affectedUsers: 'FLOOR',
    duplicateCount: 1,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-14',
    repairNotes: 'Applied cross-hatch safety stabilization film over cracked pane. Glazier contacted for 6mm tempered glass pane custom cut.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-21',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-13T11:00:00Z',
        notes: 'Noticeable crack appeared after rainstorm.'
      },
      {
        id: 'tl-22',
        action: 'Assigned and Tape Applied',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-13T11:30:00Z',
        notes: 'Assigned to Juan Dela Cruz. Area cordoned off.',
        statusBefore: 'PENDING',
        statusAfter: 'IN_PROGRESS'
      }
    ],
    createdAt: '2026-09-13T11:00:00Z',
    updatedAt: '2026-09-13T11:30:00Z'
  },
  {
    id: 'cn-009',
    reportNumber: 'FC-2026-0009',
    title: 'Flooded hallway corridor due to clogged outdoor scupper drain',
    description: 'Rain runoff from the terrace cannot discharge into scupper drain due to accumulated leaf debris, backing up into 2nd floor hallway.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-plumbing',
    categoryName: 'Plumbing',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    roomId: 'rm-eng-hall',
    roomName: '2nd Floor North Corridor & Lockers',
    priority: 'CRITICAL',
    priorityReason: [
      'Active water incursion reaching electrical conduit boxes',
      'Severe slip hazards and water damage to locker foundations',
      'Multiple classes impeded along entire northern wing'
    ],
    status: 'CLOSED',
    safetyRisk: 'IMMEDIATE_DANGER',
    affectedUsers: 'FLOOR',
    duplicateCount: 2,
    assignedPersonnelId: 'user-tech-2',
    assignedPersonnelName: 'Robert Taylor',
    scheduledDate: '2026-09-10',
    repairNotes: 'Cleared 4kg of organic silt and foliage from 4-inch cast iron scupper intake. Snaked downspout drain 25 feet. Installed stainless mesh dome strainer.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
    ],
    timeline: [
      {
        id: 'tl-23',
        action: 'Submitted & Emergency Dispatched',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-10T13:00:00Z',
        notes: 'Water creeping towards computer lab door.'
      },
      {
        id: 'tl-24',
        action: 'Unblocked & Cleaned',
        actorId: 'user-tech-2',
        actorName: 'Robert Taylor',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-10T15:00:00Z',
        notes: 'Water drained out completely within 20 mins of clearing obstruction.',
        statusBefore: 'IN_PROGRESS',
        statusAfter: 'COMPLETED'
      },
      {
        id: 'tl-25',
        action: 'Verified & Closed',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-10T16:30:00Z',
        notes: 'Waterproofing inspected and verified dry. Closed.',
        statusBefore: 'COMPLETED',
        statusAfter: 'CLOSED'
      }
    ],
    createdAt: '2026-09-10T13:00:00Z',
    updatedAt: '2026-09-10T16:30:00Z',
    completedAt: '2026-09-10T15:00:00Z',
    closedAt: '2026-09-10T16:30:00Z',
    verifiedBy: 'Engr. Carlos Mendoza',
    verifiedAt: '2026-09-10T16:30:00Z'
  },
  {
    id: 'cn-010',
    reportNumber: 'FC-2026-0010',
    title: 'Non-functioning Daikin split-type air conditioner in Computer Lab 3',
    description: 'Unit displays error code U4 on digital wall thermostat. Temperature inside lab has reached 33°C, risking overheating of 35 CAD workstations.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-others',
    categoryName: 'Others',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    roomId: 'rm-eng-com',
    roomName: 'Computer Laboratory 3 (CAD/Robotics)',
    priority: 'HIGH',
    priorityReason: [
      'High thermal load threatens expensive computer hardware',
      'Unventilated room with 40 student capacity',
      'Direct interference with scheduled CAD midterm exams'
    ],
    status: 'COMPLETED',
    safetyRisk: 'MINOR',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-2',
    assignedPersonnelName: 'Robert Taylor',
    scheduledDate: '2026-09-13',
    repairNotes: 'Traced U4 communication error to corroded signal wire terminal block on outdoor condenser unit. Re-crimped terminals and re-pressurized R410A refrigerant to 125 PSI.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    timeline: [
      {
        id: 'tl-26',
        action: 'Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-12T14:10:00Z',
        notes: 'Requested urgent priority due to exams.'
      },
      {
        id: 'tl-27',
        action: 'Assigned to HVAC Specialist',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-12T15:00:00Z',
        notes: 'Assigned to Robert Taylor.',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      },
      {
        id: 'tl-28',
        action: 'Completed Repair',
        actorId: 'user-tech-2',
        actorName: 'Robert Taylor',
        actorRole: 'MAINTENANCE_PERSONNEL',
        timestamp: '2026-09-13T10:30:00Z',
        notes: 'AC blowing steady 19°C cool air. Temperature stabilized.',
        statusBefore: 'IN_PROGRESS',
        statusAfter: 'COMPLETED'
      }
    ],
    createdAt: '2026-09-12T14:10:00Z',
    updatedAt: '2026-09-13T10:30:00Z',
    completedAt: '2026-09-13T10:30:00Z'
  },
  {
    id: 'cn-011',
    reportNumber: 'FC-2026-0011',
    title: 'Broken wooden entrance door hinge dragging on floor in Room 202',
    description: 'Top hinge screws have stripped out of the door jamb. The heavy solid-core door drags heavily against the tile floor and cannot close fully.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-doors',
    categoryName: 'Doors',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-202',
    roomName: 'Room 202 (Lecture Hall B)',
    priority: 'MEDIUM',
    priorityReason: [
      'Room cannot be locked after hours, leaving AV equipment exposed',
      'Heavy door could detach if swung aggressively',
      'No immediate life hazard'
    ],
    status: 'PENDING',
    safetyRisk: 'MINOR',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    beforePhotos: [
      'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-29',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T06:50:00Z',
        notes: 'Door wedged open with rubber stopper.'
      }
    ],
    createdAt: '2026-09-14T06:50:00Z',
    updatedAt: '2026-09-14T06:50:00Z'
  },
  {
    id: 'cn-012',
    reportNumber: 'FC-2026-0012',
    title: 'Damaged chemical fume hood exhaust sash cable in Chemistry Lab',
    description: 'Counterweight cable for fume hood #3 snapped; heavy glass sash drops violently if not propped up manually. Air face velocity is below 40 FPM.',
    reporterId: 'user-reporter-faculty',
    reporterName: 'Dr. Maria Santos',
    reporterRole: 'REPORTER',
    reporterType: 'FACULTY',
    categoryId: 'cat-lab',
    categoryName: 'Laboratory',
    buildingId: 'bld-sci',
    buildingName: 'Science Building',
    roomId: 'rm-sci-lab2',
    roomName: 'Laboratory 2 (Chemistry Wet Lab)',
    priority: 'CRITICAL',
    priorityReason: [
      'Severe hazardous chemical inhalation risk due to sub-standard face velocity',
      'Glass sash guillotine crush hazard to hands and arms',
      'Organic chemistry distillation lab scheduled this week'
    ],
    status: 'UNDER_REVIEW',
    safetyRisk: 'IMMEDIATE_DANGER',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    beforePhotos: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-30',
        action: 'Emergency Concern Submitted',
        actorId: 'user-reporter-faculty',
        actorName: 'Dr. Maria Santos',
        actorRole: 'REPORTER',
        timestamp: '2026-09-14T08:40:00Z',
        notes: 'Locked hood switch with lockout-tagout warning.'
      },
      {
        id: 'tl-31',
        action: 'Under Review by Supervisor',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T08:55:00Z',
        notes: 'Verified laboratory protocol. Recommending immediate stainless aircraft cable replacement.'
      }
    ],
    createdAt: '2026-09-14T08:40:00Z',
    updatedAt: '2026-09-14T08:55:00Z'
  },
  {
    id: 'cn-013',
    reportNumber: 'FC-2026-0013',
    title: 'Broken classroom chair leg in Room 201',
    description: 'Tubular steel leg weld cracked on front left corner of student chair #12, causing chair to wobble violently.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-furniture',
    categoryName: 'Furniture',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    roomId: 'rm-mab-201',
    roomName: 'Room 201 (Smart Classroom)',
    priority: 'LOW',
    priorityReason: [
      'Minor seating stability issue',
      'Chair removed to perimeter',
      'Plenty of open seats available in Room 201'
    ],
    status: 'CLOSED',
    safetyRisk: 'MINOR',
    affectedUsers: 'INDIVIDUAL',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-02',
    repairNotes: 'Re-welded tubular steel bracket with MIG welder and sprayed rust-inhibiting matte black primer.',
    beforePhotos: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a7884d?w=600&auto=format&fit=crop&q=80'
    ],
    timeline: [
      {
        id: 'tl-32',
        action: 'Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-01T10:00:00Z'
      },
      {
        id: 'tl-33',
        action: 'Completed & Verified',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-02T14:00:00Z',
        notes: 'Weld inspected for structural integrity. Re-introduced to Room 201.'
      }
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-02T14:00:00Z',
    completedAt: '2026-09-02T12:00:00Z',
    closedAt: '2026-09-02T14:00:00Z',
    verifiedBy: 'Engr. Carlos Mendoza',
    verifiedAt: '2026-09-02T14:00:00Z'
  },
  {
    id: 'cn-014',
    reportNumber: 'FC-2026-0014',
    title: 'Flickering fluorescent ceiling lights causing headaches in Library AVR',
    description: 'Four fluorescent tube ballasts in the center row of Audio-Visual Room hum loudly and strobe at high frequency during presentations.',
    reporterId: 'user-reporter-student',
    reporterName: 'Alex Rivera',
    reporterRole: 'REPORTER',
    reporterType: 'STUDENT',
    categoryId: 'cat-lighting',
    categoryName: 'Lighting',
    buildingId: 'bld-lib',
    buildingName: 'Library Building',
    roomId: 'rm-lib-avr',
    roomName: 'Audio-Visual Room (AVR)',
    priority: 'MEDIUM',
    priorityReason: [
      'Strobe effect creates discomfort and eye strain during presentations',
      'Audio-visual lectures held daily in this room',
      'Electronic ballast replacement recommended'
    ],
    status: 'ASSIGNED',
    safetyRisk: 'MINOR',
    affectedUsers: 'CLASS',
    duplicateCount: 0,
    assignedPersonnelId: 'user-tech-1',
    assignedPersonnelName: 'Juan Dela Cruz',
    scheduledDate: '2026-09-15',
    beforePhotos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    ],
    afterPhotos: [],
    timeline: [
      {
        id: 'tl-34',
        action: 'Concern Submitted',
        actorId: 'user-reporter-student',
        actorName: 'Alex Rivera',
        actorRole: 'REPORTER',
        timestamp: '2026-09-13T16:20:00Z'
      },
      {
        id: 'tl-35',
        action: 'Assigned to Electrician',
        actorId: 'user-supervisor',
        actorName: 'Engr. Carlos Mendoza',
        actorRole: 'MAINTENANCE_SUPERVISOR',
        timestamp: '2026-09-14T07:30:00Z',
        notes: 'Upgrade to energy-efficient LED retrofit tubes approved.',
        statusBefore: 'PENDING',
        statusAfter: 'ASSIGNED'
      }
    ],
    createdAt: '2026-09-13T16:20:00Z',
    updatedAt: '2026-09-14T07:30:00Z'
  }
];
