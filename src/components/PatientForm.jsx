// ============================================
// PatientForm.jsx
// File: frontend-web/src/components/PatientForm.jsx
//
// RECONCILED: existing quality + Phase B additions
// Step 1 (Receptionist): Bio data — existing Section/F/Input/Select + chief_complaint
// Step 2 (Nurse):        Vital signs — clinical alerts, BMI, pain score
// CredentialsModal:      Preserved exactly from existing
// patientsService:       Called directly to capture portal_credentials
// ============================================
import React, { useState, useEffect } from 'react';
import {
  User, MapPin, Heart, Shield, AlertCircle,
  Loader, Copy, Check, X,
  Activity, ChevronRight, ChevronLeft,
} from 'lucide-react';
import * as patientsService from '../services/patientService';

// ── Reusable field wrappers (preserved from existing) ─────────────────────────
const F = ({ label, error, children, span2 = false, className = '' }) => (
  <div className={`${span2 ? 'col-span-2' : ''} ${className}`}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none ${
      error
        ? 'bg-red-50 border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'
    }`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
      focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
      outline-none transition-all appearance-none cursor-pointer">
    {children}
  </select>
);

// Preserved colour palette system
const Section = ({ icon: Icon, title, color = 'teal', children }) => {
  const palette = {
    teal:   { wrap: 'bg-teal-50/60 border-teal-100',    icon: 'bg-teal-100 text-teal-600'    },
    blue:   { wrap: 'bg-blue-50/60 border-blue-100',    icon: 'bg-blue-100 text-blue-600'    },
    rose:   { wrap: 'bg-rose-50/60 border-rose-100',    icon: 'bg-rose-100 text-rose-600'    },
    purple: { wrap: 'bg-purple-50/60 border-purple-100',icon: 'bg-purple-100 text-purple-600' },
    amber:  { wrap: 'bg-amber-50/60 border-amber-100',  icon: 'bg-amber-100 text-amber-600'  },
    indigo: { wrap: 'bg-indigo-50/60 border-indigo-100',icon: 'bg-indigo-100 text-indigo-600' },
  };
  const c = palette[color] || palette.teal;
  return (
    <div className={`rounded-2xl border p-5 ${c.wrap}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
};

// ── Step indicator (new) ──────────────────────────────────────────────────────
const StepBar = ({ step, mode }) => {
  if (mode === 'edit') return null;
  const steps = [
    { n: 1, label: 'Bio Data',    role: 'Receptionist' },
    { n: 2, label: 'Vital Signs', role: 'Nurse (optional)' },
  ];
  return (
    <div className="flex items-center gap-0 mb-5 px-1">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step >= s.n ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {s.n}
            </div>
            <p className={`text-xs mt-1 font-semibold ${step >= s.n ? 'text-teal-700' : 'text-slate-400'}`}>{s.label}</p>
            <p className="text-xs text-slate-300">{s.role}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mt-[-18px] transition-all ${step > s.n ? 'bg-teal-500' : 'bg-slate-200'}`}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Vital alert (new) ─────────────────────────────────────────────────────────
const VitalAlert = ({ value, low, high, lowLabel, highLabel, normalLabel }) => {
  if (!value) return null;
  const v = parseFloat(value);
  if (high && v >= high) return <p className="text-xs text-red-600 font-semibold mt-1">⚠️ {highLabel}</p>;
  if (low  && v <= low)  return <p className="text-xs text-blue-600 font-semibold mt-1">⚠️ {lowLabel}</p>;
  return <p className="text-xs text-green-600 font-semibold mt-1">✓ {normalLabel || 'Normal'}</p>;
};

// ── CredentialsModal (preserved exactly from existing) ────────────────────────
const CredentialsModal = ({ credentials, patientName, onClose }) => {
  const [copied, setCopied] = useState('');

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const copyAll = () => copy(
    `CliniCore Patient Portal\nName: ${patientName}\nEmail: ${credentials.email}\nPassword: ${credentials.default_password}\nLogin: ${window.location.origin}/login`,
    'all'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">✓</div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Patient Created!</h2>
                <p className="text-teal-100 text-sm">{patientName} has been registered</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-teal-800 text-sm font-semibold">🔑 Patient Portal Credentials</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Login Email</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 truncate">
                  {credentials.email}
                </code>
                <button onClick={() => copy(credentials.email, 'email')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 flex items-center gap-1">
                  {copied === 'email' ? <><Check className="w-3 h-3"/> Copied</> : <><Copy className="w-3 h-3"/> Copy</>}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Default Password</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 font-bold tracking-widest">
                  {credentials.default_password}
                </code>
                <button onClick={() => copy(credentials.default_password, 'password')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 flex items-center gap-1">
                  {copied === 'password' ? <><Check className="w-3 h-3"/> Copied</> : <><Copy className="w-3 h-3"/> Copy</>}
                </button>
              </div>
            </div>
            <p className="text-xs text-teal-700 bg-teal-100 rounded-lg px-3 py-2">
              ℹ Password = first 4 letters of surname + last 4 digits of phone
            </p>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-amber-800 text-sm font-semibold">Hand these to the patient before they leave</p>
              <p className="text-amber-700 text-xs mt-1">
                They can log in at <strong>{window.location.origin}/login</strong> to view appointments, lab results, and bills.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={copyAll}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-100">
            {copied === 'all' ? <><Check className="w-4 h-4 text-teal-600"/> Copied!</> : <><Copy className="w-4 h-4"/> Copy All</>}
          </button>
          <button onClick={onClose}
            className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-teal-700">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Default form state (preserved from existing — correct schema) ──────────────
const EMPTY_PATIENT = {
  first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '',
  address: '', city: '', state: '', zip_code: '', blood_type: '', allergies: '',
  chronic_conditions: '', insurance_provider: '', insurance_policy_number: '',
  insurance_group_number: '',
  emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
  // New field — chief complaint for visit creation
  chief_complaint: '',
};

const EMPTY_VITALS = {
  blood_pressure_sys: '', blood_pressure_dia: '',
  pulse_rate: '', temperature: '', respiratory_rate: '',
  oxygen_saturation: '', weight: '', height: '',
  blood_glucose: '', pain_score: 0, general_appearance: '', notes: '',
};

// ── Step 1: Bio data (Receptionist) ──────────────────────────────────────────
const BioDataStep = ({ form, set, errors, isEdit }) => (
  <div className="space-y-5">
    <Section icon={User} title="Personal Information" color="teal">
      <div className="grid grid-cols-2 gap-3">
        <F label="First Name *" error={errors.first_name}>
          <Input name="first_name" value={form.first_name} onChange={set} placeholder="Chioma" error={errors.first_name}/>
        </F>
        <F label="Last Name *" error={errors.last_name}>
          <Input name="last_name" value={form.last_name} onChange={set} placeholder="Okafor" error={errors.last_name}/>
        </F>
        <F label="Email" error={errors.email}>
          <Input type="email" name="email" value={form.email} onChange={set} placeholder="chioma@clinic.ng" error={errors.email}/>
        </F>
        <F label="Phone *" error={errors.phone}>
          <Input type="tel" name="phone" value={form.phone} onChange={set} placeholder="+234-801-234-5678" error={errors.phone}/>
        </F>
        <F label="Date of Birth *" error={errors.date_of_birth}>
          <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} error={errors.date_of_birth}/>
        </F>
        <F label="Gender">
          <Select name="gender" value={form.gender} onChange={set}>
            <option value="">Select</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </Select>
        </F>
        {!isEdit && (
          <F label="Chief Complaint *" error={errors.chief_complaint} span2>
            <Input name="chief_complaint" value={form.chief_complaint} onChange={set}
              placeholder="Main reason for visit e.g. Fever, Chest pain, Follow-up"
              error={errors.chief_complaint}/>
          </F>
        )}
      </div>
    </Section>

    <Section icon={MapPin} title="Address" color="blue">
      <div className="space-y-3">
        <F label="Street Address">
          <Input name="address" value={form.address} onChange={set} placeholder="Street address"/>
        </F>
        <div className="grid grid-cols-3 gap-3">
          <F label="City"> <Input name="city"     value={form.city}     onChange={set} placeholder="Lagos"/></F>
          <F label="State"><Input name="state"    value={form.state}    onChange={set} placeholder="Lagos"/></F>
          <F label="Zip">  <Input name="zip_code" value={form.zip_code} onChange={set} placeholder="100001"/></F>
        </div>
      </div>
    </Section>

    <Section icon={Heart} title="Medical Information" color="rose">
      <div className="grid grid-cols-2 gap-3">
        <F label="Blood Type">
          <Select name="blood_type" value={form.blood_type} onChange={set}>
            <option value="">Unknown</option>
            {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
          </Select>
        </F>
        <F label="Allergies">
          <Input name="allergies" value={form.allergies} onChange={set} placeholder="Penicillin, Peanuts"/>
        </F>
        <F label="Chronic Conditions" span2>
          <Input name="chronic_conditions" value={form.chronic_conditions} onChange={set} placeholder="Diabetes, Hypertension"/>
        </F>
      </div>
    </Section>

    <Section icon={Shield} title="Insurance" color="purple">
      <div className="grid grid-cols-2 gap-3">
        <F label="Provider">
          <Input name="insurance_provider" value={form.insurance_provider} onChange={set} placeholder="NHIS, HMO"/>
        </F>
        <F label="Policy Number">
          <Input name="insurance_policy_number" value={form.insurance_policy_number} onChange={set} placeholder="Policy number"/>
        </F>
        <F label="Group Number" span2>
          <Input name="insurance_group_number" value={form.insurance_group_number} onChange={set} placeholder="Group number (optional)"/>
        </F>
      </div>
    </Section>

    <Section icon={AlertCircle} title="Emergency Contact" color="amber">
      <div className="grid grid-cols-2 gap-3">
        <F label="Full Name">
          <Input name="emergency_contact_name" value={form.emergency_contact_name} onChange={set} placeholder="Full name"/>
        </F>
        <F label="Phone">
          <Input type="tel" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={set} placeholder="Phone number"/>
        </F>
        <F label="Relationship" span2>
          <Input name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={set} placeholder="Spouse, Parent, Sibling"/>
        </F>
      </div>
    </Section>
  </div>
);

// ── Step 2: Vital signs (Nurse) ───────────────────────────────────────────────
const VitalsStep = ({ vitals, setVital, patientName }) => {
  const bmi = vitals.weight && vitals.height
    ? (parseFloat(vitals.weight) / ((parseFloat(vitals.height) / 100) ** 2)).toFixed(1)
    : null;
  const bmiLabel = bmi
    ? bmi < 18.5 ? { text: 'Underweight', color: 'text-blue-600' }
    : bmi < 25   ? { text: 'Normal',       color: 'text-green-600' }
    : bmi < 30   ? { text: 'Overweight',   color: 'text-amber-600' }
    :              { text: 'Obese',         color: 'text-red-600' }
    : null;

  return (
    <div className="space-y-5">
      {patientName && (
        <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white"/>
          </div>
          <div>
            <p className="text-sm font-bold text-teal-800">Recording vitals for: {patientName}</p>
            <p className="text-xs text-teal-500">Nurse — pre-consultation assessment</p>
          </div>
        </div>
      )}

      <Section icon={Activity} title="Vital Signs" color="rose">
        <div className="grid grid-cols-2 gap-4">

          <F label="Blood Pressure (mmHg)">
            <div className="flex gap-2 items-center">
              <Input type="number" value={vitals.blood_pressure_sys}
                onChange={e => setVital('blood_pressure_sys', e.target.value)}
                placeholder="Systolic" min="60" max="250"/>
              <span className="text-slate-400 font-bold">/</span>
              <Input type="number" value={vitals.blood_pressure_dia}
                onChange={e => setVital('blood_pressure_dia', e.target.value)}
                placeholder="Diastolic" min="40" max="150"/>
            </div>
            <VitalAlert value={vitals.blood_pressure_sys} high={140} low={90}
              highLabel="Hypertension" lowLabel="Hypotension" normalLabel="Normal BP"/>
          </F>

          <F label="Temperature (°C)">
            <Input type="number" step="0.1" value={vitals.temperature}
              onChange={e => setVital('temperature', e.target.value)}
              placeholder="e.g. 36.6" min="35" max="43"/>
            <VitalAlert value={vitals.temperature} high={38} low={36}
              highLabel="Fever" lowLabel="Hypothermia" normalLabel="Afebrile"/>
          </F>

          <F label="Pulse Rate (bpm)">
            <Input type="number" value={vitals.pulse_rate}
              onChange={e => setVital('pulse_rate', e.target.value)}
              placeholder="e.g. 72" min="30" max="220"/>
            <VitalAlert value={vitals.pulse_rate} high={100} low={60}
              highLabel="Tachycardia" lowLabel="Bradycardia" normalLabel="Normal pulse"/>
          </F>

          <F label="SpO₂ (%)">
            <Input type="number" step="0.1" value={vitals.oxygen_saturation}
              onChange={e => setVital('oxygen_saturation', e.target.value)}
              placeholder="e.g. 98" min="50" max="100"/>
            <VitalAlert value={vitals.oxygen_saturation} low={95}
              lowLabel="Low oxygen — monitor closely" normalLabel="Normal SpO₂"/>
          </F>

          <F label="Respiratory Rate (/min)">
            <Input type="number" value={vitals.respiratory_rate}
              onChange={e => setVital('respiratory_rate', e.target.value)}
              placeholder="e.g. 16" min="8" max="60"/>
          </F>

          <F label="Blood Glucose (mmol/L)">
            <Input type="number" step="0.1" value={vitals.blood_glucose}
              onChange={e => setVital('blood_glucose', e.target.value)}
              placeholder="e.g. 5.5" min="1" max="50"/>
            <VitalAlert value={vitals.blood_glucose} high={7} low={3.9}
              highLabel="Hyperglycaemia" lowLabel="Hypoglycaemia" normalLabel="Normal glucose"/>
          </F>

          <F label="Weight (kg)">
            <Input type="number" step="0.1" value={vitals.weight}
              onChange={e => setVital('weight', e.target.value)}
              placeholder="e.g. 70" min="1" max="300"/>
          </F>

          <F label="Height (cm)">
            <Input type="number" value={vitals.height}
              onChange={e => setVital('height', e.target.value)}
              placeholder="e.g. 170" min="30" max="250"/>
          </F>

          {bmi && (
            <div className="col-span-2 flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">BMI (auto-computed)</p>
                <p className="text-2xl font-black text-slate-800">{bmi}</p>
              </div>
              <span className={`font-bold text-sm ${bmiLabel?.color}`}>{bmiLabel?.text}</span>
            </div>
          )}

          <F label={`Pain Score: ${vitals.pain_score}/10`} span2>
            <input type="range" min="0" max="10" value={vitals.pain_score}
              onChange={e => setVital('pain_score', e.target.value)}
              className="w-full accent-teal-600 mt-2"/>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>No pain (0)</span><span>Worst pain (10)</span>
            </div>
          </F>

          <F label="General Appearance">
            <Select value={vitals.general_appearance}
              onChange={e => setVital('general_appearance', e.target.value)}>
              <option value="">Select</option>
              {['Alert and oriented','Confused','Anxious','In distress',
                'Lethargic','Unresponsive','Other'].map(g => <option key={g}>{g}</option>)}
            </Select>
          </F>

          <F label="Nurse Notes">
            <textarea value={vitals.notes} onChange={e => setVital('notes', e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
                focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
                outline-none transition-all resize-none"
              placeholder="Referral notes, observations…"/>
          </F>
        </div>
      </Section>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const PatientForm = ({ patient = null, isLoading: externalLoading = false, onSubmit, onCancel, mode = 'add' }) => {
  const isEdit = mode === 'edit';                    // derived once — used throughout
  const [step,               setStep]               = useState(1);
  const [form,               setForm]               = useState({ ...EMPTY_PATIENT });
  const [vitals,             setVitals]             = useState({ ...EMPTY_VITALS });
  const [errors,             setErrors]             = useState({});
  const [submitting,         setSubmitting]         = useState(false);
  const [portalCredentials,  setPortalCredentials]  = useState(null);
  const [createdPatientName, setCreatedPatientName] = useState('');

  const isLoading = externalLoading || submitting;

  // Populate form in edit mode (preserved from existing)
  useEffect(() => {
    if (patient && mode === 'edit') {
      setForm(f => ({
        ...f,
        ...Object.fromEntries(
          Object.keys(EMPTY_PATIENT).map(k => [k, patient[k] || ''])
        ),
      }));
      setStep(1);
    }
  }, [patient, mode]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const setVital = (k, v) => setVitals(p => ({ ...p, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim())    errs.first_name    = 'Required';
    if (!form.last_name.trim())     errs.last_name     = 'Required';
    if (!form.phone.trim())         errs.phone         = 'Required';
    if (!form.date_of_birth)        errs.date_of_birth = 'Required';
    if (!isEdit && !form.chief_complaint?.trim()) errs.chief_complaint = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email format';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(2); };

  const submit = async (e) => {
    e.preventDefault();

    // Step 1 Next button
    if (step === 1 && mode !== 'edit') { handleNext(); return; }

    // Edit mode — delegate to parent
    if (mode === 'edit') {
      if (onSubmit) onSubmit(form);
      return;
    }

    // Step 2 final submit — add mode
    if (!validate()) return;
    try {
      setSubmitting(true);
      // Attach vitals to payload if at least one field filled
      const hasVitals = Object.entries(vitals).some(([k, v]) => k !== 'pain_score' && v !== '' && v !== null);
      const payload = { ...form };
      if (hasVitals) payload._vitals = vitals;

      // Call patientsService directly to capture portal_credentials (preserved from existing)
      const response = await patientsService.createPatient(payload);

      if (response.data?.portal_credentials) {
        setPortalCredentials(response.data.portal_credentials);
        setCreatedPatientName(`${form.first_name} ${form.last_name}`);
      } else {
        if (onSubmit) onSubmit(form, response);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create patient';
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredentialsDismiss = () => {
    setPortalCredentials(null);
    if (onSubmit) onSubmit(null, { dismissed: true });
  };

  const patientName = form.first_name && form.last_name
    ? `${form.first_name} ${form.last_name}` : '';

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        <StepBar step={step} mode={mode} />

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0"/>
            {errors.general}
          </div>
        )}

        {step === 1
          ? <BioDataStep form={form} set={set} errors={errors} isEdit={isEdit}/>
          : <VitalsStep  vitals={vitals} setVital={setVital} patientName={patientName}/>
        }

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <button type="button"
            onClick={step === 2 ? () => setStep(1) : onCancel}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            {step === 2 ? <><ChevronLeft className="w-4 h-4"/> Back</> : 'Cancel'}
          </button>

          <div className="flex items-center gap-3">
            {step === 1 && mode !== 'edit' && (
              <p className="text-xs text-slate-400">Step 1 of 2 · Bio data (Receptionist)</p>
            )}
            <button type="submit" disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50">
              {isLoading && <Loader className="w-4 h-4 animate-spin"/>}
              {step === 1 && mode !== 'edit'
                ? <> Next — Vital Signs <ChevronRight className="w-4 h-4"/></>
                : isLoading ? 'Saving...'
                : mode === 'add' ? 'Create Patient'
                : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Credentials modal (preserved from existing) */}
      {portalCredentials && (
        <CredentialsModal
          credentials={portalCredentials}
          patientName={createdPatientName}
          onClose={handleCredentialsDismiss}
        />
      )}
    </>
  );
};

export default PatientForm;