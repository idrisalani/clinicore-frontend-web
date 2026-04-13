import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import RoleGuard from './components/RoleGuard';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
// Core modules
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationsPage from './pages/ConsultationsPage';
import LabPage from './pages/LabPage';
import PharmacyPage from './pages/PharmacyPage';
import BillingPage from './pages/BillingPage';
import QueuePage from './pages/QueuePage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import DrugExpiryPage from './pages/DrugExpiryPage';
import MaternityPage from './pages/MaternityPage';
import TelemedicinePage from './pages/TelemedicinePage';

// Patient Portal
import PatientPortalPage  from './pages/PatientPortalPage';
import PatientProfilePage from './pages/PatientProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import SettingsPage from './pages/admin/SettingsPage';

// ── Helpers ──────────────────────────────────────────────────────────────────

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('clinicore_user');
    if (!stored || stored === 'null' || stored === 'undefined') return { role: '', name: '' };
    const u = JSON.parse(stored);
    const userData = u?.user || u;
    return {
      role: userData?.role || userData?.role_name || '',
      name: userData?.full_name || userData?.name || userData?.username || '',
    };
  } catch {
    return { role: '', name: '' };
  }
};

// ── AppLayout ─────────────────────────────────────────────────────────────────

const AppLayout = ({ children }) => {
  const [userData, setUserData] = useState(readStoredUser);

  useEffect(() => {
    setUserData(readStoredUser());
    const refresh = () => setUserData(readStoredUser());
    window.addEventListener('storage', refresh);
    window.addEventListener('clinicore_user_saved', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('clinicore_user_saved', refresh);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userData.role} userName={userData.name} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};

// ── Route helpers ─────────────────────────────────────────────────────────────

const Protected = ({ children }) => (
  <PrivateRoute>
    <AppLayout>{children}</AppLayout>
  </PrivateRoute>
);

const AdminOnly = ({ children }) => (
  <PrivateRoute>
    <AppLayout>
      <RoleGuard allowedRoles={['admin']}>
        {children}
      </RoleGuard>
    </AppLayout>
  </PrivateRoute>
);

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* CORE MODULES */}
        <Route path="/dashboard"     element={<Protected><DashboardPage /></Protected>} />
        <Route path="/patients"      element={<Protected><PatientsPage /></Protected>} />
        <Route path="/patients/:id"  element={<Protected><PatientDetailPage /></Protected>} />
        <Route path="/appointments"  element={<Protected><AppointmentsPage /></Protected>} />
        <Route path="/consultations" element={<Protected><ConsultationsPage /></Protected>} />
        <Route path="/lab"           element={<Protected><LabPage /></Protected>} />
        <Route path="/pharmacy"      element={<Protected><PharmacyPage /></Protected>} />
        <Route path="/billing"       element={<Protected><BillingPage /></Protected>} />
        <Route path="/queue"         element={<Protected><QueuePage /></Protected>} />
        <Route path="/reports"       element={<Protected><FinancialReportsPage /></Protected>} />
        <Route path="/drug-expiry"   element={<Protected><DrugExpiryPage /></Protected>} />
        <Route path="/maternity"     element={<Protected><MaternityPage /></Protected>} />
        <Route path="/telemedicine"  element={<Protected><TelemedicinePage /></Protected>} />

        {/* PATIENT PORTAL */}
        <Route path="/portal"         element={<Protected><PatientPortalPage /></Protected>} />
        <Route path="/portal/profile" element={<Protected><PatientProfilePage /></Protected>} />

        {/* ADMIN ROUTES */}
        <Route path="/admin"             element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        <Route path="/admin/users"       element={<AdminOnly><UsersPage /></AdminOnly>} />
        <Route path="/admin/roles"       element={<AdminOnly><RolesPage /></AdminOnly>} />
        <Route path="/admin/permissions" element={<AdminOnly><PermissionsPage /></AdminOnly>} />
        <Route path="/admin/activity"    element={<AdminOnly><ActivityLogsPage /></AdminOnly>} />
        <Route path="/admin/settings"    element={<AdminOnly><SettingsPage /></AdminOnly>} />

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Router>
  );
}

export default App;