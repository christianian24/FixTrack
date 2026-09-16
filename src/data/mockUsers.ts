import { User } from '../types/user';

export const mockUsers: User[] = [
  {
    id: 'user-reporter-student',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.student@school.edu',
    role: 'REPORTER',
    userType: 'STUDENT',
    phone: '+1 (555) 234-5671',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science',
    studentId: 'STU-2024-0891',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'user-reporter-faculty',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.faculty@school.edu',
    role: 'REPORTER',
    userType: 'FACULTY',
    phone: '+1 (555) 345-6782',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'College of Engineering & Sciences',
    status: 'ACTIVE',
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'user-tech-1',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.tech@school.edu',
    role: 'MAINTENANCE_PERSONNEL',
    userType: 'MAINTENANCE',
    phone: '+1 (555) 456-7893',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Electrical & General Maintenance',
    status: 'ACTIVE',
    createdAt: '2025-03-10T08:00:00Z',
    updatedAt: '2026-09-10T14:20:00Z'
  },
  {
    id: 'user-tech-2',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@school.edu',
    role: 'MAINTENANCE_PERSONNEL',
    userType: 'MAINTENANCE',
    phone: '+1 (555) 567-8904',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Plumbing & HVAC Services',
    status: 'ACTIVE',
    createdAt: '2025-05-12T08:00:00Z',
    updatedAt: '2026-09-08T11:15:00Z'
  },
  {
    id: 'user-supervisor',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.supervisor@school.edu',
    role: 'MAINTENANCE_SUPERVISOR',
    userType: 'SUPERVISOR',
    phone: '+1 (555) 678-9015',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Facilities & Campus Operations',
    status: 'ACTIVE',
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2026-09-12T16:00:00Z'
  },
  {
    id: 'user-admin',
    firstName: 'Elena',
    lastName: 'Vance',
    email: 'elena.admin@school.edu',
    role: 'ADMINISTRATOR',
    userType: 'ADMINISTRATOR',
    phone: '+1 (555) 789-0126',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Campus Administration & IT',
    status: 'ACTIVE',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2026-09-14T09:00:00Z'
  }
];
