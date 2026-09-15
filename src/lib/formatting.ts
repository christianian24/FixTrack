import { ConcernStatus, ConcernPriority } from '../types/concern';

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1)  return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7)  return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export interface BadgeStyle {
  label:     string;
  className: string;
  dotColor:  string;
}

export function getStatusBadge(status: ConcernStatus): BadgeStyle {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending',              className: 'badge-pending',   dotColor: '#d97706' };
    case 'UNDER_REVIEW':
      return { label: 'Under Review',         className: 'badge-review',    dotColor: '#2563eb' };
    case 'ASSIGNED':
      return { label: 'Assigned',             className: 'badge-assigned',  dotColor: '#4f46e5' };
    case 'IN_PROGRESS':
      return { label: 'In Progress',          className: 'badge-progress',  dotColor: '#0284c7' };
    case 'WAITING_FOR_MATERIALS':
      return { label: 'Waiting for Parts',    className: 'badge-materials', dotColor: '#ea580c' };
    case 'COMPLETED':
      return { label: 'Completed',            className: 'badge-completed', dotColor: '#16a34a' };
    case 'CLOSED':
      return { label: 'Closed',               className: 'badge-closed',    dotColor: '#64748b' };
    default:
      return { label: status, className: 'badge-closed', dotColor: '#64748b' };
  }
}

export function getPriorityBadge(priority: ConcernPriority): BadgeStyle {
  switch (priority) {
    case 'CRITICAL':
      return { label: 'Critical', className: 'badge-critical',  dotColor: '#e11d48' };
    case 'HIGH':
      return { label: 'High',     className: 'badge-materials', dotColor: '#ea580c' };
    case 'MEDIUM':
      return { label: 'Medium',   className: 'badge-review',    dotColor: '#2563eb' };
    case 'LOW':
      return { label: 'Low',      className: 'badge-completed', dotColor: '#16a34a' };
    default:
      return { label: priority,   className: 'badge-review',    dotColor: '#2563eb' };
  }
}
