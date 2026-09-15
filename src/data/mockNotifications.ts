import { AppNotification } from '../types/notification';

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-reporter-student',
    title: 'Repair In Progress',
    message: 'Senior Electrician Juan Dela Cruz has started repair work on FC-2026-0001 (Faulty electrical outlet sparking).',
    type: 'REPAIR_STARTED',
    concernId: 'cn-001',
    reportNumber: 'FC-2026-0001',
    read: false,
    createdAt: '2026-09-14T09:10:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-tech-1',
    title: 'High Priority Task Assigned',
    message: 'You have been assigned to repair FC-2026-0007 (Oscillating electric wall fan blade vibrating violently).',
    type: 'PERSONNEL_ASSIGNED',
    concernId: 'cn-007',
    reportNumber: 'FC-2026-0007',
    read: false,
    createdAt: '2026-09-14T07:55:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-supervisor',
    title: 'Repair Awaiting Verification',
    message: 'Technician Robert Taylor marked FC-2026-0010 (Daikin AC in Computer Lab 3) as COMPLETED. Verification required.',
    type: 'REPAIR_COMPLETED',
    concernId: 'cn-010',
    reportNumber: 'FC-2026-0010',
    read: false,
    createdAt: '2026-09-13T10:30:00Z'
  },
  {
    id: 'notif-4',
    userId: 'user-reporter-faculty',
    title: 'Maintenance Status Updated',
    message: 'FC-2026-0002 (Severe water leak under sink) is now Waiting for Materials. Commercial flex-hose ordered.',
    type: 'WAITING_MATERIALS',
    concernId: 'cn-002',
    reportNumber: 'FC-2026-0002',
    read: true,
    createdAt: '2026-09-13T16:00:00Z'
  },
  {
    id: 'notif-5',
    userId: 'user-reporter-student',
    title: 'Request Closed',
    message: 'Supervisor Engr. Carlos Mendoza verified and closed FC-2026-0013 (Broken classroom chair leg).',
    type: 'REQUEST_CLOSED',
    concernId: 'cn-013',
    reportNumber: 'FC-2026-0013',
    read: true,
    createdAt: '2026-09-02T14:00:00Z'
  },
  {
    id: 'notif-6',
    userId: 'user-admin',
    title: 'Critical Safety Hazard Reported',
    message: 'Emergency report FC-2026-0012 submitted for Chemistry Lab 2 (Fume Hood Sash Cable Snapped).',
    type: 'REPORT_SUBMITTED',
    concernId: 'cn-012',
    reportNumber: 'FC-2026-0012',
    read: false,
    createdAt: '2026-09-14T08:40:00Z'
  }
];
