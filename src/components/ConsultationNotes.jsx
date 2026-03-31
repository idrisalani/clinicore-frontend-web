import React, { useState } from 'react';
import { Edit2, Trash2, Download, Eye, EyeOff } from 'lucide-react';

/**
 * Consultation Notes Display Component
 * Shows clinical notes in professional medical record format
 */
const ConsultationNotes = ({
  consultation = null,
  isLoading = false,
  onEdit = null,
  onDelete = null,
  canEdit = true,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    chief_complaint: true,
    history: true,
    vitals: true,
    examination: true,
    diagnosis: true,
    followup: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No consultation data available</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const Section = ({ title, id, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          {expandedSections[id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {title}
        </span>
      </button>
      {expandedSections[id] && <div className="mt-4 ml-6 space-y-2 text-sm text-gray-700">{children}</div>}
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-1">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-900">{value || 'Not recorded'}</span>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Signed':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Patient Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {consultation.first_name} {consultation.last_name}
            </h2>
            <p className="text-gray-600">
              Consultation Date: {formatDate(consultation.consultation_date)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(consultation.status)}`}>
              {consultation.status}
            </span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Patient ID</p>
            <p className="font-semibold text-gray-900">#{consultation.patient_id}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-semibold text-gray-900">{consultation.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Blood Type</p>
            <p className="font-semibold text-gray-900">{consultation.blood_type || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-gray-600">Allergies</p>
            <p className="font-semibold text-red-600">{consultation.allergies || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex gap-2 justify-end">
          {onEdit && (
            <button
              onClick={() => onEdit(consultation.consultation_id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(consultation.consultation_id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}

      {/* Medical Record Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-0">
        {/* Chief Complaint */}
        <Section title="Chief Complaint" id="chief_complaint">
          <p className="text-gray-800 leading-relaxed">{consultation.chief_complaint}</p>
        </Section>

        {/* History */}
        <Section title="History of Present Illness & Past Medical History" id="history">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-700">History of Present Illness:</p>
              <p className="text-gray-700 ml-4">{consultation.history_of_present_illness || 'Not recorded'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Past Medical History:</p>
              <p className="text-gray-700 ml-4">{consultation.past_medical_history || 'Not recorded'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Current Medications:</p>
              <p className="text-gray-700 ml-4">{consultation.medications || 'Not recorded'}</p>
            </div>
            {consultation.allergies && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="font-medium text-red-800">⚠️ Allergies: {consultation.allergies}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Vital Signs */}
        <Section title="Vital Signs" id="vitals">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Blood Pressure" value={consultation.vital_signs_bp} />
            <InfoRow label="Temperature" value={consultation.vital_signs_temp && `${consultation.vital_signs_temp}°C`} />
            <InfoRow label="Pulse" value={consultation.vital_signs_pulse && `${consultation.vital_signs_pulse} bpm`} />
            <InfoRow label="Respiration" value={consultation.vital_signs_respiration && `${consultation.vital_signs_respiration}/min`} />
          </div>
        </Section>

        {/* Physical Examination */}
        <Section title="Physical Examination" id="examination">
          <p className="text-gray-800 leading-relaxed">{consultation.physical_examination || 'Not recorded'}</p>
        </Section>

        {/* Diagnosis & Treatment */}
        <Section title="Diagnosis & Treatment Plan" id="diagnosis">
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="font-medium text-gray-700">Primary Diagnosis:</p>
              <p className="text-lg font-semibold text-blue-900 mt-1">{consultation.diagnosis}</p>
              {consultation.diagnosis_icd && (
                <p className="text-sm text-gray-600 mt-1">ICD Code: {consultation.diagnosis_icd}</p>
              )}
            </div>

            <div>
              <p className="font-medium text-gray-700">Treatment Plan:</p>
              <p className="text-gray-700 ml-4 whitespace-pre-wrap">{consultation.treatment_plan}</p>
            </div>

            {consultation.medications_prescribed && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="font-medium text-gray-700">Medications Prescribed:</p>
                <p className="text-gray-700 ml-4 whitespace-pre-wrap">{consultation.medications_prescribed}</p>
              </div>
            )}

            {consultation.procedures && (
              <div>
                <p className="font-medium text-gray-700">Procedures:</p>
                <p className="text-gray-700 ml-4">{consultation.procedures}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Follow-up & Referral */}
        <Section title="Follow-up & Referral" id="followup">
          <div className="space-y-3">
            {consultation.follow_up_date && (
              <InfoRow label="Follow-up Date" value={formatDate(consultation.follow_up_date)} />
            )}
            {consultation.follow_up_notes && (
              <div>
                <p className="font-medium text-gray-700">Follow-up Notes:</p>
                <p className="text-gray-700 ml-4">{consultation.follow_up_notes}</p>
              </div>
            )}

            {consultation.referral_needed === 1 && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="font-medium text-orange-800">⚠️ Referral Needed</p>
                <p className="text-orange-700">Refer to: {consultation.referral_to || 'Not specified'}</p>
              </div>
            )}
          </div>
        </Section>

        {/* Additional Notes */}
        {consultation.notes && (
          <div className="border-t border-gray-200 pt-4">
            <p className="font-semibold text-gray-900 mb-2">Additional Notes</p>
            <p className="text-gray-700 whitespace-pre-wrap">{consultation.notes}</p>
          </div>
        )}

        {/* Footer with timestamps */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-xs text-gray-500">
          <p>Created: {formatDate(consultation.created_at)} | Last Updated: {formatDate(consultation.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationNotes;