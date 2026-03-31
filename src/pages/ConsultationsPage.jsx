import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import ConsultationForm from '../components/ConsultationForm';
import ConsultationNotes from '../components/ConsultationNotes';
import {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultationStats,
} from '../services/consultationService';

/**
 * Professional Consultations Management Page
 * Record and manage patient consultations and clinical notes
 */
const ConsultationsPage = () => {
  // State Management
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // Fetch Consultations
  const fetchConsultations = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      console.log('📝 Fetching consultations...');

      const data = await getConsultations(page, 10, '', '');
      setConsultations(data.consultations || []);
      setPagination(data.pagination || {});
      console.log('✅ Consultations loaded:', data.consultations.length);
    } catch (error) {
      console.error('❌ Error fetching consultations:', error);
      alert('Failed to fetch consultations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching consultation statistics...');
      const data = await getConsultationStats();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConsultations(currentPage, searchQuery);
    fetchStats();
  }, [searchQuery]);

  // Handle Search
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);
      fetchConsultations(1, query);
    },
    [fetchConsultations]
  );

  // Handle Add Consultation
  const handleAddClick = () => {
    setSelectedConsultation(null);
    setModalMode('add');
    setShowFormModal(true);
  };

  // Handle View Consultation
  const handleView = (consultationId) => {
    const consultation = consultations.find(c => c.consultation_id === consultationId);
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
  };

  // Handle Edit Consultation
  const handleEdit = (consultationId) => {
    const consultation = consultations.find(c => c.consultation_id === consultationId);
    setSelectedConsultation(consultation);
    setModalMode('edit');
    setShowFormModal(true);
  };

  // Handle Delete Consultation
  const handleDelete = async (consultationId) => {
    if (!window.confirm('Are you sure you want to delete this consultation record?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting consultation:', consultationId);
      await deleteConsultation(consultationId);
      console.log('✅ Consultation deleted successfully');
      alert('Consultation deleted successfully');
      fetchConsultations(currentPage, searchQuery);
      fetchStats();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete consultation. Please try again.');
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
        console.log('➕ Creating new consultation...');
        await createConsultation(formData);
        console.log('✅ Consultation created successfully');
        alert('Consultation recorded successfully!');
      } else {
        console.log('✏️ Updating consultation...');
        await updateConsultation(selectedConsultation.consultation_id, formData);
        console.log('✅ Consultation updated successfully');
        alert('Consultation updated successfully!');
      }

      setShowFormModal(false);
      fetchConsultations(1, '');
      fetchStats();
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save consultation';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleFormModalClose = () => {
    setShowFormModal(false);
    setSelectedConsultation(null);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedConsultation(null);
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Clinical Consultations</h1>
              <p className="text-gray-600">Record and manage patient consultation notes</p>
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Record Consultation
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Consultations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📝
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {stats.by_status?.['Draft'] || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  ✏️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.by_status?.['Completed'] || 0}
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
                  <p className="text-gray-600 text-sm">Referrals Needed</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.referrals_needed || 0}
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
              placeholder="Search consultations by patient name..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : consultations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Chief Complaint</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Diagnosis</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((consultation, index) => (
                    <tr
                      key={consultation.consultation_id}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {new Date(consultation.consultation_date).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {consultation.first_name} {consultation.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {consultation.chief_complaint.substring(0, 50)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {consultation.diagnosis.substring(0, 30)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          consultation.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          consultation.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'Signed' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {consultation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(consultation.consultation_id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View consultation"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {!isLoading && consultations.length > 0 && renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No consultations recorded</p>
              <p className="text-gray-400 text-sm mt-2">Record your first consultation to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Consultation Form Modal */}
      <Modal
        isOpen={showFormModal}
        title={modalMode === 'add' ? 'Record Consultation' : 'Edit Consultation'}
        onClose={handleFormModalClose}
        size="large"
      >
        <ConsultationForm
          consultation={selectedConsultation}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={handleFormModalClose}
        />
      </Modal>

      {/* Consultation Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        title="Consultation Record"
        onClose={handleDetailModalClose}
        size="large"
      >
        <ConsultationNotes
          consultation={selectedConsultation}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={true}
        />
      </Modal>
    </div>
  );
};

export default ConsultationsPage;