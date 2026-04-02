import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pill, Lock } from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionForm from '../components/PrescriptionForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import {
  getPrescriptions, createPrescription, updatePrescription,
  deletePrescription, getPharmacyStats, getMedications,
} from '../services/pharmacyService';

const PharmacyPage = () => {
  const { permissions, isPatient, isPharmacist } = useRole();
  const p = permissions.pharmacy;

  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats]                 = useState({});
  const [medications, setMedications]     = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [pagination, setPagination]       = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalMode, setModalMode]         = useState('add');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // ── All hooks before any early return ────────────────────────────────────
  const fetchPrescriptions = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getPrescriptions(page, 10, '', '');
      setPrescriptions(data.prescriptions || []);
      setPagination(data.pagination || {});
    } catch (error) { console.error('Error fetching prescriptions:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getPharmacyStats(); setStats(data); }
    catch (error) { console.error('Stats error:', error); }
  }, [p.isBlocked]);

  const fetchMedications = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getMedications('', 1); setMedications(data.medications || []); }
    catch (error) { console.error('Medications error:', error); }
  }, [p.isBlocked]);

  useEffect(() => {
    fetchPrescriptions(currentPage);
    fetchStats();
    fetchMedications();
  }, [currentPage, fetchPrescriptions, fetchStats, fetchMedications]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="Pharmacy access is restricted to authorised medical and pharmacy staff." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createPrescription(formData);
      else await updatePrescription(selectedPrescription.prescription_id, formData);
      setShowFormModal(false);
      fetchPrescriptions(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) { console.error('Submit error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (prescriptionId) => {
    if (!p.canDelete) return;
    if (!window.confirm('Delete this prescription?')) return;
    try {
      setIsLoading(true);
      await deletePrescription(prescriptionId);
      fetchPrescriptions(currentPage);
      fetchStats();
    } catch (error) { console.error('Delete error:', error); }
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

  const pageTitle   = isPatient ? 'My Prescriptions' : isPharmacist ? 'Pharmacy Management' : 'Prescriptions';
  const pageDesc    = isPatient ? 'Your active and past prescriptions (read only)' : isPharmacist ? 'Manage prescriptions and drug dispensing' : 'View and manage patient prescriptions';
  const createLabel = p.canPrescribe ? 'Issue Prescription' : 'Add Prescription';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
              <p className="text-gray-600">{pageDesc}</p>
            </div>
            {p.canCreate && (
              <button onClick={() => { setSelectedPrescription(null); setModalMode('add'); setShowFormModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" /> {createLabel}
              </button>
            )}
          </div>

          {!p.canCreate && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                {isPatient ? 'These are your prescriptions — read only' : 'View only — your role cannot create prescriptions'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Prescriptions', value: stats.total_prescriptions || 0, color: 'bg-blue-100', emoji: '💊' },
              { label: 'Active', value: stats.by_status?.['Active'] || 0, color: 'bg-green-100', emoji: '✅' },
              { label: 'In Catalog', value: stats.total_medications || 0, color: 'bg-blue-100', emoji: '📋' },
              { label: 'Needing Refill', value: stats.medications_needing_refill || 0, color: 'bg-orange-100', emoji: '⚠️' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-600 text-sm">{s.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                  <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-lg`}>{s.emoji}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isPatient && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search prescriptions by patient name..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchPrescriptions(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    {!isPatient && <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>}
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Medication</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Dosage</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Frequency</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    {(p.canEdit || p.canDelete) && <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, idx) => (
                    <tr key={rx.prescription_id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm">{new Date(rx.prescription_date).toLocaleDateString('en-NG')}</td>
                      {!isPatient && <td className="px-6 py-4"><div className="font-medium text-gray-900">{rx.first_name} {rx.last_name}</div></td>}
                      <td className="px-6 py-4 text-sm text-gray-900">{rx.generic_name} ({rx.brand_name})</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{rx.prescribed_dosage}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{rx.frequency}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          rx.status === 'Active' ? 'bg-green-100 text-green-800' :
                          rx.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          rx.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{rx.status}</span>
                      </td>
                      {(p.canEdit || p.canDelete) && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {p.canEdit && (
                              <button onClick={() => { setSelectedPrescription(rx); setModalMode('edit'); setShowFormModal(true); }}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 text-sm" title="Edit">✏️</button>
                            )}
                            {p.canDelete && (
                              <button onClick={() => handleDelete(rx.prescription_id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-sm" title="Delete">🗑️</button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{isPatient ? 'No prescriptions yet' : 'No prescriptions issued'}</p>
              {p.canCreate && <p className="text-gray-400 text-sm mt-2">Issue your first prescription to get started</p>}
            </div>
          )}
        </div>
      </div>

      {(p.canCreate || p.canEdit) && (
        <Modal isOpen={showFormModal} title={modalMode === 'add' ? createLabel : 'Edit Prescription'}
          onClose={() => { setShowFormModal(false); setSelectedPrescription(null); }} size="large">
          <PrescriptionForm prescription={selectedPrescription} medications={medications} mode={modalMode}
            isLoading={isSubmitting} onSubmit={handleFormSubmit} onCancel={() => { setShowFormModal(false); setSelectedPrescription(null); }} />
        </Modal>
      )}
    </div>
  );
};

export default PharmacyPage;