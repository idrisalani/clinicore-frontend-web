import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Activity, Search, Stethoscope, CalendarCheck, Loader, User, ChevronDown, X } from 'lucide-react';
import api from '../services/api.js';
import CDSAlerts from './CDSAlerts';
import { runCDSChecks } from '../utils/cdsEngine';

// ── Shared style helpers ───────────────────────────────────────────────────
const F = ({ label, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const inp = (err = false) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${err ? 'bg-red-50 border-red-300 focus:border-red-400' : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;
const ta = (err = false) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all resize-none ${err ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;
const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer`;

const Section = ({ icon: Icon, title, color, bg, children }) => (
  <div className={`rounded-2xl border p-5 space-y-3 ${bg}`}>
    <div className="flex items-center gap-2 pb-2 border-b border-black/5">
      <Icon className={`w-4 h-4 ${color}`} />
      <h4 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</h4>
    </div>
    {children}
  </div>
);

// ── Patient search dropdown ────────────────────────────────────────────────
const PatientSelect = ({ value, onChange, error }) => {
  const [query, setQuery]       = useState('');
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients', { params: { search: query, limit: 20 } });
        setPatients(res.data.patients || []);
      } catch { setPatients([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open]);

  const select = (p) => { setSelected(p); setOpen(false); setQuery(''); onChange(p.patient_id); };
  const clear  = () => { setSelected(null); setPatients([]); onChange(''); };

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${error ? 'border-red-300 bg-red-50' : 'border-teal-300 bg-teal-50'}`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{selected.first_name} {selected.last_name}</p>
              <p className="text-xs text-slate-500">ID: {selected.patient_id} {selected.phone ? `· ${selected.phone}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={clear} className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border cursor-text ${error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100'}`}
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search patient by name…"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
          />
          {loading  && <Loader    className="w-3.5 h-3.5 text-teal-500 animate-spin flex-shrink-0" />}
          {!loading && <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
        </div>
      )}

      {open && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="w-5 h-5 text-teal-500 animate-spin" />
            </div>
          ) : patients.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">
              {query.length > 0 ? 'No patients found' : 'Start typing to search…'}
            </div>
          ) : patients.map(p => (
            <button key={p.patient_id} type="button" onMouseDown={() => select(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left">
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-teal-700">{p.first_name?.[0]}{p.last_name?.[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{p.first_name} {p.last_name}</p>
                <p className="text-xs text-slate-400">ID: {p.patient_id} {p.phone ? `· ${p.phone}` : ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Empty form state ───────────────────────────────────────────────────────
const empty = {
  appointment_id: '', patient_id: '', doctor_id: '',
  consultation_date: new Date().toISOString().split('T')[0],
  chief_complaint: '', history_of_present_illness: '',
  past_medical_history: '', medications: '', allergies: '',
  vital_signs_bp: '', vital_signs_temp: '', vital_signs_pulse: '', vital_signs_respiration: '',
  physical_examination: '', diagnosis: '', diagnosis_icd: '',
  treatment_plan: '', medications_prescribed: '', procedures: '',
  follow_up_date: '', follow_up_notes: '', referral_needed: 0, referral_to: '',
  notes: '', status: 'Draft',
};

// ── Main component ─────────────────────────────────────────────────────────
const ConsultationForm = ({
  consultation = null, patientId = null, appointmentId = null,
  isLoading = false, onSubmit, onCancel, mode = 'add',
}) => {
  const [form, setForm]         = useState({ ...empty, appointment_id: appointmentId || '', patient_id: patientId || '' });
  const [errors, setErrors]     = useState({});
  const [cdsAlerts, setCdsAlerts] = useState([]);   // ← CDS

  // Populate form when editing
  useEffect(() => {
    if (consultation && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(empty).map(k => [k, consultation[k] ?? empty[k]])) }));
    }
  }, [consultation, mode]);

  // ── CDS: re-run all checks whenever relevant fields change ───────────────
  useEffect(() => {
    const result = runCDSChecks({
      medicationsPrescribed:   form.medications_prescribed,
      currentMedications:      form.medications,
      allergies:               form.allergies,
      vital_signs_bp:          form.vital_signs_bp,
      vital_signs_temp:        form.vital_signs_temp,
      vital_signs_pulse:       form.vital_signs_pulse,
      vital_signs_respiration: form.vital_signs_respiration,
    });
    setCdsAlerts(result.alerts);
  }, [
    form.medications_prescribed,
    form.medications,
    form.allergies,
    form.vital_signs_bp,
    form.vital_signs_temp,
    form.vital_signs_pulse,
    form.vital_signs_respiration,
  ]);

  const set = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_id)             errs.patient_id      = 'Please select a patient';
    if (!form.chief_complaint.trim()) errs.chief_complaint  = 'Required';
    if (!form.diagnosis.trim())       errs.diagnosis        = 'Required';
    if (!form.treatment_plan.trim())  errs.treatment_plan   = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit({
        ...form,
        consultation_date: form.consultation_date || new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">

      {/* Patient selector + Date */}
      <div className="grid grid-cols-2 gap-3">
        <F label="Patient *" error={errors.patient_id}>
          {mode === 'edit' && consultation?.patient_id ? (
            <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-600">
              {consultation.first_name} {consultation.last_name} (ID: {consultation.patient_id})
            </div>
          ) : (
            <PatientSelect
              value={form.patient_id}
              onChange={(id) => { setForm(f => ({ ...f, patient_id: id })); if (errors.patient_id) setErrors(e => ({ ...e, patient_id: '' })); }}
              error={!!errors.patient_id}
            />
          )}
        </F>
        <F label="Consultation Date">
          <input type="date" name="consultation_date" value={form.consultation_date} onChange={set} className={inp()} />
        </F>
      </div>

      <Section icon={MessageSquare} title="Chief Complaint & History" color="text-blue-600" bg="bg-blue-50 border-blue-100">
        <F label="Chief Complaint *" error={errors.chief_complaint}>
          <textarea name="chief_complaint" value={form.chief_complaint} onChange={set} rows={2} className={ta(!!errors.chief_complaint)} placeholder="Main reason for consultation" />
        </F>
        <F label="History of Present Illness">
          <textarea name="history_of_present_illness" value={form.history_of_present_illness} onChange={set} rows={3} className={ta()} placeholder="Detailed history" />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Past Medical History">
            <textarea name="past_medical_history" value={form.past_medical_history} onChange={set} rows={2} className={ta()} placeholder="Previous illnesses, surgeries" />
          </F>
          <F label="Current Medications">
            <textarea name="medications" value={form.medications} onChange={set} rows={2} className={ta()} placeholder="Current medications & dosages" />
          </F>
        </div>
        <F label="Allergies">
          <input name="allergies" value={form.allergies} onChange={set} className={inp()} placeholder="Known allergies" />
        </F>
      </Section>

      <Section icon={Activity} title="Vital Signs" color="text-emerald-600" bg="bg-emerald-50 border-emerald-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['BP (mmHg)',       'vital_signs_bp',          'e.g., 120/80'],
            ['Temp (°C)',       'vital_signs_temp',         '37.0'],
            ['Pulse (bpm)',     'vital_signs_pulse',        '72'],
            ['Respiration/min', 'vital_signs_respiration',  '16'],
          ].map(([lbl, name, ph]) => (
            <F key={name} label={lbl}>
              <input name={name} value={form[name]} onChange={set} className={inp()} placeholder={ph} />
            </F>
          ))}
        </div>
      </Section>

      {/* ── CDS Alert Panel — appears between vitals and diagnosis ── */}
      {cdsAlerts.length > 0 && (
        <CDSAlerts alerts={cdsAlerts} />
      )}

      <Section icon={Search} title="Physical Examination" color="text-amber-600" bg="bg-amber-50 border-amber-100">
        <F label="Findings">
          <textarea name="physical_examination" value={form.physical_examination} onChange={set} rows={3} className={ta()} placeholder="Physical examination findings" />
        </F>
      </Section>

      <Section icon={Stethoscope} title="Diagnosis & Treatment" color="text-rose-600" bg="bg-rose-50 border-rose-100">
        <div className="grid grid-cols-2 gap-3">
          <F label="Diagnosis *" error={errors.diagnosis}>
            <input name="diagnosis" value={form.diagnosis} onChange={set} className={inp(!!errors.diagnosis)} placeholder="Primary diagnosis" />
          </F>
          <F label="ICD Code">
            <input name="diagnosis_icd" value={form.diagnosis_icd} onChange={set} className={inp()} placeholder="e.g., J45.901" />
          </F>
        </div>
        <F label="Treatment Plan *" error={errors.treatment_plan}>
          <textarea name="treatment_plan" value={form.treatment_plan} onChange={set} rows={3} className={ta(!!errors.treatment_plan)} placeholder="Recommended treatment plan" />
        </F>
        <F label="Medications Prescribed">
          <textarea name="medications_prescribed" value={form.medications_prescribed} onChange={set} rows={2} className={ta()} placeholder="List of prescribed medications" />
        </F>
        <F label="Procedures">
          <textarea name="procedures" value={form.procedures} onChange={set} rows={2} className={ta()} placeholder="Procedures performed or recommended" />
        </F>
      </Section>

      <Section icon={CalendarCheck} title="Follow-up & Referral" color="text-violet-600" bg="bg-violet-50 border-violet-100">
        <div className="grid grid-cols-2 gap-3">
          <F label="Follow-up Date">
            <input type="date" name="follow_up_date" value={form.follow_up_date} onChange={set} className={inp()} />
          </F>
          <F label="Follow-up Notes">
            <input name="follow_up_notes" value={form.follow_up_notes} onChange={set} className={inp()} placeholder="Follow-up instructions" />
          </F>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" name="referral_needed" checked={form.referral_needed === 1} onChange={set} className="w-4 h-4 accent-violet-600 rounded" />
          <span className="text-sm text-slate-700 font-medium">Referral needed</span>
        </label>
        {form.referral_needed === 1 && (
          <F label="Refer to (Specialist)">
            <input name="referral_to" value={form.referral_to} onChange={set} className={inp()} placeholder="e.g., Cardiology" />
          </F>
        )}
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <F label="Additional Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta()} placeholder="Any additional notes" />
        </F>
        <F label="Status">
          <select name="status" value={form.status} onChange={set} className={sel}>
            {['Draft', 'Completed', 'Signed', 'Reviewed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Record Consultation' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
};

export default ConsultationForm;