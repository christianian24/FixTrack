import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { UserRole } from '../../types/user';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your current role (<strong className="text-slate-700">{currentRole}</strong>) does not have permission to access this console.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/dashboard"
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
