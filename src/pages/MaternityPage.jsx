// ============================================
// MaternityPage.jsx
// File: frontend-web/src/pages/MaternityPage.jsx
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Plus, Search, ChevronRight, AlertTriangle,
  Calendar, Activity, Baby, Loader, X,
} from 'lucide-react';
import * as maternityService from '../services/maternityService';
import * as patientService   from '../services/patientService';

// ── Shared helpers ─────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const weeksLeft = (edd) => {
  if (!edd) return null;
  const w = Math.round((new Date(edd) - Date.now()) / (7 * 24 * 60 * 60 * 1000));
  return w;
};

const RISK_COLORS = {
  Low:       'bg-green-100 text-green-800',
  Moderate:  'bg-yellow-100 text-yellow-800',
  High:      'bg-orange-100 text-orange-800',
  'Very High':'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  Active:             'bg-teal-100 text-teal-800',
  Delivered:          'bg-blue-100 text-blue-800',
  Transferred:        'bg-purple-100 text-purple-800',
  'Lost to Follow-up':'bg-gray-100 text-gray-600',
  Deceased:           'bg-red-100 text-red-800',
};

const Badge = ({ text, colorClass }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
    {text}
  </span>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'teal', icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-3xl font-bold text-${color}-600`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
      )}
    </div>
  </div>
);

// ── Input / Select / Checkbox helpers ─────────────────────────────────────────
const Inp = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input {...props} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all" />
  </div>
);

const Sel = ({ label, children, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <select {...props} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none">
      {children}
    </select>
  </div>
);

const Chk = ({ label, ...props }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" {...props} className="w-4 h-4 rounded accent-teal-600" />
    <span className="text-sm text-slate-700">{label}</span>
  </label>
);

const Txt = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <textarea {...props} rows={3} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none" />
  </div>
);

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ title, color = 'teal', children }) => (
  <div className={`bg-${color}-50/40 border border-${color}-100 rounded-2xl p-5`}>
    <h4 className={`text-xs font-bold text-${color}-700 uppercase tracking-wider mb-4`}>{title}</h4>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// OPEN CASE MODAL
// ─────────────────────────────────────────────────────────────────────────────
const OpenCaseModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    patient_id:'', lmp_date:'', edd_by_scan:'', booking_date:'',
    gravida:1, parity:0, previous_cs:0, previous_miscarriages:0, previous_stillbirths:0,
    blood_group:'', rhesus_factor:'', hiv_status:'Unknown', hb_at_booking:'',
    risk_level:'Low', risk_factors:'', notes:'',
  });
  const [patients, setPatients] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (search.length >= 2) {
      patientService.searchPatients(search)
        .then(r => setPatients(r.patients || []))
        .catch(() => {});
    } else {
      setPatients([]);
    }
  }, [search]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patient_id) return setError('Please select a patient');
    setLoading(true); setError('');
    try {
      await maternityService.createCase(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to open case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="bg-pink-600 rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Open Maternity Case</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Patient search */}
          <Section title="Patient" color="pink">
            <div className="relative">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search patient by name or phone…"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
              {patients.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {patients.map(p => (
                    <button key={p.patient_id} type="button"
                      onClick={() => { setForm(f => ({ ...f, patient_id: p.patient_id })); setSearch(`${p.first_name} ${p.last_name}`); setPatients([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-teal-50 text-sm border-b border-slate-100 last:border-0">
                      <span className="font-semibold">{p.first_name} {p.last_name}</span>
                      <span className="text-slate-400 ml-2">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Pregnancy dating */}
          <Section title="Pregnancy Dating" color="rose">
            <div className="grid grid-cols-2 gap-3">
              <Inp label="LMP Date"       type="date" name="lmp_date"    value={form.lmp_date}    onChange={set} />
              <Inp label="EDD by Scan"    type="date" name="edd_by_scan" value={form.edd_by_scan} onChange={set} />
              <Inp label="Booking Date"   type="date" name="booking_date" value={form.booking_date} onChange={set} />
              <Sel label="Risk Level" name="risk_level" value={form.risk_level} onChange={set}>
                {['Low','Moderate','High','Very High'].map(r => <option key={r}>{r}</option>)}
              </Sel>
            </div>
          </Section>

          {/* Obstetric history */}
          <Section title="Obstetric History" color="purple">
            <div className="grid grid-cols-3 gap-3">
              <Inp label="Gravida"             type="number" name="gravida"              value={form.gravida}              onChange={set} min="1" />
              <Inp label="Parity"              type="number" name="parity"               value={form.parity}               onChange={set} min="0" />
              <Inp label="Previous C-sections" type="number" name="previous_cs"          value={form.previous_cs}          onChange={set} min="0" />
              <Inp label="Miscarriages"        type="number" name="previous_miscarriages" value={form.previous_miscarriages} onChange={set} min="0" />
              <Inp label="Stillbirths"         type="number" name="previous_stillbirths"  value={form.previous_stillbirths}  onChange={set} min="0" />
            </div>
          </Section>

          {/* Labs / serology */}
          <Section title="Labs & Serology" color="blue">
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Blood Group" name="blood_group" value={form.blood_group} onChange={set}>
                <option value="">Unknown</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
              </Sel>
              <Sel label="Rhesus Factor" name="rhesus_factor" value={form.rhesus_factor} onChange={set}>
                <option value="">Unknown</option>
                <option>Positive</option><option>Negative</option>
              </Sel>
              <Sel label="HIV Status" name="hiv_status" value={form.hiv_status} onChange={set}>
                <option>Unknown</option><option>Negative</option><option>Positive</option>
              </Sel>
              <Inp label="Hb at Booking (g/dL)" type="number" step="0.1" name="hb_at_booking" value={form.hb_at_booking} onChange={set} />
            </div>
          </Section>

          <Txt label="Risk Factors / Notes" name="notes" value={form.notes} onChange={set} placeholder="Any risk factors, relevant history…" />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Open Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ANC VISIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ANCVisitModal = ({ caseId, onClose, onSaved }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    visit_date: today, gestational_week:'', visit_type:'Routine',
    weight_kg:'', bp_systolic:'', bp_diastolic:'', temperature_c:'', pulse_bpm:'', haemoglobin:'',
    fundal_height_cm:'', fetal_presentation:'', fetal_heart_rate:'', fetal_movement:'',
    lie:'', engagement:'', urine_protein:'Negative', urine_glucose:'Negative', oedema:'None',
    tt_vaccine:false, tt_dose_number:'', ipt_given:false, iron_folic_given:false, llin_given:false,
    complaints:'', clinical_notes:'', next_visit_date:'',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await maternityService.addANCVisit(caseId, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="bg-teal-600 rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Record ANC Visit</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <Section title="Visit Details" color="teal">
            <div className="grid grid-cols-3 gap-3">
              <Inp label="Visit Date *" type="date" name="visit_date" value={form.visit_date} onChange={set} required />
              <Inp label="Gestational Week" type="number" name="gestational_week" value={form.gestational_week} onChange={set} min="1" max="44" />
              <Sel label="Visit Type" name="visit_type" value={form.visit_type} onChange={set}>
                <option>Routine</option><option>Emergency</option><option>Follow-up</option>
              </Sel>
            </div>
          </Section>

          <Section title="Vitals" color="blue">
            <div className="grid grid-cols-3 gap-3">
              <Inp label="Weight (kg)"     type="number" step="0.1" name="weight_kg"    value={form.weight_kg}    onChange={set} />
              <Inp label="BP Systolic"     type="number" name="bp_systolic"  value={form.bp_systolic}  onChange={set} />
              <Inp label="BP Diastolic"    type="number" name="bp_diastolic" value={form.bp_diastolic} onChange={set} />
              <Inp label="Temp (°C)"       type="number" step="0.1" name="temperature_c" value={form.temperature_c} onChange={set} />
              <Inp label="Pulse (bpm)"     type="number" name="pulse_bpm"   value={form.pulse_bpm}   onChange={set} />
              <Inp label="Haemoglobin (g/dL)" type="number" step="0.1" name="haemoglobin" value={form.haemoglobin} onChange={set} />
            </div>
          </Section>

          <Section title="Obstetric Exam" color="purple">
            <div className="grid grid-cols-3 gap-3">
              <Inp label="Fundal Height (cm)"  type="number" step="0.5" name="fundal_height_cm"  value={form.fundal_height_cm}  onChange={set} />
              <Inp label="Fetal Heart Rate"    type="number" name="fetal_heart_rate"    value={form.fetal_heart_rate}    onChange={set} />
              <Sel label="Fetal Presentation" name="fetal_presentation" value={form.fetal_presentation} onChange={set}>
                <option value="">—</option>
                {['Cephalic','Breech','Transverse','Oblique','Unknown'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Sel label="Fetal Movement" name="fetal_movement" value={form.fetal_movement} onChange={set}>
                <option value="">—</option>
                {['Present','Absent','Reduced'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Sel label="Lie" name="lie" value={form.lie} onChange={set}>
                <option value="">—</option>
                {['Longitudinal','Transverse','Oblique'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Sel label="Engagement" name="engagement" value={form.engagement} onChange={set}>
                <option value="">—</option>
                {['Engaged','Not Engaged','Partially'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </div>
          </Section>

          <Section title="Urine & Oedema" color="amber">
            <div className="grid grid-cols-3 gap-3">
              <Sel label="Urine Protein" name="urine_protein" value={form.urine_protein} onChange={set}>
                {['Negative','Trace','+1','+2','+3','+4'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Sel label="Urine Glucose" name="urine_glucose" value={form.urine_glucose} onChange={set}>
                {['Negative','Trace','+1','+2','+3','+4'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Sel label="Oedema" name="oedema" value={form.oedema} onChange={set}>
                {['None','Mild','Moderate','Severe'].map(o => <option key={o}>{o}</option>)}
              </Sel>
            </div>
          </Section>

          <Section title="Interventions" color="green">
            <div className="grid grid-cols-2 gap-3">
              <Chk label="TT Vaccine given" name="tt_vaccine" checked={form.tt_vaccine} onChange={set} />
              <Chk label="IPT given"        name="ipt_given"  checked={form.ipt_given}  onChange={set} />
              <Chk label="Iron/Folic given" name="iron_folic_given" checked={form.iron_folic_given} onChange={set} />
              <Chk label="LLIN given"       name="llin_given"       checked={form.llin_given}       onChange={set} />
              {form.tt_vaccine && (
                <Inp label="TT Dose Number" type="number" name="tt_dose_number" value={form.tt_dose_number} onChange={set} min="1" max="5" />
              )}
            </div>
          </Section>

          <Section title="Clinical Notes" color="teal">
            <div className="space-y-3">
              <Txt label="Complaints" name="complaints" value={form.complaints} onChange={set} />
              <Txt label="Clinical Notes" name="clinical_notes" value={form.clinical_notes} onChange={set} />
              <Inp label="Next Visit Date" type="date" name="next_visit_date" value={form.next_visit_date} onChange={set} />
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Record Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryModal = ({ caseId, onClose, onSaved }) => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    delivery_date: today, delivery_time:'', gestational_age_at_delivery:'',
    mode_of_delivery:'SVD', outcome:'Live Birth', complications:'', blood_loss_ml:'',
    newborn_sex:'', birth_weight_kg:'', apgar_1min:'', apgar_5min:'', apgar_10min:'',
    resuscitation_needed:false, nicu_admission:false, newborn_notes:'',
    placenta_complete:true, episiotomy:false, blood_transfusion:false,
    maternal_condition:'Stable', discharge_date:'', postnatal_notes:'',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await maternityService.recordDelivery(caseId, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="bg-blue-600 rounded-t-2xl px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Record Delivery</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

          <Section title="Delivery Details" color="blue">
            <div className="grid grid-cols-2 gap-3">
              <Inp label="Delivery Date *" type="date" name="delivery_date" value={form.delivery_date} onChange={set} required />
              <Inp label="Delivery Time"   type="time" name="delivery_time" value={form.delivery_time} onChange={set} />
              <Sel label="Mode of Delivery *" name="mode_of_delivery" value={form.mode_of_delivery} onChange={set}>
                {['SVD','Assisted Vaginal','Emergency CS','Elective CS','Vacuum','Forceps'].map(m => <option key={m}>{m}</option>)}
              </Sel>
              <Sel label="Outcome *" name="outcome" value={form.outcome} onChange={set}>
                {['Live Birth','Stillbirth','Neonatal Death','Maternal Death'].map(o => <option key={o}>{o}</option>)}
              </Sel>
              <Inp label="Gestational Age (weeks)" type="number" name="gestational_age_at_delivery" value={form.gestational_age_at_delivery} onChange={set} />
              <Inp label="Blood Loss (ml)"          type="number" name="blood_loss_ml"               value={form.blood_loss_ml}               onChange={set} />
            </div>
            <div className="mt-3">
              <Txt label="Complications" name="complications" value={form.complications} onChange={set} placeholder="Comma-separated list of complications" />
            </div>
          </Section>

          <Section title="Newborn Details" color="green">
            <div className="grid grid-cols-3 gap-3">
              <Sel label="Sex" name="newborn_sex" value={form.newborn_sex} onChange={set}>
                <option value="">—</option>
                <option>Male</option><option>Female</option><option>Indeterminate</option>
              </Sel>
              <Inp label="Birth Weight (kg)" type="number" step="0.01" name="birth_weight_kg" value={form.birth_weight_kg} onChange={set} />
              <Inp label="APGAR 1 min"  type="number" name="apgar_1min"  value={form.apgar_1min}  onChange={set} min="0" max="10" />
              <Inp label="APGAR 5 min"  type="number" name="apgar_5min"  value={form.apgar_5min}  onChange={set} min="0" max="10" />
              <Inp label="APGAR 10 min" type="number" name="apgar_10min" value={form.apgar_10min} onChange={set} min="0" max="10" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Chk label="Resuscitation needed" name="resuscitation_needed" checked={form.resuscitation_needed} onChange={set} />
              <Chk label="NICU admission"       name="nicu_admission"       checked={form.nicu_admission}       onChange={set} />
            </div>
            <div className="mt-3">
              <Txt label="Newborn Notes" name="newborn_notes" value={form.newborn_notes} onChange={set} />
            </div>
          </Section>

          <Section title="Maternal Condition" color="rose">
            <div className="grid grid-cols-2 gap-3">
              <Sel label="Maternal Condition" name="maternal_condition" value={form.maternal_condition} onChange={set}>
                {['Stable','Critical','Transferred','Deceased'].map(c => <option key={c}>{c}</option>)}
              </Sel>
              <Inp label="Discharge Date" type="date" name="discharge_date" value={form.discharge_date} onChange={set} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <Chk label="Placenta complete"  name="placenta_complete"  checked={form.placenta_complete}  onChange={set} />
              <Chk label="Episiotomy"         name="episiotomy"         checked={form.episiotomy}         onChange={set} />
              <Chk label="Blood transfusion"  name="blood_transfusion"  checked={form.blood_transfusion}  onChange={set} />
            </div>
            <div className="mt-3">
              <Txt label="Postnatal Notes" name="postnatal_notes" value={form.postnatal_notes} onChange={set} />
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Record Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CASE DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
const CaseDetail = ({ caseId, onBack }) => {
  const [data,          setData]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showANCModal,  setShowANCModal]  = useState(false);
  const [showDelivery,  setShowDelivery]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await maternityService.getCaseById(caseId);
      setData(r.data);
    } catch {} finally { setLoading(false); }
  }, [caseId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-teal-500" /></div>;
  if (!data)   return <div className="text-center py-20 text-slate-400">Case not found</div>;

  const { case: mc, visits, delivery } = data;
  const wLeft = weeksLeft(mc.edd);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
          ← Back
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">
            {mc.first_name} {mc.last_name}
          </h2>
          <p className="text-sm text-slate-400">{mc.phone} · Case #{mc.case_id}</p>
        </div>
        <Badge text={mc.status}     colorClass={STATUS_COLORS[mc.status]     || 'bg-slate-100 text-slate-600'} />
        <Badge text={mc.risk_level} colorClass={RISK_COLORS[mc.risk_level]   || 'bg-slate-100 text-slate-600'} />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-pink-600">{mc.anc_count}</p>
          <p className="text-xs text-pink-500 mt-1">ANC Visits</p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{mc.gestational_age_weeks || '—'}</p>
          <p className="text-xs text-teal-500 mt-1">Weeks at Booking</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{mc.gravida}G{mc.parity}P</p>
          <p className="text-xs text-blue-500 mt-1">Gravida / Parity</p>
        </div>
        <div className={`rounded-2xl p-4 text-center border ${wLeft !== null && wLeft < 0 ? 'bg-gray-50 border-gray-100' : wLeft !== null && wLeft <= 4 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
          <p className={`text-2xl font-bold ${wLeft !== null && wLeft <= 4 && wLeft >= 0 ? 'text-amber-600' : 'text-slate-600'}`}>
            {wLeft !== null ? (wLeft < 0 ? 'Overdue' : `${wLeft}w`) : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Until EDD ({fmtDate(mc.edd)})</p>
        </div>
      </div>

      {/* Case details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pregnancy Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">LMP</span><span className="font-medium">{fmtDate(mc.lmp_date)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">EDD</span><span className="font-medium">{fmtDate(mc.edd)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">EDD by Scan</span><span className="font-medium">{fmtDate(mc.edd_by_scan)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Blood Group</span><span className="font-medium">{mc.blood_group || '—'} {mc.rhesus_factor || ''}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">HIV Status</span><span className="font-medium">{mc.hiv_status || '—'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Hb at Booking</span><span className="font-medium">{mc.hb_at_booking ? `${mc.hb_at_booking} g/dL` : '—'}</span></div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Obstetric History</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Previous C-sections</span><span className="font-medium">{mc.previous_cs}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Miscarriages</span><span className="font-medium">{mc.previous_miscarriages}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Stillbirths</span><span className="font-medium">{mc.previous_stillbirths}</span></div>
            {mc.risk_factors && <div><span className="text-slate-500 block">Risk factors</span><span className="font-medium text-orange-700">{mc.risk_factors}</span></div>}
            {mc.notes && <div><span className="text-slate-500 block">Notes</span><span className="font-medium">{mc.notes}</span></div>}
          </div>
        </div>
      </div>

      {/* ANC Visits */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-700">ANC Visits ({visits.length})</h3>
          {mc.status === 'Active' && (
            <button onClick={() => setShowANCModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100">
              <Plus className="w-3 h-3" /> Add Visit
            </button>
          )}
        </div>
        {visits.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-400">No ANC visits recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Date','Week','BP','Weight','FHR','Presentation','Protein','Oedema'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visits.map(v => (
                  <tr key={v.visit_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{fmtDate(v.visit_date)}</td>
                    <td className="px-4 py-3 text-slate-500">{v.gestational_week ? `${v.gestational_week}w` : '—'}</td>
                    <td className="px-4 py-3">
                      {v.bp_systolic && v.bp_diastolic
                        ? <span className={parseInt(v.bp_systolic) >= 140 || parseInt(v.bp_diastolic) >= 90 ? 'text-red-600 font-semibold' : ''}>
                            {v.bp_systolic}/{v.bp_diastolic}
                          </span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{v.weight_kg ? `${v.weight_kg}kg` : '—'}</td>
                    <td className="px-4 py-3">{v.fetal_heart_rate ? `${v.fetal_heart_rate}bpm` : '—'}</td>
                    <td className="px-4 py-3">{v.fetal_presentation || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={v.urine_protein && v.urine_protein !== 'Negative' ? 'text-orange-600 font-semibold' : 'text-slate-400'}>
                        {v.urine_protein || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={v.oedema && v.oedema !== 'None' ? 'text-orange-600 font-semibold' : 'text-slate-400'}>
                        {v.oedema || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery record */}
      {delivery ? (
        <div className="bg-white border border-blue-100 rounded-2xl p-5">
          <h3 className="font-bold text-slate-700 mb-4">Delivery Record</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-400 block text-xs">Date & Time</span><span className="font-medium">{fmtDate(delivery.delivery_date)} {delivery.delivery_time || ''}</span></div>
            <div><span className="text-slate-400 block text-xs">Mode</span><span className="font-medium">{delivery.mode_of_delivery}</span></div>
            <div><span className="text-slate-400 block text-xs">Outcome</span>
              <span className={`font-medium ${delivery.outcome === 'Live Birth' ? 'text-green-600' : 'text-red-600'}`}>{delivery.outcome}</span>
            </div>
            <div><span className="text-slate-400 block text-xs">Birth Weight</span><span className="font-medium">{delivery.birth_weight_kg ? `${delivery.birth_weight_kg} kg` : '—'}</span></div>
            <div><span className="text-slate-400 block text-xs">APGAR (1/5/10)</span><span className="font-medium">{delivery.apgar_1min ?? '—'} / {delivery.apgar_5min ?? '—'} / {delivery.apgar_10min ?? '—'}</span></div>
            <div><span className="text-slate-400 block text-xs">Newborn Sex</span><span className="font-medium">{delivery.newborn_sex || '—'}</span></div>
            <div><span className="text-slate-400 block text-xs">Maternal Condition</span>
              <span className={`font-medium ${delivery.maternal_condition === 'Stable' ? 'text-green-600' : 'text-red-600'}`}>{delivery.maternal_condition}</span>
            </div>
            {delivery.complications && <div className="col-span-3"><span className="text-slate-400 block text-xs">Complications</span><span className="font-medium text-orange-700">{delivery.complications}</span></div>}
          </div>
        </div>
      ) : mc.status === 'Active' && (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl">
          <Baby className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-3">No delivery recorded yet</p>
          <button onClick={() => setShowDelivery(true)}
            className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100">
            Record Delivery
          </button>
        </div>
      )}

      {showANCModal  && <ANCVisitModal  caseId={caseId} onClose={() => setShowANCModal(false)}  onSaved={() => { setShowANCModal(false);  load(); }} />}
      {showDelivery  && <DeliveryModal  caseId={caseId} onClose={() => setShowDelivery(false)}  onSaved={() => { setShowDelivery(false);  load(); }} />}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const MaternityPage = () => {
  const [cases,        setCases]        = useState([]);
  const [stats,        setStats]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [riskFilter,   setRiskFilter]   = useState('');
  const [showNewCase,  setShowNewCase]  = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        maternityService.getCases({ status: statusFilter, risk_level: riskFilter, search }),
        maternityService.getStats(),
      ]);
      setCases(casesRes.data?.cases || []);
      setStats(statsRes.data || {});
    } catch {} finally { setLoading(false); }
  }, [statusFilter, riskFilter, search]);

  useEffect(() => { load(); }, [load]);

  if (selectedCase) {
    return (
      <div className="p-6">
        <CaseDetail caseId={selectedCase} onBack={() => { setSelectedCase(null); load(); }} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Maternity</h1>
            <p className="text-sm text-slate-400">Antenatal care and delivery management</p>
          </div>
        </div>
        <button onClick={() => setShowNewCase(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Open Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Active cases"  value={stats.active}       icon={Heart}     color="pink" />
        <StatCard label="Due soon"      value={stats.due_soon}     icon={Calendar}  color="amber" sub="next 30 days" />
        <StatCard label="High risk"     value={stats.high_risk}    icon={AlertTriangle} color="red" />
        <StatCard label="Delivered"     value={stats.delivered}    icon={Baby}      color="blue" />
        <StatCard label="Live births"   value={stats.live_births}  icon={Activity}  color="teal" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-teal-400">
          <option value="">All statuses</option>
          {['Active','Delivered','Transferred','Lost to Follow-up'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-teal-400">
          <option value="">All risk levels</option>
          {['Low','Moderate','High','Very High'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Cases table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader className="w-8 h-8 animate-spin text-teal-500" /></div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No maternity cases found</p>
            <button onClick={() => setShowNewCase(true)}
              className="mt-4 px-4 py-2 text-sm font-semibold text-pink-600 bg-pink-50 rounded-xl hover:bg-pink-100">
              Open first case
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Patient','EDD','Weeks left','ANC visits','Risk','Status',''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cases.map(c => {
                const wl = weeksLeft(c.edd);
                return (
                  <tr key={c.case_id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedCase(c.case_id)}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{c.first_name} {c.last_name}</div>
                      <div className="text-xs text-slate-400">{c.phone}</div>
                    </td>
                    <td className="px-5 py-4">{fmtDate(c.edd)}</td>
                    <td className="px-5 py-4">
                      {wl !== null
                        ? <span className={`font-medium ${wl < 0 ? 'text-gray-400' : wl <= 4 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {wl < 0 ? 'Overdue' : `${wl}w`}
                          </span>
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-teal-700">{c.anc_count}</span>
                      {c.visit_count !== undefined && c.visit_count !== c.anc_count && (
                        <span className="text-xs text-slate-400 ml-1">({c.visit_count} recorded)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge text={c.risk_level} colorClass={RISK_COLORS[c.risk_level] || 'bg-slate-100 text-slate-600'} />
                    </td>
                    <td className="px-5 py-4">
                      <Badge text={c.status} colorClass={STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'} />
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showNewCase && (
        <OpenCaseModal
          onClose={() => setShowNewCase(false)}
          onSaved={() => { setShowNewCase(false); load(); }}
        />
      )}
    </div>
  );
};

export default MaternityPage;