import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  LogIn,
  Shield,
  CheckCircle2,
  School,
  ArrowRight,
  Users,
  Wrench,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Lock,
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
  const [email, setEmail] = useState('alex.chen@school.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
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
        const err = await login(user.email);
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">

        {/* ── Left panel: branding & institutional identity ────────────────── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-500 to-sky-600 p-8 sm:p-10 flex flex-col justify-between text-white">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Fix<span className="text-sky-200">Track</span>
                </h1>
                <p className="text-[11px] text-sky-200">School Facility Portal</p>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
                Keep your campus in top shape
              </h2>
              <p className="text-sm text-sky-100 leading-relaxed">
                Report facility concerns, track repairs in real-time, and keep campus infrastructure running smoothly.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-white/20">
              <div>
                <p className="text-[10px] text-sky-200 uppercase tracking-wider">Resolution</p>
                <p className="text-xl font-bold mt-0.5">98.4%</p>
              </div>
              <div>
                <p className="text-[10px] text-sky-200 uppercase tracking-wider">Avg. Time</p>
                <p className="text-xl font-bold mt-0.5">1.8 hr</p>
              </div>
              <div>
                <p className="text-[10px] text-sky-200 uppercase tracking-wider">Locations</p>
                <p className="text-xl font-bold mt-0.5">14</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                'Duplicate detection prevents redundant work orders',
                'Photo-verified before & after audit trail',
                'Role-based access for all 5 user types',
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-sm text-sky-50">
                  <CheckCircle2 className="w-4 h-4 text-sky-200 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Online status */}
          <div className="pt-6 mt-4 border-t border-white/20 flex items-center justify-between text-xs text-sky-200">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block animate-pulse" />
              All campus systems operational
            </span>
            <span>AY 2026–27</span>
          </div>
        </div>

        {/* ── Right panel: login form ───────────────────────────────────── */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top header with mode indicator */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {isDemoMode ? 'Sign in to your account' : 'Sign in to Campus Portal'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isDemoMode
                    ? 'Select a test persona for instant review, or sign in with your email.'
                    : 'Enter your institutional school credentials to access the facility portal.'}
                </p>
              </div>

              {/* Exit Demo Mode / Toggle Pill */}
              {isDemoMode ? (
                <button
                  onClick={() => setDemoMode(false)}
                  id="login-exit-demo-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  title="Hide demo shortcuts to preview the clean production finished product"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exit Demo</span>
                </button>
              ) : (
                <button
                  onClick={() => setDemoMode(true)}
                  id="login-enable-demo-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  title="Enable demo persona matrix"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Demo Mode</span>
                </button>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── DEMO MODE ONLY: Quick persona selection ──────────────── */}
            {isDemoMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Quick access — click to sign in instantly
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

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRODUCTION MODE ONLY: Notice ─────────────────────────── */}
            {!isDemoMode && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 flex-shrink-0 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="leading-relaxed">
                  <strong className="text-slate-800 block">Single Sign-On & Portal Access</strong>
                  Sign in using your authorized school email account and password.
                </div>
              </div>
            )}

            {/* Email & Password form */}
            <form onSubmit={handleManualLogin} className="space-y-4" id="login-form">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="login-email">
                  Institutional Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="input-base text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600" htmlFor="login-password">
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
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="input-base text-sm"
                />
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
                  <label htmlFor="remember-me" className="text-slate-600 cursor-pointer select-none text-xs">
                    Keep me signed in on this device
                  </label>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm cursor-pointer mt-2"
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
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
                Register as Student or Faculty
              </Link>
            </div>

            {/* Discreet toggle link */}
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
                  className="text-sky-600 hover:text-sky-700 font-medium transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
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
