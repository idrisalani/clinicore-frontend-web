import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, DollarSign, Lock } from 'lucide-react';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';
import PaymentForm from '../components/PaymentForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import {
  getInvoices, createInvoice, updateInvoice,
  deleteInvoice, recordPayment, getBillingStats,
} from '../services/billingService';

const BillingPage = () => {
  const { permissions, isPatient } = useRole();
  const p = permissions.billing;

  const [invoices, setInvoices]         = useState([]);
  const [stats, setStats]               = useState({});
  const [isLoading, setIsLoading]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [pagination, setPagination]     = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalMode, setModalMode]       = useState('add');
  const [selectedInvoice, setSelectedInvoice]   = useState(null);

  // ── All hooks before any early return ────────────────────────────────────
  const fetchInvoices = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getInvoices(page, 10, '', statusFilter);
      setInvoices(data.invoices || []);
      setPagination(data.pagination || {});
    } catch (error) { console.error('Error fetching invoices:', error); }
    finally { setIsLoading(false); }
  }, [p.isBlocked, statusFilter]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getBillingStats(); setStats(data); }
    catch (error) { console.error('Stats error:', error); }
  }, [p.isBlocked]);

  useEffect(() => {
    fetchInvoices(currentPage);
    fetchStats();
  }, [currentPage, statusFilter, fetchInvoices, fetchStats]);

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (p.isBlocked) return <AccessDenied message="Billing access is restricted to authorised staff." />;

  const handleInvoiceSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createInvoice(formData);
      else await updateInvoice(selectedInvoice.invoice_id, formData);
      setShowInvoiceModal(false);
      fetchInvoices(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) { console.error('Invoice submit error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handlePaymentSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await recordPayment(formData);
      setShowPaymentModal(false);
      fetchInvoices(currentPage);
      fetchStats();
    } catch (error) { console.error('Payment error:', error); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (invoiceId) => {
    if (!p.canDelete) return;
    if (!window.confirm('Delete this invoice?')) return;
    try {
      setIsLoading(true);
      await deleteInvoice(invoiceId);
      fetchInvoices(currentPage);
      fetchStats();
    } catch (error) { console.error('Delete error:', error); }
    finally { setIsLoading(false); }
  };

  const formatCurrency = (value) =>
    `₦${parseFloat(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':           return 'bg-green-100 text-green-800';
      case 'Partially Paid': return 'bg-blue-100 text-blue-800';
      case 'Overdue':        return 'bg-red-100 text-red-800';
      case 'Draft':          return 'bg-gray-100 text-gray-800';
      default:               return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;
    return (
      <div className="flex justify-center gap-2 mt-6">
        {currentPage > 1 && <button onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>}
        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(pg => (
          <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-4 py-2 rounded-lg ${pg === currentPage ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>{pg}</button>
        ))}
        {currentPage < pagination.totalPages && <button onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>}
      </div>
    );
  };

  const pageTitle = isPatient ? 'My Bills' : 'Billing & Invoicing';
  const pageDesc  = isPatient ? 'Your invoices and payment history' : 'Manage invoices and track payments (Nigerian Naira ₦)';

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
              <button onClick={() => { setSelectedInvoice(null); setModalMode('add'); setShowInvoiceModal(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                <Plus className="w-5 h-5" />
                Create Invoice
              </button>
            )}
          </div>

          {!p.canCreate && !p.canEdit && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                {isPatient ? 'Your invoices — read only. Use the pay button to record a payment.' : 'View only — your role cannot create or modify invoices'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), color: 'bg-green-100', emoji: '💰' },
              { label: 'Outstanding', value: formatCurrency(stats.outstanding_receivables), color: 'bg-orange-100', emoji: '⚠️' },
              { label: 'Total Invoices', value: stats.total_invoices || 0, color: 'bg-blue-100', emoji: '📄' },
              { label: 'Paid Invoices', value: stats.by_status?.['Paid'] || 0, color: 'bg-purple-100', emoji: '✅' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-600 text-sm">{s.label}</p><p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                  <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-lg`}>{s.emoji}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 flex gap-4 items-center">
          {!isPatient && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search invoices by number or patient..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            </div>
          )}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Invoice #</th>
                    {!isPatient && <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>}
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Paid</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Due</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, idx) => (
                    <tr key={invoice.invoice_id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{invoice.invoice_number}</td>
                      {!isPatient && <td className="px-6 py-4 text-sm">{invoice.first_name} {invoice.last_name}</td>}
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(invoice.invoice_date).toLocaleDateString('en-NG')}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</td>
                      <td className="px-6 py-4 text-right text-sm text-green-600">{formatCurrency(invoice.amount_paid || 0)}</td>
                      <td className="px-6 py-4 text-right text-sm text-orange-600 font-semibold">{formatCurrency(invoice.amount_due || 0)}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {p.canRecordPayment && invoice.status !== 'Paid' && (
                            <button onClick={() => { setSelectedInvoice(invoice); setShowPaymentModal(true); }}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 text-sm" title="Record Payment">💳</button>
                          )}
                          {p.canEdit && (
                            <button onClick={() => { setSelectedInvoice(invoice); setModalMode('edit'); setShowInvoiceModal(true); }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 text-sm" title="Edit">✏️</button>
                          )}
                          {p.canDelete && (
                            <button onClick={() => handleDelete(invoice.invoice_id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-sm" title="Delete">🗑️</button>
                          )}
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
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{isPatient ? 'No bills yet' : 'No invoices created'}</p>
              {p.canCreate && <p className="text-gray-400 text-sm mt-2">Create your first invoice to get started</p>}
            </div>
          )}
        </div>
      </div>

      {(p.canCreate || p.canEdit) && (
        <Modal isOpen={showInvoiceModal} title={modalMode === 'add' ? 'Create Invoice' : 'Edit Invoice'}
          onClose={() => setShowInvoiceModal(false)} size="large">
          <InvoiceForm invoice={selectedInvoice} mode={modalMode} isLoading={isSubmitting}
            onSubmit={handleInvoiceSubmit} onCancel={() => setShowInvoiceModal(false)} />
        </Modal>
      )}

      {p.canRecordPayment && (
        <Modal isOpen={showPaymentModal} title="Record Payment"
          onClose={() => setShowPaymentModal(false)} size="medium">
          <PaymentForm invoice={selectedInvoice} isLoading={isSubmitting}
            onSubmit={handlePaymentSubmit} onCancel={() => setShowPaymentModal(false)} />
        </Modal>
      )}
    </div>
  );
};

export default BillingPage;