import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Beaker, TrendingUp, Lock } from 'lucide-react';
import Modal from '../components/Modal';
import LabOrderForm from '../components/LabOrderForm';
import LabResults from '../components/LabResults';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import {
  getLabOrders, createLabOrder, updateLabOrder,
  addLabResult, getLabStats,
} from '../services/labService';

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

  // ── All hooks before any early return ────────────────────────────────────
  const fetchLabOrders = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getLabOrders(page, 10, '', '');
      setLabOrders(data.orders || []);
      setPagination(data.pagination || {});
    } catch (error) { console.error('Error fetching lab orders:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getLabStats(); setStats(data); }
    catch (error) { console.error('Stats error:', error); }
  }, [p.isBlocked]);

  useEffect(() => {
    fetchLabOrders(currentPage);
    fetchStats();
  }, [currentPage, fetchLabOrders, fetchStats]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="Laboratory module access is restricted to authorised medical staff." />;

  const handleOrderSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createLabOrder(formData);
      else await updateLabOrder(selectedOrder.lab_order_id, formData);
      setShowOrderModal(false);
      fetchLabOrders(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) { console.error('Submit error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleResultSubmit = async (resultData) => {
    try {
      setIsSubmitting(true);
      await addLabResult(selectedOrder.lab_order_id, resultData);
      setShowResultModal(false);
      fetchLabOrders(currentPage);
      fetchStats();
    } catch (error) { console.error('Result error:', error); }
    finally { setIsSubmitting(false); }
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

  const pageTitle = isPatient ? 'My Lab Results' : isLabTech ? 'Lab Tests & Results' : 'Laboratory Tests';
  const pageDesc  = isPatient ? 'Your laboratory test results (read only)' : isLabTech ? 'Manage test orders and enter results' : 'Order and manage laboratory tests for patients';

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
              <button onClick={() => { setSelectedOrder(null); setModalMode('add'); setShowOrderModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                {isLabTech ? 'New Test Order' : 'Order Lab Test'}
              </button>
            )}
          </div>

          {!p.canCreate && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                {isPatient ? 'These are your lab results — read only' : 'View only — your role cannot create lab orders'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: stats.total_orders || 0, color: 'bg-blue-100', emoji: '🧪' },
              { label: 'In Progress', value: stats.by_status?.['In Progress'] || 0, color: 'bg-yellow-100', emoji: '⏳' },
              { label: 'Completed', value: stats.by_status?.['Completed'] || 0, color: 'bg-green-100', emoji: '✅' },
              { label: 'Pending Results', value: stats.pending_results || 0, color: 'bg-orange-100', emoji: '⚠️' },
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
              <input type="text" placeholder="Search lab orders by patient name..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); fetchLabOrders(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : labOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    {!isPatient && <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>}
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Test Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Priority</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Results</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrders.map((order, idx) => (
                    <tr key={order.lab_order_id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm">{new Date(order.ordered_date).toLocaleDateString('en-NG')}</td>
                      {!isPatient && (
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{order.first_name} {order.last_name}</div>
                          <div className="text-sm text-gray-600">{order.phone}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900">{order.test_name}</td>
                      <td className="px-6 py-4 text-sm"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{order.test_type}</span></td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.priority === 'Stat' ? 'bg-red-100 text-red-800' : order.priority === 'Urgent' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{order.priority}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{order.result_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {p.canAddResult && order.status !== 'Completed' && (
                            <button onClick={() => { const o = labOrders.find(x => x.lab_order_id === order.lab_order_id); setSelectedOrder(o); setModalMode('result'); setShowResultModal(true); }}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600" title="Add result">
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={async () => { const resp = await getLabOrders(); const o = resp.orders.find(x => x.lab_order_id === order.lab_order_id); setSelectedOrder(o); setShowDetailModal(true); }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" title="View order">
                            <Beaker className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{isPatient ? 'No lab results yet' : 'No lab orders yet'}</p>
              {p.canCreate && <p className="text-gray-400 text-sm mt-2">Order your first lab test to get started</p>}
            </div>
          )}
        </div>
      </div>

      {p.canCreate && (
        <Modal isOpen={showOrderModal} title={modalMode === 'add' ? 'Order Lab Test' : 'Edit Lab Order'}
          onClose={() => { setShowOrderModal(false); setSelectedOrder(null); }} size="large">
          <LabOrderForm labOrder={selectedOrder} mode={modalMode} isLoading={isSubmitting} onSubmit={handleOrderSubmit} onCancel={() => { setShowOrderModal(false); setSelectedOrder(null); }} />
        </Modal>
      )}

      {p.canAddResult && (
        <Modal isOpen={showResultModal} title="Add Lab Result"
          onClose={() => { setShowResultModal(false); setSelectedOrder(null); }} size="large">
          <LabOrderForm labOrder={selectedOrder} mode="result" isLoading={isSubmitting} onSubmit={handleResultSubmit} onCancel={() => { setShowResultModal(false); setSelectedOrder(null); }} />
        </Modal>
      )}

      <Modal isOpen={showDetailModal} title="Lab Order Details"
        onClose={() => { setShowDetailModal(false); setSelectedOrder(null); }} size="large">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4">Order Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[['Test Name', selectedOrder.test_name], ['Test Type', selectedOrder.test_type], ['Status', selectedOrder.status], ['Priority', selectedOrder.priority]].map(([label, value]) => (
                  <div key={label}><p className="text-gray-600">{label}</p><p className="font-semibold text-gray-900">{value}</p></div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Results</h4>
              <LabResults results={selectedOrder.results || []} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {p.canAddResult && selectedOrder.status !== 'Completed' && (
                <button onClick={() => { setShowDetailModal(false); setModalMode('result'); setShowResultModal(true); }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Add Result</button>
              )}
              <button onClick={() => { setShowDetailModal(false); setSelectedOrder(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabPage;