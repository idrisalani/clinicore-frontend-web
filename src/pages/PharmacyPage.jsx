import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pill, Lock, Edit2, Trash2, TrendingUp, Package } from 'lucide-react';
import Modal from '../components/Modal';
import PrescriptionForm from '../components/PrescriptionForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { getPrescriptions, createPrescription, updatePrescription, deletePrescription, getPharmacyStats, getMedications } from '../services/pharmacyService';

const STATUS_BADGE = { Active:'bg-emerald-100 text-emerald-700', Completed:'bg-blue-100 text-blue-700', Cancelled:'bg-red-100 text-red-700', Suspended:'bg-amber-100 text-amber-700' };

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p><p className="text-2xl font-black text-slate-800 mt-1">{value}</p></div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
    </div>
  </div>
);

const Pagination = ({ pagination, currentPage, setCurrentPage }) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100">
      <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
        <button key={pg} onClick={() => setCurrentPage(pg)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
      ))}
      <button disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
    </div>
  );
};

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
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast, Toast } = useToast();

  const fetchPrescriptions = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try { setIsLoading(true); const data = await getPrescriptions(page, 10, '', ''); setPrescriptions(data.prescriptions || []); setPagination(data.pagination || {}); }
    catch {} finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getPharmacyStats(); setStats(data); } catch {}
  }, [p.isBlocked]);

  const fetchMedications = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getMedications('', 1); setMedications(data.medications || []); } catch {}
  }, [p.isBlocked]);

  useEffect(() => { fetchPrescriptions(currentPage); fetchStats(); fetchMedications(); }, [currentPage, fetchPrescriptions, fetchStats, fetchMedications]);

  if (p.isBlocked) return <AccessDenied message="Pharmacy access is restricted to authorised medical and pharmacy staff." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createPrescription(formData);
      else await updatePrescription(selectedPrescription.prescription_id, formData);
      showToast(modalMode === 'add' ? 'Prescription issued' : 'Prescription updated');
      setShowFormModal(false); fetchPrescriptions(1); fetchStats(); setCurrentPage(1);
    } catch { showToast('Failed to save prescription.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deletePrescription(deleteTarget.prescription_id);
      showToast('Prescription deleted'); setDeleteTarget(null); fetchPrescriptions(currentPage); fetchStats();
    } catch { showToast('Failed to delete.', 'error'); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };

  const createLabel = p.canPrescribe ? 'Issue Prescription' : 'Add Prescription';

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{isPatient ? 'My Prescriptions' : isPharmacist ? 'Pharmacy Management' : 'Prescriptions'}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{isPatient ? 'Your active and past prescriptions' : isPharmacist ? 'Manage prescriptions and drug dispensing' : 'View and manage patient prescriptions'}</p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedPrescription(null); setModalMode('add'); setShowFormModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> {createLabel}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {!p.canCreate && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">{isPatient ? 'Your prescriptions — read only' : 'View only'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={Pill}        label="Total Prescriptions" value={stats.total_prescriptions || 0}          iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatCard icon={TrendingUp}  label="Active"              value={stats.by_status?.['Active'] || 0}        iconBg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard icon={Package}     label="In Catalog"          value={stats.total_medications || 0}            iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatCard icon={Pill}        label="Needing Refill"      value={stats.medications_needing_refill || 0}   iconBg="bg-orange-50" iconColor="text-orange-500" />
        </div>

        {!isPatient && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search prescriptions by patient name…" value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchPrescriptions(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
            </div>
          ) : prescriptions.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Date', !isPatient && 'Patient', 'Medication', 'Dosage', 'Frequency', 'Status', (p.canEdit || p.canDelete) && ''].filter(Boolean).map((h, i) => (
                      <th key={i} className={`px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${h==='' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, idx) => (
                    <tr key={rx.prescription_id} className={`border-b border-slate-50 hover:bg-teal-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-5 py-4 text-sm text-slate-600">{new Date(rx.prescription_date).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</td>
                      {!isPatient && (
                        <td className="px-5 py-4"><p className="font-semibold text-slate-800 text-sm">{rx.first_name} {rx.last_name}</p></td>
                      )}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{rx.generic_name}</p>
                        {rx.brand_name && <p className="text-xs text-slate-400">{rx.brand_name}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{rx.prescribed_dosage}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{rx.frequency}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[rx.status] || 'bg-slate-100 text-slate-600'}`}>{rx.status}</span>
                      </td>
                      {(p.canEdit || p.canDelete) && (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {p.canEdit && (
                              <button onClick={() => { setSelectedPrescription(rx); setModalMode('edit'); setShowFormModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {p.canDelete && (
                              <button onClick={() => setDeleteTarget(rx)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination pagination={pagination} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">{isPatient ? 'No prescriptions yet' : 'No prescriptions issued'}</p>
              {p.canCreate && <p className="text-slate-400 text-sm mt-1">Issue your first prescription to get started</p>}
            </div>
          )}
        </div>
      </div>

      <Toast />
      <ConfirmModal isOpen={!!deleteTarget} title="Delete Prescription?"
        message={`Delete prescription for ${deleteTarget?.first_name || ''} ${deleteTarget?.last_name || ''}? This cannot be undone.`}
        confirmLabel="Delete Prescription" loading={deleteLoading}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

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