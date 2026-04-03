import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lock, Users, TrendingUp, Calendar } from 'lucide-react';
import PatientTable from '../components/PatientTable';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { getPatients, searchPatients, createPatient, updatePatient, deletePatient } from '../services/patientService';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
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

const PatientsPage = () => {
  const { permissions, isPatient, userId } = useRole();
  const p = permissions.patients;
  const [patients, setPatients]         = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [sortBy, setSortBy]             = useState('first_name');
  const [sortOrder, setSortOrder]       = useState('asc');
  const [pagination, setPagination]     = useState({});
  const [showModal, setShowModal]       = useState(false);
  const [modalMode, setModalMode]       = useState('add');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteTarget, setDeleteTarget]       = useState(null);
  const [deleteLoading, setDeleteLoading]     = useState(false);
  const { showToast, Toast } = useToast();

  const fetchPatients = useCallback(async (page = 1, search = '') => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getPatients(page, 10, search);
      if (isPatient && userId) {
        const own = (data.patients || []).filter(pt => pt.user_id === userId || pt.patient_id === userId);
        setPatients(own); setPagination({});
      } else {
        setPatients(data.patients || []); setPagination(data.pagination || {});
      }
    } catch {}
    finally { setIsLoading(false); }
  }, [p.isBlocked, isPatient, userId]);

  useEffect(() => { fetchPatients(currentPage, searchQuery); }, [currentPage, fetchPatients, searchQuery]);

  const handleSearch = useCallback(async (e) => {
    const q = e.target.value;
    setSearchQuery(q); setCurrentPage(1);
    if (q.length >= 2) {
      try {
        const data = await searchPatients(q);
        const results = data.patients || [];
        setPatients(isPatient && userId ? results.filter(pt => pt.user_id === userId || pt.patient_id === userId) : results);
        setPagination({});
      } catch {}
    } else if (q.length === 0) fetchPatients(1, '');
  }, [fetchPatients, isPatient, userId]);

  if (p.isBlocked) return <AccessDenied message="You do not have permission to access patient records." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createPatient(formData);
      else await updatePatient(selectedPatient.patient_id, formData);
      showToast(modalMode === 'add' ? 'Patient created successfully' : 'Patient updated successfully');
      setShowModal(false); fetchPatients(1, ''); setCurrentPage(1);
    } catch { showToast('Failed to save patient.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePatient(deleteTarget.patient_id);
      showToast(`${deleteTarget.first_name} deleted`);
      setDeleteTarget(null); fetchPatients(currentPage, searchQuery);
    } catch { showToast('Failed to delete.', 'error'); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isPatient ? 'My Profile' : 'Patient Management'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {isPatient ? 'Your personal health record' : `${pagination.total || patients.length} patients total`}
            </p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedPatient(null); setModalMode('add'); setShowModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> Add Patient
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Role restriction notice */}
        {!p.canCreate && !p.canEdit && !isPatient && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">View only — your role cannot create or edit patient records</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in">
          <StatCard icon={Users}      label={isPatient ? 'Your Records' : 'Total Patients'} value={isPatient ? 1 : (pagination.total || 0)} color="bg-teal-500" />
          <StatCard icon={TrendingUp} label="This Month"  value={0} color="bg-blue-500" />
          <StatCard icon={Calendar}   label="Appointments" value={0} color="bg-violet-500" />
        </div>

        {/* Search */}
        {!isPatient && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search by name, phone, or email…" value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <PatientTable
            patients={patients} isLoading={isLoading}
            onEdit={p.canEdit ? (id) => { const pt = patients.find(x => x.patient_id === id); setSelectedPatient(pt); setModalMode('edit'); setShowModal(true); } : null}
            onDelete={p.canDelete ? (id) => setDeleteTarget(patients.find(x => x.patient_id === id)) : null}
            onSort={(f, o) => { setSortBy(f); setSortOrder(o); }}
            sortBy={sortBy} sortOrder={sortOrder}
          />
          {!isLoading && <Pagination pagination={pagination} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        </div>
      </div>

      <Toast />
      <ConfirmModal isOpen={!!deleteTarget} title="Delete Patient?"
        message={`Delete ${deleteTarget?.first_name || ''} ${deleteTarget?.last_name || ''}? This cannot be undone.`}
        confirmLabel="Delete Patient" loading={deleteLoading}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

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