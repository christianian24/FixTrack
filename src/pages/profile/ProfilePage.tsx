import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { usersApi } from '../../services/api/adminApi';
import { resolveApiUrl } from '../../services/api/client';
import { ROLE_NAMES } from '../../lib/permissions';
import {
  Mail,
  Shield,
  Building,
  CheckCircle2,
  Camera,
  Settings,
  ArrowRight,
  School,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, refreshCurrentUser } = useAuth();
  const isCompactRole = currentRole === 'REPORTER' || currentRole === 'MAINTENANCE_PERSONNEL' || currentRole === 'MAINTENANCE_SUPERVISOR' || currentRole === 'ADMINISTRATOR';
  const isAdminRole = currentRole === 'ADMINISTRATOR';
  const isSupervisorRole = currentRole === 'MAINTENANCE_SUPERVISOR';
  const isTechnicianRole = currentRole === 'MAINTENANCE_PERSONNEL';
  const primaryActionClasses = isAdminRole
    ? 'w-full h-11 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm'
    : isSupervisorRole
    ? 'w-full h-11 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors shadow-sm'
    : isTechnicianRole
    ? 'w-full h-11 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-sm'
    : 'btn-primary w-full h-11 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const settingsCardClasses = isAdminRole
    ? 'bg-red-50/70 border border-red-100 rounded-2xl p-5 flex items-center justify-between gap-4'
    : isSupervisorRole
    ? 'bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between gap-4'
    : isTechnicianRole
    ? 'bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between gap-4'
    : 'bg-sky-50/70 border border-sky-100 rounded-2xl p-5 flex items-center justify-between gap-4';
  const settingsLinkClasses = isAdminRole
    ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold transition-colors flex-shrink-0'
    : isSupervisorRole
    ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors flex-shrink-0'
    : isTechnicianRole
    ? 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors flex-shrink-0'
    : 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors flex-shrink-0';

  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
    setPhone(currentUser.phone || '');
    setDepartment(currentUser.department || '');
    setAvatarFailed(false);
  }, [currentUser]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSavedSuccess(false);
    setSaving(true);
    try {
      await usersApi.updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
      });
      if (selectedPhoto) await usersApi.uploadMyAvatar(selectedPhoto);
      await refreshCurrentUser();
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = photoPreview || (currentUser.avatar ? resolveApiUrl(currentUser.avatar) : undefined);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className={isCompactRole ? 'max-w-5xl mx-auto space-y-3' : 'max-w-5xl mx-auto space-y-5'}>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Account</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your profile</h1>
        <p className="text-sm text-slate-500">Manage your identity and campus contact details.</p>
      </div>

      <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4' : 'p-5 sm:p-6'}`}>
        <div className={`flex flex-col sm:flex-row sm:items-center ${isCompactRole ? 'gap-4' : 'gap-6'}`}>
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative">
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt={currentUser.firstName}
                  onError={() => setAvatarFailed(true)}
                  className={`w-24 h-24 rounded-full object-cover border-4 ${isAdminRole ? 'border-red-50' : isSupervisorRole ? 'border-indigo-50' : isTechnicianRole ? 'border-emerald-50' : 'border-sky-50'} shadow-sm`}
                />
              ) : (
                <div className={`w-24 h-24 rounded-full border-4 ${isAdminRole ? 'border-red-50 bg-red-100 text-red-700' : isSupervisorRole ? 'border-indigo-50 bg-indigo-100 text-indigo-700' : isTechnicianRole ? 'border-emerald-50 bg-emerald-100 text-emerald-700' : 'border-sky-50 bg-sky-100 text-sky-700'} flex items-center justify-center text-2xl font-bold shadow-sm`}>
                  {initials}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${isAdminRole ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300' : isSupervisorRole ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300' : isTechnicianRole ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' : 'bg-slate-50 border-slate-200 text-sky-700 hover:bg-sky-50 hover:border-sky-200'}`}>
              <Camera className="w-3.5 h-3.5" /> Change Photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedPhoto(file);
                  setAvatarFailed(false);
                  if (file) setPhotoPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{firstName} {lastName}</h2>
                <p className="text-sm text-slate-500 mt-1">{currentUser.email}</p>
                <p className="text-xs text-slate-400 mt-1">Account ID: {currentUser.id}</p>
              </div>
              <span className={`self-start px-3 py-1.5 rounded-lg border text-xs font-semibold ${isAdminRole ? 'bg-red-50 text-red-700 border-red-200' : isSupervisorRole ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : isTechnicianRole ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                {ROLE_NAMES[currentUser.role]}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-sky-600 mt-0.5" />
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Affiliation</p><p className="text-sm font-semibold text-slate-800">{currentUser.userType}</p></div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-sky-600 mt-0.5" />
                <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Department</p><p className="text-sm font-semibold text-slate-800 break-words">{department || 'Not specified'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={isCompactRole ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 items-start' : 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-start'}>
        <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4' : 'p-5 sm:p-6'}`}>
          <div className={isCompactRole ? 'mb-4' : 'mb-6'}>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><Mail className="w-4 h-4 text-sky-600" /> Contact Information</h3>
            <p className="text-xs text-slate-500 mt-1">Editable details used by your campus team.</p>
          </div>
          {savedSuccess && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes saved successfully.</div>}
          {saveError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{saveError}</div>}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name</label><input type="text" required maxLength={80} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-base text-sm h-11" /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label><input type="text" required maxLength={80} value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-base text-sm h-11" /></div>
            </div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">School Email</label><input type="email" disabled value={currentUser.email} className="input-base text-sm h-11 bg-slate-50 text-slate-500 cursor-not-allowed" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base text-sm h-11" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">Department / Division</label><input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="input-base text-sm h-11" /></div>
            <button type="submit" disabled={saving} className={primaryActionClasses}>{saving ? 'Saving Changes...' : 'Save Changes'}</button>
          </form>
        </section>

        <div className={isCompactRole ? 'space-y-3' : 'space-y-4'}>
          <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4' : 'p-5 sm:p-6'}`}>
            <div className={isCompactRole ? 'mb-4' : 'mb-5'}><h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><School className="w-4 h-4 text-sky-600" /> Institutional Record</h3><p className="text-xs text-slate-500 mt-1">Read-only account information managed by the institution.</p></div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              <div className={`${isCompactRole ? 'p-3' : 'p-4'} flex items-center justify-between gap-4`}><span className="text-sm text-slate-500">Assigned Role</span><span className="text-sm font-semibold text-slate-800 text-right">{ROLE_NAMES[currentUser.role]}</span></div>
              <div className={`${isCompactRole ? 'p-3' : 'p-4'} flex items-center justify-between gap-4`}><span className="text-sm text-slate-500">Affiliation Type</span><span className="text-sm font-semibold text-slate-800 text-right">{currentUser.userType}</span></div>
              <div className={`${isCompactRole ? 'p-3' : 'p-4'} flex items-center justify-between gap-4`}><span className="text-sm text-slate-500">Account Status</span><span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" />Active & Verified</span></div>
              <div className={`${isCompactRole ? 'p-3' : 'p-4'} flex items-center justify-between gap-4`}><span className="text-sm text-slate-500">Academic Year</span><span className="text-sm font-semibold text-slate-800">AY 2026–27</span></div>
            </div>
          </section>

          <section className={settingsCardClasses}>
            <div><p className={`text-sm font-bold ${isAdminRole ? 'text-red-900' : isSupervisorRole ? 'text-indigo-900' : isTechnicianRole ? 'text-emerald-900' : 'text-sky-900'} flex items-center gap-2`}><Settings className={`w-4 h-4 ${isAdminRole ? 'text-red-600' : isSupervisorRole ? 'text-indigo-600' : isTechnicianRole ? 'text-emerald-600' : 'text-sky-600'}`} /> Security & Settings</p><p className={`text-xs ${isAdminRole ? 'text-red-700' : isSupervisorRole ? 'text-indigo-700' : isTechnicianRole ? 'text-emerald-700' : 'text-sky-700'} mt-1`}>Update password, notification alerts, or sign out.</p></div>
            <Link to="/settings" className={settingsLinkClasses}>Go to Settings <ArrowRight className="w-3.5 h-3.5" /></Link>
          </section>
        </div>
      </div>
    </div>
  );
};
