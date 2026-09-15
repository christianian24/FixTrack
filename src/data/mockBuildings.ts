import { Building } from '../types/building';

export const mockBuildings: Building[] = [
  {
    id: 'bld-adm',
    name: 'Administration Building',
    code: 'ADM',
    floors: 3,
    totalRooms: 18,
    description: 'Central administration, registrar, executive offices, and campus boardroom',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    id: 'bld-mab',
    name: 'Main Academic Building',
    code: 'MAB',
    floors: 5,
    totalRooms: 45,
    description: 'Primary lecture halls, general purpose classrooms, and faculty offices',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z'
  },
  {
    id: 'bld-sci',
    name: 'Science Building',
    code: 'SCI',
    floors: 4,
    totalRooms: 32,
    description: 'Specialized wet labs, biology, chemistry, physics, and research suites',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'bld-lib',
    name: 'Library Building',
    code: 'LIB',
    floors: 3,
    totalRooms: 20,
    description: 'Main learning commons, quiet study rooms, multimedia archive, and AVR',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-04-12T00:00:00Z'
  },
  {
    id: 'bld-eng',
    name: 'Engineering Building',
    code: 'ENG',
    floors: 4,
    totalRooms: 38,
    description: 'Engineering fabrication workshops, computer labs, robotics facility, and CAD rooms',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-05-18T00:00:00Z'
  },
  {
    id: 'bld-ssb',
    name: 'Student Services Building',
    code: 'SSB',
    floors: 3,
    totalRooms: 24,
    description: 'Student affairs, clinic, campus cafeteria, counseling, and recreational commons',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-06-20T00:00:00Z'
  }
];
