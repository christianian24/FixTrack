import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { FormField } from '../../components/forms/FormField';
import {
  clearResolvedFieldError,
  emailField,
  mapApiError,
  requiredField,
  validateFields,
  type FieldErrors,
  type FieldValidators,
} from '../../lib/formValidation';
import {
  LogIn,
  Shield,
  ArrowRight,
  Users,
  Wrench,
  LayoutDashboard,
  ShieldCheck,
  Eye,
} from 'lucide-react';

// Icon map for roles
const ROLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  REPORTER: Users,
  MAINTENANCE_PERSONNEL: Wrench,
  MAINTENANCE_SUPERVISOR: LayoutDashboard,
  ADMINISTRATOR: ShieldCheck,
};

// Soft pastel color map per role
const ROLE_CARD_STYLES: Record<string, { border: string; bg: string; iconBg: string; iconColor: string; badge: string; badgeText: string }> = {
  REPORTER: { border: 'border-sky-200', bg: 'hover:bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', badge: 'bg-sky-100 text-sky-700', badgeText: 'Student/Faculty' },
  MAINTENANCE_PERSONNEL: { border: 'border-emerald-200', bg: 'hover:bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', badgeText: 'Technician' },
  MAINTENANCE_SUPERVISOR: { border: 'border-indigo-200', bg: 'hover:bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', badgeText: 'Supervisor' },
  ADMINISTRATOR: { border: 'border-rose-200', bg: 'hover:bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', badgeText: 'Admin' },
};

export const LoginPage: React.FC = () => {
  const { login, loginWithDemoAccount, demoAccounts } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const validators: FieldValidators = {
    email: emailField,
    password: requiredField('Password'),
  };

  const updateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    setError(null);
    setFieldErrors((current) =>
      clearResolvedFieldError(current, field, value, validators[field]),
    );
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors = validateFields({ email, password }, validators);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (loginError) {
      const feedback = mapApiError(
        loginError,
        'Unable to sign in. Please check your credentials and try again.',
        { knownFields: ['email', 'password'] },
      );
      setFieldErrors(feedback.fieldErrors);
      setError(feedback.generalMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userId: string) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithDemoAccount(userId);
      navigate('/dashboard');
    } catch (loginError) {
      setError(
        mapApiError(loginError, 'Unable to start the demo session. Please try again.', {
          knownFields: [],
        })
          .generalMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[490px] mx-auto">
      <div className="bg-white/95 rounded-[24px] border border-slate-200/80 shadow-[0_10px_28px_rgba(15,23,42,0.06)] p-5 sm:p-7 backdrop-blur-sm">
        <div className="mb-4">
          <div className="mb-3 inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
            Campus Facilities Portal
          </div>
          <h3 className="text-[1.8rem] sm:text-[2.15rem] font-bold text-slate-800 tracking-[-0.06em] leading-[1.08]">
            Sign in to Campus Portal
          </h3>
          <p className="text-[0.8rem] text-slate-500 mt-2 leading-relaxed">
            Choose an approved demo account for instant access, or sign in with your institutional credentials.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {demoAccounts.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
                Quick access
              </p>
              <span className="text-[11px] text-amber-600 font-medium">Demo matrix</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((user) => {
                const style = ROLE_CARD_STYLES[user.role] || ROLE_CARD_STYLES['REPORTER'];
                const RoleIcon = ROLE_ICONS[user.role] || Users;
                return (
                  <button
                    key={user.id}
                    type="button"
                    id={`persona-${user.id}`}
                    onClick={() => handleQuickLogin(user.id)}
                    disabled={loading}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 group ${style.border} ${style.bg} bg-white cursor-pointer disabled:opacity-60 disabled:cursor-wait`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                      <RoleIcon className={`w-4.5 h-4.5 ${style.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${style.badge}`}>
                        {style.badgeText}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                );
              })}
            </div>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4" id="login-form" noValidate>
          <FormField
            id="login-email"
            label="Institutional Email Address"
            error={fieldErrors.email}
            required
            className="space-y-2"
            labelClassName="block text-[0.72rem] font-semibold text-slate-600 uppercase tracking-[0.14em]"
          >
            <input
              id="login-email"
              type="email"
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="alex.chen@school.edu"
              className="input-base text-base h-12 rounded-xl border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)] focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </FormField>

          <FormField
            id="login-password"
            label="Password"
            error={fieldErrors.password}
            required
            className="space-y-2"
            labelClassName="block text-[0.72rem] font-semibold text-slate-600 uppercase tracking-[0.14em]"
          >
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••••••••"
                className="input-base text-base h-12 rounded-xl border-slate-200 bg-white pr-11 shadow-[0_1px_0_rgba(15,23,42,0.02)] focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </FormField>

          <div className="flex items-center justify-between text-sm pt-1">
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-slate-600 cursor-pointer select-none text-[0.85rem]">
                Keep me signed in on this device
              </label>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 flex items-center justify-center gap-2 text-[1rem] font-semibold rounded-xl bg-[#0f9bd5] hover:bg-[#0c8cc0] text-white shadow-[0_8px_18px_rgba(14,116,144,0.14)] transition-all cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Signing in…'
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In to FixTrack
              </>
            )}
          </button>
          <div className="flex justify-center">
            <span className="text-xs text-sky-600 hover:text-sky-700 cursor-pointer font-medium">
              Forgot password?
            </span>
          </div>
        </form>

        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Secure access for students, faculty, and maintenance teams
          </div>

          <div className="flex items-center justify-center text-[10px] text-slate-400 mb-3">
            Need help? <a href="mailto:support@fixtrack.edu" className="ml-1 text-sky-600 hover:text-sky-700 font-medium">Contact IT Support</a>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
            <div>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                Register as Student or Faculty
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
