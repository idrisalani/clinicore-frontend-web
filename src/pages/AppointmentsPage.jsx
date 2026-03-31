import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, Search } from 'lucide-react';
import AppointmentTable from '../components/AppointmentTable';
import AppointmentForm from '../components/AppointmentForm';
import Modal from '../components/Modal';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
} from '../services/appointmentService';

/**
 * Professional Appointments Management Page
 * Features: List, search, create, edit, cancel
 */
const AppointmentsPage = () => {
  // State Management
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('appointment_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({});

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch Appointments
  const fetchAppointments = useCallback(async (page = 1, status = '', search = '') => {
    try {
      setIsLoading(true);
      console.log('📅 Fetching appointments...');

      const data = await getAppointments(page, 10, status, '', search ? search.split('-')[0] : '');
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {});
      console.log('✅ Appointments loaded:', data.appointments.length);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      alert('Failed to fetch appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching appointment statistics...');
      const data = await getAppointmentStats();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAppointments(currentPage, statusFilter, searchQuery);
    fetchStats();
  }, [searchQuery]);

  // Handle Search
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);
      fetchAppointments(1, statusFilter, query);
    },
    [statusFilter, fetchAppointments]
  );

  // Handle Status Filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle Sort
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    console.log(`📊 Sorting by ${field} (${order})`);
  };

  // Handle Add Appointment
  const handleAddClick = () => {
    setSelectedAppointment(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Handle Edit Appointment
  const handleEdit = (appointmentId) => {
    const apt = appointments.find(a => a.appointment_id === appointmentId);
    setSelectedAppointment(apt);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle Cancel Appointment
  const handleCancel = async (appointmentId) => {
    const apt = appointments.find(a => a.appointment_id === appointmentId);

    if (!window.confirm(
      `Are you sure you want to cancel the appointment for ${apt.first_name} ${apt.last_name} on ${apt.appointment_date}?`
    )) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Cancelling appointment:', appointmentId);
      await deleteAppointment(appointmentId);
      console.log('✅ Appointment cancelled successfully');
      alert('Appointment cancelled successfully');
      fetchAppointments(currentPage, statusFilter, searchQuery);
      fetchStats();
    } catch (error) {
      console.error('❌ Cancel error:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('💾 Submitting form:', formData);

      if (modalMode === 'add') {
        console.log('➕ Creating new appointment...');
        await createAppointment(formData);
        console.log('✅ Appointment created successfully');
        alert('Appointment scheduled successfully!');
      } else {
        console.log('✏️ Updating appointment...');
        await updateAppointment(selectedAppointment.appointment_id, formData);
        console.log('✅ Appointment updated successfully');
        alert('Appointment updated successfully!');
      }

      setShowModal(false);
      fetchAppointments(1, statusFilter, '');
      fetchStats();
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save appointment';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  // Render Pagination
  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-6">
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
        )}

        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {currentPage < pagination.totalPages && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Appointment Management</h1>
              <p className="text-gray-600">Schedule and manage patient appointments</p>
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Schedule Appointment
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Scheduled</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.scheduled || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🔵
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.completed || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">No-Show</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.no_show || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  ⚠️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {stats.cancelled || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                  ❌
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <AppointmentTable
            appointments={appointments}
            isLoading={isLoading}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {/* Pagination */}
          {!isLoading && appointments.length > 0 && renderPagination()}

          {/* Empty State */}
          {!isLoading && appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400 text-sm mt-2">Schedule your first appointment to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Form Modal */}
      <Modal
        isOpen={showModal}
        title={modalMode === 'add' ? 'Schedule Appointment' : 'Edit Appointment'}
        onClose={handleModalClose}
        size="large"
      >
        <AppointmentForm
          appointment={selectedAppointment}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default AppointmentsPage;