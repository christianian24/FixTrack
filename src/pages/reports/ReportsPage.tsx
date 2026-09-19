import React, { useState, useMemo } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { exportConcernsToCSV } from '../../services/exportService';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { formatDateOnly } from '../../lib/formatting';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RefreshCw,
  Filter
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const { concerns, buildings, categories } = useFacilityCare();
  const isSupervisor = currentRole === 'MAINTENANCE_SUPERVISOR';

  const [reportType, setReportType] = useState('MONTHLY');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredConcerns = useMemo(() => {
    return concerns.filter(c => {
      const matchBuilding = selectedBuilding === 'ALL' || c.buildingId === selectedBuilding;
      const matchCategory = selectedCategory === 'ALL' || c.categoryId === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;
      return matchBuilding && matchCategory && matchStatus && matchPriority;
    });
  }, [concerns, selectedBuilding, selectedCategory, selectedStatus, selectedPriority]);

  const handleExportCSV = () => {
    exportConcernsToCSV(
      filteredConcerns,
      `FixTrack_${reportType}_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 250);
  };

  return (
    <div className={isSupervisor ? 'space-y-3' : 'space-y-4'}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isSupervisor ? 'gap-3' : 'gap-4'}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-sky-600" /> Facility Reports & Compliance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Export official maintenance records, compliance logs, and campus facility audit data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print / PDF View
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>
        </div>
      </div>

      {/* Filter & Report Type Selector Box */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isSupervisor ? 'p-3' : 'p-4'} space-y-3`}>
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Filter className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-700">Report Parameters & Filter Scope</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Report Subject
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="select-base text-sm"
            >
              <option value="MONTHLY">Monthly Maintenance Summary</option>
              <option value="FACILITIES">Campus Facilities Log</option>
              <option value="DAMAGED_AREAS">Frequent Hazard Analysis</option>
              <option value="TECHNICIAN">Technician Throughput Report</option>
              <option value="COMPLETION">Repair Verification Audit</option>
            </select>
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Building Filter
            </label>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="select-base text-sm"
            >
              <option value="ALL">All Campus Buildings</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-base text-sm"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Status Filter
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select-base text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Priority Filter
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="select-base text-sm"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full py-2.5 px-3 text-sm font-medium rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-sky-600 ${isGenerating ? 'animate-spin' : ''}`} /> Update Scope
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report View */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isSupervisor ? 'p-4' : 'p-5'} space-y-3`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${isSupervisor ? 'pb-3' : 'pb-4'} border-b border-slate-100 gap-2`}>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Campus Facility Report: <span className="text-sky-600">{reportType.replace(/_/g, ' ')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scope: {filteredConcerns.length} Matching Records across Campus Inventory
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Report Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Report #</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Concern Title</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Location</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Category</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Priority</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Status</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Assigned Personnel</th>
                <th className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'}`}>Date Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConcerns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    No concerns match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredConcerns.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} font-semibold text-xs text-slate-700 whitespace-nowrap`}>
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {c.reportNumber}
                      </span>
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} font-medium text-slate-800 max-w-xs truncate`}>
                      {c.title}
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} text-slate-600 whitespace-nowrap`}>
                      {c.roomName} <span className="text-slate-400">({c.buildingName})</span>
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} text-slate-600 whitespace-nowrap`}>
                      {c.categoryName}
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} whitespace-nowrap`}>
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} whitespace-nowrap`}>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} text-slate-600 whitespace-nowrap`}>
                      {c.assignedPersonnelName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className={`${isSupervisor ? 'py-2.5 px-3' : 'py-3 px-4'} text-slate-400 text-xs whitespace-nowrap`}>
                      {formatDateOnly(c.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
