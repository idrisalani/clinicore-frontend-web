import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Lock } from 'lucide-react';
import Modal from '../components/Modal';
import ConsultationForm from '../components/ConsultationForm';
import ConsultationNotes from '../components/ConsultationNotes';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import {
  getConsultations, createConsultation, updateConsultation,
  deleteConsultation, getConsultationStats,
} from '../services/consultationService';

const ConsultationsPage = () => {
  const { permissions, isPatient, isNurse } = useRole();
  const p = permissions.consultations;

  const [consultations, setConsultations] = useState([]);
  const [stats, setStats]                 = useState({});
  const [isLoading, setIsLoading]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [pagination, setPagination]       = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode]         = useState('add');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  // ── All hooks before any early return ────────────────────────────────────
  const fetchConsultations = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getConsultations(page, 10, '', '');
      setConsultations(data.consultations || []);
      setPagination(data.pagination || {});
    } catch (error) { console.error('Error fetching consultations:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getConsultationStats(); setStats(data); }
    catch (error) { console.error('Stats error:', error); }
  }, [p.isBlocked]);

  useEffect(() => {
    fetchConsultations(currentPage);
    fetchStats();
  }, [currentPage, fetchConsultations, fetchStats]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="Clinical consultation records are restricted to medical staff only." />;

  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createConsultation(formData);
      else await updateConsultation(selectedConsultation.consultation_id, formData);
      setShowFormModal(false);
      fetchConsultations(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) { console.error('Submit error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (consultationId) => {
    if (!p.canDelete) return;
    if (!window.confirm('Delete this consultation record?')) return;
    try {
      setIsLoading(true);
      await deleteConsultation(consultationId);
      fetchConsultations(currentPage);
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

  const pageTitle = isPatient ? 'My Medical Records' : isNurse ? 'Patient Vitals & Notes' : 'Clinical Consultations';
  const pageDesc  = isPatient ? 'Your consultation history (read only)' : isNurse ? 'View patient consultation records' : 'Record and manage patient consultation notes';

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
              <button onClick={() => { setSelectedConsultation(null); setModalMode('add'); setShowFormModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                Record Consultation
              </button>
            )}
          </div>

          {!p.canCreate && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                {isPatient ? 'These are your medical records — read only' : 'View only — your role cannot create consultation notes'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total || 0, color: 'bg-blue-100', emoji: '📝' },
              { label: 'Drafts', value: stats.by_status?.['Draft'] || 0, color: 'bg-yellow-100', emoji: '✏️' },
              { label: 'Completed', value: stats.by_status?.['Completed'] || 0, color: 'bg-green-100', emoji: '✅' },
              { label: 'Referrals', value: stats.referrals_needed || 0, color: 'bg-orange-100', emoji: '⚠️' },
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
              <input type="text" placeholder="Search consultations by patient name..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchConsultations(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                  {consultations.map((c, idx) => (
                    <tr key={c.consultation_id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm">{new Date(c.consultation_date).toLocaleDateString('en-NG')}</td>
                      <td className="px-6 py-4"><div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.chief_complaint?.substring(0, 50)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.diagnosis?.substring(0, 30)}...</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${c.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : c.status === 'Completed' ? 'bg-green-100 text-green-800' : c.status === 'Signed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedConsultation(c); setShowDetailModal(true); }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" title="View">
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{isPatient ? 'No medical records yet' : 'No consultations recorded'}</p>
            </div>
          )}
        </div>
      </div>

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
          onDelete={p.canDelete ? (id) => { setShowDetailModal(false); handleDelete(id); } : null}
          canEdit={p.canEdit}
        />
      </Modal>
    </div>
  );
};

export default ConsultationsPage;