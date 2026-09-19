import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckSquare, Search, ArrowRight, ChevronDown, CalendarDays, Building2, MapPin, LayoutGrid, List } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'priority' | 'status';

const priorityRank = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 } as const;

const formatDate = (value?: string) => {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const MaintenanceTasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { concerns } = useFacilityCare();
  const isTechnician = currentUser.role === 'MAINTENANCE_PERSONNEL';

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [buildingFilter, setBuildingFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const tasks = useMemo(
    () => concerns.filter((concern) =>
      currentUser.role === 'MAINTENANCE_PERSONNEL'
        ? concern.assignedPersonnelId === currentUser.id
        : !!concern.assignedPersonnelId,
    ),
    [concerns, currentUser.id, currentUser.role],
  );

  const buildingOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.buildingName).filter(Boolean))).sort(),
    [tasks],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.categoryName).filter(Boolean))).sort(),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const results = tasks.filter((task) => {
      const matchesSearch = !normalized || [
        task.reportNumber,
        task.title,
        task.description,
        task.roomName,
        task.buildingName,
        task.reporterName,
        task.categoryName,
      ].some((value) => value?.toLowerCase().includes(normalized));

      const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
      const matchesBuilding = buildingFilter === 'ALL' || task.buildingName === buildingFilter;
      const matchesCategory = categoryFilter === 'ALL' || task.categoryName === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesBuilding && matchesCategory;
    });

    return [...results].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          return priorityRank[b.priority] - priorityRank[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [buildingFilter, categoryFilter, priorityFilter, searchTerm, sortBy, statusFilter, tasks]);

  const cardHoverClasses = isTechnician ? 'hover:border-emerald-200' : 'hover:border-sky-200';
  const linkClasses = isTechnician
    ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors'
    : 'inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors';

  return (
    <div className={isTechnician ? 'space-y-3' : 'space-y-4'}>
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isTechnician ? 'p-3' : 'p-4'} space-y-3`}>
        <div className={`flex flex-col sm:flex-row items-center ${isTechnician ? 'gap-2' : 'gap-3'}`}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by report #, keyword, room, or reporter…"
              className="search-input w-full"
              aria-label="Search work orders"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Table view"
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="select-base text-sm py-2 px-3 pr-9"
                aria-label="Sort work orders"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Highest Priority</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <label className="relative block">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="select-base text-sm py-2 pr-9"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_MATERIALS">Waiting for Materials</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </label>

          <label className="relative block">
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="select-base text-sm py-2 pr-9"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </label>

          <label className="relative block">
            <select
              value={buildingFilter}
              onChange={(event) => setBuildingFilter(event.target.value)}
              className="select-base text-sm py-2 pr-9"
            >
              <option value="ALL">All Buildings</option>
              {buildingOptions.map((building) => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </label>

          <label className="relative block">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="select-base text-sm py-2 pr-9"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </label>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in this category"
          description="There are currently no maintenance work orders matching your filters."
        />
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Report #</th>
                  <th className="py-2.5 px-3">Issue</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Scheduled</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">#{task.reportNumber}</td>
                    <td className="py-2.5 px-3 min-w-[220px]">
                      <div className="font-medium text-slate-800">{task.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{task.roomName}</td>
                    <td className="py-2.5 px-3"><PriorityBadge priority={task.priority} size="sm" /></td>
                    <td className="py-2.5 px-3"><StatusBadge status={task.status} size="sm" /></td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(task.scheduledDate || task.createdAt)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Link to={`/tasks/${task.id}`} className={linkClasses}>Open <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isTechnician ? 'gap-3' : 'gap-4'}`}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isTechnician ? 'p-3 space-y-2' : 'p-4 space-y-3'} hover:shadow-md ${cardHoverClasses} flex flex-col justify-between transition-all group`}
            >
              <div className={isTechnician ? 'space-y-2' : 'space-y-2.5'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">#{task.reportNumber}</span>
                    <span className="text-xs text-slate-400">{task.roomName}</span>
                  </div>
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>

                <h3 className={`text-sm font-semibold text-slate-800 transition-colors ${isTechnician ? 'group-hover:text-emerald-600' : 'group-hover:text-sky-600'}`}>
                  {task.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <CalendarDays className={`w-3.5 h-3.5 ${isTechnician ? 'text-emerald-500' : 'text-sky-500'}`} />
                  {formatDate(task.scheduledDate || task.createdAt)}
                </div>
              </div>

              <div className={`${isTechnician ? 'pt-3' : 'pt-3.5'} border-t border-slate-100 flex items-center justify-between`}>
                <StatusBadge status={task.status} size="sm" />
                <Link
                  to={`/tasks/${task.id}`}
                  className={linkClasses}
                >
                  Open Order <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
