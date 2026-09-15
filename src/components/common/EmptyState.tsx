import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}>
      {Icon && (
        <div className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 bg-slate-100 border border-slate-200 text-slate-500 shadow-xs">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800">
        {title}
      </h4>
      {description && (
        <p className="text-xs mt-1.5 max-w-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

