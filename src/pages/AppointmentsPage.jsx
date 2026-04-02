import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Search, Lock } from 'lucide-react';
import AppointmentTable from '../components/AppointmentTable';
import AppointmentForm from '../components/AppointmentForm';
import Modal from '../components/Modal';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import {
  getAppointments, createAppointment, updateAppointment,
  deleteAppointment, getAppointmentStats,
} from '../services/appointmentService';

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

  // ── All hooks must run before any early return ────────────────────────────
  const fetchAppointments = useCallback(async (page = 1, status = '', search = '') => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getAppointments(page, 10, status, '', search ? search.split('-')[0] : '');
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {});
    } catch (error) { console.error('Error fetching appointments:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getAppointmentStats(); setStats(data); }
    catch (error) { console.error('Stats error:', error); }
  }, [p.isBlocked]);

  useEffect(() => {
    fetchAppointments(currentPage, statusFilter, searchQuery);
    fetchStats();
  }, [currentPage, statusFilter, searchQuery, fetchAppointments, fetchStats]);

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="You do not have permission to view appointments." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createAppointment(formData);
      else await updateAppointment(selectedAppointment.appointment_id, formData);
      setShowModal(false);
      fetchAppointments(1, statusFilter, '');
      fetchStats();
      setCurrentPage(1);
    } catch (error) { console.error('Submit error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleCancel = async (appointmentId) => {
    if (!p.canDelete) return;
    const apt = appointments.find(a => a.appointment_id === appointmentId);
    if (!window.confirm(`Cancel appointment for ${apt?.first_name} ${apt?.last_name}?`)) return;
    try {
      setIsLoading(true);
      await deleteAppointment(appointmentId);
      fetchAppointments(currentPage, statusFilter, searchQuery);
      fetchStats();
    } catch (error) { console.error('Cancel error:', error); }
    finally { setIsLoading(false); }
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center gap-2 mt-6">
        {currentPage > 1 && <button onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>}
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
          <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-4 py-2 rounded-lg ${pg === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{pg}</button>
        ))}
        {currentPage < pagination.totalPages && <button onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>}
      </div>
    );
  };

  const statCards = [
    { label: 'Total', value: stats.total || 0, color: 'bg-blue-100', emoji: '📅' },
    { label: 'Scheduled', value: stats.scheduled || 0, color: 'bg-blue-100', emoji: '🔵' },
    { label: 'Completed', value: stats.completed || 0, color: 'bg-green-100', emoji: '✅' },
    { label: 'No-Show', value: stats.no_show || 0, color: 'bg-orange-100', emoji: '⚠️' },
    { label: 'Cancelled', value: stats.cancelled || 0, color: 'bg-red-100', emoji: '❌' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isPatient ? 'My Appointments' : 'Appointment Management'}
              </h1>
              <p className="text-gray-600">
                {isPatient ? 'View and book your appointments' : 'Schedule and manage patient appointments'}
              </p>
            </div>
            {p.canCreate && (
              <button onClick={() => { setSelectedAppointment(null); setModalMode('add'); setShowModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                {isPatient ? 'Book Appointment' : 'Schedule Appointment'}
              </button>
            )}
          </div>

          {!p.canCreate && !p.canEdit && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">View only — your role cannot modify appointments</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-600 text-sm">{s.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                  <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-lg`}>{s.emoji}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            {!isPatient && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search by patient name, phone..." value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchAppointments(1, statusFilter, e.target.value); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
            )}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <AppointmentTable
            appointments={appointments} isLoading={isLoading}
            onEdit={p.canEdit ? (id) => { const apt = appointments.find(a => a.appointment_id === id); setSelectedAppointment(apt); setModalMode('edit'); setShowModal(true); } : null}
            onCancel={p.canDelete ? handleCancel : null}
            onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
            sortBy={sortBy} sortOrder={sortOrder}
          />
          {!isLoading && appointments.length > 0 && renderPagination()}
          {!isLoading && appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{isPatient ? 'No appointments yet' : 'No appointments found'}</p>
              {p.canCreate && <p className="text-gray-400 text-sm mt-2">{isPatient ? 'Book your first appointment above' : 'Schedule your first appointment to get started'}</p>}
            </div>
          )}
        </div>
      </div>

      {(p.canCreate || p.canEdit) && (
        <Modal isOpen={showModal} title={modalMode === 'add' ? (isPatient ? 'Book Appointment' : 'Schedule Appointment') : 'Edit Appointment'}
          onClose={() => { setShowModal(false); setSelectedAppointment(null); }} size="large">
          <AppointmentForm appointment={selectedAppointment} mode={modalMode} isLoading={isSubmitting}
            onSubmit={handleFormSubmit} onCancel={() => { setShowModal(false); setSelectedAppointment(null); }} />
        </Modal>
      )}
    </div>
  );
};

export default AppointmentsPage;