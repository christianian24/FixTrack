import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useFacilityCare } from '../../store/FacilityCareContext';
import { ROLE_NAMES } from '../../lib/permissions';
import { UserRole } from '../../types/user';
import {
  Wrench,
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  BarChart3,
  FileSpreadsheet,
  Users,
  Building as BuildingIcon,
  DoorOpen,
  FolderTree,
  Bell,
  Menu,
  X,
  RefreshCw,
  ChevronDown,
  Sparkles,
  School,
  LogOut,
  Eye,
  Settings,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  primary?: boolean;
}

// Role color accent map
const ROLE_COLORS: Record<string, string> = {
  REPORTER: 'bg-sky-500',
  MAINTENANCE_PERSONNEL: 'bg-emerald-500',
  MAINTENANCE_SUPERVISOR: 'bg-indigo-500',
  ADMINISTRATOR: 'bg-rose-500',
};

interface SidebarContentProps {
  currentUser: any;
  currentRole: UserRole;
  roleColor: string;
  navItems: NavItem[];
  locationPathname: string;
  onCloseMobile: () => void;
  isDemoMode: boolean;
  setDemoMode: (mode: boolean) => void;
  handleReset: () => void;
  resetSuccess: boolean;
  handleLogout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  currentUser,
  currentRole,
  roleColor,
  navItems,
  locationPathname,
  onCloseMobile,
  isDemoMode,
  setDemoMode,
  handleReset,
  resetSuccess,
  handleLogout,
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="px-5 py-5 border-b border-slate-100">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
          <School className="w-5 h-5" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            Fix<span className="text-sky-500">Track</span>
          </span>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">School Facility Portal</p>
        </div>
      </Link>
    </div>

    {/* User card */}
    <div className="px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
        <div className="relative flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.firstName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${roleColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 truncate">
            {currentUser.firstName} {currentUser.lastName}
          </p>
          <p className="text-[10px] text-slate-500 truncate">{ROLE_NAMES[currentRole]}</p>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      <p className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Navigation</p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = locationPathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : item.primary
                ? 'btn-primary shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : item.primary ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="px-4 py-3 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Campus Online
        </span>
        <span className="text-[10px] text-emerald-600 font-medium">AY 2026–27</span>
      </div>

      {/* Demo Mode controls (only shown when in demo mode) */}
      {isDemoMode ? (
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => setDemoMode(false)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition-all shadow-2xs"
          >
            <Eye className="w-3 h-3 text-amber-600" />
            Exit Demo Mode (Production)
          </button>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${resetSuccess ? 'animate-spin text-emerald-500' : ''}`} />
            {resetSuccess ? 'Reset successful!' : 'Reset Demo Data'}
          </button>
        </div>
      ) : (
        <div className="pt-1 text-center">
          <button
            onClick={() => setDemoMode(true)}
            className="text-[11px] text-slate-400 hover:text-sky-600 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-sky-500" />
            Enable Demo Mode
          </button>
        </div>
      )}

      {/* Sidebar Log Out Button - positioned at bottom */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </div>
  </div>
);

export const AppLayout: React.FC = () => {
  const {
    currentUser,
    currentRole,
    isAuthenticated,
    isDemoMode,
    setDemoMode,
    switchRole,
    demoUsers,
    logout,
  } = useAuth();
  const { notifications, resetDemoData } = useFacilityCare();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo facility concerns, audit logs, and repair tasks to factory defaults?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'REPORTER':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Concerns', path: '/concerns', icon: FileText },
          { label: 'Report a Concern', path: '/concerns/new', icon: PlusCircle },
          { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs },
          { label: 'My Profile', path: '/profile', icon: Users },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'MAINTENANCE_PERSONNEL':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Work Orders', path: '/tasks', icon: CheckSquare },
          { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs },
          { label: 'My Profile', path: '/profile', icon: Users },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'MAINTENANCE_SUPERVISOR':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'All Concerns', path: '/concerns', icon: FileText },
          { label: 'Manage & Dispatch', path: '/manage', icon: Wrench },
          { label: 'Analytics', path: '/analytics', icon: BarChart3 },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs },
          { label: 'My Profile', path: '/profile', icon: Users },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'ADMINISTRATOR':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Analytics', path: '/analytics', icon: BarChart3 },
          { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
          { label: 'User Directory', path: '/admin/users', icon: Users },
          { label: 'Buildings', path: '/admin/buildings', icon: BuildingIcon },
          { label: 'Rooms', path: '/admin/rooms', icon: DoorOpen },
          { label: 'Categories', path: '/admin/categories', icon: FolderTree },
          { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs },
          { label: 'My Profile', path: '/profile', icon: Users },
          { label: 'Settings', path: '/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();
  const roleColor = ROLE_COLORS[currentRole] || 'bg-sky-500';

  const sidebarProps: SidebarContentProps = {
    currentUser,
    currentRole,
    roleColor,
    navItems,
    locationPathname: location.pathname,
    onCloseMobile: () => setMobileOpen(false),
    isDemoMode,
    setDemoMode,
    handleReset,
    resetSuccess,
    handleLogout,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-200 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-white border-r border-slate-200 z-10 overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-500">
                  Welcome back, <span className="font-semibold text-slate-800">{currentUser.firstName}</span> 👋
                </p>
              </div>
            </div>

            {/* Right toolbar */}
            <div className="flex items-center gap-2.5">
              {/* Demo mode status pill */}
              {isDemoMode ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden md:inline">Demo Mode</span>
                  <button
                    onClick={() => setDemoMode(false)}
                    id="exit-demo-mode-header-btn"
                    className="ml-1 px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                    title="Exit demo mode to view clean production product"
                  >
                    Exit Demo
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDemoMode(true)}
                  id="enable-demo-mode-btn"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all"
                  title="Enable demo personas for walkthroughs"
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span>Demo Mode: Off</span>
                </button>
              )}

              {/* Persona Switcher (only active in Demo Mode) */}
              {isDemoMode && (
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    id="switch-persona-btn"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs text-slate-700 transition-all cursor-pointer"
                  >
                    <span className={`w-2 h-2 rounded-full ${roleColor}`} />
                    <span className="font-medium">{ROLE_NAMES[currentRole]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden"
                      onClick={() => setRoleDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-sky-500" />
                          Switch Persona
                        </p>
                      </div>
                      <div className="p-2">
                        {demoUsers.map((user) => {
                          const isActive = currentUser.id === user.id;
                          const uColor = ROLE_COLORS[user.role] || 'bg-sky-500';
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                switchRole(user.role);
                                navigate('/dashboard');
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-3 transition-colors ${
                                isActive
                                  ? 'bg-sky-50 text-sky-800'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${uColor}`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] text-slate-500">{ROLE_NAMES[user.role]}</p>
                              </div>
                              {isActive && (
                                <span className="text-[10px] font-semibold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">Active</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </Link>

              {/* Avatar Link to Profile */}
              <Link to="/profile" className="flex items-center gap-2 group" title="My Profile">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.firstName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 group-hover:border-sky-300 transition-colors"
                />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-3 px-6 text-center">
          <p className="text-[11px] text-slate-400">
            FixTrack — School Facility Concern Reporting & Maintenance System · AY 2026–27
          </p>
        </footer>
      </div>
    </div>
  );
};
