import React from 'react';
import { TimelineEvent, ConcernStatus } from '../../types/concern';
import { formatDateTime, formatRelativeTime } from '../../lib/formatting';
import { CheckCircle2, Clock, Wrench, ShieldCheck, AlertCircle, Play, Package } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  currentStatus: ConcernStatus;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, currentStatus }) => {
  const steps: { status: ConcernStatus; label: string }[] = [
    { status: 'PENDING',    label: 'Reported' },
    { status: 'UNDER_REVIEW', label: 'Triage' },
    { status: 'ASSIGNED',  label: 'Assigned' },
    { status: 'IN_PROGRESS', label: 'In Progress' },
    { status: 'COMPLETED', label: 'Completed' },
    { status: 'CLOSED',    label: 'Closed' },
  ];

  const getStepIndex = (st: ConcernStatus): number => {
    if (st === 'PENDING')    return 0;
    if (st === 'UNDER_REVIEW') return 1;
    if (st === 'ASSIGNED')   return 2;
    if (st === 'IN_PROGRESS' || st === 'WAITING_FOR_MATERIALS') return 3;
    if (st === 'COMPLETED')  return 4;
    if (st === 'CLOSED')     return 5;
    return 0;
  };

  const currentIdx = getStepIndex(currentStatus);

  const getEventIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('closed') || act.includes('verified')) return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
    if (act.includes('completed')) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (act.includes('started') || act.includes('in progress')) return <Play className="w-3.5 h-3.5 text-sky-500" />;
    if (act.includes('assigned')) return <Wrench className="w-3.5 h-3.5 text-sky-500" />;
    if (act.includes('materials')) return <Package className="w-3.5 h-3.5 text-amber-500" />;
    if (act.includes('priority') || act.includes('rejected')) return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
    return <Clock className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-3">
      {/* Progress pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Repair Progress
        </h4>
        <div className="relative flex items-center justify-between">
          {/* Track line */}
          <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute top-3 left-3 h-0.5 bg-sky-400 z-0 transition-all duration-500"
            style={{ width: `${(currentIdx / (steps.length - 1)) * 92}%` }}
          />
          {steps.map((step, idx) => {
            const isPassed  = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step.status} className="relative z-10 flex min-w-0 flex-col items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                  isCurrent
                    ? 'bg-sky-500 border-sky-500 text-white ring-4 ring-sky-100'
                    : isPassed
                    ? 'bg-white border-sky-400 text-sky-500'
                    : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  {isPassed ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] text-center leading-tight break-words font-medium ${
                  isCurrent ? 'text-sky-600' : isPassed ? 'text-slate-500' : 'text-slate-300'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Activity Log ({timeline.length} events)
        </h4>
        <div className="max-h-[240px] overflow-y-auto pr-1 md:max-h-[220px]">
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-4 ml-1">
            {timeline.slice().reverse().map((event) => (
              <div key={event.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm">
                  {getEventIcon(event.action)}
                </div>

                {/* Event card */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800">{event.action}</span>
                    <span className="text-[10px] text-slate-400" title={formatDateTime(event.timestamp)}>
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{event.actorName}</span>
                    <span>·</span>
                    <span className="text-[10px]">{event.actorRole.replace(/_/g, ' ')}</span>
                  </div>
                  {event.notes && (
                    <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg p-2 leading-relaxed">
                      {event.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
