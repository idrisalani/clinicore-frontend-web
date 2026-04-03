import React, { useState, useEffect } from 'react';
import { User, MapPin, Heart, Shield, AlertCircle, Loader } from 'lucide-react';

const F = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input {...props} className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none ${
    error ? 'bg-red-50 border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
           : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`} />
);

const Select = ({ children, ...props }) => (
  <select {...props} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer">
    {children}
  </select>
);

const Section = ({ icon: Icon, title, color = 'teal', children }) => {
  const colors = {
    teal:   'bg-teal-50 border-teal-100 text-teal-600',
    blue:   'bg-blue-50 border-blue-100 text-blue-600',
    rose:   'bg-rose-50 border-rose-100 text-rose-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    amber:  'bg-amber-50 border-amber-100 text-amber-600',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]?.split(' ').slice(0,2).join(' ')} border-slate-100 bg-slate-50`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]?.split(' ').slice(0,1).join(' ')}`}>
          <Icon className={`w-4 h-4 ${colors[color]?.split(' ').slice(2).join(' ')}`} />
        </div>
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
};

const EMPTY_PATIENT = {
  first_name:'', last_name:'', email:'', phone:'', date_of_birth:'', gender:'',
  address:'', city:'', state:'', zip_code:'', blood_type:'', allergies:'',
  chronic_conditions:'', insurance_provider:'', insurance_policy_number:'',
  emergency_contact_name:'', emergency_contact_phone:'', emergency_contact_relationship:'',
};

const PatientForm = ({ patient = null, isLoading = false, onSubmit, onCancel, mode = 'add' }) => {
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(EMPTY_PATIENT).map(k => [k, patient[k] || ''])) }));
    }
  }, [patient, mode]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim())  errs.last_name  = 'Required';
    if (!form.phone.trim())      errs.phone      = 'Required';
    if (!form.date_of_birth)     errs.date_of_birth = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Section icon={User} title="Personal Information" color="teal">
        <div className="grid grid-cols-2 gap-3">
          <F label="First Name *" error={errors.first_name}><Input name="first_name" value={form.first_name} onChange={set} placeholder="Chioma" error={errors.first_name} /></F>
          <F label="Last Name *"  error={errors.last_name}> <Input name="last_name"  value={form.last_name}  onChange={set} placeholder="Okafor" error={errors.last_name} /></F>
          <F label="Email"        error={errors.email}>    <Input type="email" name="email" value={form.email} onChange={set} placeholder="chioma@clinic.ng" error={errors.email} /></F>
          <F label="Phone *"      error={errors.phone}>    <Input type="tel" name="phone" value={form.phone} onChange={set} placeholder="+234-801-234-5678" error={errors.phone} /></F>
          <F label="Date of Birth *" error={errors.date_of_birth}><Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} error={errors.date_of_birth} /></F>
          <F label="Gender"><Select name="gender" value={form.gender} onChange={set}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></Select></F>
        </div>
      </Section>

      <Section icon={MapPin} title="Address" color="blue">
        <div className="space-y-3">
          <F label="Street Address"><Input name="address" value={form.address} onChange={set} placeholder="Street address" /></F>
          <div className="grid grid-cols-3 gap-3">
            <F label="City"> <Input name="city"     value={form.city}     onChange={set} placeholder="Lagos" /></F>
            <F label="State"><Input name="state"    value={form.state}    onChange={set} placeholder="Lagos" /></F>
            <F label="Zip">  <Input name="zip_code" value={form.zip_code} onChange={set} placeholder="100001" /></F>
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
          <F label="Allergies"><Input name="allergies" value={form.allergies} onChange={set} placeholder="Penicillin, Peanuts" /></F>
          <F label="Chronic Conditions" ><div className="col-span-2"><Input name="chronic_conditions" value={form.chronic_conditions} onChange={set} placeholder="Diabetes, Hypertension" /></div></F>
        </div>
        <div className="col-span-2 mt-3">
          <F label="Chronic Conditions"><Input name="chronic_conditions" value={form.chronic_conditions} onChange={set} placeholder="Diabetes, Hypertension" /></F>
        </div>
      </Section>

      <Section icon={Shield} title="Insurance" color="purple">
        <div className="grid grid-cols-2 gap-3">
          <F label="Provider"><Input name="insurance_provider" value={form.insurance_provider} onChange={set} placeholder="NHIS" /></F>
          <F label="Policy Number"><Input name="insurance_policy_number" value={form.insurance_policy_number} onChange={set} placeholder="Policy number" /></F>
        </div>
      </Section>

      <Section icon={AlertCircle} title="Emergency Contact" color="amber">
        <div className="grid grid-cols-2 gap-3">
          <F label="Full Name"><Input name="emergency_contact_name" value={form.emergency_contact_name} onChange={set} placeholder="Full name" /></F>
          <F label="Phone"><Input type="tel" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={set} placeholder="Phone number" /></F>
          <div className="col-span-2">
            <F label="Relationship"><Input name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={set} placeholder="Spouse, Parent, Sibling" /></F>
          </div>
        </div>
      </Section>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving...' : mode === 'add' ? 'Create Patient' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;