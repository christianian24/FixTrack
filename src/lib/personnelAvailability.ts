import type { Concern, ConcernStatus } from '../types/concern';

export type PersonnelAvailability = 'NOT AVAILABLE' | 'AVAILABLE' | 'BUSY';

const BUSY_CONCERN_STATUSES: ReadonlySet<ConcernStatus> = new Set([
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_FOR_MATERIALS',
  'REJECTED',
]);

export function getPersonnelAvailability(
  personnelId: string,
  isOnline: boolean,
  concerns: readonly Pick<Concern, 'assignedPersonnelId' | 'status'>[],
): PersonnelAvailability {
  if (!isOnline) return 'NOT AVAILABLE';

  const hasUnfinishedAssignment = concerns.some(
    (concern) =>
      concern.assignedPersonnelId === personnelId &&
      BUSY_CONCERN_STATUSES.has(concern.status),
  );

  return hasUnfinishedAssignment ? 'BUSY' : 'AVAILABLE';
}
