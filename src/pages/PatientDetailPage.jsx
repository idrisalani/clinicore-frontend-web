import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, FileText, Pill } from 'lucide-react';
import { getPatientById, deletePatient } from '../services/patientService';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import { updatePatient } from '../services/patientService';

/**
 * Patient Detail Page
 * Shows full patient profile with medical history, appointments, medications
 */
const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [medications, setMedications] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        console.log(`👤 Fetching patient ${id}...`);
        const data = await getPatientById(id);
        setPatient(data.patient);
        setAppointments(data.appointments || []);
        setMedicalHistory(data.medical_history || []);
        setMedications(data.medications || []);
        console.log('✅ Patient loaded:', data.patient.first_name);
      } catch (error) {
        console.error('❌ Error fetching patient:', error);
        alert('Failed to load patient. Redirecting...');
        navigate('/patients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      console.log('✏️ Updating patient...');
      await updatePatient(id, formData);
      console.log('✅ Patient updated');
      alert('Patient updated successfully!');
      setShowEditModal(false);
      
      // Refresh patient data
      const data = await getPatientById(id);
      setPatient(data.patient);
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      alert('Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm(
      `Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This cannot be undone.`
    )) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Deleting patient...');
      await deletePatient(id);
      console.log('✅ Patient deleted');
      alert('Patient deleted successfully');
      navigate('/patients');
    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      alert('Failed to delete patient');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patients
          </button>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Patient not found</p>
          </div>
        </div>
      </div>
    );
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBloodTypeBadgeColor = (bloodType) => {
    if (!bloodType) return 'bg-gray-100 text-gray-800';
    if (bloodType.includes('O')) return 'bg-red-100 text-red-800';
    if (bloodType.includes('A')) return 'bg-blue-100 text-blue-800';
    if (bloodType.includes('B')) return 'bg-yellow-100 text-yellow-800';
    if (bloodType.includes('AB')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-gray-600">{patient.email || 'No email'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAge(patient.date_of_birth)} yrs</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Blood Type</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBloodTypeBadgeColor(patient.blood_type)}`}>
                {patient.blood_type || 'Unknown'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Gender</p>
              <p className="text-lg font-semibold text-gray-900">{patient.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Registered</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(patient.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal & Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{patient.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-gray-900 font-medium">
                    {patient.address || 'N/A'}
                  </p>
                </div>
                {patient.city && (
                  <div>
                    <p className="text-sm text-gray-600">City, State</p>
                    <p className="text-gray-900 font-medium">
                      {patient.city}{patient.state ? `, ${patient.state}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergency_contact_name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900 font-medium">{patient.emergency_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900 font-medium">{patient.emergency_contact_phone}</p>
                  </div>
                  {patient.emergency_contact_relationship && (
                    <div>
                      <p className="text-sm text-gray-600">Relationship</p>
                      <p className="text-gray-900 font-medium">{patient.emergency_contact_relationship}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Medical Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  <p className="text-gray-900 font-medium">
                    {patient.allergies || 'None documented'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
                  <p className="text-gray-900 font-medium">
                    {patient.chronic_conditions || 'None documented'}
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            {patient.insurance_provider && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="text-gray-900 font-medium">{patient.insurance_provider}</p>
                  </div>
                  {patient.insurance_policy_number && (
                    <div>
                      <p className="text-sm text-gray-600">Policy Number</p>
                      <p className="text-gray-900 font-medium">{patient.insurance_policy_number}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Appointments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              </div>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.appointment_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{apt.reason_for_visit}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(apt.appointment_date)} at {apt.appointment_time}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          apt.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No upcoming appointments</p>
              )}
            </div>

            {/* Medical History Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              </div>
              {medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map(history => (
                    <div key={history.history_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900">{history.visit_type}</p>
                        <p className="text-sm text-gray-600">{formatDate(history.visit_date)}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        {history.chief_complaint && (
                          <div>
                            <p className="text-gray-600">Chief Complaint: <span className="text-gray-900 font-medium">{history.chief_complaint}</span></p>
                          </div>
                        )}
                        {history.diagnosis && (
                          <div>
                            <p className="text-gray-600">Diagnosis: <span className="text-gray-900 font-medium">{history.diagnosis}</span></p>
                          </div>
                        )}
                        {history.treatment_plan && (
                          <div>
                            <p className="text-gray-600">Treatment: <span className="text-gray-900 font-medium">{history.treatment_plan}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medical history recorded</p>
              )}
            </div>

            {/* Medications Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
              </div>
              {medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.filter(m => m.is_active).map(med => (
                    <div key={med.medication_id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{med.medication_name}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <p>Dosage: <span className="text-gray-900">{med.dosage}</span></p>
                        <p>Frequency: <span className="text-gray-900">{med.frequency}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No active medications</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        title="Edit Patient"
        onClose={() => setShowEditModal(false)}
        size="large"
      >
        <PatientForm
          patient={patient}
          mode="edit"
          isLoading={isSubmitting}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientDetailPage;