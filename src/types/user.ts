export type UserRole = 
  | 'REPORTER'
  | 'MAINTENANCE_PERSONNEL'
  | 'MAINTENANCE_SUPERVISOR'
  | 'ADMINISTRATOR';

export type UserType = 
  | 'STUDENT'
  | 'FACULTY'
  | 'MAINTENANCE'
  | 'SUPERVISOR'
  | 'ADMINISTRATOR';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  userType: UserType;
  phone?: string;
  avatar?: string;
  department?: string;
  studentId?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
