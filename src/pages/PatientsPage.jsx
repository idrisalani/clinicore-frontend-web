import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lock } from 'lucide-react';
import PatientTable from '../components/PatientTable';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import {
  getPatients, searchPatients, createPatient, updatePatient, deletePatient
} from '../services/patientService';

const PatientsPage = () => {
  const { permissions, isPatient, userId } = useRole();
  const p = permissions.patients;

  const [patients, setPatients]           = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [sortBy, setSortBy]               = useState('first_name');
  const [sortOrder, setSortOrder]         = useState('asc');
  const [pagination, setPagination]       = useState({});
  const [showModal, setShowModal]         = useState(false);
  const [modalMode, setModalMode]         = useState('add');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);
  const { showToast, Toast } = useToast();

  // ── All hooks before any early return ────────────────────────────────────
  const fetchPatients = useCallback(async (page = 1, search = '') => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getPatients(page, 10, search);
      if (isPatient && userId) {
        const own = (data.patients || []).filter(pt => pt.user_id === userId || pt.patient_id === userId);
        setPatients(own);
        setPagination({});
      } else {
        setPatients(data.patients || []);
        setPagination(data.pagination || {});
      }
    } catch (error) { console.error('Error fetching patients:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked, isPatient, userId]);

  useEffect(() => {
    fetchPatients(currentPage, searchQuery);
  }, [currentPage, fetchPatients, searchQuery]);

  const handleSearch = useCallback(async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.length >= 2) {
      try {
        const data = await searchPatients(query);
        const results = data.patients || [];
        setPatients(isPatient && userId ? results.filter(pt => pt.user_id === userId || pt.patient_id === userId) : results);
        setPagination({});
      } catch (error) { console.error('Search error:', error); }
    } else if (query.length === 0) {
      fetchPatients(1, '');
    }
  }, [fetchPatients, isPatient, userId]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="You do not have permission to access patient records." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createPatient(formData);
      else await updatePatient(selectedPatient.patient_id, formData);
      setShowModal(false);
      fetchPatients(1, '');
      setCurrentPage(1);
    } catch (error) { console.error('Form submission error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteRequest = (patientId) => {
    if (!p.canDelete) return;
    const pt = patients.find(x => x.patient_id === patientId);
    setDeleteTarget(pt);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePatient(deleteTarget.patient_id);
      showToast(`${deleteTarget.first_name || 'Patient'} deleted successfully`);
      setDeleteTarget(null);
      fetchPatients(currentPage, searchQuery);
    } catch (error) {
      showToast('Failed to delete patient. Please try again.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center gap-2 mt-6">
        {currentPage > 1 && <button onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>}
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 rounded-lg ${page === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{page}</button>
        ))}
        {currentPage < pagination.totalPages && <button onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isPatient ? 'My Profile' : 'Patient Management'}
              </h1>
              <p className="text-gray-600">
                {isPatient ? 'Your personal health record' : 'Manage and organize clinic patient records'}
              </p>
            </div>
            {p.canCreate && (
              <button onClick={() => { setSelectedPatient(null); setModalMode('add'); setShowModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" /> Add Patient
              </button>
            )}
          </div>

          {!p.canCreate && !p.canEdit && !isPatient && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">View only — your role cannot create or edit patient records</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: isPatient ? 'Your Records' : 'Total Patients', value: isPatient ? 1 : pagination.total || 0, color: 'bg-blue-100', emoji: '👥' },
              { label: 'This Month', value: 0, color: 'bg-green-100', emoji: '📅' },
              { label: 'Appointments', value: 0, color: 'bg-purple-100', emoji: '📋' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-600 text-sm">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p></div>
                  <div className={`w-12 h-12 ${s.color} rounded-lg flex items-center justify-center text-2xl`}>{s.emoji}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isPatient && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by name, phone, or email..." value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <PatientTable
            patients={patients} isLoading={isLoading}
            onEdit={p.canEdit ? (id) => { const pt = patients.find(x => x.patient_id === id); setSelectedPatient(pt); setModalMode('edit'); setShowModal(true); } : null}
            onView={(id) => console.log('View patient', id)}
            onDelete={p.canDelete ? handleDeleteRequest : null}
            onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
            sortBy={sortBy} sortOrder={sortOrder}
          />
          {!isLoading && patients.length > 0 && renderPagination()}
          {!isLoading && patients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{isPatient ? 'Your profile is being set up' : 'No patients found'}</p>
            </div>
          )}
        </div>
      </div>

      <Toast />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Patient?"
        message={`Are you sure you want to delete ${deleteTarget?.first_name || ''} ${deleteTarget?.last_name || ''}? This cannot be undone.`}
        confirmLabel="Delete Patient"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {(p.canCreate || p.canEdit) && (
        <Modal isOpen={showModal} title={modalMode === 'add' ? 'Add New Patient' : 'Edit Patient'}
          onClose={() => { setShowModal(false); setSelectedPatient(null); }} size="large">
          <PatientForm patient={selectedPatient} mode={modalMode} isLoading={isSubmitting}
            onSubmit={handleFormSubmit} onCancel={() => { setShowModal(false); setSelectedPatient(null); }} />
        </Modal>
      )}
    </div>
  );
};

export default PatientsPage;