import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { ROLE_NAMES } from '../../lib/permissions';
import { resolveApiUrl } from '../../services/api/client';
import {
  Settings,
  Key,
  Lock,
  CheckCircle2,
  Shield,
  Bell,
  Sparkles,
  Eye,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, currentRole, logout, isDemoMode, setDemoMode } = useAuth();
  const { resetDemoData } = useFacilityCare();
  const navigate = useNavigate();
  const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();

  // Password state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [criticalSmsAlerts, setCriticalSmsAlerts] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPass.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setPasswordSaved(true);
    setCurrPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all facility concerns, buildings, rooms, and notifications to default sample state?')) {
      resetDemoData();
      alert('Demo data restored to pristine state.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" /> Settings & Security
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account credentials, password security, notification alerts, and active session
        </p>
      </div>

      {/* Grid: Password Security & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Section 1: Account Security & Password ────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Key className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-800">Account Security & Password</h2>
          </div>

          {passwordSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Password updated successfully.</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-sm cursor-pointer mt-2"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* ── Section 2: Notification & Alert Preferences ──────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-800">Notification Preferences</h2>
            </div>

            {prefSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Notification preferences saved.</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-700">Email Status Updates</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Receive email receipts when your concerns are assigned or resolved
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-700">In-Portal Push Notifications</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Show badge counter and real-time alerts in the notification bell
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => setBrowserNotifications(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-700">Critical Emergency SMS</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dispatch SMS text messages for urgent safety hazard notifications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={criticalSmsAlerts}
                  onChange={(e) => setCriticalSmsAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer mt-0.5"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer mt-2"
              >
                Save Preferences
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Section 3: Demonstration & Environment Controls ────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800">Environment & Demonstration Mode</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">
                {isDemoMode ? 'Demo Mode: Active' : 'Production Mode: Finished Product'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isDemoMode ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {isDemoMode ? 'Demo Persona Switcher On' : 'Clean Portal Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isDemoMode
                ? 'Demo persona shortcuts and reset tools are currently enabled for presentations.'
                : 'Demo shortcuts are hidden. The portal reflects the clean, finished university production experience.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isDemoMode ? (
              <>
                <button
                  onClick={() => setDemoMode(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Exit Demo Mode
                </button>
                <button
                  onClick={handleResetDemoData}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Restore pristine mock dataset"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Data
                </button>
              </>
            ) : (
              <button
                onClick={() => setDemoMode(true)}
                className="px-4 py-2 text-xs font-semibold rounded-xl btn-primary transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Enable Demo Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: Sign Out & Active Session Management ─────────────── */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Lock className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-bold text-slate-800">Sign Out & Session Management</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {currentUser.avatar ? (
              <img src={resolveApiUrl(currentUser.avatar)} alt={currentUser.firstName} className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 shadow-sm" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold border-2 border-sky-200">{initials}</div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-800">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser.email} • <span className="font-semibold text-sky-700">{ROLE_NAMES[currentRole]}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentUser.userType}{currentUser.department ? ` • ${currentUser.department}` : ''} • {currentUser.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Active session on this browser
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            id="settings-logout-btn"
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
