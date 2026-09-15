import { Room } from '../types/room';

export const mockRooms: Room[] = [
  // Main Academic Building (MAB)
  {
    id: 'rm-mab-101',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Room 101 (Lecture Hall A)',
    code: 'MAB-101',
    floor: 1,
    roomType: 'Classroom',
    capacity: 60,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-102',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Room 102 (General Classroom)',
    code: 'MAB-102',
    floor: 1,
    roomType: 'Classroom',
    capacity: 45,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-103',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Room 103 (Multimedia Room)',
    code: 'MAB-103',
    floor: 1,
    roomType: 'Classroom',
    capacity: 40,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-201',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Room 201 (Smart Classroom)',
    code: 'MAB-201',
    floor: 2,
    roomType: 'Classroom',
    capacity: 50,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-202',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Room 202 (Lecture Hall B)',
    code: 'MAB-202',
    floor: 2,
    roomType: 'Classroom',
    capacity: 65,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-cr1',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Comfort Room 1 (Floor 1 East)',
    code: 'MAB-CR-1E',
    floor: 1,
    roomType: 'Comfort Room',
    capacity: 10,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-cr2',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Comfort Room 2 (Floor 2 West)',
    code: 'MAB-CR-2W',
    floor: 2,
    roomType: 'Comfort Room',
    capacity: 10,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-mab-fac',
    buildingId: 'bld-mab',
    buildingName: 'Main Academic Building',
    name: 'Faculty Lounge & Workstation',
    code: 'MAB-FAC',
    floor: 3,
    roomType: 'Office',
    capacity: 35,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // Science Building (SCI)
  {
    id: 'rm-sci-lab1',
    buildingId: 'bld-sci',
    buildingName: 'Science Building',
    name: 'Laboratory 1 (Physics Lab)',
    code: 'SCI-LAB-01',
    floor: 1,
    roomType: 'Laboratory',
    capacity: 30,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-sci-lab2',
    buildingId: 'bld-sci',
    buildingName: 'Science Building',
    name: 'Laboratory 2 (Chemistry Wet Lab)',
    code: 'SCI-LAB-02',
    floor: 2,
    roomType: 'Laboratory',
    capacity: 28,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-sci-prep',
    buildingId: 'bld-sci',
    buildingName: 'Science Building',
    name: 'Chemical Preparation & Storage Room',
    code: 'SCI-PREP',
    floor: 2,
    roomType: 'Laboratory',
    capacity: 8,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // Library Building (LIB)
  {
    id: 'rm-lib-main',
    buildingId: 'bld-lib',
    buildingName: 'Library Building',
    name: 'Library Main Hall & Stacks',
    code: 'LIB-MAIN',
    floor: 1,
    roomType: 'Library',
    capacity: 120,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-lib-avr',
    buildingId: 'bld-lib',
    buildingName: 'Library Building',
    name: 'Audio-Visual Room (AVR)',
    code: 'LIB-AVR',
    floor: 2,
    roomType: 'Auditorium',
    capacity: 80,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-lib-study',
    buildingId: 'bld-lib',
    buildingName: 'Library Building',
    name: 'Quiet Collaborative Study Room A',
    code: 'LIB-STD-A',
    floor: 2,
    roomType: 'Library',
    capacity: 16,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // Engineering Building (ENG)
  {
    id: 'rm-eng-ws1',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    name: 'Engineering Workshop A (Mechanical)',
    code: 'ENG-WS-A',
    floor: 1,
    roomType: 'Workshop',
    capacity: 35,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-eng-com',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    name: 'Computer Laboratory 3 (CAD/Robotics)',
    code: 'ENG-LAB-03',
    floor: 2,
    roomType: 'Laboratory',
    capacity: 40,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-eng-hall',
    buildingId: 'bld-eng',
    buildingName: 'Engineering Building',
    name: '2nd Floor North Corridor & Lockers',
    code: 'ENG-HL-2N',
    floor: 2,
    roomType: 'Hallway',
    capacity: 50,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // Administration Building (ADM)
  {
    id: 'rm-adm-conf',
    buildingId: 'bld-adm',
    buildingName: 'Administration Building',
    name: 'Executive Conference Room',
    code: 'ADM-CONF',
    floor: 2,
    roomType: 'Conference Room',
    capacity: 25,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-adm-reg',
    buildingId: 'bld-adm',
    buildingName: 'Administration Building',
    name: "Registrar's Service Counter & Records",
    code: 'ADM-REG',
    floor: 1,
    roomType: 'Office',
    capacity: 40,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // Student Services Building (SSB)
  {
    id: 'rm-ssb-cafe',
    buildingId: 'bld-ssb',
    buildingName: 'Student Services Building',
    name: 'Campus Dining Commons & Cafeteria',
    code: 'SSB-CAFE',
    floor: 1,
    roomType: 'Hallway',
    capacity: 200,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'rm-ssb-clinic',
    buildingId: 'bld-ssb',
    buildingName: 'Student Services Building',
    name: 'University Health & Medical Clinic',
    code: 'SSB-CLINIC',
    floor: 1,
    roomType: 'Office',
    capacity: 20,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  }
];
