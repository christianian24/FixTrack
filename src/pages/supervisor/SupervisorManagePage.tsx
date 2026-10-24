import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Concern } from '../../types/concern';
import { formatBuildingLabel, formatConcernRoom } from '../../lib/locationFormatting';
import { getPersonnelAvailability } from '../../lib/personnelAvailability';
import { FormField } from '../../components/forms/FormField';
import {
  clearResolvedFieldError,
  requiredField,
  validateFields,
  type FieldErrors,
} from '../../lib/formValidation';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle, Check, ChevronDown } from 'lucide-react';

type Tab = 'UNASSIGNED' | 'ACTIVE' | 'VERIFY' | 'CRITICAL' | 'ALL';

export const SupervisorManagePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { concerns, users, assignConcern } = useFacilityCare();
  const [activeTab, setActiveTab] = useState<Tab>('UNASSIGNED');
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [isTechDropdownOpen, setIsTechDropdownOpen] = useState(false);
  const [highlightedTechIndex, setHighlightedTechIndex] = useState(0);
  const [scheduledDate, setScheduledDate] = useState('2026-09-15');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignErrors, setAssignErrors] = useState<FieldErrors>({});
  const technicianValidator = requiredField('Technician');
  const techDropdownRef = useRef<HTMLDivElement>(null);
  const techTriggerRef = useRef<HTMLButtonElement>(null);
  const techOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const technicians = users.filter(u => u.role === 'MAINTENANCE_PERSONNEL');
  const technicianOptions = technicians.map((tech) => {
    const isOnline = tech.isOnline === true && tech.status === 'ACTIVE';
    return {
      tech,
      isOnline,
      availability: getPersonnelAvailability(tech.id, isOnline, concerns),
    };
  });
  const selectedTechnician = technicianOptions.find(
    ({ tech }) => tech.id === selectedTechId,
  );
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
    const currentAssignee = technicians.find((tech) => tech.id === c.assignedPersonnelId);
    const firstOnlineTechnician = technicians.find(
      (tech) => tech.status === 'ACTIVE' && tech.isOnline,
    );
    setSelectedTechId(
      currentAssignee?.status === 'ACTIVE' && currentAssignee.isOnline
        ? currentAssignee.id
        : firstOnlineTechnician?.id || '',
    );
    setScheduledDate(c.scheduledDate || '2026-09-15');
    setAssignNotes('');
    setAssignErrors({});
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcern) return;
    const errors = validateFields({ technician: selectedTechId }, { technician: technicianValidator });
    setAssignErrors(errors);
    if (Object.keys(errors).length > 0) return;
    assignConcern(selectedConcern.id, selectedTechId, scheduledDate, assignNotes, currentUser);
    setSelectedConcern(null);
  };

  const closeTechDropdown = (restoreFocus = false) => {
    setIsTechDropdownOpen(false);
    if (restoreFocus) techTriggerRef.current?.focus();
  };

  const openTechDropdown = (initialIndex?: number) => {
    const selectedIndex = technicianOptions.findIndex(
      ({ tech }) => tech.id === selectedTechId,
    );
    setHighlightedTechIndex(
      initialIndex ?? (selectedIndex >= 0 ? selectedIndex : 0),
    );
    setIsTechDropdownOpen(true);
  };

  useEffect(() => {
    if (!isTechDropdownOpen) return;
    techOptionRefs.current[highlightedTechIndex]?.focus();
  }, [highlightedTechIndex, isTechDropdownOpen]);

  useEffect(() => {
    if (!isTechDropdownOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !techDropdownRef.current?.contains(event.target)
      ) {
        closeTechDropdown();
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [isTechDropdownOpen]);

  const moveTechHighlight = (direction: -1 | 1) => {
    if (!technicianOptions.length) return;
    setHighlightedTechIndex((index) =>
      (index + direction + technicianOptions.length) % technicianOptions.length,
    );
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
                      <div className="font-medium text-slate-700">{formatConcernRoom(item)}</div>
                      <div className="text-[11px] text-slate-400">{formatBuildingLabel(item.buildingName, item.buildingCode)}</div>
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
          <form onSubmit={handleAssignSubmit} className="space-y-4" noValidate>
            <FormField id="dispatch-technician" label="Select Technician" error={assignErrors.technician} required>
              <div className="relative" ref={techDropdownRef}>
                <button
                  ref={techTriggerRef}
                  id="dispatch-technician"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isTechDropdownOpen}
                  aria-labelledby="dispatch-technician-label"
                  aria-invalid={Boolean(assignErrors.technician)}
                  aria-describedby={assignErrors.technician ? 'dispatch-technician-error' : undefined}
                  onClick={() => {
                    if (isTechDropdownOpen) closeTechDropdown();
                    else openTechDropdown();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault();
                      openTechDropdown(event.key === 'ArrowDown' ? 0 : technicianOptions.length - 1);
                    }
                  }}
                  className="w-full min-h-[3.75rem] px-3 py-2 rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-colors hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      {selectedTechnician ? (
                        <>
                          <span className="block break-words text-sm font-semibold text-slate-800">
                            {selectedTechnician.tech.firstName} {selectedTechnician.tech.lastName}
                          </span>
                          <span className={`mt-0.5 block text-xs font-medium ${
                            selectedTechnician.isOnline ? 'text-emerald-700' : 'text-slate-500'
                          }`}>
                            {selectedTechnician.isOnline ? 'ONLINE' : 'OFFLINE'}
                            <span className="mx-1.5 text-slate-300">•</span>
                            <span className={
                              selectedTechnician.availability === 'BUSY'
                                ? 'text-amber-700'
                                : selectedTechnician.availability === 'AVAILABLE'
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }>
                              {selectedTechnician.availability}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span className="block text-sm text-slate-400">Select an active technician</span>
                      )}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      isTechDropdownOpen ? 'rotate-180' : ''
                    }`} aria-hidden="true" />
                  </span>
                </button>

                {isTechDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Technicians"
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        closeTechDropdown(true);
                      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        moveTechHighlight(event.key === 'ArrowDown' ? 1 : -1);
                      } else if (event.key === 'Home' && technicianOptions.length) {
                        event.preventDefault();
                        setHighlightedTechIndex(0);
                      } else if (event.key === 'End' && technicianOptions.length) {
                        event.preventDefault();
                        setHighlightedTechIndex(technicianOptions.length - 1);
                      }
                    }}
                    className="absolute z-20 mt-1 w-full max-h-[min(16rem,35vh)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
                  >
                    {technicianOptions.length ? technicianOptions.map(
                      ({ tech, isOnline, availability }, index) => {
                        const isDisabled = availability === 'NOT AVAILABLE';
                        const isSelected = tech.id === selectedTechId;
                        return (
                          <button
                            key={tech.id}
                            ref={(element) => { techOptionRefs.current[index] = element; }}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-disabled={isDisabled}
                            tabIndex={highlightedTechIndex === index ? 0 : -1}
                            onFocus={() => setHighlightedTechIndex(index)}
                            onClick={() => {
                              if (isDisabled) return;
                              setSelectedTechId(tech.id);
                              setAssignErrors((errors) =>
                                clearResolvedFieldError(
                                  errors,
                                  'technician',
                                  tech.id,
                                  technicianValidator,
                                ),
                              );
                              closeTechDropdown(true);
                            }}
                            onKeyDown={(event) => {
                              if ((event.key === 'Enter' || event.key === ' ') && isDisabled) {
                                event.preventDefault();
                              }
                            }}
                            className={`flex w-full items-start justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                              isDisabled
                                ? 'cursor-not-allowed opacity-55'
                                : 'cursor-pointer hover:bg-slate-50'
                            } ${
                              highlightedTechIndex === index ? 'bg-indigo-50/70' : ''
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block break-words text-sm font-semibold text-slate-800">
                                {tech.firstName} {tech.lastName}
                              </span>
                              <span className="mt-0.5 block break-words text-xs text-slate-500">
                                {tech.department || 'Department not specified'}
                              </span>
                              <span className="mt-1 block text-[11px] font-semibold">
                                <span className={isOnline ? 'text-emerald-700' : 'text-slate-500'}>
                                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                                </span>
                                <span className="mx-1.5 text-slate-300">•</span>
                                <span className={
                                  availability === 'BUSY'
                                    ? 'text-amber-700'
                                    : availability === 'AVAILABLE'
                                    ? 'text-emerald-700'
                                    : 'text-slate-500'
                                }>
                                  {availability}
                                </span>
                              </span>
                            </span>
                            {isSelected && (
                              <Check className="mt-1 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                            )}
                          </button>
                        );
                      },
                    ) : (
                      <p className="px-3 py-2 text-sm text-slate-500">No maintenance technicians found.</p>
                    )}
                  </div>
                )}
              </div>
            </FormField>
            <FormField id="dispatch-date" label="Target Date">
              <input id="dispatch-date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="input-base" />
            </FormField>
            <FormField id="dispatch-notes" label="Dispatch Instructions">
              <textarea id="dispatch-notes" rows={3} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="Specific instructions for the technician…" className="input-base" />
            </FormField>
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
