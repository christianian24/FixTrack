import { UserRole } from '../types/user';

export const ROLE_NAMES: Record<UserRole, string> = {
  REPORTER: 'Facility Reporter',
  MAINTENANCE_PERSONNEL: 'Maintenance Technician',
  MAINTENANCE_SUPERVISOR: 'Maintenance Supervisor',
  ADMINISTRATOR: 'Campus Administrator'
};
