export type NotificationType = 
  | 'REPORT_SUBMITTED'
  | 'REPORT_REVIEWED'
  | 'PERSONNEL_ASSIGNED'
  | 'REPAIR_STARTED'
  | 'WAITING_MATERIALS'
  | 'PROGRESS_UPDATED'
  | 'REPAIR_COMPLETED'
  | 'REPAIR_VERIFIED'
  | 'REPAIR_REJECTED'
  | 'REQUEST_CLOSED'
  | 'PRIORITY_CHANGED';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  concernId?: string;
  reportNumber?: string;
  read: boolean;
  createdAt: string;
}
