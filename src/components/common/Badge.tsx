import React from 'react';
import { ConcernStatus, ConcernPriority } from '../../types/concern';
import { getStatusBadge, getPriorityBadge } from '../../lib/formatting';

interface StatusBadgeProps {
  status: ConcernStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const style = getStatusBadge(status);
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5'
      : size === 'lg'
      ? 'text-xs px-3 py-1'
      : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-colors ${style.className} ${sizeClass} ${className}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.dotColor }}
        />
      )}
      <span>{style.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: ConcernPriority;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const style = getPriorityBadge(priority);
  const sizeClass =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5'
      : size === 'lg'
      ? 'text-xs px-3 py-1'
      : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-colors ${style.className} ${sizeClass} ${className}`}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.dotColor }}
        />
      )}
      <span>{style.label}</span>
    </span>
  );
};
