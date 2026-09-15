import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { FacilityCareProvider } from './store/FacilityCareContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Main Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ConcernListPage } from './pages/concerns/ConcernListPage';
import { NewConcernPage } from './pages/concerns/NewConcernPage';
import { ConcernDetailPage } from './pages/concerns/ConcernDetailPage';
import { MaintenanceTasksPage } from './pages/tasks/MaintenanceTasksPage';
import { MaintenanceTaskDetailPage } from './pages/tasks/MaintenanceTaskDetailPage';
import { SupervisorManagePage } from './pages/supervisor/SupervisorManagePage';
import { VerificationDetailPage } from './pages/supervisor/VerificationDetailPage';
import { UsersPage } from './pages/admin/UsersPage';
import { BuildingsPage } from './pages/admin/BuildingsPage';
import { RoomsPage } from './pages/admin/RoomsPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';

import { ProtectedRoute } from './components/layout/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacilityCareProvider>
          <Routes>
            {/* Auth Layout Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* App Layout Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Concerns Routes */}
              <Route path="/concerns" element={<ConcernListPage />} />
              <Route path="/concerns/new" element={<NewConcernPage />} />
              <Route path="/concerns/:id" element={<ConcernDetailPage />} />

              {/* Maintenance Technician Tasks */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_PERSONNEL', 'MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR']}>
                    <MaintenanceTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/:id"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_PERSONNEL', 'MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR']}>
                    <MaintenanceTaskDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Supervisor Management & Verification */}
              <Route
                path="/manage"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR']}>
                    <SupervisorManagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify/:id"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR', 'REPORTER']}>
                    <VerificationDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Infrastructure Management */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/buildings"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                    <BuildingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rooms"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                    <RoomsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />

              {/* Analytics & Reports */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR']}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['MAINTENANCE_SUPERVISOR', 'ADMINISTRATOR']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Notifications, Profile & Settings */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </FacilityCareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
