import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { PhotoUploadZone } from '../../components/forms/PhotoUploadZone';
import { DuplicateWarningBanner } from '../../components/forms/DuplicateWarningBanner';
import { PriorityAdvisorCard } from '../../components/forms/PriorityAdvisorCard';
import { calculateRecommendedPriority } from '../../lib/priorityEngine';
import { checkForDuplicateConcern } from '../../lib/duplicateDetection';
import { ConcernPriority, SafetyRisk, AffectedUsers } from '../../types/concern';
import { ApiError } from '../../services/api/client';
import {
  FilePlus2,
  ArrowLeft,
  Building,
  DoorOpen,
  FolderTree,
  AlertTriangle,
  Users,
  CheckCircle,
} from 'lucide-react';

// Step header helper
const StepHeader: React.FC<{ step: number; title: string; subtitle?: string }> = ({ step, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
      {step}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

// Form field label
const FieldLabel: React.FC<{ label: string; required?: boolean; icon?: React.ReactNode }> = ({ label, required, icon }) => (
  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
    {icon}
    {label}
    {required && <span className="text-rose-400">*</span>}
  </label>
);

const getSubmitErrors = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return { submit: "We couldn't submit your concern right now. Please try again." };
  }

  const details = Array.isArray(error.detail) ? error.detail : [];
  const fieldErrors: Record<string, string> = {};

  details.forEach((detail) => {
    if (!detail || typeof detail !== 'object') return;

    const item = detail as { loc?: unknown; type?: unknown };
    const location = Array.isArray(item.loc) ? item.loc : [];
    const field = location.at(-1);
    if (typeof field !== 'string') return;

    if (field === 'description' && item.type === 'string_too_short') {
      fieldErrors.description = 'Please provide at least 10 characters describing the concern.';
    } else if (field === 'title' && item.type === 'string_too_short') {
      fieldErrors.title = 'Please provide a longer concern title.';
    } else if (field === 'title' || field === 'description') {
      fieldErrors[field] = 'Please check this field and correct the invalid information.';
    }
  });

  return Object.keys(fieldErrors).length > 0
    ? fieldErrors
    : { submit: 'Please check the form fields and correct the invalid information.' };
};

export const NewConcernPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const isReporter = currentRole === 'REPORTER';
  const { concerns, buildings, rooms, categories, createConcern, uploadConcernPhoto } = useFacilityCare();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [buildingId, setBuildingId] = useState(buildings[0]?.id || '');
  const availableRooms = useMemo(() => rooms.filter(r => r.buildingId === buildingId && r.status === 'ACTIVE'), [rooms, buildingId]);
  const [roomId, setRoomId] = useState(() => {
    const firstActive = rooms.find(r => r.buildingId === (buildings[0]?.id || '') && r.status === 'ACTIVE');
    return firstActive?.id || '';
  });
  const [safetyRisk, setSafetyRisk] = useState<SafetyRisk>('NONE');
  const [affectedUsers, setAffectedUsers] = useState<AffectedUsers>('CLASS');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [manualPriority, setManualPriority] = useState<ConcernPriority | null>(null);
  const [duplicateIgnored, setDuplicateIgnored] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  useEffect(() => {
    if (!buildings.some((building) => building.id === buildingId)) {
      setBuildingId(buildings[0]?.id || '');
    }
  }, [buildings, buildingId]);

  useEffect(() => {
    const firstActiveRoom = rooms.find((room) => room.buildingId === buildingId && room.status === 'ACTIVE');
    if (!rooms.some((room) => room.id === roomId && room.buildingId === buildingId)) {
      setRoomId(firstActiveRoom?.id || '');
    }
  }, [rooms, buildingId, roomId]);

  const selectedCategory = useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);
  const selectedBuilding  = useMemo(() => buildings.find(b => b.id === buildingId), [buildings, buildingId]);
  const selectedRoom      = useMemo(() => rooms.find(r => r.id === roomId), [rooms, roomId]);

  const duplicateResult = useMemo(() => {
    if (duplicateIgnored || !roomId || !title.trim()) return { isDuplicate: false, score: 0 };
    return checkForDuplicateConcern(concerns, roomId, categoryId, title);
  }, [concerns, roomId, categoryId, title, duplicateIgnored]);

  const existingDupCount = useMemo(() => concerns.filter(c => c.roomId === roomId && c.status !== 'CLOSED').length, [concerns, roomId]);

  const priorityResult = useMemo(() => calculateRecommendedPriority(
    safetyRisk, affectedUsers, categoryId, selectedCategory?.name || '', existingDupCount,
  ), [safetyRisk, affectedUsers, categoryId, selectedCategory, existingDupCount]);

  const activePriority = manualPriority || priorityResult.recommendedPriority;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.length < 5) errors.title = 'Title must be at least 5 characters.';
    if (!description.trim()) errors.description = 'Please provide a detailed description.';
    if (!categoryId) errors.categoryId = 'Please select a category.';
    if (!buildingId) errors.buildingId = 'Please select a building.';
    if (!roomId) errors.roomId = 'Please select a room.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (duplicateResult.isDuplicate && !duplicateIgnored) return;
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const newConcern = await createConcern({
      title: title.trim(),
      description: description.trim(),
      reporterId: currentUser.id,
      reporterName: `${currentUser.firstName} ${currentUser.lastName}`,
      reporterRole: currentUser.role,
      reporterType: currentUser.userType,
      categoryId,
      categoryName: selectedCategory?.name || 'General Facility',
      buildingId,
      buildingName: selectedBuilding?.name || 'Campus Building',
      roomId,
      roomName: selectedRoom?.name || 'Campus Room',
      priority: activePriority,
      priorityReason: priorityResult.reasons,
      status: 'PENDING',
      safetyRisk,
      affectedUsers,
      duplicateCount: duplicateResult.isDuplicate ? 1 : 0,
      duplicateOfId: duplicateResult.matchedConcern?.id,
      beforePhotos: [],
      afterPhotos: [],
      });

      await Promise.all(photoFiles.map((file) => uploadConcernPhoto(newConcern.id, file)));
      setIsSubmitting(false);
      navigate(`/concerns/${newConcern.id}`);
    } catch (error) {
      setIsSubmitting(false);
      setFormErrors(getSubmitErrors(error));
    }
  };

  return (
    <div className={isReporter ? 'max-w-3xl mx-auto space-y-3' : 'max-w-3xl mx-auto space-y-4'}>
      {/* Header */}
      <div>
        <Link to="/concerns" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Concerns
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
            <FilePlus2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Report a Facility Concern</h1>
            <p className="text-sm text-slate-500">Fill in the details below — it takes less than 2 minutes.</p>
          </div>
        </div>
      </div>

      {/* Duplicate warning */}
      {duplicateResult.isDuplicate && duplicateResult.matchedConcern && !duplicateIgnored && (
        <DuplicateWarningBanner
          matchedConcern={duplicateResult.matchedConcern}
          reason={duplicateResult.reason}
          onContinueAnyway={() => setDuplicateIgnored(true)}
          onCancelSubmission={() => navigate('/dashboard')}
        />
      )}

      <form onSubmit={handleSubmit} className={isReporter ? 'space-y-3' : 'space-y-4'}>
        {/* Step 1: Basic Details */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isReporter ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
          <StepHeader step={1} title="Basic Concern Details" subtitle="Describe what's broken or needs attention." />

          <div>
            <FieldLabel label="Issue Title" required />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken whiteboard arm, sparking outlet in Lab 301…"
              className={`input-base ${formErrors.title ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
              id="concern-title"
            />
            {formErrors.title && <p className="text-xs text-rose-500 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <FieldLabel label="Detailed Description" required />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail — specific fixture, equipment ID, sounds, smells, or hazard…"
              className={`input-base resize-none ${formErrors.description ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
              id="concern-description"
            />
            {formErrors.description && <p className="text-xs text-rose-500 mt-1">{formErrors.description}</p>}
          </div>
        </div>

        {/* Step 2: Location & Category */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isReporter ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
          <StepHeader step={2} title="Location & Category" subtitle="Where is the problem located?" />

          <div className={`grid grid-cols-1 sm:grid-cols-3 ${isReporter ? 'gap-3' : 'gap-4'}`}>
            <div>
              <FieldLabel label="Category" required icon={<FolderTree className="w-3.5 h-3.5 text-sky-500" />} />
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="select-base" id="concern-category">
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              {selectedCategory && (
                <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">{selectedCategory.description}</p>
              )}
            </div>

            <div>
              <FieldLabel label="Building" required icon={<Building className="w-3.5 h-3.5 text-sky-500" />} />
              <select
                value={buildingId}
                onChange={(e) => {
                  const newBld = e.target.value;
                  setBuildingId(newBld);
                  setDuplicateIgnored(false);
                  const newRooms = rooms.filter(r => r.buildingId === newBld && r.status === 'ACTIVE');
                  setRoomId(newRooms.length > 0 ? newRooms[0].id : '');
                }}
                className="select-base"
                id="concern-building"
              >
                {buildings.map(bld => <option key={bld.id} value={bld.id}>{bld.name} ({bld.code})</option>)}
              </select>
            </div>

            <div>
              <FieldLabel label="Room / Location" required icon={<DoorOpen className="w-3.5 h-3.5 text-sky-500" />} />
              <select
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value); setDuplicateIgnored(false); }}
                className="select-base"
                id="concern-room"
              >
                {availableRooms.map(rm => <option key={rm.id} value={rm.id}>{rm.name} (Floor {rm.floor})</option>)}
              </select>
              {availableRooms.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No active rooms found in this building.</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Safety & Priority */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isReporter ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
          <StepHeader step={3} title="Safety & Priority Assessment" subtitle="Help us understand the urgency and impact." />

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isReporter ? 'gap-3' : 'gap-4'}`}>
            <div>
              <FieldLabel label="Safety Risk Level" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />} />
              <select value={safetyRisk} onChange={(e) => setSafetyRisk(e.target.value as SafetyRisk)} className="select-base" id="concern-safety">
                <option value="NONE">None — Cosmetic or non-hazardous</option>
                <option value="MINOR">Minor — Minor inconvenience or snagging hazard</option>
                <option value="SIGNIFICANT">Significant — Slipping, falling debris, exposed wire</option>
                <option value="IMMEDIATE_DANGER">Immediate Danger — Live voltage, fire, structural risk</option>
              </select>
            </div>

            <div>
              <FieldLabel label="Affected Population" icon={<Users className="w-3.5 h-3.5 text-sky-500" />} />
              <select value={affectedUsers} onChange={(e) => setAffectedUsers(e.target.value as AffectedUsers)} className="select-base" id="concern-affected">
                <option value="INDIVIDUAL">Individual (1–3 users)</option>
                <option value="CLASS">Classroom / Section (30–60 students)</option>
                <option value="FLOOR">Entire Floor (100+ occupants)</option>
                <option value="CAMPUS_WIDE">Campus Wide / Central Infrastructure</option>
              </select>
            </div>
          </div>

          <PriorityAdvisorCard
            recommendation={priorityResult}
            selectedPriority={activePriority}
            onSelectPriority={(p) => setManualPriority(p)}
            allowManualOverride={true}
          />
        </div>

        {/* Step 4: Photos */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isReporter ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
          <StepHeader step={4} title="Photo Evidence" subtitle="Upload photos of the issue (optional but strongly recommended)." />
          <PhotoUploadZone photos={photos} onChange={setPhotos} onFiles={setPhotoFiles} maxPhotos={4} />
          {formErrors.submit && <p className="text-sm text-rose-600">{formErrors.submit}</p>}
        </div>

        {/* Submit bar */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between ${isReporter ? 'gap-3' : 'gap-4'}`}>
          <p className="text-sm text-slate-500">
            Submitting as <strong className="text-slate-800">{currentUser.firstName} {currentUser.lastName}</strong>
            <span className="text-slate-400"> ({currentUser.userType})</span>
          </p>

          <div className={`flex items-center ${isReporter ? 'gap-2' : 'gap-3'}`}>
            <button
              type="button"
              onClick={() => navigate('/concerns')}
              className="btn-secondary px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              id="submit-concern-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting…'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Submit Concern
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
