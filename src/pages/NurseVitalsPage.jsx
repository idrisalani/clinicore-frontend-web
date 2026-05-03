// ============================================
// NurseVitalsPage.jsx
// File: frontend-web/src/pages/NurseVitalsPage.jsx
// Route: /nurse/vitals/:visitId
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity, User, ArrowLeft, Loader,
  CheckCircle2, AlertTriangle, Heart,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import api from '../services/api.js';

const inp = (err = false) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all
   ${err ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'}`;

const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none appearance-none cursor-pointer`;

const F = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

// Inline alert for abnormal readings
const VitalAlert = ({ value, low, high, unit, lowLabel, highLabel, normalLabel }) => {
  if (!value) return null;
  const v = parseFloat(value);
  const isHigh = high && v >= high;
  const isLow  = low  && v <= low;
  if (!isHigh && !isLow) return (
    <p className="text-xs text-green-600 font-semibold mt-1">✓ {normalLabel || 'Normal'}</p>
  );
  return (
    <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${isHigh ? 'text-red-600' : 'text-blue-600'}`}>
      <AlertTriangle className="w-3 h-3"/>
      {isHigh ? highLabel : lowLabel} ({v} {unit})
    </p>
  );
};

export default function NurseVitalsPage() {
  const { visitId } = useParams();
  const navigate    = useNavigate();
  const { showToast, Toast } = useToast();

  const [visit,    setVisit]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const [form, setForm] = useState({
    blood_pressure_sys: '', blood_pressure_dia: '',
    pulse_rate: '', temperature: '', respiratory_rate: '',
    oxygen_saturation: '', weight: '', height: '',
    blood_glucose: '', pain_score: 0,
    general_appearance: '', notes: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // BMI
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1) : null;
  const bmiLabel = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;
  const bmiColor = bmi
    ? bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-amber-600' : 'text-red-600'
    : '';

  const fetchVisit = useCallback(async () => {
    try {
      const res = await api.get(`/visits/${visitId}`);
      setVisit(res.data.visit);
      // Pre-fill if vitals already recorded
      if (res.data.vitals) {
        const v = res.data.vitals;
        setForm(f => ({
          ...f,
          blood_pressure_sys: v.blood_pressure_sys || '',
          blood_pressure_dia: v.blood_pressure_dia || '',
          pulse_rate:         v.pulse_rate         || '',
          temperature:        v.temperature        || '',
          respiratory_rate:   v.respiratory_rate   || '',
          oxygen_saturation:  v.oxygen_saturation  || '',
          weight:             v.weight             || '',
          height:             v.height             || '',
          blood_glucose:      v.blood_glucose      || '',
          pain_score:         v.pain_score         || 0,
          general_appearance: v.general_appearance || '',
          notes:              v.notes              || '',
        }));
      }
    } catch (err) {
      showToast('Failed to load visit', 'error');
    } finally {
      setLoading(false);
    }
  }, [visitId, showToast]);

  useEffect(() => { fetchVisit(); }, [fetchVisit]);

  // Advance visit to "With Nurse" when page loads
  useEffect(() => {
    if (visit && visit.status === 'Waiting') {
      api.put(`/visits/${visitId}/status`, { status: 'With Nurse' }).catch(() => {});
    }
  }, [visit, visitId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/vitals', {
        visit_id:   parseInt(visitId),
        patient_id: visit.patient_id,
        ...form,
      });
      // Status advances to "With Doctor" automatically in vitalsController
      setSaved(true);
      showToast('Vitals recorded — patient referred to doctor');
      setTimeout(() => navigate('/queue'), 1800);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to save vitals', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }}/>
    </div>
  );

  const patientName = visit ? `${visit.first_name || ''} ${visit.last_name || ''}`.trim() : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast/>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/queue')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-500"/>
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800">Record Vital Signs</h1>
              {visit && (
                <p className="text-sm text-slate-400">
                  {patientName} · Visit #{visitId} · {visit.chief_complaint}
                </p>
              )}
            </div>
          </div>
          {visit && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              <User className="w-4 h-4 text-blue-600"/>
              <div>
                <p className="text-xs text-blue-500 font-semibold">{patientName}</p>
                <p className="text-xs text-blue-400">{visit.visit_type} · {visit.triage_priority}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-6 space-y-6">

        {saved && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-green-600"/>
            <p className="text-sm font-semibold text-green-700">Vitals saved — redirecting to queue…</p>
          </div>
        )}

        {/* Blood pressure */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500"/> Cardiovascular
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <F label="Blood Pressure (mmHg)">
              <div className="flex gap-2 items-center">
                <input type="number" value={form.blood_pressure_sys}
                  onChange={e => set('blood_pressure_sys', e.target.value)}
                  className={inp()} placeholder="Systolic" min="60" max="250"/>
                <span className="text-slate-400 font-bold text-sm">/</span>
                <input type="number" value={form.blood_pressure_dia}
                  onChange={e => set('blood_pressure_dia', e.target.value)}
                  className={inp()} placeholder="Diastolic" min="40" max="150"/>
              </div>
              <VitalAlert value={form.blood_pressure_sys} high={140} low={90} unit="mmHg"
                highLabel="Hypertension" lowLabel="Hypotension" normalLabel="Normal BP"/>
            </F>
            <F label="Pulse Rate (bpm)">
              <input type="number" value={form.pulse_rate}
                onChange={e => set('pulse_rate', e.target.value)}
                className={inp()} placeholder="e.g., 72" min="30" max="220"/>
              <VitalAlert value={form.pulse_rate} high={100} low={60} unit="bpm"
                highLabel="Tachycardia" lowLabel="Bradycardia" normalLabel="Normal pulse"/>
            </F>
          </div>
        </div>

        {/* Respiratory */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500"/> Respiratory & Temperature
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <F label="Temperature (°C)">
              <input type="number" step="0.1" value={form.temperature}
                onChange={e => set('temperature', e.target.value)}
                className={inp()} placeholder="36.6" min="35" max="43"/>
              <VitalAlert value={form.temperature} high={38} low={36} unit="°C"
                highLabel="Fever" lowLabel="Hypothermia" normalLabel="Afebrile"/>
            </F>
            <F label="SpO₂ (%)">
              <input type="number" step="0.1" value={form.oxygen_saturation}
                onChange={e => set('oxygen_saturation', e.target.value)}
                className={inp()} placeholder="98" min="50" max="100"/>
              <VitalAlert value={form.oxygen_saturation} low={95} unit="%"
                lowLabel="Low oxygen" normalLabel="Normal SpO₂"/>
            </F>
            <F label="Respiratory Rate (/min)">
              <input type="number" value={form.respiratory_rate}
                onChange={e => set('respiratory_rate', e.target.value)}
                className={inp()} placeholder="16" min="8" max="60"/>
              <VitalAlert value={form.respiratory_rate} high={20} low={12} unit="/min"
                highLabel="Tachypnoea" lowLabel="Bradypnoea" normalLabel="Normal"/>
            </F>
          </div>
        </div>

        {/* Anthropometrics */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Anthropometrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <F label="Weight (kg)">
              <input type="number" step="0.1" value={form.weight}
                onChange={e => set('weight', e.target.value)}
                className={inp()} placeholder="70" min="1" max="300"/>
            </F>
            <F label="Height (cm)">
              <input type="number" value={form.height}
                onChange={e => set('height', e.target.value)}
                className={inp()} placeholder="170" min="30" max="250"/>
            </F>
            {bmi && (
              <div className="col-span-2 flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">BMI</p>
                  <p className="text-2xl font-black text-slate-800">{bmi}</p>
                </div>
                <p className={`font-bold ${bmiColor}`}>{bmiLabel}</p>
              </div>
            )}
            <F label="Blood Glucose (mmol/L)">
              <input type="number" step="0.1" value={form.blood_glucose}
                onChange={e => set('blood_glucose', e.target.value)}
                className={inp()} placeholder="5.5" min="1" max="50"/>
              <VitalAlert value={form.blood_glucose} high={7} low={3.9} unit="mmol/L"
                highLabel="Hyperglycaemia" lowLabel="Hypoglycaemia" normalLabel="Normal glucose"/>
            </F>
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700">Clinical Assessment</h3>
          <div className="grid grid-cols-2 gap-4">
            <F label={`Pain Score: ${form.pain_score}/10`}>
              <input type="range" min="0" max="10" value={form.pain_score}
                onChange={e => set('pain_score', e.target.value)}
                className="w-full accent-teal-600 mt-2"/>
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>No pain (0)</span><span>Worst (10)</span>
              </div>
            </F>
            <F label="General Appearance">
              <select value={form.general_appearance}
                onChange={e => set('general_appearance', e.target.value)} className={sel}>
                <option value="">Select</option>
                {['Alert and oriented','Confused','Anxious','In distress',
                  'Lethargic','Unresponsive','Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </F>
          </div>
          <F label="Nurse Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} className={`${inp()} resize-none`}
              placeholder="Referral notes, observations, special instructions…"/>
          </F>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <button type="button" onClick={() => navigate('/queue')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            Back to Queue
          </button>
          <button type="submit" disabled={saving || saved}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 shadow-sm">
            {saving && <Loader className="w-4 h-4 animate-spin"/>}
            {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save Vitals & Refer to Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}