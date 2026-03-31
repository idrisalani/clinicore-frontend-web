import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  FileText,
  Beaker,
  Pill,
  CreditCard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

/**
 * Professional Sidebar Navigation Component
 * Main navigation for authenticated users with professional scrollbar styling
 */
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear authentication token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: FileText, label: 'Consultations', path: '/consultations' },
    { icon: Beaker, label: 'Laboratory', path: '/lab' },
    { icon: Pill, label: 'Pharmacy', path: '/pharmacy' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
  ];

  return (
    <>
      {/* Professional Custom Scrollbar Styles */}
      <style>{`
        .sidebar-nav {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.4) transparent;
        }
        
        .sidebar-nav::-webkit-scrollbar {
          width: 5px;
        }
        
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.4);
          border-radius: 3px;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
          border: 1px solid rgba(107, 114, 128, 0.4);
        }
        
        .sidebar-nav::-webkit-scrollbar-thumb:active {
          background: rgba(107, 114, 128, 0.9);
        }
      `}</style>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform duration-300 z-40 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Header - Logo Section */}
        <div className="p-6 flex items-center justify-between flex-shrink-0">
          {isOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold">
                CC
              </div>
              <div>
                <p className="font-bold text-lg">CliniCore</p>
                <p className="text-xs text-gray-400">Healthcare</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block p-1 hover:bg-gray-700 rounded transition"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation Items - Scrollable Section */}
        <nav className="sidebar-nav px-3 py-6 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={!isOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-3 flex-shrink-0">
          <div className="h-px bg-gray-700" />
        </div>

        {/* Logout Button */}
        <div className="px-3 py-6 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all w-full group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Stats Footer - Fixed at Bottom */}
        {isOpen && (
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-800 flex-shrink-0 space-y-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">Active Users</p>
              <p className="text-2xl font-bold text-blue-400">1</p>
            </div>
            <p className="text-xs text-gray-500 text-center">Version 1.0.0</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;