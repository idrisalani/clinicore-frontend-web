import React, { useState, useEffect } from 'react';
import { getDoctorAvailability } from '../services/appointmentService';

/**
 * Appointment Form Component
 * Handles both Add and Edit modes for appointments
 */
const AppointmentForm = ({
  appointment = null,
  patientId = null,
  isLoading = false,
  onSubmit = null,
  onCancel = null,
  mode = 'add', // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    reason_for_visit: '',
    notes: '',
    status: 'Scheduled',
    is_confirmed: 0,
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (appointment && mode === 'edit') {
      setFormData({
        patient_id: appointment.patient_id || '',
        doctor_id: appointment.doctor_id || '',
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        duration_minutes: appointment.duration_minutes || 30,
        reason_for_visit: appointment.reason_for_visit || '',
        notes: appointment.notes || '',
        status: appointment.status || 'Scheduled',
        is_confirmed: appointment.is_confirmed || 0,
      });
    }
  }, [appointment, mode]);

  // Load available slots when date/doctor changes
  useEffect(() => {
    if (formData.appointment_date && formData.doctor_id && mode === 'add') {
      loadAvailableSlots();
    }
  }, [formData.appointment_date, formData.doctor_id, mode]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      console.log('📅 Loading available slots...');
      const data = await getDoctorAvailability(formData.doctor_id, formData.appointment_date);
      setAvailableSlots(data.available_slots || []);
      console.log(`✅ Found ${data.available_slots.length} available slots`);
    } catch (error) {
      console.error('❌ Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Appointment date is required';
    }
    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Appointment time is required';
    }
    if (!formData.reason_for_visit.trim()) {
      newErrors.reason_for_visit = 'Reason for visit is required';
    }

    // Check if date is not in the past
    const selectedDate = new Date(formData.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today && mode === 'add') {
      newErrors.appointment_date = 'Cannot schedule appointments in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value,
    }));
    // Clear error for this field
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {mode === 'add' ? 'Schedule New Appointment' : 'Edit Appointment'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'add' 
            ? 'Fill in the appointment details'
            : 'Update appointment information'}
        </p>
      </div>

      {/* Appointment Details */}
      <div className="space-y-4">
        {/* Patient ID (if not pre-filled) */}
        {!patientId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID *
            </label>
            <input
              type="number"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.patient_id ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Patient ID"
            />
            {errors.patient_id && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
            )}
          </div>
        )}

        {/* Doctor ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor ID
          </label>
          <input
            type="number"
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Doctor ID (optional)"
          />
        </div>

        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date *
          </label>
          <input
            type="date"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={handleChange}
            min={mode === 'add' ? new Date().toISOString().split('T')[0] : undefined}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.appointment_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.appointment_date && (
            <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>
          )}
        </div>

        {/* Appointment Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Time *
          </label>
          {loadingSlots ? (
            <p className="text-sm text-gray-500">Loading available slots...</p>
          ) : (
            <select
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.appointment_time ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select time</option>
              {mode === 'add' && availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))
              ) : (
                <option value={formData.appointment_time}>{formData.appointment_time}</option>
              )}
            </select>
          )}
          {errors.appointment_time && (
            <p className="text-red-500 text-xs mt-1">{errors.appointment_time}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <select
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>

        {/* Reason for Visit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit *
          </label>
          <input
            type="text"
            name="reason_for_visit"
            value={formData.reason_for_visit}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.reason_for_visit ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., General Checkup, Follow-up"
          />
          {errors.reason_for_visit && (
            <p className="text-red-500 text-xs mt-1">{errors.reason_for_visit}</p>
          )}
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
            placeholder="Additional notes (optional)"
            rows="3"
          />
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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-Show">No-Show</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
        </div>

        {/* Confirmed Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_confirmed"
            checked={formData.is_confirmed === 1}
            onChange={handleChange}
            className="w-4 h-4 border border-gray-300 rounded text-blue-600"
            id="is_confirmed"
          />
          <label htmlFor="is_confirmed" className="ml-2 text-sm text-gray-700">
            Appointment confirmed
          </label>
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
          {isLoading ? 'Saving...' : mode === 'add' ? 'Schedule Appointment' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;