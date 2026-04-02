// ============================================
// AdminDashboard - Professional Admin Overview
// File: frontend-web/src/pages/admin/AdminDashboard.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Users, UserCheck, Activity, HeartPulse, Calendar,
  ShieldCheck, ArrowRight, TrendingUp, RefreshCw,
  UserCog, ClipboardList, Settings, AlertTriangle,
} from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, color, sub }) => {
  const palette = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   icon: 'bg-blue-100'   },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100',  icon: 'bg-green-100'  },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: 'bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: 'bg-orange-100' },
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   icon: 'bg-teal-100'   },
  };
  const p = palette[color] || palette.blue;

  return (
    <div className={`${p.bg} border ${p.border} rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`${p.icon} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${p.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold ${p.text} mt-0.5`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ── Quick Action Card ─────────────────────────────────────────────────────────
const ActionCard = ({ icon: Icon, label, desc, path, color }) => (
  <Link
    to={path}
    className={`${color} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm group`}
  >
    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold">{label}</p>
      <p className="text-xs opacity-70 truncate">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
  </Link>
);

// ── Activity Row ──────────────────────────────────────────────────────────────
const ActivityRow = ({ activity, idx }) => {
  const actionColor = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN:  'bg-purple-100 text-purple-700',
    VIEW:   'bg-gray-100 text-gray-600',
  };
  const action = (activity.action || '').toUpperCase().split('_')[0];
  const colorClass = actionColor[action] || 'bg-gray-100 text-gray-600';

  return (
    <div className={`flex items-center gap-4 py-3 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>
        {action}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{activity.action}</p>
        <p className="text-xs text-gray-400">{activity.resource_type || 'System'}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-gray-600">{activity.username || 'System'}</p>
        <p className="text-xs text-gray-400">
          {activity.created_at
            ? new Date(activity.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
            : '—'}
        </p>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { fetchDashboardStats } = useAdmin();

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Admin access required to view dashboard stats.'
        : 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchDashboardStats]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        <p className="mt-3 text-gray-500 text-sm">Loading admin dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">System overview & management</p>
        </div>
        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      title="Total Users"         value={stats?.totalUsers}          color="blue"   sub="All registered accounts" />
        <StatCard icon={UserCheck}  title="Active Users"        value={stats?.activeUsers}         color="green"  sub="Currently active" />
        <StatCard icon={HeartPulse} title="Total Patients"      value={stats?.totalPatients}       color="purple" sub="Registered patients" />
        <StatCard icon={Calendar}   title="Today's Appointments"value={stats?.appointmentsToday}   color="orange" sub="Scheduled today" />
      </div>

      {/* ── Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <ActionCard icon={UserCog}      label="Manage Users"    desc="Create, edit & delete users"    path="/admin/users"       color="bg-purple-600" />
            <ActionCard icon={ShieldCheck}  label="Roles & Perms"   desc="Configure access control"       path="/admin/permissions" color="bg-indigo-600" />
            <ActionCard icon={ClipboardList}label="Activity Logs"   desc="Monitor system activity"        path="/admin/activity"    color="bg-slate-700"  />
            <ActionCard icon={Settings}     label="System Settings" desc="Configure CliniCore"            path="/admin/settings"    color="bg-gray-700"   />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recent Activity</h2>
            <Link to="/admin/activity" className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-2">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.slice(0, 8).map((activity, idx) => (
                <ActivityRow key={idx} activity={activity} idx={idx} />
              ))
            ) : (
              <div className="py-10 text-center">
                <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── System Modules ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">All Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Patients',      path: '/patients',      icon: Users,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
            { label: 'Appointments',  path: '/appointments',  icon: Calendar,     color: 'text-green-600',  bg: 'bg-green-50'  },
            { label: 'Consultations', path: '/consultations', icon: ClipboardList,color: 'text-teal-600',   bg: 'bg-teal-50'   },
            { label: 'Laboratory',    path: '/lab',           icon: Activity,     color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Pharmacy',      path: '/pharmacy',      icon: ShieldCheck,  color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Billing',       path: '/billing',       icon: TrendingUp,   color: 'text-rose-600',   bg: 'bg-rose-50'   },
          ].map((mod) => (
            <Link
              key={mod.path}
              to={mod.path}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group text-center"
            >
              <div className={`${mod.bg} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                <mod.icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <p className="text-xs font-semibold text-gray-700">{mod.label}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}