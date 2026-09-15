import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { Concern } from '../../types/concern';
import { Link } from 'react-router-dom';

interface DuplicateWarningBannerProps {
  matchedConcern: Concern;
  reason?: string;
  onContinueAnyway: () => void;
  onCancelSubmission: () => void;
}

export const DuplicateWarningBanner: React.FC<DuplicateWarningBannerProps> = ({
  matchedConcern,
  reason,
  onContinueAnyway,
  onCancelSubmission,
}) => {
  return (
    <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-100">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            Possible Duplicate Detected
          </p>
          <p className="text-xs mt-1 leading-relaxed text-amber-700">
            {reason || 'A similar concern may already exist for this room/category combination.'}
          </p>

          {/* Matched concern preview */}
          <div className="mt-3 p-3 rounded-xl bg-white border border-amber-200">
            <p className="text-xs font-semibold text-slate-500">
              #{matchedConcern.reportNumber}
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {matchedConcern.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {matchedConcern.roomName} · {matchedConcern.categoryName}
            </p>
            <Link
              to={`/concerns/${matchedConcern.id}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              View existing report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={onCancelSubmission}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel my submission
            </button>
            <button
              type="button"
              onClick={onContinueAnyway}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-700 bg-amber-100 border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              Submit anyway
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancelSubmission}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
