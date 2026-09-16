import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { PhotoGallery } from '../../components/common/PhotoGallery';
import { PhotoUploadZone } from '../../components/forms/PhotoUploadZone';
import { TimelineView } from '../../components/concerns/TimelineView';
import { Modal } from '../../components/common/Modal';
import { ArrowLeft, Wrench, CheckCircle, Package, PlusCircle } from 'lucide-react';

const MetaChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-800">{value}</p>
  </div>
);

const ModalBtn: React.FC<{ type?: 'button' | 'submit'; color?: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode }> =
  ({ type = 'button', color = 'bg-slate-100 hover:bg-slate-200 text-slate-700', onClick, disabled = false, children }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color}`}>
      {children}
    </button>
  );

export const MaintenanceTaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, currentRole } = useAuth();
  const { concerns, updateConcernStatus, uploadConcernPhoto, deleteConcernPhoto } = useFacilityCare();

  const task = concerns.find(c => c.id === id);

  const [completeModalOpen, setCompleteModalOpen]   = useState(false);
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen]   = useState(false);
  const [completionSubmitting, setCompletionSubmitting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const [progressNote, setProgressNote] = useState('');
  const [materialsNote, setMaterialsNote] = useState('Awaiting replacement hardware delivery from supplier.');
  const [completionNotes, setCompletionNotes] = useState('Replaced damaged components, tested operation, and verified area is clean and safe.');
  const [completionPhotoFile, setCompletionPhotoFile] = useState<File | null>(null);
  const [completionPhotoPreviews, setCompletionPhotoPreviews] = useState<string[]>([]);

  if (!task) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-800 font-semibold mb-3">Work order not found.</p>
        <Link to="/tasks" className="text-sky-600 text-sm font-medium hover:underline">
          ← Back to Work Orders
        </Link>
      </div>
    );
  }

  const handleAcceptTask = () =>
    updateConcernStatus(task.id, 'IN_PROGRESS', 'Technician accepted work order and dispatched to site.', undefined, currentUser);

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNote) return;
    updateConcernStatus(task.id, task.status, progressNote, undefined, currentUser);
    setProgressNote('');
    setProgressModalOpen(false);
  };

  const handleMaterialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConcernStatus(task.id, 'WAITING_FOR_MATERIALS', materialsNote, undefined, currentUser);
    setMaterialsModalOpen(false);
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completionNotes.trim().length < 10) {
      setCompletionError('Resolution notes must be at least 10 characters.');
      return;
    }
    if (!completionPhotoFile) {
      setCompletionError('Select a completion evidence file before submitting.');
      return;
    }
    setCompletionError(null);
    setCompletionSubmitting(true);
    let uploadedPhotoId: string | null = null;
    try {
      const uploadedPhoto = await uploadConcernPhoto(task.id, completionPhotoFile, true);
      uploadedPhotoId = uploadedPhoto.id;
      await updateConcernStatus(task.id, 'COMPLETED', completionNotes, undefined, currentUser);
      setCompleteModalOpen(false);
      setCompletionPhotoFile(null);
      setCompletionPhotoPreviews([]);
    } catch (error) {
      if (uploadedPhotoId) {
        try {
          await deleteConcernPhoto(task.id, uploadedPhotoId);
        } catch {
          // Keep the original completion error visible if compensation fails.
        }
      }
      setCompletionError(error instanceof Error ? error.message : 'Completion failed. Please try again.');
    } finally {
      setCompletionSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Work Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">#{task.reportNumber}</h1>
            <StatusBadge status={task.status} size="md" />
            <PriorityBadge priority={task.priority} size="md" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {task.status === 'ASSIGNED' && (
            <button onClick={handleAcceptTask} className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
              <Wrench className="w-4 h-4" /> Accept & Begin Work
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <>
              <button onClick={() => setProgressModalOpen(true)} className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2.5 text-sm">
                <PlusCircle className="w-4 h-4 text-sky-500" /> Log Work Note
              </button>
              <button onClick={() => setMaterialsModalOpen(true)} className="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors">
                <Package className="w-4 h-4" /> Hold for Parts
              </button>
              <button onClick={() => setCompleteModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                <CheckCircle className="w-4 h-4" /> Complete Work Order
              </button>
            </>
          )}

          {task.status === 'WAITING_FOR_MATERIALS' && (
            <button
              onClick={() => updateConcernStatus(task.id, 'IN_PROGRESS', 'Parts received. Resumed repair work.', undefined, currentUser)}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Wrench className="w-4 h-4" /> Parts Received — Resume
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overview card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-3">{task.title}</h2>
              <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4">
                {task.description}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetaChip label="Location"    value={`${task.buildingName} · ${task.roomName}`} />
              <MetaChip label="Reported By" value={`${task.reporterName} (${task.reporterType})`} />
              <MetaChip label="Target Date" value={task.scheduledDate || 'Standard SLA'} />
            </div>

            {task.repairNotes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Technical Work Log
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{task.repairNotes}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <PhotoGallery
              beforePhotos={task.beforePhotos}
              afterPhotos={task.afterPhotos}
              photoRecords={task.photoRecords}
              canDelete={task.status !== 'CLOSED' && currentRole === 'MAINTENANCE_PERSONNEL' && task.assignedPersonnelId === currentUser.id}
              onDelete={(photoId) => deleteConcernPhoto(task.id, photoId)}
              title="Inspection & Completion Photos"
            />
          </div>
        </div>

        {/* Timeline */}
        <div>
          <TimelineView timeline={task.timeline} currentStatus={task.status} />
        </div>
      </div>

      {/* Modal 1: Progress Note */}
      <Modal isOpen={progressModalOpen} onClose={() => setProgressModalOpen(false)} title="Log Work Note">
        <form onSubmit={handleProgressSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Notes / Actions Performed</label>
            <textarea rows={3} required value={progressNote} onChange={(e) => setProgressNote(e.target.value)} placeholder="Detail diagnostics, parts dismantled, or repairs performed…" className="input-base" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <ModalBtn onClick={() => setProgressModalOpen(false)}>Cancel</ModalBtn>
            <ModalBtn type="submit" color="bg-sky-500 hover:bg-sky-600 text-white">Save Note</ModalBtn>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Materials */}
      <Modal isOpen={materialsModalOpen} onClose={() => setMaterialsModalOpen(false)} title="Hold for Replacement Parts">
        <form onSubmit={handleMaterialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Required Parts / Supplier Details</label>
            <textarea rows={3} required value={materialsNote} onChange={(e) => setMaterialsNote(e.target.value)} className="input-base" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <ModalBtn onClick={() => setMaterialsModalOpen(false)}>Cancel</ModalBtn>
            <ModalBtn type="submit" color="bg-amber-500 hover:bg-amber-600 text-white">Mark Waiting for Parts</ModalBtn>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Complete */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Work Order">
        <form onSubmit={handleCompletionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resolution Summary *</label>
            <textarea rows={3} required value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Completion Evidence *</label>
            <p className="text-xs text-slate-500 mb-2">Upload a photo of the completed repair.</p>
            <PhotoUploadZone
              photos={completionPhotoPreviews}
              maxPhotos={1}
              onChange={(photos) => {
                setCompletionPhotoPreviews(photos);
                if (photos.length === 0) setCompletionPhotoFile(null);
              }}
              onFiles={(files) => {
                setCompletionPhotoFile(files[0] ?? null);
                setCompletionError(null);
              }}
            />
          </div>
          {completionError && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{completionError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <ModalBtn onClick={() => setCompleteModalOpen(false)}>Cancel</ModalBtn>
            <ModalBtn type="submit" disabled={completionSubmitting} color="bg-emerald-500 hover:bg-emerald-600 text-white">{completionSubmitting ? 'Submitting...' : 'Submit for Verification'}</ModalBtn>
          </div>
        </form>
      </Modal>
    </div>
  );
};
