import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Beaker, TrendingUp } from 'lucide-react';
import Modal from '../components/Modal';
import LabOrderForm from '../components/LabOrderForm';
import LabResults from '../components/LabResults';
import {
  getLabOrders,
  createLabOrder,
  updateLabOrder,
  deleteLabOrder,
  addLabResult,
  getLabStats,
} from '../services/labService';

/**
 * Professional Lab Management Page
 * Order and manage laboratory tests
 */
const LabPage = () => {
  // State Management
  const [labOrders, setLabOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Lab Orders
  const fetchLabOrders = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      console.log('🧪 Fetching lab orders...');

      const data = await getLabOrders(page, 10, '', '');
      setLabOrders(data.orders || []);
      setPagination(data.pagination || {});
      console.log('✅ Lab orders loaded:', data.orders.length);
    } catch (error) {
      console.error('❌ Error fetching lab orders:', error);
      alert('Failed to fetch lab orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch Statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching lab statistics...');
      const data = await getLabStats();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLabOrders(currentPage);
    fetchStats();
  }, [searchQuery]);

  // Handle Search
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      setCurrentPage(1);
      fetchLabOrders(1);
    },
    [fetchLabOrders]
  );

  // Handle Order Lab Test
  const handleOrderClick = () => {
    setSelectedOrder(null);
    setModalMode('add');
    setShowOrderModal(true);
  };

  // Handle View Order Details
  const handleViewOrder = async (orderId) => {
    try {
      const response = await getLabOrders();
      const order = response.orders.find(o => o.lab_order_id === orderId);
      setSelectedOrder(order);
      setShowDetailModal(true);
    } catch (error) {
      console.error('❌ Error viewing order:', error);
    }
  };

  // Handle Edit Order
  const _handleEditOrder = (orderId) => {
    const order = labOrders.find(o => o.lab_order_id === orderId);
    setSelectedOrder(order);
    setModalMode('edit');
    setShowOrderModal(true);
  };

  // Handle Add Result
  const handleAddResult = (orderId) => {
    const order = labOrders.find(o => o.lab_order_id === orderId);
    setSelectedOrder(order);
    setModalMode('result');
    setShowResultModal(true);
  };

  // Handle Delete Order
  const _handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this lab order?')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting lab order:', orderId);
      await deleteLabOrder(orderId);
      console.log('✅ Lab order deleted successfully');
      alert('Lab order deleted successfully');
      fetchLabOrders(currentPage);
      fetchStats();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete lab order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submit (Order)
  const handleOrderSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('💾 Submitting lab order:', formData);

      if (modalMode === 'add') {
        console.log('➕ Creating new lab order...');
        await createLabOrder(formData);
        console.log('✅ Lab order created successfully');
        alert('Lab order created successfully!');
      } else {
        console.log('✏️ Updating lab order...');
        await updateLabOrder(selectedOrder.lab_order_id, formData);
        console.log('✅ Lab order updated successfully');
        alert('Lab order updated successfully!');
      }

      setShowOrderModal(false);
      fetchLabOrders(1);
      fetchStats();
      setCurrentPage(1);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save lab order';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Result Submit
  const handleResultSubmit = async (resultData) => {
    try {
      setIsSubmitting(true);
      console.log('💾 Adding lab result:', resultData);

      await addLabResult(selectedOrder.lab_order_id, resultData);
      console.log('✅ Lab result added successfully');
      alert('Lab result added successfully!');

      setShowResultModal(false);
      fetchLabOrders(currentPage);
      fetchStats();
    } catch (error) {
      console.error('❌ Error adding result:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add lab result';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Modal Close
  const handleOrderModalClose = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    setSelectedOrder(null);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
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

        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Laboratory Tests</h1>
              <p className="text-gray-600">Order and manage laboratory tests for patients</p>
            </div>
            <button
              onClick={handleOrderClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Order Lab Test
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total_orders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  🧪
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {stats.by_status?.['In Progress'] || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                  ⏳
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {stats.by_status?.['Completed'] || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Results</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {stats.pending_results || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                  ⚠️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search lab orders by patient name..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Lab Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : labOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Test Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Priority</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Results</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labOrders.map((order, index) => (
                    <tr
                      key={order.lab_order_id}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.ordered_date).toLocaleDateString('en-NG')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.first_name} {order.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.test_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {order.test_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.priority === 'Stat'
                              ? 'bg-red-100 text-red-800'
                              : order.priority === 'Urgent'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {order.result_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status !== 'Completed' && (
                            <button
                              onClick={() => handleAddResult(order.lab_order_id)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                              title="Add result"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewOrder(order.lab_order_id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View order"
                          >
                            <Beaker className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {!isLoading && labOrders.length > 0 && renderPagination()}
            </div>
          ) : (
            <div className="text-center py-12">
              <Beaker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No lab orders yet</p>
              <p className="text-gray-400 text-sm mt-2">Order your first lab test to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Lab Order Form Modal */}
      <Modal
        isOpen={showOrderModal}
        title={modalMode === 'add' ? 'Order Lab Test' : 'Edit Lab Order'}
        onClose={handleOrderModalClose}
        size="large"
      >
        <LabOrderForm
          labOrder={selectedOrder}
          mode={modalMode}
          isLoading={isSubmitting}
          onSubmit={handleOrderSubmit}
          onCancel={handleOrderModalClose}
        />
      </Modal>

      {/* Lab Result Form Modal */}
      <Modal
        isOpen={showResultModal}
        title="Add Lab Result"
        onClose={handleResultModalClose}
        size="large"
      >
        <LabOrderForm
          labOrder={selectedOrder}
          mode="result"
          isLoading={isSubmitting}
          onSubmit={handleResultSubmit}
          onCancel={handleResultModalClose}
        />
      </Modal>

      {/* Lab Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        title="Lab Order Details"
        onClose={handleDetailModalClose}
        size="large"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-4">Order Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Test Name</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.test_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Test Type</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.test_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-gray-600">Priority</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.priority}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ordered Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOrder.ordered_date).toLocaleDateString('en-NG')}
                  </p>
                </div>
                {selectedOrder.expected_date && (
                  <div>
                    <p className="text-gray-600">Expected Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedOrder.expected_date).toLocaleDateString('en-NG')}
                    </p>
                  </div>
                )}
              </div>

              {selectedOrder.instructions && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-gray-600 text-sm mb-2">Instructions:</p>
                  <p className="text-gray-800 text-sm">{selectedOrder.instructions}</p>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Results</h4>
              <LabResults results={selectedOrder.results || []} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              {selectedOrder.status !== 'Completed' && (
                <button
                  onClick={() => {
                    handleDetailModalClose();
                    handleAddResult(selectedOrder.lab_order_id);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Result
                </button>
              )}
              <button
                onClick={handleDetailModalClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabPage;