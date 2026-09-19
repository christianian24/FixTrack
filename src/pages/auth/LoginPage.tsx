import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
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
  const { login, demoUsers, isDemoMode, setDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('usr_alex');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const err = await login(email, password);
      if (!err) {
        navigate('/dashboard');
      } else {
        setError(err);
      }
    } catch {
      setError('Please enter a valid school email address (e.g. name@school.edu).');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (userId: string) => {
    const user = demoUsers.find(u => u.id === userId);
    if (user) {
      setSelectedDemoId(userId);
      setEmail(user.email);
    }
  };

  const handleQuickLogin = async (userId: string) => {
    const user = demoUsers.find(u => u.id === userId);
    if (user) {
      setLoading(true);
      try {
        const err = await login(user.email, 'demo1234');
        if (!err) {
          navigate('/dashboard');
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
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
            {isDemoMode ? 'Sign in to your account' : 'Sign in to Campus Portal'}
          </h3>
          <p className="text-[0.8rem] text-slate-500 mt-2 leading-relaxed">
            {isDemoMode
              ? 'Select a test persona for instant review, or sign in with your email.'
              : 'Enter your institutional school credentials to access the facility portal.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isDemoMode && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
                Quick access
              </p>
              <span className="text-[11px] text-amber-600 font-medium">Demo matrix</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoUsers.map((user) => {
                const isSelected = selectedDemoId === user.id;
                const style = ROLE_CARD_STYLES[user.role] || ROLE_CARD_STYLES['REPORTER'];
                const RoleIcon = ROLE_ICONS[user.role] || Users;
                return (
                  <button
                    key={user.id}
                    type="button"
                    id={`persona-${user.id}`}
                    onClick={() => handleQuickLogin(user.id)}
                    onMouseEnter={() => handleSelectDemo(user.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 group ${style.border} ${style.bg} ${
                      isSelected ? 'ring-2 ring-sky-300 ring-offset-1' : ''
                    } bg-white cursor-pointer`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
                      <RoleIcon className={`w-4.5 h-4.5 ${style.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {user.firstName} {user.lastName}
                      </p>
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

        <form onSubmit={handleManualLogin} className="space-y-4" id="login-form">
          <div className="space-y-2">
            <label className="block text-[0.72rem] font-semibold text-slate-600 uppercase tracking-[0.14em]" htmlFor="login-email">
              Institutional Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.chen@school.edu"
              className="input-base text-base h-12 rounded-xl border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)] focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[0.72rem] font-semibold text-slate-600 uppercase tracking-[0.14em]" htmlFor="login-password">
                Password
              </label>
              {isDemoMode ? (
                <span className="text-[11px] text-slate-400">Any password works in demo</span>
              ) : (
                <span className="text-xs text-sky-600 hover:text-sky-700 cursor-pointer font-medium">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

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
        </form>

        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Secure access for students, faculty, and maintenance teams
          </div>

          <div className="flex items-center justify-center text-[10px] text-slate-400 mb-3">
            Need help? <a href="mailto:support@fixtrack.edu" className="ml-1 text-sky-600 hover:text-sky-700 font-medium">Contact IT Support</a>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                Register as Student or Faculty
              </Link>
            </div>

            <div>
              {isDemoMode ? (
                <button
                  onClick={() => setDemoMode(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  View clean finished portal
                </button>
              ) : (
                <button
                  onClick={() => setDemoMode(true)}
                  className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
                >
                  Enable Demo Mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
