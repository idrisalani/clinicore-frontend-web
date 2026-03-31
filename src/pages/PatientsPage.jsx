import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import PatientTable from '../components/PatientTable';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import { 
  getPatients, 
  searchPatients, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from '../services/patientService';

/**
 * Professional Patients Management Page
 * Features: List, search, create, edit, delete
 */
const PatientsPage = () => {
  // State Management
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('first_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({});
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch Patients
  const fetchPatients = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      console.log('📋 Fetching patients...');

      const data = await getPatients(page, 10, search);
      setPatients(data.patients || []);
      setPagination(data.pagination || {});
      console.log('✅ Patients loaded:', data.patients.length);
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      alert('Failed to fetch patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients(currentPage, searchQuery);
  }, [currentPage]);

  // Handle Search
  const handleSearch = useCallback(
    async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);

      if (query.length >= 2) {
        try {
          console.log('🔍 Searching:', query);
          const data = await searchPatients(query);
          setPatients(data.patients || []);
          setPagination({});
          console.log('✅ Search results:', data.patients.length);
        } catch (error) {
          console.error('❌ Search error:', error);
        }
      } else if (query.length === 0) {
        fetchPatients(1, '');
      }
    },
    [fetchPatients]
  );

  // Handle Sort
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    console.log(`📊 Sorting by ${field} (${order})`);
    // Backend sorting can be added here
  };

  // Handle Add Patient
  const handleAddClick = () => {
    setSelectedPatient(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Handle Edit Patient
  const handleEdit = (patientId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    setSelectedPatient(patient);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle View Patient
  const handleView = (patientId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    console.log('👤 View patient:', patient);
    // TODO: Navigate to patient detail page in future phase
  };

  // Handle Delete Patient
  const handleDelete = async (patientId) => {
    const patient = patients.find(p => p.patient_id === patientId);
    
    if (!window.confirm(
      `Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This cannot be undone.`
    )) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting patient:', patientId);
      await deletePatient(patientId);
      console.log('✅ Patient deleted successfully');
      alert('Patient deleted successfully');
      fetchPatients(currentPage, searchQuery);
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete patient. Please try again.');
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
        console.log('➕ Creating new patient...');
        await createPatient(formData);
        console.log('✅ Patient created successfully');
        alert('Patient created successfully!');
      } else {
        console.log('✏️ Updating patient...');
        await updatePatient(selectedPatient.patient_id, formData);
        console.log('✅ Patient updated successfully');
        alert('Patient updated successfully!');
      }

      // Refresh patient list
      setShowModal(false);
      fetchPatients(1, '');
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save patient';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPatient(null);
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Management</h1>
              <p className="text-gray-600">Manage and organize your clinic's patient records</p>
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Patient
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {pagination.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Appointments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  📋
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <PatientTable
            patients={patients}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />

          {/* Pagination */}
          {!isLoading && patients.length > 0 && renderPagination()}

          {/* Empty State */}
          {!isLoading && patients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">Start by adding your first patient</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Form Modal */}
      <Modal
        isOpen={showModal}
        title={modalMode === 'add' ? 'Add New Patient' : 'Edit Patient'}
        onClose={handleModalClose}
        size="large"
      >
        <PatientForm
          patient={selectedPatient}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default PatientsPage;