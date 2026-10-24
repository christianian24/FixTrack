import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { PhotoGallery } from '../../components/common/PhotoGallery';
import { PhotoUploadZone } from '../../components/forms/PhotoUploadZone';
import { TimelineView } from '../../components/concerns/TimelineView';
import { RoomRepairHistory } from '../../components/concerns/RoomRepairHistory';
import { formatBuildingLabel, formatConcernRoom } from '../../lib/locationFormatting';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { ConcernPriority } from '../../types/concern';
import {
  clearResolvedFieldError,
  mapApiError,
  minimumLengthField,
  requiredField,
  validateFields,
  type FieldErrors,
  type FieldValidators,
} from '../../lib/formValidation';
import {
  ArrowLeft,
  User,
  Building,
  DoorOpen,
  FolderTree,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  Edit3,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

const MetaChip: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
    <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
      {icon} {value}
    </span>
  </div>
);

const ModalFooterBtn: React.FC<{ type?: 'button' | 'submit'; variant?: 'primary' | 'secondary' | 'success'; onClick?: () => void; disabled?: boolean; children: React.ReactNode }> =
  ({ type = 'button', variant = 'secondary', onClick, disabled = false, children }) => {
    const cls =
      variant === 'primary'   ? 'bg-sky-500 hover:bg-sky-600 text-white' :
      variant === 'success'   ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
      'bg-slate-100 hover:bg-slate-200 text-slate-700';
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}>
        {children}
      </button>
    );
  };

export const ConcernDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { concerns, users, archiveConcern, assignConcern, updateConcernStatus, uploadConcernPhoto, deleteConcernPhoto, verifyConcern, updatePriority } = useFacilityCare();

  const concern = concerns.find(c => c.id === id);

  const [assignModalOpen, setAssignModalOpen]   = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completionSubmitting, setCompletionSubmitting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [assignErrors, setAssignErrors] = useState<FieldErrors>({});
  const [priorityErrors, setPriorityErrors] = useState<FieldErrors>({});
  const [completionFieldErrors, setCompletionFieldErrors] = useState<FieldErrors>({});
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  const [selectedTechId, setSelectedTechId]   = useState('');
  const [scheduledDate, setScheduledDate]     = useState('2026-09-15');
  const [assignNotes, setAssignNotes]         = useState('');

  const [newPriority, setNewPriority]                   = useState<ConcernPriority>('HIGH');
  const [priorityOverrideReason, setPriorityOverrideReason] = useState('');
  const [repairCompletionNotes, setRepairCompletionNotes]   = useState('');
  const [completionPhotoFile, setCompletionPhotoFile] = useState<File | null>(null);
  const [completionPhotoPreviews, setCompletionPhotoPreviews] = useState<string[]>([]);
  const assignValidators: FieldValidators = {
    technician: requiredField('Technician'),
  };
  const priorityValidators: FieldValidators = {
    reason: requiredField('Justification'),
  };
  const completionValidators: FieldValidators = {
    notes: (value) => minimumLengthField(value, 'Resolution notes', 10),
    evidence: () => completionPhotoFile ? null : 'Select a completion evidence file before submitting.',
  };

  if (!concern) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-2">Concern Not Found</h3>
        <p className="text-sm text-slate-500 mb-4">This report ID does not exist or has been removed.</p>
        <Link to="/concerns" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
          Back to Concerns
        </Link>
      </div>
    );
  }

  const technicians = users.filter(u => u.role === 'MAINTENANCE_PERSONNEL');
  const canArchiveConcern =
    currentRole === 'MAINTENANCE_SUPERVISOR' ||
    currentRole === 'ADMINISTRATOR' ||
    (currentRole === 'REPORTER' &&
      concern.reporterId === currentUser.id &&
      concern.status === 'PENDING' &&
      !concern.assignedPersonnelId);

  const handleArchive = async () => {
    setArchiveError(null);
    setArchiveSubmitting(true);
    try {
      await archiveConcern(concern.id);
      navigate('/concerns', {
        state: { successMessage: 'Concern archived and removed from active records.' },
      });
    } catch (error) {
      setArchiveError(
        mapApiError(error, 'Unable to archive this concern. Please try again.', { knownFields: [] })
          .generalMessage,
      );
    } finally {
      setArchiveSubmitting(false);
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields({ technician: selectedTechId }, assignValidators);
    setAssignErrors(errors);
    if (Object.keys(errors).length > 0) return;
    assignConcern(concern.id, selectedTechId, scheduledDate, assignNotes, currentUser);
    setAssignModalOpen(false);
  };

  const handlePrioritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields({ reason: priorityOverrideReason }, priorityValidators);
    setPriorityErrors(errors);
    if (Object.keys(errors).length > 0) return;
    updatePriority(concern.id, newPriority, priorityOverrideReason, currentUser);
    setPriorityModalOpen(false);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields(
      { notes: repairCompletionNotes, evidence: completionPhotoFile },
      completionValidators,
    );
    setCompletionFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!completionPhotoFile) return;
    setCompletionError(null);
    setCompletionSubmitting(true);
    let uploadedPhotoId: string | null = null;
    try {
      const uploadedPhoto = await uploadConcernPhoto(concern.id, completionPhotoFile, true);
      uploadedPhotoId = uploadedPhoto.id;
      await updateConcernStatus(concern.id, 'COMPLETED', repairCompletionNotes, undefined, currentUser);
      setCompleteModalOpen(false);
      setCompletionPhotoFile(null);
      setCompletionPhotoPreviews([]);
    } catch (error) {
      if (uploadedPhotoId) {
        try {
          await deleteConcernPhoto(concern.id, uploadedPhotoId);
        } catch {
          // Keep the original completion error visible if compensation fails.
        }
      }
      const feedback = mapApiError(error, 'Completion failed. Please try again.', {
        knownFields: ['notes', 'evidence'],
        aliases: { repair_notes: 'notes', resolution_notes: 'notes' },
      });
      setCompletionFieldErrors(feedback.fieldErrors);
      setCompletionError(feedback.generalMessage);
    } finally {
      setCompletionSubmitting(false);
    }
  };

  const handleStartRepair = () =>
    updateConcernStatus(concern.id, 'IN_PROGRESS', 'Technician initiated physical repairs on site.', undefined, currentUser);

  const handleWaitingMaterials = () =>
    updateConcernStatus(concern.id, 'WAITING_FOR_MATERIALS', 'Placed on hold awaiting replacement hardware.', undefined, currentUser);

  const handleDirectVerify = () =>
    verifyConcern(concern.id, 'Workmanship verified and approved. Concern resolved.', currentUser);

  return (
    <div className="max-w-6xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link to="/concerns" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Concerns
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">#{concern.reportNumber}</h1>
            <StatusBadge status={concern.status} size="md" />
            <PriorityBadge priority={concern.priority} size="md" />
          </div>
        </div>

        {/* Role actions */}
        <div className="flex flex-wrap items-center gap-2">
          {canArchiveConcern && (
            <button
              onClick={() => setArchiveDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Concern
            </button>
          )}
          {/* Supervisor */}
          {(currentRole === 'MAINTENANCE_SUPERVISOR' || currentRole === 'ADMINISTRATOR') && (
            <>
              <button
                onClick={() => setPriorityModalOpen(true)}
                className="btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2 text-sm"
              >
                <Edit3 className="w-3.5 h-3.5" /> Adjust Priority
              </button>
              <button
                onClick={() => { setSelectedTechId(concern.assignedPersonnelId || technicians[0]?.id || ''); setAssignModalOpen(true); }}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-sm"
              >
                <Wrench className="w-3.5 h-3.5" /> {concern.assignedPersonnelId ? 'Reassign' : 'Assign Technician'}
              </button>
              {concern.status === 'COMPLETED' && (
                <Link
                  to={`/verify/${concern.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify & Close
                </Link>
              )}
            </>
          )}

          {/* Technician */}
          {currentRole === 'MAINTENANCE_PERSONNEL' && (
            <>
              {concern.status === 'ASSIGNED' && (
                <button onClick={handleStartRepair} className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-sm">
                  <Wrench className="w-3.5 h-3.5" /> Start Repair
                </button>
              )}
              {concern.status === 'IN_PROGRESS' && (
                <>
                  <button onClick={handleWaitingMaterials} className="btn-secondary px-3.5 py-2 text-sm text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100">
                    Hold for Parts
                  </button>
                  <button onClick={() => setCompleteModalOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                </>
              )}
              {concern.status === 'WAITING_FOR_MATERIALS' && (
                <button onClick={handleStartRepair} className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-sm">
                  <Wrench className="w-3.5 h-3.5" /> Resume Repair
                </button>
              )}
            </>
          )}

          {/* Faculty sign-off */}
          {currentRole === 'REPORTER' && currentUser.userType === 'FACULTY' && concern.status === 'COMPLETED' && (
            <button onClick={handleDirectVerify} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" /> Faculty Sign-Off
            </button>
          )}
        </div>
      </div>

      {archiveError && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3" role="alert">
          {archiveError}
        </p>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 cols */}
        <div className="min-w-0 lg:col-span-2 space-y-3">
          {/* Main card */}
          <div className="min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800 leading-snug mb-3 [overflow-wrap:anywhere]">{concern.title}</h2>
              <div className="min-w-0 text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4 [overflow-wrap:anywhere]">
                {concern.description}
              </div>
            </div>

            {/* Metadata chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetaChip label="Building"    value={formatBuildingLabel(concern.buildingName, concern.buildingCode)} icon={<Building   className="w-3.5 h-3.5 text-sky-400" />} />
              <MetaChip label="Room / Location" value={formatConcernRoom(concern)} icon={<DoorOpen   className="w-3.5 h-3.5 text-sky-400" />} />
              <MetaChip label="Category"    value={concern.categoryName} icon={<FolderTree className="w-3.5 h-3.5 text-sky-400" />} />
              <MetaChip label="Safety Risk" value={concern.safetyRisk}   icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />} />
            </div>

            {/* Reporter & technician */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Reported By</p>
                  <p className="font-semibold text-slate-800">{concern.reporterName}</p>
                  <p className="text-xs text-slate-400">{concern.reporterType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Assigned Technician</p>
                  {concern.assignedPersonnelName ? (
                    <>
                      <p className="font-semibold text-slate-800">{concern.assignedPersonnelName}</p>
                      {concern.scheduledDate && <p className="text-xs text-slate-400">Due: {concern.scheduledDate}</p>}
                    </>
                  ) : (
                    <p className="text-slate-400 italic text-sm">Unassigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Priority rationale */}
            {concern.priorityReason && concern.priorityReason.length > 0 && (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sm space-y-1.5">
                <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-widest">Priority Evaluation</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                  {concern.priorityReason.map((reason, idx) => <li key={idx}>{reason}</li>)}
                </ul>
              </div>
            )}

            {/* Repair notes */}
            {concern.repairNotes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Maintenance Work Log
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{concern.repairNotes}</p>
              </div>
            )}

            {/* Rejection notice */}
            {concern.rejectionReason && concern.status !== 'CLOSED' && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm space-y-1">
                <p className="font-semibold text-rose-700 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Re-work Requested
                </p>
                <p className="text-slate-700">{concern.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <PhotoGallery
              beforePhotos={concern.beforePhotos}
              afterPhotos={concern.afterPhotos}
              photoRecords={concern.photoRecords}
              canDelete={concern.status !== 'CLOSED' && (
                (currentRole === 'MAINTENANCE_PERSONNEL' && concern.assignedPersonnelId === currentUser.id) ||
                currentRole === 'MAINTENANCE_SUPERVISOR' ||
                currentRole === 'ADMINISTRATOR'
              )}
              onDelete={(photoId) => deleteConcernPhoto(concern.id, photoId)}
            />
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-3">
          <TimelineView timeline={concern.timeline} currentStatus={concern.status} />
          {concern.roomId && (
            <RoomRepairHistory currentConcernId={concern.id} roomId={concern.roomId} roomName={formatConcernRoom(concern)} allConcerns={concerns} />
          )}
        </div>
      </div>

      {/* Modal 1: Assign technician */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Technician">
        <form onSubmit={handleAssignSubmit} className="space-y-4" noValidate>
          <FormField id="assign-technician" label="Select Technician" error={assignErrors.technician} required>
            <select
              id="assign-technician"
              value={selectedTechId}
              aria-invalid={Boolean(assignErrors.technician)}
              aria-describedby={assignErrors.technician ? 'assign-technician-error' : undefined}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedTechId(value);
                setAssignErrors((errors) =>
                  clearResolvedFieldError(errors, 'technician', value, assignValidators.technician),
                );
              }}
              className="select-base"
            >
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName} — {tech.department}</option>
              ))}
            </select>
          </FormField>
          <FormField id="assign-scheduled-date" label="Target Resolution Date">
            <input id="assign-scheduled-date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="input-base" />
          </FormField>
          <FormField id="assign-notes" label="Dispatch Instructions">
            <textarea id="assign-notes" rows={3} value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} placeholder="e.g. Inspect breaker panel, test continuity before replacing…" className="input-base" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <ModalFooterBtn onClick={() => setAssignModalOpen(false)}>Cancel</ModalFooterBtn>
            <ModalFooterBtn type="submit" variant="primary">Confirm Dispatch</ModalFooterBtn>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Priority */}
      <Modal isOpen={priorityModalOpen} onClose={() => setPriorityModalOpen(false)} title="Adjust Priority">
        <form onSubmit={handlePrioritySubmit} className="space-y-4" noValidate>
          <FormField id="priority-level" label="New Priority Level">
            <select id="priority-level" value={newPriority} onChange={(e) => setNewPriority(e.target.value as ConcernPriority)} className="select-base">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </FormField>
          <FormField id="priority-reason" label="Justification" error={priorityErrors.reason} required>
            <textarea
              id="priority-reason"
              rows={3}
              value={priorityOverrideReason}
              aria-invalid={Boolean(priorityErrors.reason)}
              aria-describedby={priorityErrors.reason ? 'priority-reason-error' : undefined}
              onChange={(e) => {
                setPriorityOverrideReason(e.target.value);
                setPriorityErrors((errors) =>
                  clearResolvedFieldError(errors, 'reason', e.target.value, priorityValidators.reason),
                );
              }}
              placeholder="Explain the reason for this priority adjustment…"
              className="input-base"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <ModalFooterBtn onClick={() => setPriorityModalOpen(false)}>Cancel</ModalFooterBtn>
            <ModalFooterBtn type="submit" variant="primary">Save Adjustment</ModalFooterBtn>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Complete */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Document Repair Completion">
        <form onSubmit={handleCompleteSubmit} className="space-y-4" noValidate>
          <FormField id="completion-notes" label="Resolution Notes" error={completionFieldErrors.notes} required>
            <textarea
              id="completion-notes"
              rows={3}
              value={repairCompletionNotes}
              aria-invalid={Boolean(completionFieldErrors.notes)}
              aria-describedby={completionFieldErrors.notes ? 'completion-notes-error' : undefined}
              onChange={(e) => {
                setRepairCompletionNotes(e.target.value);
                setCompletionFieldErrors((errors) =>
                  clearResolvedFieldError(
                    errors,
                    'notes',
                    e.target.value,
                    completionValidators.notes,
                  ),
                );
              }}
              placeholder="Detail what was done, parts replaced, tests performed…"
              className="input-base"
            />
          </FormField>
          <FormField id="completion-evidence" label="Completion Evidence" error={completionFieldErrors.evidence} required>
            <p className="text-xs text-slate-500 mb-2">Upload a photo of the completed repair.</p>
            <PhotoUploadZone
              inputId="completion-evidence"
              inputInvalid={Boolean(completionFieldErrors.evidence)}
              inputDescribedBy={completionFieldErrors.evidence ? 'completion-evidence-error' : undefined}
              photos={completionPhotoPreviews}
              maxPhotos={1}
              onChange={(photos) => {
                setCompletionPhotoPreviews(photos);
                if (photos.length === 0) setCompletionPhotoFile(null);
              }}
              onFiles={(files) => {
                setCompletionPhotoFile(files[0] ?? null);
                setCompletionFieldErrors((errors) =>
                  clearResolvedFieldError(
                    errors,
                    'evidence',
                    files[0],
                    () => files[0] ? null : 'Select a completion evidence file before submitting.',
                  ),
                );
                setCompletionError(null);
              }}
              onValidationError={(message) => {
                if (message) {
                  setCompletionFieldErrors((errors) => ({ ...errors, evidence: message }));
                }
              }}
            />
          </FormField>
          {completionError && <p role="alert" className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{completionError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <ModalFooterBtn onClick={() => setCompleteModalOpen(false)}>Cancel</ModalFooterBtn>
            <ModalFooterBtn type="submit" variant="success" disabled={completionSubmitting}>{completionSubmitting ? 'Submitting...' : 'Submit for Verification'}</ModalFooterBtn>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={() => void handleArchive()}
        title="Delete Concern"
        message="Are you sure you want to delete this concern? It will be removed from active records but retained for audit purposes."
        confirmLabel={archiveSubmitting ? 'Archiving...' : 'Delete Concern'}
        variant="danger"
      />
    </div>
  );
};
