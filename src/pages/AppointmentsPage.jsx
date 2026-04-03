import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lock, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import AppointmentTable from '../components/AppointmentTable';
import AppointmentForm from '../components/AppointmentForm';
import Modal from '../components/Modal';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getAppointmentStats } from '../services/appointmentService';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const Pagination = ({ pagination, currentPage, setCurrentPage }) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-6 pb-2">
      <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
        <button key={pg} onClick={() => setCurrentPage(pg)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
      ))}
      <button disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}
        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
    </div>
  );
};

const AppointmentsPage = () => {
  const { permissions, isPatient } = useRole();
  const p = permissions.appointments;
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState({});
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [sortBy, setSortBy]             = useState('appointment_date');
  const [sortOrder, setSortOrder]       = useState('asc');
  const [pagination, setPagination]     = useState({});
  const [showModal, setShowModal]       = useState(false);
  const [modalMode, setModalMode]       = useState('add');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelTarget, setCancelTarget]               = useState(null);
  const [cancelLoading, setCancelLoading]             = useState(false);
  const { showToast, Toast } = useToast();

  const fetchAppointments = useCallback(async (page = 1, status = '', search = '') => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getAppointments(page, 10, status, '', search ? search.split('-')[0] : '');
      setAppointments(data.appointments || []); setPagination(data.pagination || {});
    } catch {}
    finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getAppointmentStats(); setStats(data); } catch {}
  }, [p.isBlocked]);

  useEffect(() => {
    fetchAppointments(currentPage, statusFilter, searchQuery);
    fetchStats();
  }, [currentPage, statusFilter, searchQuery, fetchAppointments, fetchStats]);

  if (p.isBlocked) return <AccessDenied message="You do not have permission to view appointments." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createAppointment(formData);
      else await updateAppointment(selectedAppointment.appointment_id, formData);
      showToast(modalMode === 'add' ? 'Appointment scheduled' : 'Appointment updated');
      setShowModal(false); fetchAppointments(1, statusFilter, ''); fetchStats(); setCurrentPage(1);
    } catch { showToast('Failed to save appointment.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await deleteAppointment(cancelTarget.appointment_id);
      showToast('Appointment cancelled');
      setCancelTarget(null); fetchAppointments(currentPage, statusFilter, searchQuery); fetchStats();
    } catch { showToast('Failed to cancel.', 'error'); setCancelTarget(null); }
    finally { setCancelLoading(false); }
  };

  const statCards = [
    { icon: Calendar,     label: 'Total',     value: stats.total     || 0, bg: 'bg-blue-50',   color: 'text-blue-500' },
    { icon: Clock,        label: 'Scheduled', value: stats.scheduled || 0, bg: 'bg-teal-50',   color: 'text-teal-500' },
    { icon: CheckCircle,  label: 'Completed', value: stats.completed || 0, bg: 'bg-emerald-50',color: 'text-emerald-500' },
    { icon: AlertCircle,  label: 'No-Show',   value: stats.no_show   || 0, bg: 'bg-orange-50', color: 'text-orange-500' },
    { icon: XCircle,      label: 'Cancelled', value: stats.cancelled || 0, bg: 'bg-red-50',    color: 'text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isPatient ? 'My Appointments' : 'Appointment Management'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {isPatient ? 'View and book your appointments' : 'Schedule and manage patient appointments'}
            </p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedAppointment(null); setModalMode('add'); setShowModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> {isPatient ? 'Book Appointment' : 'Schedule Appointment'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {!p.canCreate && !p.canEdit && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">View only — your role cannot modify appointments</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 fade-in">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3 flex-col md:flex-row">
            {!isPatient && (
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search by patient name, phone…" value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
              </div>
            )}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 appearance-none cursor-pointer transition-all min-w-40">
              <option value="">All Statuses</option>
              {['Scheduled','Completed','Cancelled','No-Show'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <AppointmentTable
            appointments={appointments} isLoading={isLoading}
            onEdit={p.canEdit ? (id) => { const apt = appointments.find(a => a.appointment_id === id); setSelectedAppointment(apt); setModalMode('edit'); setShowModal(true); } : null}
            onCancel={p.canDelete ? (id) => setCancelTarget(appointments.find(a => a.appointment_id === id)) : null}
            onSort={(f, o) => { setSortBy(f); setSortOrder(o); }} sortBy={sortBy} sortOrder={sortOrder}
          />
          {!isLoading && <Pagination pagination={pagination} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        </div>
      </div>

      <Toast />
      <ConfirmModal isOpen={!!cancelTarget} title="Cancel Appointment?"
        message={`Cancel appointment for ${cancelTarget?.first_name || ''} ${cancelTarget?.last_name || ''}? This cannot be undone.`}
        confirmLabel="Cancel Appointment" loading={cancelLoading}
        onConfirm={handleCancelConfirm} onCancel={() => setCancelTarget(null)} />

      {(p.canCreate || p.canEdit) && (
        <Modal isOpen={showModal} title={modalMode === 'add' ? (isPatient ? 'Book Appointment' : 'Schedule Appointment') : 'Edit Appointment'}
          onClose={() => { setShowModal(false); setSelectedAppointment(null); }} size="medium">
          <AppointmentForm appointment={selectedAppointment} mode={modalMode} isLoading={isSubmitting}
            onSubmit={handleFormSubmit} onCancel={() => { setShowModal(false); setSelectedAppointment(null); }} />
        </Modal>
      )}
    </div>
  );
};

export default AppointmentsPage;