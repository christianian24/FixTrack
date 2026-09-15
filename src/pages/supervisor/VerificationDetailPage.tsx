import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { StatusBadge } from '../../components/common/Badge';
import { TimelineView } from '../../components/concerns/TimelineView';
import { Modal } from '../../components/common/Modal';
import { formatDateOnly } from '../../lib/formatting';
import { ShieldCheck, XCircle, ArrowLeft, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';

export const VerificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { concerns, verifyConcern, rejectConcern } = useFacilityCare();

  const concern = concerns.find(c => c.id === id);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('Inspected physical work on site. Conforms to institutional safety standards. Operational status confirmed.');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!concern) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="font-semibold text-slate-800 mb-3">Report not found.</p>
        <Link to="/manage" className="text-sky-600 text-sm font-medium hover:underline">← Back to Dispatch</Link>
      </div>
    );
  }

  const handleVerifyAndClose = () => {
    setIsProcessing(true);
    verifyConcern(concern.id, verifyNotes, currentUser);
    setTimeout(() => { setIsProcessing(false); navigate(`/concerns/${concern.id}`); }, 300);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setIsProcessing(true);
    rejectConcern(concern.id, rejectionReason, currentUser);
    setTimeout(() => { setIsProcessing(false); setRejectModalOpen(false); navigate('/manage'); }, 300);
  };

  const beforePhoto = concern.beforePhotos[0] || 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop&q=80';
  const afterPhoto  = concern.afterPhotos[0]  || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link to="/manage" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dispatch
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Repair Verification</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-slate-500">#{concern.reportNumber}</span>
                <StatusBadge status={concern.status} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRejectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <XCircle className="w-4 h-4" /> Request Rework
          </button>
          <button
            onClick={handleVerifyAndClose}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" /> Approve & Close
          </button>
        </div>
      </div>

      {/* Before / After photos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-500" /> Before vs After Comparison
          </h3>
          <p className="text-xs text-slate-400">Compare initial damage vs completion proof</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>BEFORE REPAIR</span>
              <span className="text-slate-400 font-normal">{formatDateOnly(concern.createdAt)}</span>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-amber-200 bg-slate-100">
              <img src={beforePhoto} alt="Before repair" className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg shadow-sm">
                Before
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>AFTER REPAIR</span>
              <span className="text-slate-400 font-normal">{formatDateOnly(concern.completedAt || concern.updatedAt)}</span>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-200 bg-slate-100">
              <img src={afterPhoto} alt="After repair" className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg shadow-sm">
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details + timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">{concern.title}</h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Original Condition</p>
              <p className="leading-relaxed">{concern.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm space-y-2">
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Technician Resolution Notes
              </p>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {concern.repairNotes || 'Completed and tested on site.'}
              </p>
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs text-slate-500">
                <span>Technician: <strong className="text-slate-700">{concern.assignedPersonnelName}</strong></span>
                <span>Completed: <strong className="text-slate-700">{formatDateOnly(concern.completedAt || concern.updatedAt)}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Verification Sign-Off Notes</label>
              <textarea
                rows={2}
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="input-base"
              />
            </div>
          </div>
        </div>

        <div>
          <TimelineView timeline={concern.timeline} currentStatus={concern.status} />
        </div>
      </div>

      {/* Rejection modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Request Rework">
        <form onSubmit={handleReject} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This will return the status to <strong>IN PROGRESS</strong> and notify technician{' '}
              {concern.assignedPersonnelName} with your corrective instructions.
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Required Corrective Action *</label>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Specify what remains incomplete or fails safety standards…"
              className="input-base"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors">Confirm Rework Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
