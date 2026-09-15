import { UserRole } from '../types/user';

export const ROLE_NAMES: Record<UserRole, string> = {
  REPORTER: 'Facility Reporter',
  MAINTENANCE_PERSONNEL: 'Maintenance Technician',
  MAINTENANCE_SUPERVISOR: 'Maintenance Supervisor',
  ADMINISTRATOR: 'Campus Administrator'
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  REPORTER: '/dashboard',
  MAINTENANCE_PERSONNEL: '/tasks',
  MAINTENANCE_SUPERVISOR: '/manage',
  ADMINISTRATOR: '/dashboard'
};

export function canSubmitConcern(role: UserRole): boolean {
  return role === 'REPORTER' || role === 'MAINTENANCE_SUPERVISOR' || role === 'ADMINISTRATOR';
}

export function canAssignPersonnel(role: UserRole): boolean {
  return role === 'MAINTENANCE_SUPERVISOR' || role === 'ADMINISTRATOR';
}

export function canExecuteRepairs(role: UserRole): boolean {
  return role === 'MAINTENANCE_PERSONNEL';
}

export function canVerifyRepairs(role: UserRole): boolean {
  return role === 'MAINTENANCE_SUPERVISOR' || role === 'ADMINISTRATOR';
}

export function canManageCampusData(role: UserRole): boolean {
  return role === 'ADMINISTRATOR';
}

export function canViewAnalytics(role: UserRole): boolean {
  return role === 'MAINTENANCE_SUPERVISOR' || role === 'ADMINISTRATOR';
}
