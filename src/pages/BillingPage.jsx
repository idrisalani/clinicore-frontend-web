import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import InvoiceForm from '../components/InvoiceForm';
import PaymentForm from '../components/PaymentForm';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  recordPayment,
  getBillingStats,
} from '../services/billingService';

/**
 * Professional Billing & Invoice Management Page
 * Complete invoice lifecycle and payment tracking
 */
const BillingPage = () => {
  // State Management
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch Invoices
  const fetchInvoices = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      console.log('💰 Fetching invoices...');

      const data = await getInvoices(page, 10, '', statusFilter);
      setInvoices(data.invoices || []);
      setPagination(data.pagination || {});
      console.log('✅ Invoices loaded:', data.invoices.length);
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      alert('Failed to fetch invoices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching billing statistics...');
      const data = await getBillingStats();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInvoices(currentPage);
    fetchStats();
  }, [currentPage, statusFilter, fetchInvoices, fetchStats]);

  // Handle Search
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);
    },
    []
  );

  // Handle Create Invoice
  const handleCreateClick = () => {
    setSelectedInvoice(null);
    setModalMode('add');
    setShowInvoiceModal(true);
  };

  // Handle Record Payment
  const handlePaymentClick = (invoiceId) => {
    const invoice = invoices.find(i => i.invoice_id === invoiceId);
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Handle Edit Invoice
  const handleEdit = (invoiceId) => {
    const invoice = invoices.find(i => i.invoice_id === invoiceId);
    setSelectedInvoice(invoice);
    setModalMode('edit');
    setShowInvoiceModal(true);
  };

  // Handle Delete Invoice
  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting invoice:', invoiceId);
      await deleteInvoice(invoiceId);
      console.log('✅ Invoice deleted successfully');
      alert('Invoice deleted successfully');
      fetchInvoices(currentPage);
      fetchStats();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Invoice Form Submit
  const handleInvoiceSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('💾 Submitting invoice:', formData);

      if (modalMode === 'add') {
        console.log('➕ Creating new invoice...');
        await createInvoice(formData);
        console.log('✅ Invoice created successfully');
        alert('Invoice created successfully!');
      } else {
        console.log('✏️ Updating invoice...');
        await updateInvoice(selectedInvoice.invoice_id, formData);
        console.log('✅ Invoice updated successfully');
        alert('Invoice updated successfully!');
      }

      setShowInvoiceModal(false);
      fetchInvoices(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save invoice';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Payment Submit
  const handlePaymentSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('💳 Recording payment:', formData);
      await recordPayment(formData);
      console.log('✅ Payment recorded successfully');
      alert('Payment recorded successfully!');

      setShowPaymentModal(false);
      fetchInvoices(currentPage);
      fetchStats();
    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to record payment';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return `₦${parseFloat(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partially Paid':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Issued':
      case 'Sent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render Pagination
  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center gap-2 mt-6">
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
        )}

        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {currentPage < pagination.totalPages && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing & Invoicing</h1>
              <p className="text-gray-600">Manage invoices and track payments (Nigerian Naira ₦)</p>
            </div>
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {formatCurrency(stats.total_revenue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Outstanding</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {formatCurrency(stats.outstanding_receivables || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  ⚠️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Invoices</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.total_invoices || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📄
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Paid Invoices</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats.by_status?.['Paid'] || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search invoices by number or patient..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Invoice #</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Paid</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Due</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr
                      key={invoice.invoice_id}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {invoice.first_name} {invoice.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(invoice.invoice_date).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-green-600">
                        {formatCurrency(invoice.amount_paid || 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-orange-600 font-semibold">
                        {formatCurrency(invoice.amount_due || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePaymentClick(invoice.invoice_id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 text-sm"
                            title="Record Payment"
                          >
                            💳
                          </button>
                          <button
                            onClick={() => handleEdit(invoice.invoice_id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 text-sm"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.invoice_id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 text-sm"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {!isLoading && invoices.length > 0 && renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No invoices created</p>
              <p className="text-gray-400 text-sm mt-2">Create your first invoice to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Form Modal */}
      <Modal
        isOpen={showInvoiceModal}
        title={modalMode === 'add' ? 'Create Invoice' : 'Edit Invoice'}
        onClose={() => setShowInvoiceModal(false)}
        size="large"
      >
        <InvoiceForm
          invoice={selectedInvoice}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleInvoiceSubmit}
          onCancel={() => setShowInvoiceModal(false)}
        />
      </Modal>

      {/* Payment Form Modal */}
      <Modal
        isOpen={showPaymentModal}
        title="Record Payment"
        onClose={() => setShowPaymentModal(false)}
        size="medium"
      >
        <PaymentForm
          invoice={selectedInvoice}
          isLoading={isSubmitting}
          onSubmit={handlePaymentSubmit}
          onCancel={() => setShowPaymentModal(false)}
        />
      </Modal>
    </div>
  );
};

export default BillingPage;