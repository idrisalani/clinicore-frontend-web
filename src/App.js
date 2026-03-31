import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationsPage from './pages/ConsultationsPage';
import LabPage from './pages/LabPage';
import PharmacyPage from './pages/PharmacyPage';
import BillingPage from './pages/BillingPage';

/**
 * Main App Component with Professional Routing & UI
 * Landing Page + Sidebar Navigation + All Features
 * 
 * Phases:
 * Phase 0-1: Auth
 * Phase 2: Patients
 * Phase 3: Appointments
 * Phase 4: Consultations
 * Phase 5: Lab
 * Phase 6: Pharmacy
 * Phase 7: Billing
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}

        {/* Landing Page - Homepage for non-authenticated users */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED ROUTES WITH SIDEBAR */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <DashboardPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 2: Patients Management */}
        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <PatientsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 2.5.1: Patient Detail Page */}
        <Route
          path="/patients/:id"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <PatientDetailPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 3: Appointments Management */}
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <AppointmentsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 4: Consultations & Clinical Notes */}
        <Route
          path="/consultations"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <ConsultationsPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 5: Laboratory Tests */}
        <Route
          path="/lab"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <LabPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 6: Pharmacy & Prescriptions */}
        <Route
          path="/pharmacy"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <PharmacyPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* PHASE 7: Billing & Invoicing */}
        <Route
          path="/billing"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <BillingPage />
                </main>
              </div>
            </PrivateRoute>
          }
        />

        {/* Redirect root to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;