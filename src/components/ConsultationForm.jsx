import React, { useState, useEffect } from 'react';

/**
 * Consultation Form Component
 * Handles recording clinical notes and consultation details
 */
const ConsultationForm = ({
  consultation = null,
  patientId = null,
  appointmentId = null,
  isLoading = false,
  onSubmit = null,
  onCancel = null,
  mode = 'add', // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    appointment_id: appointmentId || '',
    patient_id: patientId || '',
    doctor_id: '',
    consultation_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    history_of_present_illness: '',
    past_medical_history: '',
    medications: '',
    allergies: '',
    vital_signs_bp: '',
    vital_signs_temp: '',
    vital_signs_pulse: '',
    vital_signs_respiration: '',
    physical_examination: '',
    diagnosis: '',
    diagnosis_icd: '',
    treatment_plan: '',
    medications_prescribed: '',
    procedures: '',
    follow_up_date: '',
    follow_up_notes: '',
    referral_needed: 0,
    referral_to: '',
    notes: '',
    status: 'Draft',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (consultation && mode === 'edit') {
      setFormData({
        appointment_id: consultation.appointment_id || '',
        patient_id: consultation.patient_id || '',
        doctor_id: consultation.doctor_id || '',
        consultation_date: consultation.consultation_date || new Date().toISOString().split('T')[0],
        chief_complaint: consultation.chief_complaint || '',
        history_of_present_illness: consultation.history_of_present_illness || '',
        past_medical_history: consultation.past_medical_history || '',
        medications: consultation.medications || '',
        allergies: consultation.allergies || '',
        vital_signs_bp: consultation.vital_signs_bp || '',
        vital_signs_temp: consultation.vital_signs_temp || '',
        vital_signs_pulse: consultation.vital_signs_pulse || '',
        vital_signs_respiration: consultation.vital_signs_respiration || '',
        physical_examination: consultation.physical_examination || '',
        diagnosis: consultation.diagnosis || '',
        diagnosis_icd: consultation.diagnosis_icd || '',
        treatment_plan: consultation.treatment_plan || '',
        medications_prescribed: consultation.medications_prescribed || '',
        procedures: consultation.procedures || '',
        follow_up_date: consultation.follow_up_date || '',
        follow_up_notes: consultation.follow_up_notes || '',
        referral_needed: consultation.referral_needed || 0,
        referral_to: consultation.referral_to || '',
        notes: consultation.notes || '',
        status: consultation.status || 'Draft',
      });
    }
  }, [consultation, mode]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Patient is required';
    }
    if (!formData.consultation_date) {
      newErrors.consultation_date = 'Consultation date is required';
    }
    if (!formData.chief_complaint.trim()) {
      newErrors.chief_complaint = 'Chief complaint is required';
    }
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    if (!formData.treatment_plan.trim()) {
      newErrors.treatment_plan = 'Treatment plan is required';
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
          {mode === 'add' ? 'Record Consultation' : 'Edit Consultation'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Document clinical notes and treatment details
        </p>
      </div>

      {/* Chief Complaint & HPI Section */}
      <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-gray-900">Chief Complaint & History</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chief Complaint *
          </label>
          <textarea
            name="chief_complaint"
            value={formData.chief_complaint}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.chief_complaint ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Main reason for consultation"
            rows="2"
          />
          {errors.chief_complaint && (
            <p className="text-red-500 text-xs mt-1">{errors.chief_complaint}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            History of Present Illness
          </label>
          <textarea
            name="history_of_present_illness"
            value={formData.history_of_present_illness}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Detailed history of current illness"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Past Medical History
            </label>
            <textarea
              name="past_medical_history"
              value={formData.past_medical_history}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Previous illnesses, surgeries"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Medications
            </label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Current medications and dosages"
              rows="2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allergies
          </label>
          <input
            type="text"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Known allergies"
          />
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className="space-y-4 border rounded-lg p-4 bg-green-50">
        <h4 className="font-semibold text-gray-900">Vital Signs</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Pressure (mmHg)
            </label>
            <input
              type="text"
              name="vital_signs_bp"
              value={formData.vital_signs_bp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 120/80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="text"
              name="vital_signs_temp"
              value={formData.vital_signs_temp}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 37.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pulse (bpm)
            </label>
            <input
              type="text"
              name="vital_signs_pulse"
              value={formData.vital_signs_pulse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 72"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Respiration (breaths/min)
            </label>
            <input
              type="text"
              name="vital_signs_respiration"
              value={formData.vital_signs_respiration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., 16"
            />
          </div>
        </div>
      </div>

      {/* Physical Examination */}
      <div className="space-y-4 border rounded-lg p-4 bg-yellow-50">
        <h4 className="font-semibold text-gray-900">Physical Examination</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Findings
          </label>
          <textarea
            name="physical_examination"
            value={formData.physical_examination}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Physical examination findings"
            rows="3"
          />
        </div>
      </div>

      {/* Diagnosis & Treatment Section */}
      <div className="space-y-4 border rounded-lg p-4 bg-red-50">
        <h4 className="font-semibold text-gray-900">Diagnosis & Treatment</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.diagnosis ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Primary diagnosis"
            />
            {errors.diagnosis && (
              <p className="text-red-500 text-xs mt-1">{errors.diagnosis}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ICD Code (Optional)
            </label>
            <input
              type="text"
              name="diagnosis_icd"
              value={formData.diagnosis_icd}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="e.g., J45.901"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment Plan *
          </label>
          <textarea
            name="treatment_plan"
            value={formData.treatment_plan}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
              errors.treatment_plan ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Recommended treatment plan"
            rows="3"
          />
          {errors.treatment_plan && (
            <p className="text-red-500 text-xs mt-1">{errors.treatment_plan}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medications Prescribed
          </label>
          <textarea
            name="medications_prescribed"
            value={formData.medications_prescribed}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="List of prescribed medications"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Procedures (if any)
          </label>
          <textarea
            name="procedures"
            value={formData.procedures}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Any procedures performed or recommended"
            rows="2"
          />
        </div>
      </div>

      {/* Follow-up & Referral Section */}
      <div className="space-y-4 border rounded-lg p-4 bg-purple-50">
        <h4 className="font-semibold text-gray-900">Follow-up & Referral</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              name="follow_up_date"
              value={formData.follow_up_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Notes
            </label>
            <input
              type="text"
              name="follow_up_notes"
              value={formData.follow_up_notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Follow-up instructions"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="referral_needed"
            checked={formData.referral_needed === 1}
            onChange={handleChange}
            className="w-4 h-4 border border-gray-300 rounded text-blue-600"
            id="referral_needed"
          />
          <label htmlFor="referral_needed" className="text-sm text-gray-700">
            Referral needed
          </label>
        </div>

        {formData.referral_needed === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referral To (Specialist)
            </label>
            <input
              type="text"
              name="referral_to"
              value={formData.referral_to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Specialist type, e.g., Cardiology"
            />
          </div>
        )}
      </div>

      {/* General Notes & Status */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Any additional notes"
            rows="2"
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
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
            <option value="Signed">Signed</option>
            <option value="Reviewed">Reviewed</option>
          </select>
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
          {isLoading ? 'Saving...' : mode === 'add' ? 'Record Consultation' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ConsultationForm;