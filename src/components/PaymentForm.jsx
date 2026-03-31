import React, { useState } from 'react';

/**
 * Payment Form Component
 * For recording payments against invoices
 */
const PaymentForm = ({
  invoice = null,
  isLoading = false,
  onSubmit = null,
  onCancel = null,
}) => {
  const [formData, setFormData] = useState({
    invoice_id: invoice?.invoice_id || '',
    patient_id: invoice?.patient_id || '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    payment_method: 'Cash',
    reference_number: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Card',
    'Cheque',
    'Mobile Money',
    'Other',
  ];

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.invoice_id) {
      newErrors.invoice_id = 'Invoice is required';
    }
    if (!formData.amount_paid || parseFloat(formData.amount_paid) <= 0) {
      newErrors.amount_paid = 'Amount must be greater than 0';
    }
    if (!formData.payment_date) {
      newErrors.payment_date = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_paid' ? parseFloat(value) || 0 : value,
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

  const remainingAmount = invoice 
    ? Math.max(0, (invoice.total_amount || 0) - (invoice.amount_paid || 0))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
        <p className="text-sm text-gray-600 mt-1">
          Record payment received for invoice
        </p>
      </div>

      {/* Invoice Summary */}
      {invoice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Invoice:</span>
            <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Invoice Total:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Already Paid:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(invoice.amount_paid || 0)}</span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between">
            <span className="text-gray-700 font-semibold">Remaining:</span>
            <span className="font-bold text-blue-600 text-lg">{formatCurrency(remainingAmount)}</span>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="space-y-4 border rounded-lg p-4 bg-green-50">
        <h4 className="font-semibold text-gray-900">Payment Details</h4>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date *
          </label>
          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.payment_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.payment_date && (
            <p className="text-red-500 text-xs mt-1">{errors.payment_date}</p>
          )}
        </div>

        {/* Amount Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Paid *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-600 font-semibold">₦</span>
            <input
              type="number"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.amount_paid ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              step="0.01"
              max={remainingAmount}
            />
          </div>
          {errors.amount_paid && (
            <p className="text-red-500 text-xs mt-1">{errors.amount_paid}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Max: {formatCurrency(remainingAmount)}
          </p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="e.g., Cheque #, Transaction ID"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Additional payment notes"
            rows="2"
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;