import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileText,
  Beaker,
  Pill,
  CreditCard,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';

/**
 * Enhanced Professional Dashboard
 * Quick overview and analytics
 */
const EnhancedDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 10,
    appointments: 0,
    consultations: 0,
    labTests: 0,
    prescriptions: 0,
    revenue: 0,
  });

  // Simulate stats loading
  useEffect(() => {
    // In real app, fetch from API
    setStats({
      totalPatients: 10,
      appointments: 0,
      consultations: 0,
      labTests: 0,
      prescriptions: 0,
      revenue: 0,
    });
  }, []);

  const dashboardCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      link: '/patients',
    },
    {
      title: 'Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
      link: '/appointments',
    },
    {
      title: 'Consultations',
      value: stats.consultations,
      icon: FileText,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      link: '/consultations',
    },
    {
      title: 'Lab Tests',
      value: stats.labTests,
      icon: Beaker,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      link: '/lab',
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: Pill,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      link: '/pharmacy',
    },
    {
      title: 'Revenue (₦)',
      value: stats.revenue.toLocaleString(),
      icon: CreditCard,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-100',
      textColor: 'text-indigo-700',
      link: '/billing',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to CliniCore</h1>
          <p className="text-gray-600">Healthcare Management Dashboard</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-gray-300 p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>
                    {typeof card.value === 'number' && card.value < 100
                      ? card.value
                      : card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.lightColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">View Details</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/patients"
                  className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-blue-700 font-medium"
                >
                  <Users className="w-5 h-5" />
                  Add New Patient
                </Link>
                <Link
                  to="/appointments"
                  className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-green-700 font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Appointment
                </Link>
                <Link
                  to="/consultations"
                  className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-purple-700 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Record Consultation
                </Link>
                <Link
                  to="/billing"
                  className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition text-indigo-700 font-medium"
                >
                  <CreditCard className="w-5 h-5" />
                  Create Invoice
                </Link>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-semibold text-green-900">System Online</p>
                      <p className="text-sm text-green-700">All services operational</p>
                    </div>
                  </div>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Database</p>
                    <p className="text-lg font-bold text-gray-900">✓</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">API Server</p>
                    <p className="text-lg font-bold text-gray-900">✓</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Frontend</p>
                    <p className="text-lg font-bold text-gray-900">✓</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Pro Tip</p>
                    <p className="text-sm text-blue-700">Use the sidebar to navigate between different modules</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">Patient Management</p>
              <p className="text-sm text-blue-700">Complete patient records and history</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="font-semibold text-green-900 mb-1">Appointments</p>
              <p className="text-sm text-green-700">Schedule and manage appointments</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">Clinical Notes</p>
              <p className="text-sm text-purple-700">Record consultations and treatment</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-900 mb-1">Lab & Pharmacy</p>
              <p className="text-sm text-orange-700">Order tests and manage medications</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
              <p className="font-semibold text-pink-900 mb-1">Prescriptions</p>
              <p className="text-sm text-pink-700">Issue and track prescriptions</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
              <p className="font-semibold text-indigo-900 mb-1">Billing</p>
              <p className="text-sm text-indigo-700">Create invoices and track payments</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
              <p className="font-semibold text-cyan-900 mb-1">Analytics</p>
              <p className="text-sm text-cyan-700">Real-time clinic statistics</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
              <p className="font-semibold text-teal-900 mb-1">Security</p>
              <p className="text-sm text-teal-700">HIPAA-compliant and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;