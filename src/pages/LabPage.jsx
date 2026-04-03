import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Beaker, Lock, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import LabOrderForm from '../components/LabOrderForm';
import LabResults from '../components/LabResults';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import { getLabOrders, createLabOrder, updateLabOrder, addLabResult, getLabStats } from '../services/labService';

const PRIORITY_BADGE = { Stat: 'bg-red-100 text-red-700', Urgent: 'bg-orange-100 text-orange-700', Routine: 'bg-emerald-100 text-emerald-700' };
const STATUS_BADGE   = { Completed: 'bg-emerald-100 text-emerald-700', 'In Progress': 'bg-amber-100 text-amber-700', Ordered: 'bg-blue-100 text-blue-700', Pending: 'bg-slate-100 text-slate-600', Cancelled: 'bg-red-100 text-red-700' };

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

const LabPage = () => {
  const { permissions, isPatient, isLabTech } = useRole();
  const p = permissions.lab;
  const [labOrders, setLabOrders]     = useState([]);
  const [stats, setStats]             = useState({});
  const [isLoading, setIsLoading]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination]   = useState({});
  const [showOrderModal, setShowOrderModal]   = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode]     = useState('add');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast, Toast } = useToast();

  const fetchLabOrders = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try { setIsLoading(true); const data = await getLabOrders(page, 10, '', ''); setLabOrders(data.orders || []); setPagination(data.pagination || {}); }
    catch {} finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getLabStats(); setStats(data); } catch {}
  }, [p.isBlocked]);

  useEffect(() => { fetchLabOrders(currentPage); fetchStats(); }, [currentPage, fetchLabOrders, fetchStats]);

  if (p.isBlocked) return <AccessDenied message="Laboratory module access is restricted to authorised medical staff." />;

  const handleOrderSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createLabOrder(formData);
      else await updateLabOrder(selectedOrder.lab_order_id, formData);
      showToast(modalMode === 'add' ? 'Lab order created' : 'Lab order updated');
      setShowOrderModal(false); fetchLabOrders(1); fetchStats(); setCurrentPage(1);
    } catch { showToast('Failed to save order.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleResultSubmit = async (resultData) => {
    try {
      setIsSubmitting(true);
      await addLabResult(selectedOrder.lab_order_id, resultData);
      showToast('Result added successfully');
      setShowResultModal(false); fetchLabOrders(currentPage); fetchStats();
    } catch { showToast('Failed to add result.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{isPatient ? 'My Lab Results' : isLabTech ? 'Lab Tests & Results' : 'Laboratory Tests'}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{isPatient ? 'Your laboratory test results' : isLabTech ? 'Manage test orders and enter results' : 'Order and manage laboratory tests'}</p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedOrder(null); setModalMode('add'); setShowOrderModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> {isLabTech ? 'New Test Order' : 'Order Lab Test'}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {!p.canCreate && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">{isPatient ? 'Your lab results — read only' : 'View only'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={Beaker}       label="Total Orders"    value={stats.total_orders || 0}               iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatCard icon={Clock}        label="In Progress"     value={stats.by_status?.['In Progress'] || 0} iconBg="bg-amber-50"  iconColor="text-amber-500" />
          <StatCard icon={CheckCircle}  label="Completed"       value={stats.by_status?.['Completed'] || 0}  iconBg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard icon={AlertCircle}  label="Pending Results" value={stats.pending_results || 0}            iconBg="bg-orange-50" iconColor="text-orange-500" />
        </div>

        {!isPatient && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search lab orders by patient name…" value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchLabOrders(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
            </div>
          ) : labOrders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Date', !isPatient && 'Patient', 'Test Name', 'Type', 'Priority', 'Status', 'Results', ''].filter(Boolean).map(h => (
                        <th key={h} className={`px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${h==='' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {labOrders.map((order, idx) => (
                      <tr key={order.lab_order_id}
                        className={`border-b border-slate-50 hover:bg-teal-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-5 py-4 text-sm text-slate-600">{new Date(order.ordered_date).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</td>
                        {!isPatient && (
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-800 text-sm">{order.first_name} {order.last_name}</p>
                            <p className="text-xs text-slate-400">{order.phone}</p>
                          </td>
                        )}
                        <td className="px-5 py-4 text-sm font-medium text-slate-700">{order.test_name}</td>
                        <td className="px-5 py-4"><span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{order.test_type}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${PRIORITY_BADGE[order.priority] || 'bg-slate-100 text-slate-600'}`}>{order.priority}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span></td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-700 rounded-full text-xs font-black">{order.result_count || 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {p.canAddResult && order.status !== 'Completed' && (
                              <button onClick={() => { setSelectedOrder(order); setModalMode('result'); setShowResultModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="Add result">
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-100 text-teal-600 transition-colors" title="View">
                              <Beaker className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={pagination} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Beaker className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">{isPatient ? 'No lab results yet' : 'No lab orders yet'}</p>
              {p.canCreate && <p className="text-slate-400 text-sm mt-1">Order your first lab test to get started</p>}
            </div>
          )}
        </div>
      </div>

      <Toast />

      {p.canCreate && (
        <Modal isOpen={showOrderModal} title={modalMode === 'add' ? 'Order Lab Test' : 'Edit Lab Order'}
          onClose={() => { setShowOrderModal(false); setSelectedOrder(null); }} size="large">
          <LabOrderForm labOrder={selectedOrder} mode={modalMode} isLoading={isSubmitting} onSubmit={handleOrderSubmit} onCancel={() => { setShowOrderModal(false); setSelectedOrder(null); }} />
        </Modal>
      )}

      {p.canAddResult && (
        <Modal isOpen={showResultModal} title="Add Lab Result"
          onClose={() => { setShowResultModal(false); setSelectedOrder(null); }} size="medium">
          <LabOrderForm labOrder={selectedOrder} mode="result" isLoading={isSubmitting} onSubmit={handleResultSubmit} onCancel={() => { setShowResultModal(false); setSelectedOrder(null); }} />
        </Modal>
      )}

      <Modal isOpen={showDetailModal} title="Lab Order Details"
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }} size="large">
        {selectedOrder && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
              <h3 className="font-black text-lg">{selectedOrder.test_name}</h3>
              <p className="text-teal-200 text-sm mt-0.5">{selectedOrder.test_type}</p>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                {[['Status',selectedOrder.status],['Priority',selectedOrder.priority],['Specimen',selectedOrder.specimen_type||'—'],['Result Count',selectedOrder.result_count||0]].map(([l,v]) => (
                  <div key={l}><p className="text-teal-300 text-xs uppercase tracking-wide">{l}</p><p className="font-bold mt-0.5">{v}</p></div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">Results</h4>
              <LabResults results={selectedOrder.results || []} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              {p.canAddResult && selectedOrder.status !== 'Completed' && (
                <button onClick={() => { setShowDetailModal(false); setModalMode('result'); setShowResultModal(true); }}
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all">Add Result</button>
              )}
              <button onClick={() => { setShowDetailModal(false); setSelectedOrder(null); }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabPage;