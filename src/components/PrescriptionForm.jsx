import React, { useState, useEffect } from 'react';
import { getMedications } from '../services/pharmacyService';

/**
 * Prescription Form Component
 * For issuing and editing prescriptions
 */
const PrescriptionForm = ({
  prescription = null,
  patientId = null,
  medications = [],
  isLoading = false,
  onSubmit = null,
  onCancel = null,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    consultation_id: '',
    doctor_id: '',
    medication_id: '',
    prescription_date: new Date().toISOString().split('T')[0],
    prescribed_dosage: '',
    frequency: '',
    duration_days: '',
    quantity: '',
    refills_remaining: 0,
    instructions: '',
    special_instructions: '',
    status: 'Active',
    expiry_date: '',
    notes: '',
  });

  const [medicationsList, setMedicationsList] = useState(medications);
  const [errors, setErrors] = useState({});

  // Load medications
  useEffect(() => {
    const loadMedications = async () => {
      try {
        const response = await getMedications('', 1);
        setMedicationsList(response.medications || []);
      } catch (error) {
        console.error('Error loading medications:', error);
      }
    };

    if (!medications || medications.length === 0) {
      loadMedications();
    }
  }, [medications]);

  // Populate form when editing
  useEffect(() => {
    if (prescription && mode === 'edit') {
      setFormData({
        patient_id: prescription.patient_id || '',
        consultation_id: prescription.consultation_id || '',
        doctor_id: prescription.doctor_id || '',
        medication_id: prescription.medication_id || '',
        prescription_date: prescription.prescription_date || new Date().toISOString().split('T')[0],
        prescribed_dosage: prescription.prescribed_dosage || '',
        frequency: prescription.frequency || '',
        duration_days: prescription.duration_days || '',
        quantity: prescription.quantity || '',
        refills_remaining: prescription.refills_remaining || 0,
        instructions: prescription.instructions || '',
        special_instructions: prescription.special_instructions || '',
        status: prescription.status || 'Active',
        expiry_date: prescription.expiry_date || '',
        notes: prescription.notes || '',
      });
    }
  }, [prescription, mode]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.medication_id) {
      newErrors.medication_id = 'Medication is required';
    }
    if (!formData.prescribed_dosage.trim()) {
      newErrors.prescribed_dosage = 'Dosage is required';
    }
    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
    }
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
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

  // When medication selected, populate default values
  const handleMedicationChange = (e) => {
    const medicationId = e.target.value;
    const selectedMed = medicationsList.find(m => m.medication_id === parseInt(medicationId));

    setFormData(prev => ({
      ...prev,
      medication_id: medicationId,
      prescribed_dosage: selectedMed?.default_dosage || '',
      frequency: selectedMed?.default_frequency || '',
    }));

    if (errors.medication_id) {
      setErrors(prev => ({
        ...prev,
        medication_id: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'add' ? 'Issue Prescription' : 'Edit Prescription'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Prescribe medication for the patient
        </p>
      </div>

      {/* Prescription Details */}
      <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-900">Prescription Details</h4>

        {/* Medication Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medication *
          </label>
          <select
            name="medication_id"
            value={formData.medication_id}
            onChange={handleMedicationChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.medication_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Medication</option>
            {medicationsList.map(med => (
              <option key={med.medication_id} value={med.medication_id}>
                {med.generic_name} ({med.brand_name || 'No brand'})
              </option>
            ))}
          </select>
          {errors.medication_id && (
            <p className="text-red-500 text-xs mt-1">{errors.medication_id}</p>
          )}
        </div>

        {/* Dosage & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescribed Dosage *
            </label>
            <input
              type="text"
              name="prescribed_dosage"
              value={formData.prescribed_dosage}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.prescribed_dosage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 500mg, 1 tablet"
            />
            {errors.prescribed_dosage && (
              <p className="text-red-500 text-xs mt-1">{errors.prescribed_dosage}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <input
              type="text"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.frequency ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Twice daily, Every 6 hours"
            />
            {errors.frequency && (
              <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>
            )}
          </div>
        </div>

        {/* Duration & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration_days"
              value={formData.duration_days}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 7, 14, 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Number of units"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
            )}
          </div>
        </div>

        {/* Refills & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refills Remaining
            </label>
            <input
              type="number"
              name="refills_remaining"
              value={formData.refills_remaining}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>

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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prescription Date
            </label>
            <input
              type="date"
              name="prescription_date"
              value={formData.prescription_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="General instructions for patient"
            rows="2"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <textarea
            name="special_instructions"
            value={formData.special_instructions}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Take with food, avoid alcohol, etc."
            rows="2"
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
          {isLoading ? 'Saving...' : mode === 'add' ? 'Issue Prescription' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;