import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pill } from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionForm from '../components/PrescriptionForm';
import {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPharmacyStats,
  getMedications,
} from '../services/pharmacyService';

/**
 * Professional Pharmacy Management Page
 * Issue and manage prescriptions
 */
const PharmacyPage = () => {
  // State Management
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Fetch Prescriptions
  const fetchPrescriptions = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      console.log('💊 Fetching prescriptions...');

      const data = await getPrescriptions(page, 10, '', '');
      setPrescriptions(data.prescriptions || []);
      setPagination(data.pagination || {});
      console.log('✅ Prescriptions loaded:', data.prescriptions.length);
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error);
      alert('Failed to fetch prescriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching pharmacy statistics...');
      const data = await getPharmacyStats();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  }, []);

  // Fetch Medications
  const fetchMedications = useCallback(async () => {
    try {
      console.log('💊 Fetching medications...');
      const data = await getMedications('', 1);
      setMedications(data.medications || []);
      console.log('✅ Medications loaded:', data.medications.length);
    } catch (error) {
      console.error('❌ Error fetching medications:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPrescriptions(currentPage);
    fetchStats();
    fetchMedications();
  }, [currentPage, fetchMedications, fetchPrescriptions, fetchStats]);

  // Handle Search
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);
      fetchPrescriptions(1);
    },
    [fetchPrescriptions]
  );

  // Handle Issue Prescription
  const handleIssueClick = () => {
    setSelectedPrescription(null);
    setModalMode('add');
    setShowFormModal(true);
  };

  // Handle Edit Prescription
  const handleEdit = (prescriptionId) => {
    const prescription = prescriptions.find(p => p.prescription_id === prescriptionId);
    setSelectedPrescription(prescription);
    setModalMode('edit');
    setShowFormModal(true);
  };

  // Handle Delete Prescription
  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting prescription:', prescriptionId);
      await deletePrescription(prescriptionId);
      console.log('✅ Prescription deleted successfully');
      alert('Prescription deleted successfully');
      fetchPrescriptions(currentPage);
      fetchStats();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete prescription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('💾 Submitting prescription:', formData);

      if (modalMode === 'add') {
        console.log('➕ Creating new prescription...');
        await createPrescription(formData);
        console.log('✅ Prescription created successfully');
        alert('Prescription issued successfully!');
      } else {
        console.log('✏️ Updating prescription...');
        await updatePrescription(selectedPrescription.prescription_id, formData);
        console.log('✅ Prescription updated successfully');
        alert('Prescription updated successfully!');
      }

      setShowFormModal(false);
      fetchPrescriptions(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save prescription';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleModalClose = () => {
    setShowFormModal(false);
    setSelectedPrescription(null);
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Pharmacy Management</h1>
              <p className="text-gray-600">Issue and manage patient prescriptions</p>
            </div>
            <button
              onClick={handleIssueClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Issue Prescription
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Prescriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_prescriptions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  💊
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Prescriptions</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.by_status?.['Active'] || 0}
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
                  <p className="text-gray-600 text-sm">In Catalog</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.total_medications || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📋
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Needing Refill</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.medications_needing_refill || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  ⚠️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prescriptions by patient name..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Medication</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Dosage</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Frequency</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription, index) => (
                    <tr
                      key={prescription.prescription_id}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {new Date(prescription.prescription_date).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {prescription.first_name} {prescription.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {prescription.generic_name} ({prescription.brand_name})
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {prescription.prescribed_dosage}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {prescription.frequency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                          prescription.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          prescription.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(prescription.prescription_id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 text-sm"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(prescription.prescription_id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-sm"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {!isLoading && prescriptions.length > 0 && renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No prescriptions issued</p>
              <p className="text-gray-400 text-sm mt-2">Issue your first prescription to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Form Modal */}
      <Modal
        isOpen={showFormModal}
        title={modalMode === 'add' ? 'Issue Prescription' : 'Edit Prescription'}
        onClose={handleModalClose}
        size="large"
      >
        <PrescriptionForm
          prescription={selectedPrescription}
          medications={medications}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default PharmacyPage;