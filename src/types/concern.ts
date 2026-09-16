import { UserRole, UserType } from './user';

export type ConcernStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_MATERIALS'
  | 'COMPLETED'
  | 'CLOSED';

export type ConcernPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SafetyRisk = 'NONE' | 'MINOR' | 'SIGNIFICANT' | 'IMMEDIATE_DANGER';

export type AffectedUsers = 'INDIVIDUAL' | 'CLASS' | 'FLOOR' | 'CAMPUS_WIDE';

export interface TimelineEvent {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  timestamp: string;
  notes?: string;
  statusBefore?: ConcernStatus;
  statusAfter?: ConcernStatus;
}

export interface ConcernPhotoEvidence {
  id: string;
  url: string;
  isCompletionPhoto: boolean;
  filename?: string | null;
}

export interface Concern {
  id: string;
  reportNumber: string; // e.g. FC-2026-0001
  title: string;
  description: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  reporterType: UserType;
  
  categoryId: string;
  categoryName: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomName: string;

  priority: ConcernPriority;
  priorityReason: string[];
  status: ConcernStatus;

  safetyRisk: SafetyRisk;
  affectedUsers: AffectedUsers;
  duplicateCount: number;
  duplicateOfId?: string;

  assignedPersonnelId?: string;
  assignedPersonnelName?: string;
  scheduledDate?: string;

  repairNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  photoRecords?: ConcernPhotoEvidence[];

  timeline: TimelineEvent[];

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  closedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  score: number;
  matchedConcern?: Concern;
  reason?: string;
}

export interface PriorityRecommendationResult {
  recommendedPriority: ConcernPriority;
  reasons: string[];
}
