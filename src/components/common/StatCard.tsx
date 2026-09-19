import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: { value: number; label: string };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconBgColor = 'bg-sky-50',
  iconColor = 'text-sky-600',
  className = '',
}) => {
  const isPositiveTrend = trend && trend.value >= 0;

  return (
    <div className={`card-base p-3.5 sm:p-4 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-1.5">
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium mt-2 ${
            isPositiveTrend ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          <span>{isPositiveTrend ? '↑' : '↓'}</span>
          <span>
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};
