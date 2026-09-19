import React from 'react';
import { Concern } from '../../types/concern';
import { StatusBadge } from '../common/Badge';
import { formatDateOnly } from '../../lib/formatting';
import { History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RoomRepairHistoryProps {
  currentConcernId: string;
  roomId: string;
  roomName: string;
  allConcerns: Concern[];
}

export const RoomRepairHistory: React.FC<RoomRepairHistoryProps> = ({
  currentConcernId,
  roomId,
  roomName,
  allConcerns,
}) => {
  const history = allConcerns.filter(c => c.roomId === roomId && c.id !== currentConcernId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-50 flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Room History</h4>
        </div>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
          {roomName}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No prior maintenance history for this room.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-3">
            <span className="font-semibold text-slate-700">{history.length}</span> previous report{history.length !== 1 ? 's' : ''} found at this location.
          </p>
          {history.map(item => (
            <Link
              key={item.id}
              to={`/concerns/${item.id}`}
              className="block p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-200 hover:bg-sky-50 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-sky-600">#{item.reportNumber}</span>
                    <span className="text-[10px] text-slate-400">{formatDateOnly(item.createdAt)}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 truncate group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge status={item.status} size="sm" />
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-sky-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
