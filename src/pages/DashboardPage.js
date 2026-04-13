import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getPatientStats } from '../services/patientService';
import { getAppointmentStats } from '../services/appointmentService';
import { getConsultationStats } from '../services/consultationService';
import { getLabStats } from '../services/labService';
import { getPharmacyStats } from '../services/pharmacyService';
import { getBillingStats } from '../services/billingService';
import {
  Users, Calendar, FileText, Beaker, Pill, CreditCard,
  HeartPulse, FlaskConical, Stethoscope, Receipt, Shield,
  UserCog, BarChart3, ClipboardList, ArrowRight, AlertCircle,
  Settings, TrendingUp, Activity,
} from 'lucide-react';
import { useRole } from '../hooks/useRole';

// ─── Role Dashboard Configs ───────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    greeting: 'Admin Dashboard',
    subtitle: 'System overview & management',
    theme: { primary: '#7c3aed', light: '#ede9fe' },
    quickActions: [
      { label: 'Manage Users',    path: '/admin/users',       icon: UserCog,       color: 'bg-purple-600' },
      { label: 'Roles & Perms',   path: '/admin/permissions', icon: Shield,        color: 'bg-indigo-600' },
      { label: 'Activity Logs',   path: '/admin/activity',    icon: ClipboardList, color: 'bg-gray-700'   },
      { label: 'Settings',        path: '/admin/settings',    icon: Settings,      color: 'bg-slate-600'  },
    ],
    modules: [
      { label: 'Patients',      path: '/patients',      icon: Users,        desc: 'All patient records'    },
      { label: 'Appointments',  path: '/appointments',  icon: Calendar,     desc: 'Schedule overview'      },
      { label: 'Consultations', path: '/consultations', icon: FileText,     desc: 'Clinical notes'         },
      { label: 'Laboratory',    path: '/lab',           icon: Beaker,       desc: 'Lab tests & results'    },
      { label: 'Pharmacy',      path: '/pharmacy',      icon: Pill,         desc: 'Drug management'        },
      { label: 'Billing',       path: '/billing',       icon: CreditCard,   desc: 'Invoices & payments'    },
    ],
  },
  doctor: {
    greeting: "Doctor's Dashboard",
    subtitle: 'Your clinical overview for today',
    theme: { primary: '#2563eb', light: '#dbeafe' },
    quickActions: [
      { label: 'New Consultation', path: '/consultations', icon: Stethoscope, color: 'bg-blue-600'   },
      { label: 'View Patients',    path: '/patients',      icon: Users,       color: 'bg-indigo-600' },
      { label: 'Schedule',         path: '/appointments',  icon: Calendar,    color: 'bg-green-600'  },
      { label: 'Lab Requests',     path: '/lab',           icon: Beaker,      color: 'bg-orange-600' },
    ],
    modules: [
      { label: 'My Patients',    path: '/patients',      icon: Users,        desc: 'Patient list & records' },
      { label: 'Appointments',   path: '/appointments',  icon: Calendar,     desc: "Today's schedule"       },
      { label: 'Consultations',  path: '/consultations', icon: Stethoscope,  desc: 'Write clinical notes'   },
      { label: 'Lab Requests',   path: '/lab',           icon: FlaskConical, desc: 'Order & view lab tests' },
      { label: 'Prescriptions',  path: '/pharmacy',      icon: Pill,         desc: 'Prescribe medications'  },
      { label: 'Billing',        path: '/billing',       icon: Receipt,      desc: 'Patient invoices'       },
    ],
  },
  nurse: {
    greeting: 'Nurse Dashboard',
    subtitle: 'Patient care & monitoring',
    theme: { primary: '#0d9488', light: '#ccfbf1' },
    quickActions: [
      { label: 'Record Vitals',  path: '/consultations', icon: HeartPulse, color: 'bg-teal-600'   },
      { label: 'View Patients',  path: '/patients',      icon: Users,      color: 'bg-blue-600'   },
      { label: 'Appointments',   path: '/appointments',  icon: Calendar,   color: 'bg-green-600'  },
      { label: 'Medications',    path: '/pharmacy',      icon: Pill,       color: 'bg-purple-600' },
    ],
    modules: [
      { label: 'Patients',      path: '/patients',      icon: Users,      desc: 'View & update patients'  },
      { label: 'Appointments',  path: '/appointments',  icon: Calendar,   desc: 'Daily schedule'          },
      { label: 'Vitals',        path: '/consultations', icon: HeartPulse, desc: 'Record patient vitals'   },
      { label: 'Lab Results',   path: '/lab',           icon: Beaker,     desc: 'View lab reports'        },
      { label: 'Medications',   path: '/pharmacy',      icon: Pill,       desc: 'Medication tracking'     },
    ],
  },
  pharmacist: {
    greeting: 'Pharmacy Dashboard',
    subtitle: 'Prescription & inventory management',
    theme: { primary: '#059669', light: '#d1fae5' },
    quickActions: [
      { label: 'Prescriptions',  path: '/pharmacy',  icon: Pill,          color: 'bg-emerald-600' },
      { label: 'Inventory',      path: '/pharmacy',  icon: ClipboardList, color: 'bg-green-700'   },
      { label: 'Patient Bills',  path: '/billing',   icon: Receipt,       color: 'bg-blue-600'    },
      { label: 'Patients',       path: '/patients',  icon: Users,         color: 'bg-indigo-600'  },
    ],
    modules: [
      { label: 'Prescriptions',  path: '/pharmacy',  icon: Pill,          desc: 'Active prescriptions'   },
      { label: 'Drug Inventory', path: '/pharmacy',  icon: ClipboardList, desc: 'Stock levels & alerts'  },
      { label: 'Patients',       path: '/patients',  icon: Users,         desc: 'Patient lookup'         },
      { label: 'Billing',        path: '/billing',   icon: Receipt,       desc: 'Pharmacy billing'       },
    ],
  },
  lab_technician: {
    greeting: 'Lab Dashboard',
    subtitle: 'Test requests & results management',
    theme: { primary: '#d97706', light: '#fef3c7' },
    quickActions: [
      { label: 'Lab Tests',  path: '/lab',      icon: FlaskConical, color: 'bg-orange-600' },
      { label: 'Results',    path: '/lab',      icon: FileText,     color: 'bg-yellow-600' },
      { label: 'Patients',   path: '/patients', icon: Users,        color: 'bg-blue-600'   },
    ],
    modules: [
      { label: 'Test Requests', path: '/lab',      icon: FlaskConical, desc: 'View pending requests' },
      { label: 'Results Entry', path: '/lab',      icon: FileText,     desc: 'Enter test results'    },
      { label: 'Patients',      path: '/patients', icon: Users,        desc: 'Patient lookup'        },
    ],
  },
  receptionist: {
    greeting: 'Reception Dashboard',
    subtitle: 'Patient intake & scheduling',
    theme: { primary: '#db2777', light: '#fce7f3' },
    quickActions: [
      { label: 'New Appointment',  path: '/appointments', icon: Calendar, color: 'bg-pink-600'   },
      { label: 'Register Patient', path: '/patients',     icon: Users,    color: 'bg-blue-600'   },
      { label: 'Billing',          path: '/billing',      icon: Receipt,  color: 'bg-orange-600' },
    ],
    modules: [
      { label: 'Patients',     path: '/patients',     icon: Users,    desc: 'Register & manage patients' },
      { label: 'Appointments', path: '/appointments', icon: Calendar, desc: 'Book & schedule visits'     },
      { label: 'Billing',      path: '/billing',      icon: Receipt,  desc: 'Process payments'           },
    ],
  },

  // ── PATIENT — redirected immediately to /portal, config kept as fallback ──
  patient: {
    greeting: 'My Health Portal',
    subtitle: 'Your personal health overview',
    theme: { primary: '#0d9488', light: '#ccfbf1' },
    quickActions: [
      { label: 'Book Appointment', path: '/appointments',   icon: Calendar,    color: 'bg-teal-600'   },
      { label: 'My Prescriptions', path: '/pharmacy',       icon: Pill,        color: 'bg-emerald-600'},
      { label: 'View Lab Results', path: '/lab',            icon: FlaskConical,color: 'bg-blue-600'   },
      { label: 'My Portal',        path: '/portal',         icon: Activity,    color: 'bg-indigo-600' },
    ],
    modules: [
      { label: 'My Health',       path: '/portal',         icon: Activity,    desc: 'Portal dashboard'     },
      { label: 'Appointments',    path: '/appointments',   icon: Calendar,    desc: 'View & book visits'   },
      { label: 'Medical Records', path: '/consultations',  icon: FileText,    desc: 'Consultation history' },
      { label: 'Lab Results',     path: '/lab',            icon: FlaskConical,desc: 'View test results'    },
      { label: 'Prescriptions',   path: '/pharmacy',       icon: Pill,        desc: 'Active medications'   },
      { label: 'My Profile',      path: '/portal/profile', icon: Users,       desc: 'Personal information' },
    ],
  },
};

const DEFAULT_CONFIG = ROLE_CONFIG.doctor;

// ─── Stat mapping per role ─────────────────────────────────────────────────────
const buildStats = (role, allStats) => {
  const { patients, appointments, consultations, lab, pharmacy, billing } = allStats;
  const fmt = (n) => (n != null ? String(n) : '—');
  const fmtCurrency = (n) => n != null ? `₦${parseFloat(n).toLocaleString('en-NG', { maximumFractionDigits: 0 })}` : '—';

  const maps = {
    admin: [
      { label: 'Total Patients',      value: fmt(patients?.total_patients),                              icon: Users,        color: 'bg-blue-100 text-blue-700'    },
      { label: "Today's Appts",       value: fmt(appointments?.today),                                   icon: Calendar,     color: 'bg-green-100 text-green-700'  },
      { label: 'Total Revenue',        value: fmtCurrency(billing?.total_revenue),                        icon: CreditCard,   color: 'bg-purple-100 text-purple-700' },
      { label: 'Pending Lab Results',  value: fmt(lab?.pending_results),                                  icon: Beaker,       color: 'bg-orange-100 text-orange-700' },
    ],
    doctor: [
      { label: 'My Patients',          value: fmt(patients?.total_patients),                              icon: Users,        color: 'bg-blue-100 text-blue-700'    },
      { label: "Today's Appts",        value: fmt(appointments?.today || appointments?.scheduled),         icon: Calendar,     color: 'bg-green-100 text-green-700'  },
      { label: 'Pending Notes',        value: fmt(consultations?.by_status?.Draft),                       icon: FileText,     color: 'bg-yellow-100 text-yellow-700' },
      { label: 'Lab Requests',         value: fmt(lab?.total_orders),                                     icon: FlaskConical, color: 'bg-orange-100 text-orange-700' },
    ],
    nurse: [
      { label: 'Patients',             value: fmt(patients?.total_patients),                              icon: Users,        color: 'bg-teal-100 text-teal-700'    },
      { label: 'Appointments Today',   value: fmt(appointments?.today || appointments?.scheduled),         icon: Calendar,     color: 'bg-green-100 text-green-700'  },
      { label: 'Vitals Due',           value: fmt(consultations?.total),                                  icon: HeartPulse,   color: 'bg-red-100 text-red-700'      },
      { label: 'Medications',          value: fmt(pharmacy?.total_prescriptions),                         icon: Pill,         color: 'bg-blue-100 text-blue-700'    },
    ],
    pharmacist: [
      { label: 'Prescriptions',        value: fmt(pharmacy?.total_prescriptions),                         icon: Pill,         color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Active Prescriptions', value: fmt(pharmacy?.by_status?.Active),                           icon: TrendingUp,   color: 'bg-green-100 text-green-700'     },
      { label: 'Medications',          value: fmt(pharmacy?.total_medications),                           icon: ClipboardList,color: 'bg-blue-100 text-blue-700'        },
      { label: 'Needing Refill',       value: fmt(pharmacy?.medications_needing_refill),                  icon: AlertCircle,  color: 'bg-orange-100 text-orange-700'    },
    ],
    lab_technician: [
      { label: 'Pending Tests',        value: fmt(lab?.by_status?.Pending),                               icon: FlaskConical, color: 'bg-orange-100 text-orange-700' },
      { label: 'In Progress',          value: fmt(lab?.by_status?.['In Progress']),                       icon: TrendingUp,   color: 'bg-yellow-100 text-yellow-700' },
      { label: 'Completed Today',      value: fmt(lab?.by_status?.Completed),                             icon: BarChart3,    color: 'bg-green-100 text-green-700'   },
      { label: 'Total Patients',       value: fmt(patients?.total_patients),                              icon: Users,        color: 'bg-blue-100 text-blue-700'     },
    ],
    receptionist: [
      { label: "Today's Appts",        value: fmt(appointments?.today || appointments?.scheduled),         icon: Calendar,     color: 'bg-pink-100 text-pink-700'    },
      { label: 'Total Patients',       value: fmt(patients?.total_patients),                              icon: Users,        color: 'bg-blue-100 text-blue-700'    },
      { label: 'Pending Bills',        value: fmt(billing?.by_status?.Issued),                            icon: Receipt,      color: 'bg-orange-100 text-orange-700' },
      { label: 'Paid Invoices',        value: fmt(billing?.by_status?.Paid),                              icon: CreditCard,   color: 'bg-green-100 text-green-700'  },
    ],
    patient: [
      { label: 'Appointments',         value: fmt(appointments?.total),                                   icon: Calendar,     color: 'bg-teal-100 text-teal-700'    },
      { label: 'Prescriptions',        value: fmt(pharmacy?.total_prescriptions),                         icon: Pill,         color: 'bg-emerald-100 text-emerald-700' },
      { label: 'Lab Results',          value: fmt(lab?.total_orders),                                     icon: FlaskConical, color: 'bg-blue-100 text-blue-700'    },
      { label: 'Pending Bills',        value: fmt(billing?.by_status?.Issued),                            icon: Receipt,      color: 'bg-amber-100 text-amber-700'  },
    ],
  };

  return maps[role] || maps.doctor;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ stat }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
      <stat.icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
    </div>
  </div>
);

const QuickAction = ({ action }) => (
  <Link to={action.path}
    className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm`}>
    <action.icon className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm font-semibold">{action.label}</span>
    <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
  </Link>
);

const ModuleCard = ({ mod }) => (
  <Link to={mod.path}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group hover:scale-[1.01]">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
        <mod.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm">{mod.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{mod.desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-0.5" />
    </div>
  </Link>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser]               = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [allStats, setAllStats]       = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError]             = useState('');
  const navigate = useNavigate();
  const { role, isPatient } = useRole();

  // ── Load user profile ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        const permData = await userService.getPermissions();
        setPermissions(permData.permissions || []);
      } catch (err) {
        setError('Failed to load dashboard');
        setTimeout(() => { authService.logout(); navigate('/login'); }, 2000);
      } finally {
        setPageLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // ── Load stats in parallel, silently fail per-module ─────────────────────
  useEffect(() => {
    const fetchAllStats = async () => {
      setStatsLoading(true);
      const safeCall = async (fn) => { try { return await fn(); } catch { return null; } };
      const [patients, appointments, consultations, lab, pharmacy, billing] = await Promise.all([
        safeCall(getPatientStats),
        safeCall(getAppointmentStats),
        safeCall(getConsultationStats),
        safeCall(getLabStats),
        safeCall(getPharmacyStats),
        safeCall(getBillingStats),
      ]);
      setAllStats({ patients, appointments, consultations, lab, pharmacy, billing });
      setStatsLoading(false);
    };
    fetchAllStats();
  }, []);

  // ── PATIENT REDIRECT — after all hooks, before render ───────────────────
  // Must be here (not before hooks) to satisfy React Rules of Hooks
  if (isPatient) return <Navigate to="/portal" replace />;

  // ── Loading / error states ────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="mt-3 text-gray-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-semibold">{error}</p>
        <p className="text-red-500 text-sm mt-1">Redirecting to login...</p>
      </div>
    </div>
  );

  const resolvedRole = (user?.role || role || '').toLowerCase().replace(/\s+/g, '_');
  const config       = ROLE_CONFIG[resolvedRole] || DEFAULT_CONFIG;
  const firstName    = user?.full_name?.split(' ')[0] || 'User';
  const stats        = buildStats(resolvedRole, allStats);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Header Bar ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Welcome back, <span style={{ color: config.theme.primary }}>{firstName}</span>! 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{config.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: config.theme.primary }}>
            {(user?.role || 'USER').toUpperCase()}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
            {firstName.charAt(0)}
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={statsLoading ? { ...stat, value: '…' } : stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Quick Actions ── */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {config.quickActions.map((action, i) => (
                <QuickAction key={i} action={action} />
              ))}
            </div>
          </div>

          {/* ── Account Info ── */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Account Info</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-50">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                  style={{ backgroundColor: config.theme.primary }}>
                  {firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['User ID', `#${user?.user_id}`],
                  ['Role', (user?.role || '').toUpperCase()],
                  ['Phone', user?.phone || 'N/A'],
                  ['Department', user?.department || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                    <p className="font-bold mt-1" style={label === 'Role' ? { color: config.theme.primary } : { color: '#1f2937' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {permissions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">
                    Permissions ({permissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.slice(0, 8).map((perm, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: config.theme.light, color: config.theme.primary }}>
                        {perm.name || perm.action}
                      </span>
                    ))}
                    {permissions.length > 8 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        +{permissions.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Modules Grid ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.modules.map((mod, i) => (
              <ModuleCard key={i} mod={mod} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}