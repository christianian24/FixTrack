import { UserRole } from '../types/user';

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const demoAccounts: DemoAccount[] = [
  {
    id: 'usr_student_001',
    name: 'Alex Rivera',
    email: 'alex.student@school.edu',
    role: 'REPORTER',
  },
  {
    id: 'usr_faculty_002',
    name: 'Dr. Maria Santos',
    email: 'maria.faculty@school.edu',
    role: 'REPORTER',
  },
  {
    id: 'usr_tech_003',
    name: 'Juan Dela Cruz',
    email: 'juan.tech@school.edu',
    role: 'MAINTENANCE_PERSONNEL',
  },
  {
    id: 'usr_tech_006',
    name: 'Robert Taylor',
    email: 'robert.taylor@school.edu',
    role: 'MAINTENANCE_PERSONNEL',
  },
  {
    id: 'usr_super_004',
    name: 'Engr. Carlos Mendoza',
    email: 'carlos.supervisor@school.edu',
    role: 'MAINTENANCE_SUPERVISOR',
  },
  {
    id: 'usr_admin_005',
    name: 'Elena Vance',
    email: 'elena.admin@school.edu',
    role: 'ADMINISTRATOR',
  },
];
