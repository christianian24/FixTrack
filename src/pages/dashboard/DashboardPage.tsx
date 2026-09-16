import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import {
  FileText,
  PlusCircle,
  Clock,
  Wrench,
  CheckCircle2,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckSquare,
  Activity,
  Layers,
  CalendarDays,
  Bell,
  MapPin,
  FileSpreadsheet,
  Users,
  Building as BuildingIcon,
  DoorOpen,
  FolderTree,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ──────────────────────────────────────────────────────────────────
//  Shared section card wrapper
// ──────────────────────────────────────────────────────────────────
const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Concern row for list tables
const ConcernRow: React.FC<{
  to: string;
  reportNumber: string;
  location: string;
  title: string;
  priority: any;
  status: any;
}> = ({ to, reportNumber, location, title, priority, status }) => (
  <Link
    to={to}
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors group"
  >
    <div className="min-w-0 space-y-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500">#{reportNumber}</span>
        <span className="text-xs text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{location}</span>
      </div>
      <p className="text-sm font-medium text-slate-800 group-hover:text-sky-600 transition-colors truncate">
        {title}
      </p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <PriorityBadge priority={priority} size="sm" />
      <StatusBadge status={status} size="sm" />
    </div>
  </Link>
);

// Status step tracker
const STATUS_STEPS = [
  { key: 'PENDING',      label: 'Submitted',    color: 'bg-amber-400'   },
  { key: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-sky-400'     },
  { key: 'ASSIGNED',     label: 'Assigned',     color: 'bg-indigo-400'  },
  { key: 'IN_PROGRESS',  label: 'In Progress',  color: 'bg-violet-500'  },
  { key: 'COMPLETED',    label: 'Completed',    color: 'bg-emerald-500' },
  { key: 'CLOSED',       label: 'Closed',       color: 'bg-slate-400'   },
];

// ══════════════════════════════════════════════════════════════════
export const DashboardPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { concerns, buildings } = useFacilityCare();
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Role 1: Reporter (Student / Faculty) ────────────────────────
  if (currentRole === 'REPORTER') {
    const myConcerns = concerns.filter(c => c.reporterId === currentUser.id);
    const pending    = myConcerns.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;
    const inProgress = myConcerns.filter(c => ['IN_PROGRESS', 'ASSIGNED', 'WAITING_FOR_MATERIALS'].includes(c.status)).length;
    const resolved   = myConcerns.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED').length;
    const statusCounts = STATUS_STEPS.map(s => ({ ...s, count: myConcerns.filter(c => c.status === s.key).length })).filter(s => s.count > 0);
    const latestConcern   = myConcerns[0] ?? null;
    const latestStepIndex = latestConcern ? STATUS_STEPS.findIndex(s => s.key === latestConcern.status) : -1;

    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-sky-200">
          <div>
            <p className="text-sky-100 text-sm">{greeting()}, {currentUser.firstName}</p>
            <h1 className="text-xl font-bold mt-0.5">{(currentUser as any).department ?? 'School Facility Portal'}</h1>
            <p className="text-sky-100 text-sm mt-1">Track and manage your facility concern reports below.</p>
          </div>
          <Link to="/concerns/new" id="report-concern-btn" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-sky-600 rounded-xl font-semibold text-sm hover:bg-sky-50 transition-colors flex-shrink-0 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Report a Concern
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Reports"     value={myConcerns.length} icon={FileText}     subtitle="Total concerns filed" />
          <StatCard title="Pending Review" value={pending}           icon={Clock}        subtitle="Awaiting triage"   iconBgColor="bg-amber-50"   iconColor="text-amber-600" />
          <StatCard title="In Progress"    value={inProgress}        icon={Wrench}       subtitle="Being repaired"    iconBgColor="bg-violet-50"  iconColor="text-violet-600" />
          <StatCard title="Resolved"       value={resolved}          icon={CheckCircle2} subtitle="Completed repairs" iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        </div>

        {/* Status tracker + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Section className="lg:col-span-2">
            <SectionHeader
              title="Latest Report — Live Status"
              subtitle={latestConcern ? `#${latestConcern.reportNumber} · ${latestConcern.title}` : 'No active concerns'}
              action={latestConcern && (<Link to={`/concerns/${latestConcern.id}`} className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">View Details <ArrowRight className="w-3.5 h-3.5" /></Link>)}
            />
            {latestConcern ? (
              <>
                <div className="flex items-start mb-5">
                  {STATUS_STEPS.map((step, idx) => {
                    const isActive = idx === latestStepIndex;
                    const isPast   = idx < latestStepIndex;
                    return (
                      <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={`w-full h-1.5 rounded-full transition-all ${isPast ? 'bg-sky-400' : isActive ? 'bg-sky-500' : 'bg-slate-100'}`} />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isPast ? 'border-sky-400 bg-sky-400' : isActive ? 'border-sky-500 bg-white ring-2 ring-sky-200' : 'border-slate-200 bg-white'}`}>
                          {isPast   && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                          {isActive && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />}
                        </div>
                        <span className={`text-[9px] font-medium text-center leading-tight ${isActive ? 'text-sky-600 font-bold' : isPast ? 'text-slate-500' : 'text-slate-300'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${STATUS_STEPS[Math.max(0, latestStepIndex)]?.color ?? 'bg-slate-300'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{latestConcern.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{latestConcern.buildingName} · {latestConcern.roomName}</p>
                    {latestConcern.repairNotes && (<p className="text-xs text-slate-500 mt-2 italic border-l-2 border-sky-200 pl-2 line-clamp-2">"{latestConcern.repairNotes}"</p>)}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={latestConcern.priority} size="sm" />
                    <StatusBadge   status={latestConcern.status}    size="sm" />
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3"><FileText className="w-7 h-7 text-sky-300" /></div>
                <p className="text-sm text-slate-500 font-medium">No concerns filed yet</p>
                <p className="text-xs text-slate-400 mt-1">Submit a report and track its live progress here</p>
                <Link to="/concerns/new" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors"><PlusCircle className="w-3.5 h-3.5" /> Report a Concern</Link>
              </div>
            )}
          </Section>

          <div className="space-y-4">
            <Section>
              <SectionHeader title="Quick Actions" />
              <div className="space-y-2">
                <Link to="/concerns/new" className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0"><PlusCircle className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-bold text-sky-800">Report a Concern</p><p className="text-[10px] text-sky-600">Submit a new facility issue</p></div>
                </Link>
                <Link to="/concerns" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-slate-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">View All My Reports</p><p className="text-[10px] text-slate-500">Full submission history</p></div>
                </Link>
                <Link to="/notifications" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-amber-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">Notifications</p><p className="text-[10px] text-slate-500">Updates on your reports</p></div>
                </Link>
              </div>
            </Section>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-100">
              <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-1.5">💡 Pro Tip</p>
              <p className="text-xs text-slate-600 leading-relaxed">Include a clear photo when reporting — concerns with photos are resolved <span className="font-semibold text-sky-700">2× faster</span> on average.</p>
            </div>
          </div>
        </div>

        {/* Status breakdown + recent reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Section>
            <SectionHeader title="Reports by Status" subtitle="How your concerns are distributed" />
            {myConcerns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-3">
                {statusCounts.map(s => (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{s.label}</span>
                      <span className="text-xs font-bold text-slate-800">{s.count}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full transition-all ${s.color}`} style={{ width: `${Math.round((s.count / myConcerns.length) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section className="lg:col-span-2">
            <SectionHeader
              title={`My Recent Reports (${myConcerns.length})`}
              subtitle="Your latest facility concern submissions"
              action={<Link to="/concerns" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
            {myConcerns.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No concerns yet. <Link to="/concerns/new" className="text-sky-600 font-medium hover:underline">Report your first one →</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myConcerns.slice(0, 5).map(c => (
                  <ConcernRow key={c.id} to={`/concerns/${c.id}`} reportNumber={c.reportNumber} location={`${c.buildingName} · ${c.roomName}`} title={c.title} priority={c.priority} status={c.status} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    );
  }

  // ── Role 2: Maintenance Personnel ───────────────────────────────
  if (currentRole === 'MAINTENANCE_PERSONNEL') {
    const myTasks           = concerns.filter(c => c.assignedPersonnelId === currentUser.id);
    const inProgressTasks   = myTasks.filter(c => c.status === 'IN_PROGRESS');
    const pendingAcceptance = myTasks.filter(c => c.status === 'ASSIGNED');
    const completedTasks    = myTasks.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED');
    const highPriority      = myTasks.filter(c => (c.priority === 'CRITICAL' || c.priority === 'HIGH') && c.status !== 'CLOSED');
    const activeTasks       = myTasks.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(c.status));
    const openTasks         = myTasks.filter(c => !['COMPLETED','CLOSED'].includes(c.status));
    const weeklyData = [
      { day: 'Mon', done: 2 }, { day: 'Tue', done: 4 }, { day: 'Wed', done: 1 },
      { day: 'Thu', done: 3 }, { day: 'Fri', done: completedTasks.length > 0 ? completedTasks.length : 2 },
      { day: 'Sat', done: 0 }, { day: 'Sun', done: 0 },
    ];

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-emerald-200">
          <div>
            <p className="text-emerald-100 text-sm">{greeting()}, {currentUser.firstName}</p>
            <h1 className="text-xl font-bold mt-0.5">My Maintenance Tasks</h1>
            <p className="text-emerald-100 text-sm mt-1">{openTasks.length > 0 ? `${openTasks.length} open work order${openTasks.length > 1 ? 's' : ''} — ${highPriority.length} high/critical.` : 'All tasks complete — great job! 🎉'}</p>
          </div>
          <Link to="/tasks" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors flex-shrink-0 shadow-sm">
            <CheckSquare className="w-4 h-4" /> Work Order Queue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Assigned"      value={myTasks.length}         icon={CheckSquare}  subtitle={`${pendingAcceptance.length} pending acceptance`} />
          <StatCard title="In Progress"   value={inProgressTasks.length} icon={Wrench}       subtitle="Under active repair"  iconBgColor="bg-violet-50"  iconColor="text-violet-600" />
          <StatCard title="High Priority" value={highPriority.length}    icon={Flame}        subtitle="Urgent or critical"   iconBgColor="bg-rose-50"    iconColor="text-rose-600" />
          <StatCard title="Completed"     value={completedTasks.length}  icon={CheckCircle2} subtitle="Awaiting sign-off"    iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
        </div>

        {/* Active work + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Section className="lg:col-span-2">
            <SectionHeader
              title="Active Work"
              subtitle={activeTasks.length > 0 ? `${activeTasks.length} active task${activeTasks.length > 1 ? 's' : ''}` : 'No active work'}
              action={<Link to="/tasks" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">All Tasks <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
            {activeTasks.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3"><CalendarDays className="w-7 h-7 text-emerald-300" /></div>
                <p className="text-sm text-slate-500 font-medium">No active work</p>
                <p className="text-xs text-slate-400 mt-1">Check the work order queue for pending tasks</p>
                <Link to="/tasks" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"><CheckSquare className="w-3.5 h-3.5" /> View Work Queue</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${task.priority === 'CRITICAL' ? 'bg-rose-50 border-rose-100' : task.priority === 'HIGH' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-500">#{task.reportNumber}</span><span className="text-xs text-slate-400">{task.buildingName} · {task.roomName}</span></div>
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <StatusBadge   status={task.status}    size="sm" />
                      <Link to={`/tasks/${task.id}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Open</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="space-y-4">
            <Section>
              <SectionHeader title="Quick Actions" />
              <div className="space-y-2">
                <Link to="/tasks" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0"><CheckSquare className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-bold text-emerald-800">Work Order Queue</p><p className="text-[10px] text-emerald-600">All your assigned tasks</p></div>
                </Link>
                <Link to="/notifications" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-slate-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">Notifications</p><p className="text-[10px] text-slate-500">Dispatch alerts and updates</p></div>
                </Link>
              </div>
            </Section>
            {highPriority.length > 0 ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100">
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Flame className="w-3 h-3" /> Priority Alert</p>
                <p className="text-xs text-slate-700 leading-relaxed">You have <span className="font-bold text-rose-700">{highPriority.length}</span> high / critical task{highPriority.length > 1 ? 's' : ''} needing immediate attention.</p>
                <Link to="/tasks" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-rose-700 hover:text-rose-800">Review now <ArrowRight className="w-3 h-3" /></Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1.5">✅ All Clear</p>
                <p className="text-xs text-slate-600 leading-relaxed">No critical or high priority tasks. Keep up the great work!</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly chart + work orders list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Section>
            <SectionHeader title="This Week's Output" subtitle="Tasks completed per day" />
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: '10px', fontSize: '12px' }} cursor={{ fill: 'rgba(16,185,129,0.06)' }} />
                  <Bar dataKey="done" fill="#10B981" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Week of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="font-semibold text-emerald-600">{completedTasks.length} total done</span>
            </div>
          </Section>

          <Section className="lg:col-span-2">
            <SectionHeader
              title={`Assigned Work Orders (${myTasks.length})`}
              subtitle="Tasks queued for your inspection and repair"
              action={<Link to="/tasks" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">All Tasks <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
            {myTasks.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3"><CheckSquare className="w-7 h-7 text-emerald-300" /></div>
                <p className="text-sm text-slate-500 font-medium">No work orders assigned yet</p>
                <p className="text-xs text-slate-400 mt-1">Check back when the supervisor dispatches a task</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500">#{task.reportNumber}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{task.buildingName} · {task.roomName}</span>
                        {task.scheduledDate && (<span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {task.scheduledDate}</span>)}
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} size="sm" />
                      <StatusBadge   status={task.status}    size="sm" />
                      <Link to={`/tasks/${task.id}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors">Open</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    );
  }

  // ── Role 3: Maintenance Supervisor ──────────────────────────────
  if (currentRole === 'MAINTENANCE_SUPERVISOR') {
    const unassigned           = concerns.filter(c => !c.assignedPersonnelId && c.status !== 'CLOSED');
    const pendingTriage        = concerns.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW');
    const activeRepairs        = concerns.filter(c => c.status === 'IN_PROGRESS' || c.status === 'WAITING_FOR_MATERIALS');
    const awaitingVerification = concerns.filter(c => c.status === 'COMPLETED');
    const criticalConcerns     = concerns.filter(c => c.priority === 'CRITICAL' && c.status !== 'CLOSED');
    const highConcerns         = concerns.filter(c => c.priority === 'HIGH' && c.status !== 'CLOSED');

    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-indigo-200">
          <div>
            <p className="text-indigo-100 text-sm">{greeting()}, {currentUser.firstName}</p>
            <h1 className="text-xl font-bold mt-0.5">Maintenance Supervisor Overview</h1>
            <p className="text-indigo-100 text-sm mt-1">
              {criticalConcerns.length > 0
                ? `${criticalConcerns.length} critical concern${criticalConcerns.length > 1 ? 's' : ''} require immediate dispatch.`
                : 'Campus operations normal — triage, dispatch, and verify repairs below.'}
            </p>
          </div>
          <Link to="/manage" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex-shrink-0 shadow-sm">
            <Wrench className="w-4 h-4" /> Dispatch & Triage
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Unassigned"      value={unassigned.length}           icon={Clock}       subtitle="Needs dispatch"     iconBgColor="bg-amber-50"   iconColor="text-amber-600" />
          <StatCard title="Pending Triage"  value={pendingTriage.length}        icon={FileText}    subtitle="Awaiting review"    iconBgColor="bg-sky-50"     iconColor="text-sky-600" />
          <StatCard title="Active Repairs"  value={activeRepairs.length}        icon={Wrench}      subtitle="In progress"        iconBgColor="bg-violet-50"  iconColor="text-violet-600" />
          <StatCard title="Awaiting Verify" value={awaitingVerification.length} icon={ShieldCheck} subtitle="Ready for sign-off"  iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard title="Critical"        value={criticalConcerns.length}     icon={Flame}       subtitle="Life safety"        iconBgColor="bg-rose-50"    iconColor="text-rose-600" />
        </div>

        {/* Critical alert banner */}
        {criticalConcerns.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800">{criticalConcerns.length} Critical Concern{criticalConcerns.length > 1 ? 's' : ''} Unresolved</p>
                <p className="text-xs text-rose-600 mt-0.5">Immediate safety hazards requiring urgent technician dispatch.</p>
              </div>
            </div>
            <Link to="/manage" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex-shrink-0">
              <Flame className="w-3.5 h-3.5" /> Dispatch Now
            </Link>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Needs assignment */}
          <Section className="lg:col-span-2">
            <SectionHeader
              title={`Needs Assignment (${unassigned.length})`}
              subtitle="Concerns awaiting technician dispatch"
              action={<Link to="/manage" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">Triage All <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
            {unassigned.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
                <p className="text-sm text-slate-500 font-medium">All reports are assigned!</p>
                <p className="text-xs text-slate-400">Great work — no pending dispatches.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unassigned.slice(0, 6).map(item => (
                  <div key={item.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                    item.priority === 'CRITICAL' ? 'bg-rose-50 border-rose-100' :
                    item.priority === 'HIGH'     ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">#{item.reportNumber}</span>
                        <span className="text-xs text-slate-400">{item.buildingName} · {item.roomName}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={item.priority} size="sm" />
                      <Link to="/manage" className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">Assign</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Quick actions + workload summary */}
          <div className="space-y-4">
            <Section>
              <SectionHeader title="Quick Actions" />
              <div className="space-y-2">
                <Link to="/manage" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0"><Wrench className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-bold text-indigo-800">Dispatch & Triage</p><p className="text-[10px] text-indigo-600">Assign technicians to concerns</p></div>
                </Link>
                <Link to="/concerns" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-slate-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">All Concerns</p><p className="text-[10px] text-slate-500">Browse full report list</p></div>
                </Link>
                <Link to="/analytics" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0"><Activity className="w-4 h-4 text-violet-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">Analytics</p><p className="text-[10px] text-slate-500">Performance & SLA trends</p></div>
                </Link>
                <Link to="/reports" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><FileSpreadsheet className="w-4 h-4 text-emerald-600" /></div>
                  <div><p className="text-xs font-bold text-slate-700">Reports</p><p className="text-[10px] text-slate-500">Export maintenance data</p></div>
                </Link>
              </div>
            </Section>

            {/* Priority summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <p className="text-xs font-bold text-slate-700">Priority Breakdown</p>
              {[{ label: 'Critical', count: criticalConcerns.length, color: 'bg-rose-500', text: 'text-rose-700' },
                { label: 'High', count: highConcerns.length, color: 'bg-amber-400', text: 'text-amber-700' }].map(p => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${p.text}`}>{p.label}</span>
                    <span className="text-xs font-bold text-slate-800">{p.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${concerns.length > 0 ? Math.round((p.count / concerns.length) * 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: Active repairs + Awaiting sign-off */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Active repairs */}
          <Section>
            <SectionHeader
              title={`Active Repairs (${activeRepairs.length})`}
              subtitle="Work currently in progress on campus"
              action={<Link to="/concerns" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">View All <ArrowRight className="w-3.5 h-3.5" /></Link>}
            />
            {activeRepairs.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">No active repairs right now.</div>
            ) : (
              <div className="space-y-2">
                {activeRepairs.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">#{item.reportNumber}</span>
                        <span className="text-xs text-slate-400">{item.assignedPersonnelName ?? 'Unassigned'}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{item.title}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Awaiting sign-off */}
          <Section>
            <SectionHeader
              title={`Awaiting Sign-Off (${awaitingVerification.length})`}
              subtitle="Repairs needing photo review and approval"
            />
            {awaitingVerification.length === 0 ? (
              <div className="py-6 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
                <p className="text-sm text-slate-500 font-medium">No pending verifications!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {awaitingVerification.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">#{item.reportNumber}</span>
                        <span className="text-xs text-slate-400">{item.assignedPersonnelName}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{item.title}</p>
                    </div>
                    <Link to={`/verify/${item.id}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0">Verify</Link>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    );
  }

  // ── Role 4: Administrator ────────────────────────────────────────
  const total          = concerns.length;
  const pending        = concerns.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;
  const inProgress     = concerns.filter(c => ['IN_PROGRESS', 'ASSIGNED', 'WAITING_FOR_MATERIALS'].includes(c.status)).length;
  const completed      = concerns.filter(c => c.status === 'COMPLETED' || c.status === 'CLOSED').length;
  const critical       = concerns.filter(c => c.priority === 'CRITICAL' && c.status !== 'CLOSED').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const recentConcerns = [...concerns].slice(0, 6);

  const buildingChartData = buildings.map(b => ({
    name: b.code,
    fullName: b.name,
    concerns: concerns.filter(c => c.buildingId === b.id).length,
  }));

  const topBuildings = [...buildingChartData].sort((a, b) => b.concerns - a.concerns).slice(0, 5);
  const maxBuildingCount = topBuildings[0]?.concerns ?? 1;

  const statusData = [
    { name: 'Pending Review', value: pending,    color: '#F59E0B' },
    { name: 'In Progress',    value: inProgress, color: '#0284C7' },
    { name: 'Resolved',       value: completed,  color: '#10B981' },
  ];

  const priorityData = [
    { label: 'Critical', count: concerns.filter(c => c.priority === 'CRITICAL' && c.status !== 'CLOSED').length, color: 'bg-rose-500',   text: 'text-rose-700'  },
    { label: 'High',     count: concerns.filter(c => c.priority === 'HIGH'     && c.status !== 'CLOSED').length, color: 'bg-amber-400',  text: 'text-amber-700' },
    { label: 'Medium',   count: concerns.filter(c => c.priority === 'MEDIUM'   && c.status !== 'CLOSED').length, color: 'bg-sky-400',    text: 'text-sky-700'   },
    { label: 'Low',      count: concerns.filter(c => c.priority === 'LOW'      && c.status !== 'CLOSED').length, color: 'bg-slate-300',  text: 'text-slate-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Admin banner */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shadow-rose-200">
        <div>
          <p className="text-rose-100 text-sm">{greeting()}, {currentUser.firstName}</p>
          <h1 className="text-xl font-bold mt-0.5">Facility Management Overview</h1>
          <p className="text-rose-100 text-sm mt-1">
            {critical > 0 ? `${critical} critical concern${critical > 1 ? 's' : ''} require immediate attention.` : `Campus resolution rate: ${completionRate}% — ${total} total concerns tracked.`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/analytics" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30">
            <Activity className="w-4 h-4" /> Analytics
          </Link>
          <Link to="/admin/users" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-colors shadow-sm">
            <Users className="w-4 h-4" /> Manage Users
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Reports"   value={total}               icon={Layers}     subtitle="All recorded incidents" />
        <StatCard title="Pending Triage"  value={pending}             icon={Clock}      subtitle="Awaiting response"    iconBgColor="bg-amber-50"   iconColor="text-amber-600" />
        <StatCard title="Active Repairs"  value={inProgress}          icon={Wrench}     subtitle="Field maintenance"    iconBgColor="bg-violet-50"  iconColor="text-violet-600" />
        <StatCard title="Critical"        value={critical}            icon={Flame}      subtitle="Urgent life-safety"  iconBgColor="bg-rose-50"    iconColor="text-rose-600" />
        <StatCard title="Resolution Rate" value={`${completionRate}%`} icon={TrendingUp} subtitle="Campus SLA"          iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <Section className="lg:col-span-2">
          <SectionHeader
            title="Reports by Building"
            subtitle="Distribution of concerns across campus buildings"
            action={<Link to="/admin/buildings" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">Buildings <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: '12px', color: '#1E293B', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(2,132,199,0.05)' }} />
                <Bar dataKey="concerns" fill="#0284C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Donut + legend */}
        <Section className="flex flex-col">
          <SectionHeader title="Status Breakdown" subtitle="Current queue distribution" />
          <div className="h-44 w-full relative flex-1 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{completionRate}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Resolved</span>
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {statusData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Bottom row: recent concerns + priority breakdown + quick admin links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent concerns feed */}
        <Section className="lg:col-span-2">
          <SectionHeader
            title={`Recent Concerns (${total})`}
            subtitle="Latest reports across all buildings"
            action={<Link to="/concerns" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">All Reports <ArrowRight className="w-3.5 h-3.5" /></Link>}
          />
          {recentConcerns.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No concerns on record yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentConcerns.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">#{c.reportNumber}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.buildingName} · {c.roomName}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{c.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={c.priority} size="sm" />
                    <StatusBadge   status={c.status}    size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick admin links */}
          <Section>
            <SectionHeader title="Admin Quick Links" />
            <div className="space-y-2">
              <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-white" /></div>
                <div><p className="text-xs font-bold text-rose-800">User Directory</p><p className="text-[10px] text-rose-600">Manage accounts & roles</p></div>
              </Link>
              <Link to="/admin/buildings" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0"><BuildingIcon className="w-4 h-4 text-slate-600" /></div>
                <div><p className="text-xs font-bold text-slate-700">Buildings</p><p className="text-[10px] text-slate-500">Campus building registry</p></div>
              </Link>
              <Link to="/admin/rooms" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0"><DoorOpen className="w-4 h-4 text-sky-600" /></div>
                <div><p className="text-xs font-bold text-slate-700">Rooms</p><p className="text-[10px] text-slate-500">Room and space registry</p></div>
              </Link>
              <Link to="/admin/categories" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0"><FolderTree className="w-4 h-4 text-violet-600" /></div>
                <div><p className="text-xs font-bold text-slate-700">Categories</p><p className="text-[10px] text-slate-500">Concern category taxonomy</p></div>
              </Link>
            </div>
          </Section>

          {/* Priority breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700">Open Concerns by Priority</p>
            {priorityData.map(p => (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${p.text}`}>{p.label}</span>
                  <span className="text-xs font-bold text-slate-800">{p.count}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100">
                  <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: total > 0 ? `${Math.round((p.count / total) * 100)}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top buildings leaderboard */}
      <Section>
        <SectionHeader
          title="Top Buildings by Report Volume"
          subtitle="Buildings with the most filed concerns this academic year"
          action={<Link to="/admin/buildings" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">All Buildings <ArrowRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="space-y-3">
          {topBuildings.map((b, idx) => (
            <div key={b.name} className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">#{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 truncate">{b.fullName}</span>
                  <span className="text-xs font-bold text-slate-800 ml-2 flex-shrink-0">{b.concerns}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100">
                  <div
                    className={`h-1.5 rounded-full ${idx === 0 ? 'bg-rose-400' : idx === 1 ? 'bg-amber-400' : idx === 2 ? 'bg-sky-400' : 'bg-slate-300'}`}
                    style={{ width: `${Math.round((b.concerns / maxBuildingCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};
