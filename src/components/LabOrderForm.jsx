import React, { useState, useEffect } from 'react';

/**
 * Lab Order Form Component
 * For ordering lab tests and adding results
 */
const LabOrderForm = ({
  labOrder = null,
  patientId = null,
  isLoading = false,
  onSubmit = null,
  onCancel = null,
  mode = 'add', // 'add' or 'edit' or 'result'
}) => {
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    consultation_id: '',
    doctor_id: '',
    test_type: '',
    test_code: '',
    test_name: '',
    specimen_type: '',
    priority: 'Routine',
    instructions: '',
    ordered_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    status: 'Ordered',
    notes: '',
  });

  const [resultData, setResultData] = useState({
    result_value: '',
    unit: '',
    reference_range: '',
    result_status: 'Pending',
    interpretation: '',
    test_date: new Date().toISOString().split('T')[0],
    completion_date: '',
    performed_by: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (labOrder && (mode === 'edit' || mode === 'result')) {
      setFormData({
        patient_id: labOrder.patient_id || '',
        consultation_id: labOrder.consultation_id || '',
        doctor_id: labOrder.doctor_id || '',
        test_type: labOrder.test_type || '',
        test_code: labOrder.test_code || '',
        test_name: labOrder.test_name || '',
        specimen_type: labOrder.specimen_type || '',
        priority: labOrder.priority || 'Routine',
        instructions: labOrder.instructions || '',
        ordered_date: labOrder.ordered_date || new Date().toISOString().split('T')[0],
        expected_date: labOrder.expected_date || '',
        status: labOrder.status || 'Ordered',
        notes: labOrder.notes || '',
      });
    }
  }, [labOrder, mode]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (mode === 'result') {
      if (!resultData.result_value.trim()) {
        newErrors.result_value = 'Result value is required';
      }
    } else {
      if (!formData.patient_id) {
        newErrors.patient_id = 'Patient is required';
      }
      if (!formData.test_type.trim()) {
        newErrors.test_type = 'Test type is required';
      }
      if (!formData.test_name.trim()) {
        newErrors.test_name = 'Test name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setResultData(prev => ({
      ...prev,
      [name]: value,
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

    const dataToSubmit = mode === 'result' ? resultData : formData;
    console.log('✅ Form submitted:', dataToSubmit);
    if (onSubmit) {
      onSubmit(dataToSubmit);
    }
  };

  // Common test types
  const commonTests = [
    { value: 'CBC', label: 'Complete Blood Count' },
    { value: 'CMP', label: 'Comprehensive Metabolic Panel' },
    { value: 'Lipid', label: 'Lipid Panel' },
    { value: 'TSH', label: 'Thyroid Stimulating Hormone' },
    { value: 'Glucose', label: 'Fasting Glucose' },
    { value: 'HbA1c', label: 'Hemoglobin A1c' },
    { value: 'UA', label: 'Urinalysis' },
    { value: 'PT/INR', label: 'Prothrombin Time' },
    { value: 'ECG', label: 'Electrocardiogram' },
    { value: 'Ultrasound', label: 'Ultrasound' },
    { value: 'Other', label: 'Other' },
  ];

  if (mode === 'result') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Lab Result</h3>
          <p className="text-sm text-gray-600 mt-1">Record the lab test results</p>
        </div>

        {/* Result Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Result Value *
          </label>
          <input
            type="text"
            name="result_value"
            value={resultData.result_value}
            onChange={handleResultChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.result_value ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 120, 98.6, positive"
          />
          {errors.result_value && (
            <p className="text-red-500 text-xs mt-1">{errors.result_value}</p>
          )}
        </div>

        {/* Unit & Reference Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              name="unit"
              value={resultData.unit}
              onChange={handleResultChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., mg/dL, mmol/L"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Range
            </label>
            <input
              type="text"
              name="reference_range"
              value={resultData.reference_range}
              onChange={handleResultChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 70-100"
            />
          </div>
        </div>

        {/* Result Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Result Status
          </label>
          <select
            name="result_status"
            value={resultData.result_status}
            onChange={handleResultChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Normal">Normal</option>
            <option value="Abnormal">Abnormal</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Interpretation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interpretation
          </label>
          <textarea
            name="interpretation"
            value={resultData.interpretation}
            onChange={handleResultChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Clinical interpretation of results"
            rows="2"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Date
            </label>
            <input
              type="date"
              name="test_date"
              value={resultData.test_date}
              onChange={handleResultChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Date
            </label>
            <input
              type="date"
              name="completion_date"
              value={resultData.completion_date}
              onChange={handleResultChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Performed By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performed By (Lab Technician)
          </label>
          <input
            type="text"
            name="performed_by"
            value={resultData.performed_by}
            onChange={handleResultChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Name of lab technician"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={resultData.notes}
            onChange={handleResultChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Additional notes"
            rows="2"
          />
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
            {isLoading ? 'Saving...' : 'Add Result'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'add' ? 'Order Lab Test' : 'Edit Lab Order'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'add' ? 'Create a new lab order' : 'Update lab order details'}
        </p>
      </div>

      {/* Order Details */}
      <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-900">Order Details</h4>

        {/* Test Type & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Type *
            </label>
            <select
              name="test_type"
              value={formData.test_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.test_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Test Type</option>
              {commonTests.map(test => (
                <option key={test.value} value={test.value}>
                  {test.label}
                </option>
              ))}
            </select>
            {errors.test_type && (
              <p className="text-red-500 text-xs mt-1">{errors.test_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name *
            </label>
            <input
              type="text"
              name="test_name"
              value={formData.test_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.test_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Test name"
            />
            {errors.test_name && (
              <p className="text-red-500 text-xs mt-1">{errors.test_name}</p>
            )}
          </div>
        </div>

        {/* Test Code & Specimen Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Code (Optional)
            </label>
            <input
              type="text"
              name="test_code"
              value={formData.test_code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., LAB-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specimen Type
            </label>
            <input
              type="text"
              name="specimen_type"
              value={formData.specimen_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., Blood, Urine"
            />
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Stat">Stat (Emergency)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Ordered">Ordered</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions (Fasting, etc.)
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Special instructions for the test"
            rows="2"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordered Date
            </label>
            <input
              type="date"
              name="ordered_date"
              value={formData.ordered_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Date
            </label>
            <input
              type="date"
              name="expected_date"
              value={formData.expected_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Additional notes"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : mode === 'add' ? 'Create Order' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default LabOrderForm;