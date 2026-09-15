import React from 'react';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatCard } from '../../components/common/StatCard';
import {
  calculateSystemOverviewStats,
  calculateBuildingStats,
  calculateCategoryStats,
  calculateMonthlyTrends,
  calculateTechnicianPerformance,
} from '../../services/analyticsService';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Building, Award } from 'lucide-react';

const chartTooltipStyle = {
  backgroundColor: '#fff',
  borderColor: '#E2E8F0',
  borderRadius: '12px',
  color: '#1E293B',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="mb-4">
    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">{icon}{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const { concerns, buildings, categories, users } = useFacilityCare();

  const overview       = calculateSystemOverviewStats(concerns);
  const buildingStats  = calculateBuildingStats(concerns, buildings);
  const categoryStats  = calculateCategoryStats(concerns, categories).slice(0, 6);
  const monthlyTrends  = calculateMonthlyTrends(concerns);
  const techPerformance= calculateTechnicianPerformance(concerns, users);

  const statusPieData = [
    { name: 'Resolved & Closed', value: overview.completedRepairs + overview.closedRequests,   color: '#10B981' },
    { name: 'In Progress',       value: overview.inProgressRepairs + overview.assignedRepairs, color: '#0284C7' },
    { name: 'Pending Review',    value: overview.pendingReports + overview.underReview,        color: '#F59E0B' },
    { name: 'Waiting for Parts', value: overview.waitingForMaterials,                          color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-500" /> Analytics & Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Facility metrics, maintenance velocity, and staff performance benchmarks
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Resolution Rate"   value={`${overview.overallCompletionRate}%`} icon={TrendingUp}    subtitle="Closed vs total" />
        <StatCard title="Avg Turnaround"    value={`${overview.avgRepairHours}h`}        icon={Clock}         subtitle="Dispatch to done" />
        <StatCard title="Top Building"      value={overview.mostReportedBuilding}         icon={Building}      subtitle="Highest incidents" />
        <StatCard title="Top Hazard Type"   value={overview.mostCommonIssue}              icon={AlertTriangle} subtitle="Most frequent" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly trends */}
        <Card>
          <CardTitle title="Monthly Trends" subtitle="Reports filed vs repairs resolved (6 months)" />
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="reported"  name="Reports Filed"    stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
                <Line type="monotone" dataKey="resolved"  name="Repairs Resolved" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /> Reports Filed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Resolved</span>
          </div>
        </Card>

        {/* Building bar chart */}
        <Card>
          <CardTitle title="Incidents by Building" subtitle="Reported vs resolved per campus building" />
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingStats} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="buildingName" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(2,132,199,0.04)' }} />
                <Bar dataKey="totalConcerns"    name="Total"    fill="#0284C7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="resolvedConcerns" name="Resolved" fill="#10B981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardTitle title="Top Incident Categories" subtitle="Most frequent facility concerns reported" />
          <div className="space-y-3">
            {categoryStats.map((stat, i) => {
              const colors = ['#0284C7', '#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'];
              return (
                <div key={stat.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{stat.categoryName}</span>
                    <span className="text-slate-400">{stat.count} ({stat.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(stat.percentage * 2, 8)}%`, backgroundColor: colors[i] || '#0284C7' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Status donut */}
        <Card className="flex flex-col">
          <CardTitle title="Status Breakdown" subtitle="Allocation across all recorded incidents" />
          <div className="h-48 w-full relative flex-1 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {statusPieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-800">{overview.overallCompletionRate}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Resolved</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 text-xs">
            {statusPieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: <strong className="text-slate-800">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Technician table */}
      <Card>
        <CardTitle
          title="Technician Performance"
          subtitle="Work order completion rates and turnaround benchmarks"
          icon={<Award className="w-4 h-4 text-sky-500" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Assigned</th>
                <th className="py-2.5 px-3">Completed</th>
                <th className="py-2.5 px-3">In Progress</th>
                <th className="py-2.5 px-3">Avg Turnaround</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {techPerformance.map(tech => (
                <tr key={tech.personnelId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {tech.name}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">{tech.assigned}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-emerald-600 font-semibold">{tech.completed}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-sky-600">{tech.inProgress}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">{tech.avgCompletionHours}h</td>
                  <td className="py-3 px-3 whitespace-nowrap text-right">
                    <span className="font-bold text-slate-800">{tech.completionRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
