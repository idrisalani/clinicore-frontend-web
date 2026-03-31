import React, { useState, useEffect } from 'react';

/**
 * Invoice Form Component
 * For creating and editing invoices
 */
const InvoiceForm = ({
  invoice = null,
  patientId = null,
  isLoading = false,
  onSubmit = null,
  onCancel = null,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    consultation_id: '',
    doctor_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: '',
    tax_percentage: 0,
    tax_amount: 0,
    discount_percentage: 0,
    discount_amount: 0,
    total_amount: '',
    status: 'Draft',
    notes: '',
    payment_terms: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (invoice && mode === 'edit') {
      setFormData({
        patient_id: invoice.patient_id || '',
        consultation_id: invoice.consultation_id || '',
        doctor_id: invoice.doctor_id || '',
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        subtotal: invoice.subtotal || '',
        tax_percentage: invoice.tax_percentage || 0,
        tax_amount: invoice.tax_amount || 0,
        discount_percentage: invoice.discount_percentage || 0,
        discount_amount: invoice.discount_amount || 0,
        total_amount: invoice.total_amount || '',
        status: invoice.status || 'Draft',
        notes: invoice.notes || '',
        payment_terms: invoice.payment_terms || '',
      });
    }
  }, [invoice, mode]);

  // Calculate totals when amounts change
  useEffect(() => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const taxAmount = (subtotal * (formData.tax_percentage / 100)) || 0;
    const discountAmount = (subtotal * (formData.discount_percentage / 100)) || 0;
    const total = subtotal + taxAmount - discountAmount;

    setFormData(prev => ({
      ...prev,
      tax_amount: Math.round(taxAmount * 100) / 100,
      discount_amount: Math.round(discountAmount * 100) / 100,
      total_amount: Math.round(total * 100) / 100,
    }));
  }, [formData.subtotal, formData.tax_percentage, formData.discount_percentage]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.invoice_date) {
      newErrors.invoice_date = 'Invoice date is required';
    }
    if (!formData.subtotal || parseFloat(formData.subtotal) <= 0) {
      newErrors.subtotal = 'Subtotal must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('percentage') || name.includes('_amount') || name === 'subtotal' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form submitted:', formData);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const formatCurrency = (value) => {
    return `₦${parseFloat(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'add' ? 'Create Invoice' : 'Edit Invoice'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Generate billing invoice in Nigerian Naira (₦)
        </p>
      </div>

      {/* Invoice Details */}
      <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-900">Invoice Details</h4>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date *
            </label>
            <input
              type="date"
              name="invoice_date"
              value={formData.invoice_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.invoice_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.invoice_date && (
              <p className="text-red-500 text-xs mt-1">{errors.invoice_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Draft">Draft</option>
            <option value="Issued">Issued</option>
            <option value="Sent">Sent</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Financial Details */}
      <div className="space-y-4 border rounded-lg p-4 bg-green-50">
        <h4 className="font-semibold text-gray-900">Financial Details (Nigerian Naira ₦)</h4>

        {/* Subtotal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtotal *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-600 font-semibold">₦</span>
            <input
              type="number"
              name="subtotal"
              value={formData.subtotal}
              onChange={handleChange}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.subtotal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          {errors.subtotal && (
            <p className="text-red-500 text-xs mt-1">{errors.subtotal}</p>
          )}
        </div>

        {/* Tax */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax %
            </label>
            <input
              type="number"
              name="tax_percentage"
              value={formData.tax_percentage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Amount
            </label>
            <input
              type="text"
              value={formatCurrency(formData.tax_amount)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>

        {/* Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount %
            </label>
            <input
              type="number"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Amount
            </label>
            <input
              type="text"
              value={formatCurrency(formData.discount_amount)}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>

        {/* Total */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(formData.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms
          </label>
          <input
            type="text"
            name="payment_terms"
            value={formData.payment_terms}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="e.g., Net 30 days, Due on receipt"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Additional notes or terms"
            rows="3"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : mode === 'add' ? 'Create Invoice' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;