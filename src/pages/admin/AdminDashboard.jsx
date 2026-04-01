// ============================================
// AdminDashboard Component - Admin Overview
// File: frontend-web/src/pages/admin/AdminDashboard.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Users, UserCheck, Activity, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchDashboardStats } = useAdmin();

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          title="Active Users"
          value={stats?.activeUsers || 0}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          title="Total Patients"
          value={stats?.totalPatients || 0}
          color="purple"
        />
        <StatCard
          icon={Activity}
          title="Today's Appointments"
          value={stats?.appointmentsToday || 0}
          color="orange"
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {stats?.recentActivities?.slice(0, 10).map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div>
                <p className="font-semibold text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.resource_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {activity.username || 'System'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon size={32} opacity={0.3} />
      </div>
    </div>
  );
}