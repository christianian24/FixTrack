import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Concern } from '../../types/concern';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';

type Tab = 'UNASSIGNED' | 'ACTIVE' | 'VERIFY' | 'CRITICAL' | 'ALL';

export const SupervisorManagePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { concerns, users, assignConcern } = useFacilityCare();
  const [activeTab, setActiveTab] = useState<Tab>('UNASSIGNED');
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-09-15');
  const [assignNotes, setAssignNotes] = useState('');

  const technicians = users.filter(u => u.role === 'MAINTENANCE_PERSONNEL');
  const unassigned          = concerns.filter(c => !c.assignedPersonnelId && c.status !== 'CLOSED');
  const activeRepairs       = concerns.filter(c => ['IN_PROGRESS', 'WAITING_FOR_MATERIALS', 'ASSIGNED'].includes(c.status));
  const awaitingVerification= concerns.filter(c => c.status === 'COMPLETED');
  const criticalConcerns    = concerns.filter(c => (c.priority === 'CRITICAL' || c.priority === 'HIGH') && c.status !== 'CLOSED');

  const tabData: { key: Tab; label: string; count: number; alert?: boolean }[] = [
    { key: 'UNASSIGNED', label: 'Unassigned',          count: unassigned.length,           alert: unassigned.length > 0 },
    { key: 'ACTIVE',     label: 'Active Repairs',      count: activeRepairs.length },
    { key: 'VERIFY',     label: 'Awaiting Verify',     count: awaitingVerification.length,  alert: awaitingVerification.length > 0 },
    { key: 'CRITICAL',   label: 'High / Critical',     count: criticalConcerns.length,      alert: criticalConcerns.length > 0 },
    { key: 'ALL',        label: 'All Concerns',        count: concerns.length },
  ];

  const filtered: Concern[] = {
    UNASSIGNED: unassigned,
    ACTIVE:     activeRepairs,
    VERIFY:     awaitingVerification,
    CRITICAL:   criticalConcerns,
    ALL:        concerns,
  }[activeTab];

  const handleOpenAssign = (c: Concern) => {
    setSelectedConcern(c);
    setSelectedTechId(c.assignedPersonnelId || technicians[0]?.id || '');
    setScheduledDate(c.scheduledDate || '2026-09-15');
    setAssignNotes('');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcern || !selectedTechId) return;
    assignConcern(selectedConcern.id, selectedTechId, scheduledDate, assignNotes, currentUser);
    setSelectedConcern(null);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dispatch & Triage</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Triage facility reports, assign technicians, and monitor repair queues.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {tabData.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              tab.alert && activeTab !== tab.key
                ? 'bg-amber-100 text-amber-700'
                : activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Report #</th>
                <th className="py-2.5 px-3">Concern</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned To</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    No concerns in this queue right now.
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-600">#{item.reportNumber}</span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <Link to={`/concerns/${item.id}`} className="font-medium text-slate-800 hover:text-sky-600 line-clamp-1 transition-colors">
                        {item.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{item.description}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{item.roomName}</div>
                      <div className="text-[11px] text-slate-400">{item.buildingName}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><PriorityBadge priority={item.priority} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap"><StatusBadge status={item.status} size="sm" /></td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.assignedPersonnelName ? (
                        <span className="text-slate-700 font-medium">{item.assignedPersonnelName}</span>
                      ) : (
                        <span className="text-amber-500 italic text-xs font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'COMPLETED' ? (
                          <Link
                            to={`/verify/${item.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                          >
                            <ShieldCheck className="w-3 h-3" /> Verify
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleOpenAssign(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                          >
                            <UserCheck className="w-3 h-3" /> {item.assignedPersonnelId ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                        <Link to={`/concerns/${item.id}`} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign modal */}
      {selectedConcern && (
        <Modal isOpen={!!selectedConcern} onClose={() => setSelectedConcern(null)} title="Dispatch Technician">
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Technician</label>
              <select value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)} className="select-base">
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName} ({tech.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Date</label>
              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dispatch Instructions</label>
              <textarea rows={3} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="Specific instructions for the technician…" className="input-base" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setSelectedConcern(null)} className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Confirm Dispatch</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
