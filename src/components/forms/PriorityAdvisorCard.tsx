import React from 'react';
import { ConcernPriority, PriorityRecommendationResult } from '../../types/concern';
import { PriorityBadge } from '../common/Badge';
import { ShieldAlert, Info } from 'lucide-react';

interface PriorityAdvisorCardProps {
  recommendation: PriorityRecommendationResult;
  selectedPriority: ConcernPriority;
  onSelectPriority: (p: ConcernPriority) => void;
  allowManualOverride?: boolean;
}

const PRIORITY_STYLES: Record<ConcernPriority, { selected: string; normal: string }> = {
  LOW:      { selected: 'bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold', normal: 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50' },
  MEDIUM:   { selected: 'bg-amber-50 border-amber-400 text-amber-700 font-semibold',     normal: 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50' },
  HIGH:     { selected: 'bg-orange-50 border-orange-400 text-orange-700 font-semibold',  normal: 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50' },
  CRITICAL: { selected: 'bg-rose-50 border-rose-400 text-rose-700 font-semibold',        normal: 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50' },
};

export const PriorityAdvisorCard: React.FC<PriorityAdvisorCardProps> = ({
  recommendation,
  selectedPriority,
  onSelectPriority,
  allowManualOverride = true,
}) => {
  const priorities: ConcernPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return (
    <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-sky-600" />
          </div>
          <h4 className="text-sm font-semibold text-sky-800">Priority Recommendation</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-600">Suggested:</span>
          <PriorityBadge priority={recommendation.recommendedPriority} size="sm" />
        </div>
      </div>

      {/* Reasons */}
      <div className="bg-white rounded-xl p-3 border border-sky-100 space-y-1.5">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400" /> Evaluation Rules
        </p>
        <ul className="space-y-1 pl-4 list-disc text-xs text-slate-700">
          {recommendation.reasons.map((reason, idx) => (
            <li key={idx} className="leading-snug">{reason}</li>
          ))}
        </ul>
      </div>

      {/* Manual override */}
      {allowManualOverride && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">Select Priority:</span>
            {selectedPriority !== recommendation.recommendedPriority && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Manual Override
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {priorities.map((p) => {
              const isSelected = selectedPriority === p;
              const isRecommended = recommendation.recommendedPriority === p;
              const style = PRIORITY_STYLES[p];

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPriority(p)}
                  className={`relative py-2 px-1 text-xs font-medium rounded-xl border transition-all ${
                    isSelected ? style.selected : style.normal
                  }`}
                >
                  {p}
                  {isRecommended && (
                    <span
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-500 border-2 border-white"
                      title="Recommended"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
