import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, Calendar, FileText,
  Pill, Activity, Heart, Thermometer, Wind, Scale,
  Droplets, AlertTriangle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getPatientById, deletePatient } from '../services/patientService';
import Modal from '../components/Modal';
import PatientForm from '../components/PatientForm';
import { updatePatient } from '../services/patientService';
import api from '../services/api.js';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient,       setPatient]       = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [appointments,  setAppointments]  = useState([]);
  const [medicalHistory,setMedicalHistory]= useState([]);
  const [medications,   setMedications]   = useState([]);
  const [vitals,        setVitals]        = useState([]);          // ← NEW
  const [showAllVitals, setShowAllVitals] = useState(false);       // ← NEW
  const [showEditModal, setShowEditModal] = useState(false);

  // ── Fetch patient + vitals ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const data = await getPatientById(id);
        setPatient(data.patient);
        setAppointments(data.appointments || []);
        setMedicalHistory(data.medical_history || []);
        setMedications(data.medications || []);
      } catch {
        alert('Failed to load patient. Redirecting...');
        navigate('/patients');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  // Fetch vitals separately (new endpoint from Phase A)
  useEffect(() => {
    if (!id) return;
    api.get(`/vitals/patient/${id}`, { params: { limit: 10 } })
      .then(res => setVitals(res.data.vitals || []))
      .catch(() => {}); // silent — vitals may not exist yet
  }, [id]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleEditSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await updatePatient(id, formData);
      setShowEditModal(false);
      const data = await getPatientById(id);
      setPatient(data.patient);
    } catch {
      alert('Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(
      `Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This cannot be undone.`
    )) return;
    try {
      setIsLoading(true);
      await deletePatient(id);
      navigate('/patients');
    } catch {
      alert('Failed to delete patient');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', { year:'numeric', month:'short', day:'numeric' });
  };

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-NG', {
      day:'numeric', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit',
    });
  };

  const bloodTypeBadge = (bt) => {
    if (!bt) return 'bg-gray-100 text-gray-800';
    if (bt.includes('O'))  return 'bg-red-100 text-red-800';
    if (bt.includes('AB')) return 'bg-purple-100 text-purple-800';
    if (bt.includes('A'))  return 'bg-blue-100 text-blue-800';
    if (bt.includes('B'))  return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // ── Vital alert helpers ───────────────────────────────────────────────────────
  const bpStatus = (sys) => {
    if (!sys) return null;
    if (sys >= 140) return { text: 'Hypertension', color: 'text-red-600' };
    if (sys >= 120) return { text: 'Elevated',     color: 'text-amber-600' };
    return { text: 'Normal', color: 'text-green-600' };
  };

  const tempStatus = (t) => {
    if (!t) return null;
    if (t >= 38)  return { text: 'Fever',        color: 'text-red-600' };
    if (t <= 36)  return { text: 'Low temp',      color: 'text-blue-600' };
    return { text: 'Afebrile', color: 'text-green-600' };
  };

  const spo2Status = (s) => {
    if (!s) return null;
    if (s < 90) return { text: 'Critical', color: 'text-red-600' };
    if (s < 95) return { text: 'Low',      color: 'text-amber-600' };
    return { text: 'Normal', color: 'text-green-600' };
  };

  const pulseStatus = (p) => {
    if (!p) return null;
    if (p > 100) return { text: 'Tachycardia', color: 'text-amber-600' };
    if (p < 60)  return { text: 'Bradycardia', color: 'text-blue-600' };
    return { text: 'Normal', color: 'text-green-600' };
  };

  // ── Loading / not found ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/patients')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4"/> Back to Patients
          </button>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">Patient not found</p>
          </div>
        </div>
      </div>
    );
  }

  const latestVitals  = vitals[0] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4"/> Back to Patients
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-gray-600">{patient.email || 'No email'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit2 className="w-4 h-4"/> Edit
              </button>
              <button onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4"/> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAge(patient.date_of_birth)} yrs</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Blood Type</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bloodTypeBadge(patient.blood_type)}`}>
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

        {/* ── VITALS SECTION (NEW) ─────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600"/>
              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
              {vitals.length > 0 && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {vitals.length} reading{vitals.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {latestVitals && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3"/>
                Latest: {formatDateTime(latestVitals.recorded_at)}
              </p>
            )}
          </div>

          {!latestVitals ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-30"/>
              <p className="text-sm font-medium text-gray-500">No vitals recorded yet</p>
              <p className="text-xs mt-1 text-gray-400">
                Vitals are recorded by the nurse after the patient checks in via the Queue.
              </p>
              <button
                onClick={() => navigate('/queue')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Activity className="w-3.5 h-3.5" />
                Go to Queue to check in patient
              </button>
            </div>
          ) : (
            <>
              {/* Latest vitals summary grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                {/* Blood Pressure */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Heart className="w-4 h-4 text-red-500"/>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Blood Pressure</p>
                  </div>
                  {latestVitals.blood_pressure_sys ? (
                    <>
                      <p className="text-2xl font-black text-gray-900">
                        {latestVitals.blood_pressure_sys}/{latestVitals.blood_pressure_dia}
                      </p>
                      <p className="text-xs text-gray-400 mb-1">mmHg</p>
                      {bpStatus(latestVitals.blood_pressure_sys) && (
                        <p className={`text-xs font-bold ${bpStatus(latestVitals.blood_pressure_sys).color}`}>
                          {bpStatus(latestVitals.blood_pressure_sys).text}
                        </p>
                      )}
                    </>
                  ) : <p className="text-lg text-gray-300 font-bold">—</p>}
                </div>

                {/* Temperature */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Thermometer className="w-4 h-4 text-orange-500"/>
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Temperature</p>
                  </div>
                  {latestVitals.temperature ? (
                    <>
                      <p className="text-2xl font-black text-gray-900">{latestVitals.temperature}</p>
                      <p className="text-xs text-gray-400 mb-1">°C</p>
                      {tempStatus(latestVitals.temperature) && (
                        <p className={`text-xs font-bold ${tempStatus(latestVitals.temperature).color}`}>
                          {tempStatus(latestVitals.temperature).text}
                        </p>
                      )}
                    </>
                  ) : <p className="text-lg text-gray-300 font-bold">—</p>}
                </div>

                {/* Pulse */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Activity className="w-4 h-4 text-purple-500"/>
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Pulse Rate</p>
                  </div>
                  {latestVitals.pulse_rate ? (
                    <>
                      <p className="text-2xl font-black text-gray-900">{latestVitals.pulse_rate}</p>
                      <p className="text-xs text-gray-400 mb-1">bpm</p>
                      {pulseStatus(latestVitals.pulse_rate) && (
                        <p className={`text-xs font-bold ${pulseStatus(latestVitals.pulse_rate).color}`}>
                          {pulseStatus(latestVitals.pulse_rate).text}
                        </p>
                      )}
                    </>
                  ) : <p className="text-lg text-gray-300 font-bold">—</p>}
                </div>

                {/* SpO2 */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wind className="w-4 h-4 text-blue-500"/>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">SpO₂</p>
                  </div>
                  {latestVitals.oxygen_saturation ? (
                    <>
                      <p className="text-2xl font-black text-gray-900">{latestVitals.oxygen_saturation}</p>
                      <p className="text-xs text-gray-400 mb-1">%</p>
                      {spo2Status(latestVitals.oxygen_saturation) && (
                        <p className={`text-xs font-bold ${spo2Status(latestVitals.oxygen_saturation).color}`}>
                          {spo2Status(latestVitals.oxygen_saturation).text}
                        </p>
                      )}
                    </>
                  ) : <p className="text-lg text-gray-300 font-bold">—</p>}
                </div>
              </div>

              {/* Secondary vitals row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Weight',       value: latestVitals.weight,          unit: 'kg',      icon: Scale       },
                  { label: 'BMI',          value: latestVitals.bmi,             unit: '',        icon: Scale       },
                  { label: 'Resp. Rate',   value: latestVitals.respiratory_rate,unit: '/min',    icon: Wind        },
                  { label: 'Blood Glucose',value: latestVitals.blood_glucose,   unit: 'mmol/L',  icon: Droplets    },
                ].map(({ label, value, unit, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-black ${value ? 'text-gray-900' : 'text-gray-200'}`}>
                      {value ? `${value}${unit ? ' ' + unit : ''}` : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pain score + general appearance */}
              {(latestVitals.pain_score !== null || latestVitals.general_appearance) && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {latestVitals.pain_score !== null && latestVitals.pain_score !== undefined && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Pain Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-gray-900">{latestVitals.pain_score}</p>
                        <p className="text-xs text-slate-400">/10</p>
                        {latestVitals.pain_score >= 7 && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                            <AlertTriangle className="w-3 h-3"/> Severe
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {latestVitals.general_appearance && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">General Appearance</p>
                      <p className="text-sm font-semibold text-gray-800">{latestVitals.general_appearance}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Nurse notes */}
              {latestVitals.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Nurse Notes</p>
                  <p className="text-sm text-gray-700">{latestVitals.notes}</p>
                </div>
              )}

              {/* Vitals history — collapsible */}
              {vitals.length > 1 && (
                <>
                  <button
                    onClick={() => setShowAllVitals(v => !v)}
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2">
                    {showAllVitals ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                    {showAllVitals ? 'Hide' : 'Show'} vitals history ({vitals.length - 1} older reading{vitals.length > 2 ? 's' : ''})
                  </button>

                  {showAllVitals && (
                    <div className="mt-3 space-y-2">
                      {vitals.slice(1).map((v, i) => (
                        <div key={v.vital_id || i}
                          className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                          <div className="flex items-center gap-4 text-slate-600">
                            {v.blood_pressure_sys && <span>BP: <strong>{v.blood_pressure_sys}/{v.blood_pressure_dia}</strong></span>}
                            {v.temperature        && <span>T: <strong>{v.temperature}°C</strong></span>}
                            {v.pulse_rate         && <span>P: <strong>{v.pulse_rate} bpm</strong></span>}
                            {v.oxygen_saturation  && <span>SpO₂: <strong>{v.oxygen_saturation}%</strong></span>}
                            {v.weight             && <span>W: <strong>{v.weight} kg</strong></span>}
                          </div>
                          <p className="text-xs text-slate-400 flex-shrink-0 ml-4">
                            {formatDateTime(v.recorded_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {/* ── END VITALS SECTION ──────────────────────────────────────────── */}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
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
                  <p className="text-gray-900 font-medium">{patient.address || 'N/A'}</p>
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

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  <p className="text-gray-900 font-medium">{patient.allergies || 'None documented'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
                  <p className="text-gray-900 font-medium">{patient.chronic_conditions || 'None documented'}</p>
                </div>
              </div>
            </div>

            {/* Insurance */}
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

            {/* Appointments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600"/>
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
                        }`}>{apt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No upcoming appointments</p>
              )}
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-600"/>
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
                          <p className="text-gray-600">Complaint: <span className="text-gray-900 font-medium">{history.chief_complaint}</span></p>
                        )}
                        {history.diagnosis && (
                          <p className="text-gray-600">Diagnosis: <span className="text-gray-900 font-medium">{history.diagnosis}</span></p>
                        )}
                        {history.treatment_plan && (
                          <p className="text-gray-600">Treatment: <span className="text-gray-900 font-medium">{history.treatment_plan}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medical history recorded</p>
              )}
            </div>

            {/* Medications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-red-600"/>
                <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
              </div>
              {medications.filter(m => m.is_active).length > 0 ? (
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
      <Modal isOpen={showEditModal} title="Edit Patient"
        onClose={() => setShowEditModal(false)} size="large">
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