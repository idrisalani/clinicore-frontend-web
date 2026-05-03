// ============================================
// DoctorConsultationPage.jsx
// File: frontend-web/src/pages/DoctorConsultationPage.jsx
// Route: /doctor/consultation/:visitId
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope, ArrowLeft, Loader, Plus, X,
  TestTube, Pill, CheckCircle2, FileText,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import api from '../services/api.js';

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none appearance-none cursor-pointer`;

const F = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const Card = ({ icon: Icon, title, color, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
      <Icon className={`w-4 h-4 ${color}`}/>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ── Drug row in prescriptions ─────────────────────────────────────────────────
const DrugRow = ({ drug, index, onChange, onRemove }) => (
  <div className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-xl">
    <div className="col-span-3">
      <input value={drug.name} onChange={e => onChange(index, 'name', e.target.value)}
        className={inp} placeholder="Drug name" autoComplete="off"/>
    </div>
    <div className="col-span-2">
      <input value={drug.dosage} onChange={e => onChange(index, 'dosage', e.target.value)}
        className={inp} placeholder="Dose e.g. 500mg"/>
    </div>
    <div className="col-span-2">
      <select value={drug.frequency} onChange={e => onChange(index, 'frequency', e.target.value)} className={sel}>
        {['Once daily','Twice daily','Three times daily','Four times daily',
          'Every 6h','Every 8h','As needed','Stat'].map(f => <option key={f}>{f}</option>)}
      </select>
    </div>
    <div className="col-span-2">
      <input value={drug.duration} onChange={e => onChange(index, 'duration', e.target.value)}
        className={inp} placeholder="e.g. 7 days"/>
    </div>
    <div className="col-span-2">
      <input value={drug.route} onChange={e => onChange(index, 'route', e.target.value)}
        className={inp} placeholder="Oral/IV/IM"/>
    </div>
    <div className="col-span-1 pt-1">
      <button type="button" onClick={() => onRemove(index)}
        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
        <X className="w-4 h-4"/>
      </button>
    </div>
  </div>
);

// ── Lab test row ──────────────────────────────────────────────────────────────
const LabRow = ({ test, index, onChange, onRemove }) => (
  <div className="flex gap-2 items-center p-3 bg-slate-50 rounded-xl">
    <input value={test.name} onChange={e => onChange(index, 'name', e.target.value)}
      className={`${inp} flex-1`} placeholder="Test name e.g. FBC, LFT, Malaria RDT" autoComplete="off"/>
    <select value={test.priority} onChange={e => onChange(index, 'priority', e.target.value)}
      className={`${sel} w-32`}>
      {['Routine','Urgent','STAT'].map(p => <option key={p}>{p}</option>)}
    </select>
    <input value={test.notes} onChange={e => onChange(index, 'notes', e.target.value)}
      className={`${inp} flex-1`} placeholder="Clinical notes" autoComplete="off"/>
    <button type="button" onClick={() => onRemove(index)}
      className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
      <X className="w-4 h-4"/>
    </button>
  </div>
);

export default function DoctorConsultationPage() {
  const { visitId } = useParams();
  const navigate    = useNavigate();
  const { showToast, Toast } = useToast();

  const [visit,    setVisit]    = useState(null);
  const [vitals,   setVitals]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    chief_complaint: '',
    history_of_present_illness: '',
    past_medical_history: '',
    physical_examination: '',
    diagnosis: '',
    icd_codes: '',
    treatment_plan: '',
    follow_up_date: '',
    status: 'Completed',
  });

  const [drugs, setDrugs] = useState([
    { name: '', dosage: '', frequency: 'Twice daily', duration: '', route: 'Oral' }
  ]);
  const [labs, setLabs]   = useState([]);
  const [disposition, setDisposition] = useState('Discharge');

  const fetchVisit = useCallback(async () => {
    try {
      const res = await api.get(`/visits/${visitId}`);
      setVisit(res.data.visit);
      setVitals(res.data.vitals);
      if (res.data.visit?.chief_complaint) {
        setForm(f => ({ ...f, chief_complaint: res.data.visit.chief_complaint }));
      }
    } catch (err) {
      showToast('Failed to load visit', 'error');
    } finally {
      setLoading(false);
    }
  }, [visitId, showToast]);

  useEffect(() => { fetchVisit(); }, [fetchVisit]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Drug helpers
  const addDrug    = () => setDrugs(d => [...d, { name: '', dosage: '', frequency: 'Twice daily', duration: '', route: 'Oral' }]);
  const removeDrug = (i) => setDrugs(d => d.filter((_, j) => j !== i));
  const updateDrug = (i, k, v) => setDrugs(d => d.map((item, j) => j === i ? { ...item, [k]: v } : item));

  // Lab helpers
  const addLab    = () => setLabs(l => [...l, { name: '', priority: 'Routine', notes: '' }]);
  const removeLab = (i) => setLabs(l => l.filter((_, j) => j !== i));
  const updateLab = (i, k, v) => setLabs(l => l.map((item, j) => j === i ? { ...item, [k]: v } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) { showToast('Please enter a diagnosis', 'error'); return; }
    setSaving(true);
    try {
      const validDrugs = drugs.filter(d => d.name.trim());
      const validLabs  = labs.filter(l => l.name.trim());

      // 1. Create consultation
      await api.post('/consultations', {
        patient_id: visit.patient_id,
        visit_id:   parseInt(visitId),
        ...form,
        medications_prescribed: validDrugs.map(d =>
          `${d.name} ${d.dosage} ${d.frequency} for ${d.duration} (${d.route})`
        ).join('\n'),
      });

      // 2. Create lab orders
      for (const lab of validLabs) {
        await api.post('/lab/orders', {
          patient_id:    visit.patient_id,
          visit_id:      parseInt(visitId),
          test_name:     lab.name,
          test_type:     lab.name,
          priority:      lab.priority,
          clinical_notes:lab.notes,
          ordered_date:  new Date().toISOString().split('T')[0],
        });
      }

      // 3. Update visit status based on disposition
      const newStatus = disposition === 'Admit' ? 'Admitted'
        : validLabs.length  ? 'Awaiting Lab'
        : validDrugs.length ? 'Awaiting Pharmacy'
        : 'Discharged';

      await api.put(`/visits/${visitId}/status`, {
        status: newStatus,
        discharge_summary: disposition === 'Discharge' ? form.treatment_plan : null,
        discharge_type:    disposition === 'Discharge' ? 'Home' : null,
        follow_up_date:    form.follow_up_date || null,
        doctor_id:         null, // already set
      });

      showToast('Consultation saved successfully');
      setTimeout(() => navigate('/queue'), 1500);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to save consultation', 'error');
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
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800">Consultation</h1>
              <p className="text-sm text-slate-400">{patientName} · Visit #{visitId}</p>
            </div>
          </div>
          {/* Quick vitals summary */}
          {vitals && (
            <div className="flex gap-3 text-xs text-slate-500 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
              {vitals.blood_pressure_sys && <span className="font-semibold">BP {vitals.blood_pressure_sys}/{vitals.blood_pressure_dia}</span>}
              {vitals.temperature        && <span>T {vitals.temperature}°C</span>}
              {vitals.pulse_rate         && <span>P {vitals.pulse_rate}bpm</span>}
              {vitals.oxygen_saturation  && <span>SpO₂ {vitals.oxygen_saturation}%</span>}
            </div>
          )}
          <button onClick={() => navigate(`/patients/${visit?.patient_id}/timeline`)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100">
            <FileText className="w-3.5 h-3.5"/> Full History
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-6 space-y-5">

        {/* History */}
        <Card icon={FileText} title="History & Examination" color="text-purple-500">
          <div className="grid grid-cols-2 gap-4">
            <F label="Chief Complaint">
              <textarea value={form.chief_complaint}
                onChange={e => setField('chief_complaint', e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Patient's main complaint"/>
            </F>
            <F label="History of Present Illness">
              <textarea value={form.history_of_present_illness}
                onChange={e => setField('history_of_present_illness', e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Onset, duration, character…"/>
            </F>
            <F label="Past Medical History">
              <textarea value={form.past_medical_history}
                onChange={e => setField('past_medical_history', e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Previous illnesses, surgeries, medications…"/>
            </F>
            <F label="Physical Examination">
              <textarea value={form.physical_examination}
                onChange={e => setField('physical_examination', e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Findings on examination…"/>
            </F>
          </div>
        </Card>

        {/* Diagnosis */}
        <Card icon={Stethoscope} title="Diagnosis & Treatment" color="text-red-500">
          <div className="grid grid-cols-2 gap-4">
            <F label="Diagnosis *">
              <textarea value={form.diagnosis}
                onChange={e => setField('diagnosis', e.target.value)}
                rows={2} className={`${inp} resize-none`}
                placeholder="Primary diagnosis" required/>
            </F>
            <F label="ICD-10 Code(s)">
              <input value={form.icd_codes}
                onChange={e => setField('icd_codes', e.target.value)}
                className={inp} placeholder="e.g. J18.9, A90" autoComplete="off"/>
            </F>
            <F label="Treatment Plan" className="col-span-2">
              <textarea value={form.treatment_plan}
                onChange={e => setField('treatment_plan', e.target.value)}
                rows={3} className={`${inp} resize-none`}
                placeholder="Management plan, lifestyle advice, follow-up instructions…"/>
            </F>
          </div>
        </Card>

        {/* Prescriptions */}
        <Card icon={Pill} title="Prescriptions" color="text-teal-500">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase px-3">
            <span className="col-span-3">Drug</span>
            <span className="col-span-2">Dose</span>
            <span className="col-span-2">Frequency</span>
            <span className="col-span-2">Duration</span>
            <span className="col-span-2">Route</span>
            <span className="col-span-1"/>
          </div>
          {drugs.map((d, i) => (
            <DrugRow key={i} drug={d} index={i} onChange={updateDrug} onRemove={removeDrug}/>
          ))}
          <button type="button" onClick={addDrug}
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 px-3 py-2 hover:bg-teal-50 rounded-xl transition-colors">
            <Plus className="w-4 h-4"/> Add Drug
          </button>
        </Card>

        {/* Lab orders */}
        <Card icon={TestTube} title="Lab & Imaging Orders" color="text-amber-500">
          {labs.length > 0 && (
            <div className="space-y-2">
              {labs.map((l, i) => (
                <LabRow key={i} test={l} index={i} onChange={updateLab} onRemove={removeLab}/>
              ))}
            </div>
          )}
          <button type="button" onClick={addLab}
            className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 px-3 py-2 hover:bg-amber-50 rounded-xl transition-colors">
            <Plus className="w-4 h-4"/> Add Lab / Imaging Test
          </button>
        </Card>

        {/* Disposition */}
        <Card icon={CheckCircle2} title="Disposition" color="text-green-500">
          <div className="grid grid-cols-3 gap-3">
            {['Discharge', 'Admit', 'Refer'].map(d => (
              <button key={d} type="button" onClick={() => setDisposition(d)}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all
                  ${disposition === d
                    ? d === 'Discharge' ? 'bg-green-600 text-white border-green-600'
                    : d === 'Admit'     ? 'bg-red-500 text-white border-red-500'
                    :                    'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                {d === 'Discharge' ? '🏠 Discharge Home'
                : d === 'Admit'    ? '🛏 Admit Patient'
                :                   '🔄 Refer'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <F label="Follow-up Date">
              <input type="date" value={form.follow_up_date}
                onChange={e => setField('follow_up_date', e.target.value)}
                className={inp}
                min={new Date().toISOString().split('T')[0]}/>
            </F>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <button type="button" onClick={() => navigate('/queue')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            Back to Queue
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 shadow-sm">
            {saving && <Loader className="w-4 h-4 animate-spin"/>}
            {saving ? 'Saving…' : 'Complete Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
}