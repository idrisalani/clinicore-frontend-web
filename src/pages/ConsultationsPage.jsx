import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lock, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import ConsultationForm from '../components/ConsultationForm';
import ConsultationNotes from '../components/ConsultationNotes';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { getConsultations, createConsultation, updateConsultation, deleteConsultation, getConsultationStats } from '../services/consultationService';

const STATUS_STYLES = {
  Draft:     'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Signed:    'bg-blue-100 text-blue-700',
  Reviewed:  'bg-violet-100 text-violet-700',
};

const StatCard = ({ label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    <div className={`h-1 w-8 rounded-full mt-2 ${bg}`} />
  </div>
);

const Pagination = ({ pagination, currentPage, setCurrentPage }) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100">
      <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}
        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
        <button key={pg} onClick={() => setCurrentPage(pg)}
          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
      ))}
      <button disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}
        className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
    </div>
  );
};

const ConsultationsPage = () => {
  const { permissions, isPatient, isNurse } = useRole();
  const p = permissions.consultations;
  const [consultations, setConsultations]   = useState([]);
  const [stats, setStats]                   = useState({});
  const [isLoading, setIsLoading]           = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [currentPage, setCurrentPage]       = useState(1);
  const [pagination, setPagination]         = useState({});
  const [showFormModal, setShowFormModal]   = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode]           = useState('add');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const { showToast, Toast } = useToast();

  const fetchConsultations = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try { setIsLoading(true); const data = await getConsultations(page, 10, '', ''); setConsultations(data.consultations || []); setPagination(data.pagination || {}); }
    catch {} finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getConsultationStats(); setStats(data); } catch {}
  }, [p.isBlocked]);

  useEffect(() => { fetchConsultations(currentPage); fetchStats(); }, [currentPage, fetchConsultations, fetchStats]);

  if (p.isBlocked) return <AccessDenied message="Clinical consultation records are restricted to medical staff only." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createConsultation(formData);
      else await updateConsultation(selectedConsultation.consultation_id, formData);
      showToast(modalMode === 'add' ? 'Consultation recorded' : 'Consultation updated');
      setShowFormModal(false); fetchConsultations(1); fetchStats(); setCurrentPage(1);
    } catch { showToast('Failed to save consultation.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteConsultation(deleteTarget.consultation_id);
      showToast('Consultation deleted'); setDeleteTarget(null); fetchConsultations(currentPage); fetchStats();
    } catch { showToast('Failed to delete.', 'error'); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };

  const pageTitle = isPatient ? 'My Medical Records' : isNurse ? 'Patient Vitals & Notes' : 'Clinical Consultations';

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{pageTitle}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{isPatient ? 'Your consultation history (read only)' : 'Record and manage patient consultation notes'}</p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedConsultation(null); setModalMode('add'); setShowFormModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> Record Consultation
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {!p.canCreate && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">{isPatient ? 'These are your medical records — read only' : 'View only'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard label="Total"     value={stats.total || 0}                       color="text-slate-800" bg="bg-slate-200" />
          <StatCard label="Drafts"    value={stats.by_status?.['Draft'] || 0}        color="text-amber-600" bg="bg-amber-400" />
          <StatCard label="Completed" value={stats.by_status?.['Completed'] || 0}    color="text-emerald-600" bg="bg-emerald-400" />
          <StatCard label="Referrals" value={stats.referrals_needed || 0}            color="text-orange-600" bg="bg-orange-400" />
        </div>

        {!isPatient && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search consultations by patient name…" value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchConsultations(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
            </div>
          ) : consultations.length > 0 ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Date','Patient','Chief Complaint','Diagnosis','Status',''].map(h => (
                      <th key={h} className={`px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((c, idx) => (
                    <tr key={c.consultation_id}
                      className={`border-b border-slate-50 hover:bg-teal-50/40 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      onClick={() => { setSelectedConsultation(c); setShowDetailModal(true); }}>
                      <td className="px-5 py-4 text-sm text-slate-600">{new Date(c.consultation_date).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm">{c.first_name} {c.last_name}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 max-w-xs truncate">{c.chief_complaint?.substring(0,50)}…</td>
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">{c.diagnosis?.substring(0,30)}…</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[c.status] || STATUS_STYLES.Draft}`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={e => { e.stopPropagation(); setSelectedConsultation(c); setShowDetailModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-100 text-teal-600 transition-colors ml-auto">
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination pagination={pagination} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">{isPatient ? 'No medical records yet' : 'No consultations recorded'}</p>
            </div>
          )}
        </div>
      </div>

      <Toast />
      <ConfirmModal isOpen={!!deleteTarget} title="Delete Consultation?"
        message="Delete this consultation record? This cannot be undone."
        confirmLabel="Delete Record" loading={deleteLoading}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

      {p.canCreate && (
        <Modal isOpen={showFormModal} title={modalMode === 'add' ? 'Record Consultation' : 'Edit Consultation'}
          onClose={() => { setShowFormModal(false); setSelectedConsultation(null); }} size="large">
          <ConsultationForm consultation={selectedConsultation} mode={modalMode} isLoading={isSubmitting}
            onSubmit={handleFormSubmit} onCancel={() => { setShowFormModal(false); setSelectedConsultation(null); }} />
        </Modal>
      )}

      <Modal isOpen={showDetailModal} title="Consultation Record"
        onClose={() => { setShowDetailModal(false); setSelectedConsultation(null); }} size="large">
        <ConsultationNotes
          consultation={selectedConsultation}
          onEdit={p.canEdit ? (id) => { setShowDetailModal(false); const c = consultations.find(x => x.consultation_id === id); setSelectedConsultation(c); setModalMode('edit'); setShowFormModal(true); } : null}
          onDelete={p.canDelete ? (id) => { setShowDetailModal(false); setDeleteTarget(consultations.find(x => x.consultation_id === id)); } : null}
          canEdit={p.canEdit}
        />
      </Modal>
    </div>
  );
};

export default ConsultationsPage;