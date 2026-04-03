import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lock, DollarSign, TrendingUp, FileText, CheckCircle, Edit2, Trash2, CreditCard } from 'lucide-react';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';
import PaymentForm from '../components/PaymentForm';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, recordPayment, getBillingStats } from '../services/billingService';

const fmt = (v) => `₦${parseFloat(v||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

const STATUS_BADGE = {
  Paid:           'bg-emerald-100 text-emerald-700',
  'Partially Paid':'bg-blue-100 text-blue-700',
  Issued:         'bg-teal-100 text-teal-700',
  Overdue:        'bg-red-100 text-red-700',
  Draft:          'bg-slate-100 text-slate-600',
  Cancelled:      'bg-gray-100 text-gray-500',
};

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p><p className="text-xl font-black text-slate-800 mt-1">{value}</p></div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
    </div>
  </div>
);

const Pagination = ({ pagination, currentPage, setCurrentPage }) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100">
      <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(pg => (
        <button key={pg} onClick={() => setCurrentPage(pg)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
      ))}
      <button disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
    </div>
  );
};

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
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [deleteLoading, setDeleteLoading]       = useState(false);
  const { showToast, Toast } = useToast();

  const fetchInvoices = useCallback(async (page = 1) => {
    if (p.isBlocked) return;
    try { setIsLoading(true); const data = await getInvoices(page, 10, '', statusFilter); setInvoices(data.invoices || []); setPagination(data.pagination || {}); }
    catch {} finally { setIsLoading(false); }
  }, [p.isBlocked, statusFilter]);

  const fetchStats = useCallback(async () => {
    if (p.isBlocked) return;
    try { const data = await getBillingStats(); setStats(data); } catch {}
  }, [p.isBlocked]);

  useEffect(() => { fetchInvoices(currentPage); fetchStats(); }, [currentPage, statusFilter, fetchInvoices, fetchStats]);

  if (p.isBlocked) return <AccessDenied message="Billing access is restricted to authorised staff." />;

  const handleInvoiceSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (modalMode === 'add') await createInvoice(formData);
      else await updateInvoice(selectedInvoice.invoice_id, formData);
      showToast(modalMode === 'add' ? 'Invoice created' : 'Invoice updated');
      setShowInvoiceModal(false); fetchInvoices(1); fetchStats(); setCurrentPage(1);
    } catch { showToast('Failed to save invoice.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handlePaymentSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await recordPayment(formData);
      showToast('Payment recorded successfully');
      setShowPaymentModal(false); fetchInvoices(currentPage); fetchStats();
    } catch { showToast('Failed to record payment.', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteInvoice(deleteTarget.invoice_id);
      showToast(`Invoice ${deleteTarget.invoice_number || ''} deleted`);
      setDeleteTarget(null); fetchInvoices(currentPage); fetchStats();
    } catch { showToast('Failed to delete.', 'error'); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{isPatient ? 'My Bills' : 'Billing & Invoicing'}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{isPatient ? 'Your invoices and payment history' : 'Manage invoices and track payments (₦)'}</p>
          </div>
          {p.canCreate && (
            <button onClick={() => { setSelectedInvoice(null); setModalMode('add'); setShowInvoiceModal(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {!p.canCreate && !p.canEdit && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">{isPatient ? 'Your invoices — read only' : 'View only'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={DollarSign}  label="Total Revenue"  value={fmt(stats.total_revenue)}                iconBg="bg-emerald-50" iconColor="text-emerald-500" />
          <StatCard icon={TrendingUp}  label="Outstanding"    value={fmt(stats.outstanding_receivables)}     iconBg="bg-orange-50"  iconColor="text-orange-500" />
          <StatCard icon={FileText}    label="Total Invoices" value={stats.total_invoices || 0}               iconBg="bg-blue-50"    iconColor="text-blue-500" />
          <StatCard icon={CheckCircle} label="Paid Invoices"  value={stats.by_status?.['Paid'] || 0}         iconBg="bg-teal-50"    iconColor="text-teal-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3 flex-col md:flex-row">
            {!isPatient && (
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search invoices by number or patient…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all" />
              </div>
            )}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 appearance-none cursor-pointer transition-all min-w-44">
              <option value="">All Status</option>
              {['Draft','Issued','Partially Paid','Paid','Overdue'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
            </div>
          ) : invoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Invoice #', !isPatient && 'Patient', 'Date', 'Amount', 'Paid', 'Due', 'Status', ''].filter(Boolean).map((h, i) => (
                        <th key={i} className={`px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${['Amount','Paid','Due',''].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, idx) => (
                      <tr key={inv.invoice_id} className={`border-b border-slate-50 hover:bg-teal-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-5 py-4 font-black text-slate-800 text-sm">{inv.invoice_number}</td>
                        {!isPatient && <td className="px-5 py-4 text-sm text-slate-700">{inv.first_name} {inv.last_name}</td>}
                        <td className="px-5 py-4 text-sm text-slate-500">{new Date(inv.invoice_date).toLocaleDateString('en-NG', {day:'numeric',month:'short',year:'numeric'})}</td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-800 text-sm">{fmt(inv.total_amount)}</td>
                        <td className="px-5 py-4 text-right text-sm text-emerald-600 font-medium">{fmt(inv.amount_paid||0)}</td>
                        <td className="px-5 py-4 text-right text-sm text-orange-600 font-bold">{fmt(inv.amount_due||0)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[inv.status] || 'bg-slate-100 text-slate-600'}`}>{inv.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {p.canRecordPayment && inv.status !== 'Paid' && (
                              <button onClick={() => { setSelectedInvoice(inv); setShowPaymentModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors" title="Record Payment">
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            {p.canEdit && (
                              <button onClick={() => { setSelectedInvoice(inv); setModalMode('edit'); setShowInvoiceModal(true); }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {p.canDelete && (
                              <button onClick={() => setDeleteTarget(inv)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
                <DollarSign className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">{isPatient ? 'No bills yet' : 'No invoices created'}</p>
              {p.canCreate && <p className="text-slate-400 text-sm mt-1">Create your first invoice to get started</p>}
            </div>
          )}
        </div>
      </div>

      <Toast />
      <ConfirmModal isOpen={!!deleteTarget} title="Delete Invoice?"
        message={`Delete invoice ${deleteTarget?.invoice_number || ''}? This cannot be undone.`}
        confirmLabel="Delete Invoice" loading={deleteLoading}
        onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />

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