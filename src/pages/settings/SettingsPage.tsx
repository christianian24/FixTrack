import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { FormField } from '../../components/forms/FormField';
import {
  clearResolvedFieldError,
  matchingField,
  minimumLengthField,
  requiredField,
  validateFields,
  type FieldErrors,
  type FieldValidators,
} from '../../lib/formValidation';
import {
  Settings,
  Key,
  CheckCircle2,
  Bell,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentRole } = useAuth();
  const isCompactRole = currentRole === 'REPORTER' || currentRole === 'MAINTENANCE_PERSONNEL' || currentRole === 'MAINTENANCE_SUPERVISOR' || currentRole === 'ADMINISTRATOR';
  const isAdminRole = currentRole === 'ADMINISTRATOR';
  const isSupervisorRole = currentRole === 'MAINTENANCE_SUPERVISOR';
  const isTechnicianRole = currentRole === 'MAINTENANCE_PERSONNEL';
  const primaryButtonClasses = isAdminRole
    ? 'w-full py-2.5 text-sm cursor-pointer mt-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm'
    : isSupervisorRole
    ? 'w-full py-2.5 text-sm cursor-pointer mt-2 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors shadow-sm'
    : isTechnicianRole
    ? 'w-full py-2.5 text-sm cursor-pointer mt-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-sm'
    : 'btn-primary w-full py-2.5 text-sm cursor-pointer mt-2';
  // Password state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const passwordValidators: FieldValidators = {
    currPass: requiredField('Current password'),
    newPass: (value) =>
      requiredField('New password')(value, {}) ??
      minimumLengthField(value, 'Password', 6),
    confirmPass: (value, values) =>
      requiredField('Confirm password')(value, values) ??
      matchingField(value, values, 'newPass', 'Passwords'),
  };

  const updatePasswordField = (field: 'currPass' | 'newPass' | 'confirmPass', value: string) => {
    const nextValues = {
      currPass: field === 'currPass' ? value : currPass,
      newPass: field === 'newPass' ? value : newPass,
      confirmPass: field === 'confirmPass' ? value : confirmPass,
    };
    if (field === 'currPass') setCurrPass(value);
    else if (field === 'newPass') setNewPass(value);
    else setConfirmPass(value);
    setFieldErrors((errors) => {
      let nextErrors = clearResolvedFieldError(
        errors,
        field,
        value,
        passwordValidators[field],
        nextValues,
      );
      if (field === 'newPass') {
        nextErrors = clearResolvedFieldError(
          nextErrors,
          'confirmPass',
          nextValues.confirmPass,
          passwordValidators.confirmPass,
          nextValues,
        );
      }
      return nextErrors;
    });
  };

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [criticalSmsAlerts, setCriticalSmsAlerts] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateFields({ currPass, newPass, confirmPass }, passwordValidators);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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

  return (
    <div className={isCompactRole ? 'max-w-4xl mx-auto space-y-3' : 'max-w-4xl mx-auto space-y-4'}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-600" /> Settings & Security
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account credentials, password security, and notification alerts
        </p>
      </div>

      {/* Grid: Password Security & Notifications */}
      <div className={isCompactRole ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
        {/* ── Section 1: Account Security & Password ────────────────────── */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4 space-y-3' : 'p-5 space-y-4'}`}>
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

          <form onSubmit={handleChangePassword} className="space-y-3.5" noValidate>
            <FormField id="settings-current-password" label="Current Password" error={fieldErrors.currPass} required>
              <input
                id="settings-current-password"
                type="password"
                value={currPass}
                aria-invalid={Boolean(fieldErrors.currPass)}
                aria-describedby={fieldErrors.currPass ? 'settings-current-password-error' : undefined}
                onChange={(e) => updatePasswordField('currPass', e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </FormField>

            <FormField id="settings-new-password" label="New Password" error={fieldErrors.newPass} required>
              <input
                id="settings-new-password"
                type="password"
                value={newPass}
                aria-invalid={Boolean(fieldErrors.newPass)}
                aria-describedby={fieldErrors.newPass ? 'settings-new-password-error' : undefined}
                onChange={(e) => updatePasswordField('newPass', e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </FormField>

            <FormField id="settings-confirm-password" label="Confirm New Password" error={fieldErrors.confirmPass} required>
              <input
                id="settings-confirm-password"
                type="password"
                value={confirmPass}
                aria-invalid={Boolean(fieldErrors.confirmPass)}
                aria-describedby={fieldErrors.confirmPass ? 'settings-confirm-password-error' : undefined}
                onChange={(e) => updatePasswordField('confirmPass', e.target.value)}
                placeholder="••••••••"
                className="input-base text-sm"
              />
            </FormField>

            <button
              type="submit"
              className={primaryButtonClasses}
            >
              Update Password
            </button>
          </form>
        </div>

        {/* ── Section 2: Notification & Alert Preferences ──────────────── */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${isCompactRole ? 'p-4 space-y-3' : 'p-5 space-y-4'} flex flex-col justify-between`}>
          <div className={isCompactRole ? 'space-y-3' : 'space-y-4'}>
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

            <form onSubmit={handleSavePreferences} className={isCompactRole ? 'space-y-3' : 'space-y-4'} noValidate>
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

    </div>
  );
};
