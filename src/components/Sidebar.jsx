import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, Users, Calendar, FileText, Beaker, Pill,
  CreditCard, LogOut, ChevronDown, Shield, Settings, AlertTriangle,
  UserCog, ClipboardList, HeartPulse, FlaskConical,
  Stethoscope, Receipt, BarChart3, User, Heart, Activity,
} from 'lucide-react';
import LogoutModal from './LogoutModal';

// ─── Role-based nav config ────────────────────────────────────────────────────
const NAV_CONFIG = {
  admin: {
    label: 'Admin Panel',
    color: 'from-slate-900 to-slate-800',
    accent: 'bg-purple-600',
    badge: 'ADMIN',
    badgeColor: 'bg-purple-500',
    items: [
      { icon: BarChart3,     label: 'Dashboard',    path: '/dashboard'         },
      { icon: Users,         label: 'Users',         path: '/admin/users'       },
      { icon: UserCog,       label: 'Roles',         path: '/admin/roles'       },
      { icon: Shield,        label: 'Permissions',   path: '/admin/permissions' },
      { icon: Users,         label: 'Patients',      path: '/patients'          },
      { icon: Calendar,      label: 'Appointments',  path: '/appointments'      },
      { icon: Users,         label: 'Queue',         path: '/queue'             },
      { icon: FileText,      label: 'Consultations', path: '/consultations'     },
      { icon: Heart,         label: 'Maternity',     path: '/maternity'         },
      { icon: Beaker,        label: 'Laboratory',    path: '/lab'               },
      { icon: Pill,          label: 'Pharmacy',      path: '/pharmacy'          },
      { icon: AlertTriangle, label: 'Drug Expiry',   path: '/drug-expiry'       },
      { icon: CreditCard,    label: 'Billing',       path: '/billing'           },
      { icon: BarChart3,     label: 'Fin. Reports',  path: '/reports'           },
      { icon: ClipboardList, label: 'Activity Logs', path: '/admin/activity'    },
      { icon: Settings,      label: 'Settings',      path: '/admin/settings'    },
    ],
  },
  doctor: {
    label: 'Doctor Portal',
    color: 'from-blue-900 to-blue-800',
    accent: 'bg-blue-500',
    badge: 'DOCTOR',
    badgeColor: 'bg-blue-500',
    items: [
      { icon: Home,          label: 'Dashboard',     path: '/dashboard'     },
      { icon: Users,         label: 'My Patients',   path: '/patients'      },
      { icon: Calendar,      label: 'Appointments',  path: '/appointments'  },
      { icon: Users,         label: 'Queue',         path: '/queue'         },
      { icon: Stethoscope,   label: 'Consultations', path: '/consultations' },
      { icon: Heart,         label: 'Maternity',     path: '/maternity'     },
      { icon: FlaskConical,  label: 'Lab Requests',  path: '/lab'           },
      { icon: Pill,          label: 'Prescriptions', path: '/pharmacy'      },
      { icon: Receipt,       label: 'Billing',       path: '/billing'       },
      { icon: BarChart3,     label: 'Fin. Reports',  path: '/reports'       },
    ],
  },
  nurse: {
    label: 'Nurse Station',
    color: 'from-teal-900 to-teal-800',
    accent: 'bg-teal-500',
    badge: 'NURSE',
    badgeColor: 'bg-teal-500',
    items: [
      { icon: Home,          label: 'Dashboard',    path: '/dashboard'     },
      { icon: Users,         label: 'Patients',     path: '/patients'      },
      { icon: Calendar,      label: 'Appointments', path: '/appointments'  },
      { icon: Users,         label: 'Queue',        path: '/queue'         },
      { icon: HeartPulse,    label: 'Vitals',       path: '/consultations' },
      { icon: Heart,         label: 'Maternity',    path: '/maternity'     },
      { icon: FlaskConical,  label: 'Lab Results',  path: '/lab'           },
      { icon: Pill,          label: 'Medications',  path: '/pharmacy'      },
    ],
  },
  pharmacist: {
    label: 'Pharmacy Portal',
    color: 'from-emerald-900 to-emerald-800',
    accent: 'bg-emerald-500',
    badge: 'PHARMACIST',
    badgeColor: 'bg-emerald-500',
    items: [
      { icon: Home,          label: 'Dashboard',      path: '/dashboard'   },
      { icon: Pill,          label: 'Prescriptions',  path: '/pharmacy'    },
      { icon: ClipboardList, label: 'Drug Inventory', path: '/pharmacy'    },
      { icon: AlertTriangle, label: 'Drug Expiry',    path: '/drug-expiry' },
      { icon: Users,         label: 'Patients',       path: '/patients'    },
      { icon: Receipt,       label: 'Billing',        path: '/billing'     },
    ],
  },
  lab_technician: {
    label: 'Lab Portal',
    color: 'from-orange-900 to-orange-800',
    accent: 'bg-orange-500',
    badge: 'LAB TECH',
    badgeColor: 'bg-orange-500',
    items: [
      { icon: Home,          label: 'Dashboard', path: '/dashboard' },
      { icon: FlaskConical,  label: 'Lab Tests', path: '/lab'       },
      { icon: ClipboardList, label: 'Results',   path: '/lab'       },
      { icon: Users,         label: 'Patients',  path: '/patients'  },
    ],
  },
  receptionist: {
    label: 'Reception',
    color: 'from-pink-900 to-pink-800',
    accent: 'bg-pink-500',
    badge: 'RECEPTION',
    badgeColor: 'bg-pink-500',
    items: [
      { icon: Home,     label: 'Dashboard',    path: '/dashboard'    },
      { icon: Users,    label: 'Patients',     path: '/patients'     },
      { icon: Calendar, label: 'Appointments', path: '/appointments' },
      { icon: Users,    label: 'Queue',        path: '/queue'        },
      { icon: Receipt,  label: 'Billing',      path: '/billing'      },
    ],
  },

  // ── PATIENT — updated with portal routes ────────────────────────────────────
  patient: {
    label: 'My Health Portal',
    color: 'from-teal-900 to-teal-800',
    accent: 'bg-teal-500',
    badge: 'PATIENT',
    badgeColor: 'bg-teal-500',
    items: [
      { icon: Activity,     label: 'My Health',     path: '/portal'          },
      { icon: Calendar,     label: 'Appointments',  path: '/appointments'    },
      { icon: FileText,     label: 'My Records',    path: '/consultations'   },
      { icon: FlaskConical, label: 'Lab Results',   path: '/lab'             },
      { icon: Pill,         label: 'Prescriptions', path: '/pharmacy'        },
      { icon: Receipt,      label: 'My Bills',      path: '/billing'         },
      { icon: User,         label: 'My Profile',    path: '/portal/profile'  },
    ],
  },
};

const DEFAULT_NAV = {
  label: 'CliniCore',
  color: 'from-gray-900 to-gray-800',
  accent: 'bg-blue-500',
  badge: 'USER',
  badgeColor: 'bg-gray-500',
  items: [
    { icon: Home,     label: 'Dashboard',    path: '/dashboard'    },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────
const Sidebar = ({ userRole, userName }) => {
  const [isOpen,       setIsOpen]       = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);
  const location = useLocation();

  const role   = (userRole || '').toLowerCase().replace(/\s+/g, '_');
  const config = NAV_CONFIG[role] || DEFAULT_NAV;

  // Active check: exact match OR prefix match for nested portal routes
  const isActive = (path) =>
    path === '/portal'
      ? location.pathname === '/portal'             // exact — avoid matching /portal/profile
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogoutConfirm = () => {
    localStorage.removeItem('clinicore_access_token');
    localStorage.removeItem('clinicore_refresh_token');
    localStorage.removeItem('clinicore_user');
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        .sidebar-nav {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.4);
        }
      `}</style>

      <LogoutModal
        isOpen={showLogout}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogout(false)}
        userName={userName}
      />

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-gradient-to-b ${config.color} text-white transition-all duration-300 z-40 flex flex-col shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Logo + Badge */}
        <div className="p-5 flex items-center justify-between flex-shrink-0 border-b border-white/10">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${config.accent} rounded-xl flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0`}>
                CC
              </div>
              <div>
                <p className="font-bold text-base leading-tight">CliniCore</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeColor} text-white`}>
                  {config.badge}
                </span>
              </div>
            </div>
          ) : (
            <div className={`w-10 h-10 ${config.accent} rounded-xl flex items-center justify-center font-bold text-sm mx-auto`}>
              CC
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-1.5 hover:bg-white/10 rounded-lg transition ml-auto"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>

        {/* User Strip */}
        {isOpen && userName && (
          <div className="px-5 py-3 bg-white/5 flex-shrink-0">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">{userName}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
          {config.items.map((item, idx) => {
            const active = isActive(item.path);
            return (
              <Link
                key={`${item.path}-${idx}`}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  active
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                title={!isOpen ? item.label : ''}
              >
                <item.icon
                  className={`flex-shrink-0 ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}
                  style={{ width: 17, height: 17 }}
                />
                {isOpen && (
                  <>
                    <span className="text-sm flex-1">{item.label}</span>
                    {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 flex-shrink-0">
          <div className="h-px bg-white/10" />
        </div>

        {/* Logout */}
        <div className="px-3 py-4 flex-shrink-0">
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all w-full group"
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut style={{ width: 17, height: 17 }} className="flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
            <p className="text-[10px] text-white/30 text-center">CliniCore v1.0.0</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;