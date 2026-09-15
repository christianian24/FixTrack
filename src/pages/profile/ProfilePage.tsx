import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { ROLE_NAMES } from '../../lib/permissions';
import {
  User,
  Mail,
  Shield,
  Building,
  CheckCircle2,
  Settings,
  ArrowRight,
  School,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-5671');
  const [department, setDepartment] = useState(currentUser.department || 'Computer Science');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" /> Account Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View your institutional identity, academic affiliation, and contact records
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.firstName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
          />
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            Active
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold self-center sm:self-auto">
              {ROLE_NAMES[currentUser.role]}
            </span>
          </div>

          <p className="text-sm text-slate-500">
            {currentUser.email} • ID: {currentUser.id}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-600" /> Affiliation: <strong className="text-slate-800 font-semibold">{currentUser.userType}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-600" /> Department: <strong className="text-slate-800 font-semibold">{department}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Contact Details & Campus Membership */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-600" /> Institutional Contact Details
          </h3>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Contact details updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                School Email (Institutional)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="input-base text-sm bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Department / Division
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-base text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-sm cursor-pointer"
            >
              Save Contact Updates
            </button>
          </form>
        </div>

        {/* Campus Affiliation & Institutional Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <School className="w-4 h-4 text-sky-600" /> Institutional Record
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Assigned Role</span>
                <span className="font-bold text-slate-800">{ROLE_NAMES[currentUser.role]}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Affiliation Type</span>
                <span className="font-bold text-slate-800">{currentUser.userType}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active & Verified
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Academic Year</span>
                <span className="font-bold text-slate-800">AY 2026–27</span>
              </div>
            </div>
          </div>

          {/* Quick link to Settings */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex items-center justify-between gap-3 mt-4">
            <div>
              <p className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-sky-600" /> Security & Settings
              </p>
              <p className="text-[11px] text-sky-700 mt-0.5">
                Update password, notification alerts, or sign out
              </p>
            </div>
            <Link
              to="/settings"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs flex-shrink-0"
            >
              Go to Settings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
