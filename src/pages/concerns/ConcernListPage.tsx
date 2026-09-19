import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../lib/formatting';
import { ConcernPriority } from '../../types/concern';
import {
  Search,
  PlusCircle,
  LayoutGrid,
  List,
  ArrowRight,
  FileText,
  X,
} from 'lucide-react';

export const ConcernListPage: React.FC = () => {
  const { currentRole } = useAuth();
  const { concerns, buildings, categories } = useFacilityCare();
  const isCompactRole = currentRole === 'REPORTER' || currentRole === 'MAINTENANCE_SUPERVISOR' || currentRole === 'ADMINISTRATOR';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  const filteredConcerns = useMemo(() => {
    let list = [...concerns];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.reportNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.roomName.toLowerCase().includes(q) ||
          c.buildingName.toLowerCase().includes(q) ||
          c.reporterName.toLowerCase().includes(q),
      );
    }

    if (selectedStatus !== 'ALL')   list = list.filter(c => c.status === selectedStatus);
    if (selectedPriority !== 'ALL') list = list.filter(c => c.priority === selectedPriority);
    if (selectedCategory !== 'ALL') list = list.filter(c => c.categoryId === selectedCategory);
    if (selectedBuilding !== 'ALL') list = list.filter(c => c.buildingId === selectedBuilding);

    if (sortBy === 'newest')   list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === 'priority') {
      const weights: Record<ConcernPriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      list.sort((a, b) => weights[b.priority] - weights[a.priority]);
    }

    return list;
  }, [concerns, searchQuery, selectedStatus, selectedPriority, selectedCategory, selectedBuilding, sortBy]);

  const hasActiveFilter = searchQuery || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || selectedCategory !== 'ALL' || selectedBuilding !== 'ALL';
  const reportConcernButtonClass = currentRole === 'ADMINISTRATOR'
    ? 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-sm transition-colors flex-shrink-0'
    : currentRole === 'MAINTENANCE_SUPERVISOR'
    ? 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 shadow-sm transition-colors flex-shrink-0'
    : currentRole === 'MAINTENANCE_PERSONNEL'
    ? 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-sm transition-colors flex-shrink-0'
    : 'btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm flex-shrink-0';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedCategory('ALL');
    setSelectedBuilding('ALL');
  };

  return (
    <div className={isCompactRole ? 'space-y-3' : 'space-y-4'}>
      {/* Page header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isCompactRole ? 'gap-3' : 'gap-4'}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Facility Concerns</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredConcerns.length} concern{filteredConcerns.length !== 1 ? 's' : ''} found
            {concerns.length !== filteredConcerns.length ? ` (of ${concerns.length} total)` : ''}
          </p>
        </div>
        <Link
          to="/concerns/new"
          id="new-concern-btn"
          className={reportConcernButtonClass}
        >
          <PlusCircle className="w-4 h-4" /> Report a Concern
        </Link>
      </div>

      {/* Filter bar */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-3' : 'p-4'} space-y-3`}>
        {/* Search + view toggle + sort */}
        <div className={`flex flex-col sm:flex-row items-center ${isCompactRole ? 'gap-2' : 'gap-3'}`}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by report #, keyword, room, or reporter…"
              className="search-input w-full"
              id="concerns-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select-base text-sm py-2 px-3"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <select value={selectedStatus}   onChange={(e) => setSelectedStatus(e.target.value)}   className="select-base text-sm py-2">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_MATERIALS">Waiting for Materials</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="select-base text-sm py-2">
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="select-base text-sm py-2">
            <option value="ALL">All Buildings</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="select-base text-sm py-2">
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        {hasActiveFilter && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-medium text-sky-600">Showing {filteredConcerns.length} of {concerns.length} concerns</span>
            <button onClick={resetFilters} className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
              <X className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredConcerns.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No concerns match your search"
          description="Try broadening your search or clearing the active filters above."
          action={
            <button
              onClick={resetFilters}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Clear All Filters
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        // ── Table View ────────────────────────────────────────────
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Report #</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Issue</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Location</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Category</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Priority</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Status</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Assigned To</th>
                  <th className={isCompactRole ? 'py-2.5 px-3' : 'py-3 px-4'}>Reported</th>
                  <th className={isCompactRole ? 'py-2.5 px-3 text-right' : 'py-3 px-4 text-right'}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConcerns.map((concern) => (
                  <tr
                    key={concern.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap' : 'py-3 px-4 whitespace-nowrap'}>
                      <span className="text-xs font-semibold text-slate-600">
                        #{concern.reportNumber}
                      </span>
                    </td>
                    <td className={isCompactRole ? 'py-2.5 px-3 max-w-xs' : 'py-3 px-4 max-w-xs'}>
                      <Link
                        to={`/concerns/${concern.id}`}
                        className="font-medium text-slate-800 hover:text-sky-600 transition-colors line-clamp-1"
                      >
                        {concern.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        By {concern.reporterName} ({concern.reporterType})
                      </span>
                    </td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap' : 'py-3 px-4 whitespace-nowrap'}>
                      <div className="font-medium text-slate-700">{concern.roomName}</div>
                      <div className="text-[11px] text-slate-400">{concern.buildingName}</div>
                    </td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap text-slate-600' : 'py-3 px-4 whitespace-nowrap text-slate-600'}>{concern.categoryName}</td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap' : 'py-3 px-4 whitespace-nowrap'}><PriorityBadge priority={concern.priority} size="sm" /></td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap' : 'py-3 px-4 whitespace-nowrap'}><StatusBadge status={concern.status} size="sm" /></td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap' : 'py-3 px-4 whitespace-nowrap'}>
                      {concern.assignedPersonnelName ? (
                        <span className="text-slate-700 font-medium">{concern.assignedPersonnelName}</span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className={isCompactRole ? 'py-2.5 px-3 whitespace-nowrap text-slate-400 text-xs' : 'py-3 px-4 whitespace-nowrap text-slate-400 text-xs'} title={concern.createdAt}>
                      {formatRelativeTime(concern.createdAt)}
                    </td>
                    <td className={isCompactRole ? 'py-2.5 px-3 text-right whitespace-nowrap' : 'py-3 px-4 text-right whitespace-nowrap'}>
                      <Link
                        to={`/concerns/${concern.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ── Grid View ─────────────────────────────────────────────
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isCompactRole ? 'gap-3' : 'gap-4'}`}>
          {filteredConcerns.map((concern) => (
            <Link
              key={concern.id}
              to={`/concerns/${concern.id}`}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4 space-y-3' : 'p-5 space-y-4'} hover:shadow-md hover:border-sky-200 flex flex-col justify-between transition-all group`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    #{concern.reportNumber}
                  </span>
                  <StatusBadge status={concern.status} size="sm" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2">
                  {concern.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {concern.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Location</span>
                  <span className="text-slate-700 font-medium truncate max-w-[180px] text-right">{concern.roomName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Priority</span>
                  <PriorityBadge priority={concern.priority} size="sm" />
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Assigned</span>
                  <span className="text-slate-700 font-medium truncate">{concern.assignedPersonnelName || 'Unassigned'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
