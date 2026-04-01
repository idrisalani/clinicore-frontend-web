// File: frontend-web/src/components/admin/AdminNav.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Lock, Activity, Settings, X
} from 'lucide-react';

export default function AdminNav({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/roles', label: 'Roles', icon: Shield },
    { path: '/admin/permissions', label: 'Permissions', icon: Lock },
    { path: '/admin/activity-logs', label: 'Activity Logs', icon: Activity },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-gray-900 text-white p-6 transform
        transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">CliniCore</h2>
          <button onClick={onClose} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${isActive(path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-gray-400">
            CliniCore v1.0 | Phase 10 Admin
          </p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </>
  );
}