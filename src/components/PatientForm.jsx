import React, { useState, useEffect } from 'react';
import { User, MapPin, Heart, Shield, AlertCircle, Loader, Copy, Check, X } from 'lucide-react';
import patientsService from '../services/patientsService';

// ── Reusable field wrappers ────────────────────────────────────────────────────
const F = ({ label, error, children, span2 = false }) => (
  <div className={span2 ? 'col-span-2' : ''}>
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
    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer">
    {children}
  </select>
);

const Section = ({ icon: Icon, title, color = 'teal', children }) => {
  const palette = {
    teal:   { wrap: 'bg-teal-50/60 border-teal-100',   icon: 'bg-teal-100 text-teal-600'   },
    blue:   { wrap: 'bg-blue-50/60 border-blue-100',   icon: 'bg-blue-100 text-blue-600'   },
    rose:   { wrap: 'bg-rose-50/60 border-rose-100',   icon: 'bg-rose-100 text-rose-600'   },
    purple: { wrap: 'bg-purple-50/60 border-purple-100',icon:'bg-purple-100 text-purple-600'},
    amber:  { wrap: 'bg-amber-50/60 border-amber-100', icon: 'bg-amber-100 text-amber-600' },
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

// ── Credentials modal ─────────────────────────────────────────────────────────
const CredentialsModal = ({ credentials, patientName, onClose }) => {
  const [copied, setCopied] = useState('');

  const copy = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch { /* fallback: execCommand */ }
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

        {/* Header */}
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

        {/* Credentials */}
        <div className="p-6 space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-teal-800 text-sm font-semibold flex items-center gap-2">
              🔑 Patient Portal Credentials
            </p>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Login Email</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 truncate">
                  {credentials.email}
                </code>
                <button
                  onClick={() => copy(credentials.email, 'email')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 transition-colors flex items-center gap-1">
                  {copied === 'email' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Default Password</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 font-bold tracking-widest">
                  {credentials.default_password}
                </code>
                <button
                  onClick={() => copy(credentials.default_password, 'password')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 transition-colors flex items-center gap-1">
                  {copied === 'password' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            </div>

            <p className="text-xs text-teal-700 bg-teal-100 rounded-lg px-3 py-2">
              ℹ Password = first 4 letters of surname + last 4 digits of phone
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-amber-800 text-sm font-semibold">Hand these to the patient before they leave</p>
              <p className="text-amber-700 text-xs mt-1">
                They can log in at <strong className="font-semibold">{window.location.origin}/login</strong> to
                view appointments, lab results, and bills.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={copyAll}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm hover:bg-slate-100 transition-colors">
            {copied === 'all' ? <><Check className="w-4 h-4 text-teal-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy All</>}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-teal-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Default form state ─────────────────────────────────────────────────────────
const EMPTY_PATIENT = {
  first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '',
  address: '', city: '', state: '', zip_code: '', blood_type: '', allergies: '',
  chronic_conditions: '', insurance_provider: '', insurance_policy_number: '',
  insurance_group_number: '',
  emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
};

// ── Main component ─────────────────────────────────────────────────────────────
const PatientForm = ({ patient = null, isLoading: externalLoading = false, onSubmit, onCancel, mode = 'add' }) => {
  const [form,               setForm]               = useState(EMPTY_PATIENT);
  const [errors,             setErrors]             = useState({});
  const [submitting,         setSubmitting]         = useState(false);
  const [portalCredentials,  setPortalCredentials]  = useState(null);
  const [createdPatientName, setCreatedPatientName] = useState('');

  const isLoading = externalLoading || submitting;

  useEffect(() => {
    if (patient && mode === 'edit') {
      setForm(f => ({
        ...f,
        ...Object.fromEntries(
          Object.keys(EMPTY_PATIENT).map(k => [k, patient[k] || ''])
        ),
      }));
    }
  }, [patient, mode]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim())  errs.first_name    = 'Required';
    if (!form.last_name.trim())   errs.last_name     = 'Required';
    if (!form.phone.trim())       errs.phone         = 'Required';
    if (!form.date_of_birth)      errs.date_of_birth = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // edit mode → delegate to parent as before
    if (mode === 'edit') {
      if (onSubmit) onSubmit(form);
      return;
    }

    // add mode → call API directly so we can capture portal_credentials
    try {
      setSubmitting(true);
      const response = await patientsService.createPatient(form);

      if (response.data?.portal_credentials) {
        setPortalCredentials(response.data.portal_credentials);
        setCreatedPatientName(`${form.first_name} ${form.last_name}`);
        // Don't navigate yet — wait for the staff to dismiss the credentials modal
      } else {
        // Fallback: no credentials in response → call parent handler
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
    // Tell parent we're done so it can close the modal / navigate away
    if (onSubmit) onSubmit(null, { dismissed: true });
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-5">

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errors.general}
          </div>
        )}

        {/* ── Personal Information ── */}
        <Section icon={User} title="Personal Information" color="teal">
          <div className="grid grid-cols-2 gap-3">
            <F label="First Name *" error={errors.first_name}>
              <Input name="first_name" value={form.first_name} onChange={set} placeholder="Chioma" error={errors.first_name} />
            </F>
            <F label="Last Name *" error={errors.last_name}>
              <Input name="last_name" value={form.last_name} onChange={set} placeholder="Okafor" error={errors.last_name} />
            </F>
            <F label="Email" error={errors.email}>
              <Input type="email" name="email" value={form.email} onChange={set} placeholder="chioma@clinic.ng" error={errors.email} />
            </F>
            <F label="Phone *" error={errors.phone}>
              <Input type="tel" name="phone" value={form.phone} onChange={set} placeholder="+234-801-234-5678" error={errors.phone} />
            </F>
            <F label="Date of Birth *" error={errors.date_of_birth}>
              <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} error={errors.date_of_birth} />
            </F>
            <F label="Gender">
              <Select name="gender" value={form.gender} onChange={set}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </Select>
            </F>
          </div>
        </Section>

        {/* ── Address ── */}
        <Section icon={MapPin} title="Address" color="blue">
          <div className="space-y-3">
            <F label="Street Address">
              <Input name="address" value={form.address} onChange={set} placeholder="Street address" />
            </F>
            <div className="grid grid-cols-3 gap-3">
              <F label="City"> <Input name="city"     value={form.city}     onChange={set} placeholder="Lagos"  /></F>
              <F label="State"><Input name="state"    value={form.state}    onChange={set} placeholder="Lagos"  /></F>
              <F label="Zip">  <Input name="zip_code" value={form.zip_code} onChange={set} placeholder="100001" /></F>
            </div>
          </div>
        </Section>

        {/* ── Medical Information ── */}
        <Section icon={Heart} title="Medical Information" color="rose">
          <div className="grid grid-cols-2 gap-3">
            <F label="Blood Type">
              <Select name="blood_type" value={form.blood_type} onChange={set}>
                <option value="">Unknown</option>
                {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
              </Select>
            </F>
            <F label="Allergies">
              <Input name="allergies" value={form.allergies} onChange={set} placeholder="Penicillin, Peanuts" />
            </F>
            <F label="Chronic Conditions" span2>
              <Input name="chronic_conditions" value={form.chronic_conditions} onChange={set} placeholder="Diabetes, Hypertension" />
            </F>
          </div>
        </Section>

        {/* ── Insurance ── */}
        <Section icon={Shield} title="Insurance" color="purple">
          <div className="grid grid-cols-2 gap-3">
            <F label="Provider">
              <Input name="insurance_provider" value={form.insurance_provider} onChange={set} placeholder="NHIS, HMO" />
            </F>
            <F label="Policy Number">
              <Input name="insurance_policy_number" value={form.insurance_policy_number} onChange={set} placeholder="Policy number" />
            </F>
            <F label="Group Number" span2>
              <Input name="insurance_group_number" value={form.insurance_group_number} onChange={set} placeholder="Group number (optional)" />
            </F>
          </div>
        </Section>

        {/* ── Emergency Contact ── */}
        <Section icon={AlertCircle} title="Emergency Contact" color="amber">
          <div className="grid grid-cols-2 gap-3">
            <F label="Full Name">
              <Input name="emergency_contact_name" value={form.emergency_contact_name} onChange={set} placeholder="Full name" />
            </F>
            <F label="Phone">
              <Input type="tel" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={set} placeholder="Phone number" />
            </F>
            <F label="Relationship" span2>
              <Input name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={set} placeholder="Spouse, Parent, Sibling" />
            </F>
          </div>
        </Section>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Saving...' : mode === 'add' ? 'Create Patient' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Credentials modal — rendered outside the form so it overlays everything */}
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