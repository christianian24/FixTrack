import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckSquare, Calendar, ArrowRight } from 'lucide-react';

type TaskTab = 'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_MATERIALS' | 'COMPLETED';

export const MaintenanceTasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { concerns } = useFacilityCare();
  const isTechnician = currentUser.role === 'MAINTENANCE_PERSONNEL';
  const activeTabClasses = isTechnician
    ? 'bg-emerald-500 text-white shadow-sm'
    : 'bg-sky-500 text-white shadow-sm';
  const inactiveTabClasses = isTechnician
    ? 'text-slate-500 hover:text-slate-700 hover:bg-emerald-50'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50';
  const badgeClasses = isTechnician
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-500';
  const cardHoverClasses = isTechnician
    ? 'hover:border-emerald-200'
    : 'hover:border-sky-200';
  const linkClasses = isTechnician
    ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors'
    : 'inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors';
  const [activeTab, setActiveTab] = useState<TaskTab>('ALL');

  const tasks = concerns.filter(c =>
    currentUser.role === 'MAINTENANCE_PERSONNEL'
      ? c.assignedPersonnelId === currentUser.id
      : !!c.assignedPersonnelId,
  );

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'COMPLETED') return t.status === 'COMPLETED' || t.status === 'CLOSED';
    return t.status === activeTab;
  });

  const tabs: { key: TaskTab; label: string; count: number }[] = [
    { key: 'ALL',                   label: 'All',           count: tasks.length },
    { key: 'ASSIGNED',              label: 'Pending',       count: tasks.filter(t => t.status === 'ASSIGNED').length },
    { key: 'IN_PROGRESS',           label: 'In Progress',   count: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { key: 'WAITING_FOR_MATERIALS', label: 'Waiting Parts', count: tasks.filter(t => t.status === 'WAITING_FOR_MATERIALS').length },
    { key: 'COMPLETED',             label: 'Completed',     count: tasks.filter(t => t.status === 'COMPLETED' || t.status === 'CLOSED').length },
  ];

  return (
    <div className={isTechnician ? 'space-y-3' : 'space-y-4'}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isTechnician ? 'gap-3' : 'gap-4'}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Work Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tasks.length} maintenance task{tasks.length !== 1 ? 's' : ''} assigned
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={`flex flex-wrap items-center ${isTechnician ? 'gap-1 p-1' : 'gap-1.5 p-1.5'} rounded-2xl bg-white border border-slate-200 shadow-sm`}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${isTechnician ? 'px-3 py-1.5' : 'px-3.5 py-2'} text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
              activeTab === tab.key ? activeTabClasses : inactiveTabClasses
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : badgeClasses
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task cards */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in this category"
          description="There are currently no maintenance work orders in this state."
        />
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

                {task.scheduledDate && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <Calendar className={`w-3.5 h-3.5 ${isTechnician ? 'text-emerald-500' : 'text-sky-500'}`} />
                    Scheduled: {task.scheduledDate}
                  </div>
                )}
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
