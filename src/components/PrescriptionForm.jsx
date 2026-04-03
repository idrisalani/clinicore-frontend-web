import React, { useState, useEffect } from 'react';
import { Pill, Loader } from 'lucide-react';
import { getMedications } from '../services/pharmacyService';

const F = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const inp = (err=false) => `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${err ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;
const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer`;
const ta  = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none`;

const empty = {
  patient_id:'', consultation_id:'', doctor_id:'', medication_id:'',
  prescription_date: new Date().toISOString().split('T')[0],
  prescribed_dosage:'', frequency:'', duration_days:'', quantity:'',
  refills_remaining:0, instructions:'', special_instructions:'',
  status:'Active', expiry_date:'', notes:'',
};

const PrescriptionForm = ({ prescription=null, patientId=null, medications=[], isLoading=false, onSubmit, onCancel, mode='add' }) => {
  const [form, setForm]     = useState({ ...empty, patient_id: patientId || '' });
  const [medList, setMedList] = useState(medications);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try { const r = await getMedications('', 1); setMedList(r.medications || []); } catch {}
    };
    if (!medications?.length) load();
  }, [medications]);

  useEffect(() => {
    if (prescription && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(empty).map(k => [k, prescription[k] ?? empty[k]])) }));
    }
  }, [prescription, mode]);

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const handleMedChange = (e) => {
    const id = e.target.value;
    const med = medList.find(m => m.medication_id === parseInt(id));
    setForm(f => ({ ...f, medication_id: id, prescribed_dosage: med?.default_dosage || f.prescribed_dosage, frequency: med?.default_frequency || f.frequency }));
    if (errors.medication_id) setErrors(ev => ({ ...ev, medication_id: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_id)               errs.patient_id = 'Required';
    if (!form.medication_id)            errs.medication_id = 'Required';
    if (!form.prescribed_dosage.trim()) errs.prescribed_dosage = 'Required';
    if (!form.frequency.trim())         errs.frequency = 'Required';
    if (!form.quantity)                 errs.quantity = 'Required';
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Patient ID *" error={errors.patient_id}>
          <input type="number" name="patient_id" value={form.patient_id} onChange={set} className={inp(errors.patient_id)} placeholder="Patient ID" />
        </F>
        <F label="Prescription Date">
          <input type="date" name="prescription_date" value={form.prescription_date} onChange={set} className={inp()} />
        </F>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Prescription Details</h4>
        </div>

        <F label="Medication *" error={errors.medication_id}>
          <select name="medication_id" value={form.medication_id} onChange={handleMedChange} className={`${sel} ${errors.medication_id ? 'border-red-300' : ''}`}>
            <option value="">Select Medication</option>
            {medList.map(m => <option key={m.medication_id} value={m.medication_id}>{m.generic_name} ({m.brand_name || 'No brand'})</option>)}
          </select>
        </F>

        <div className="grid grid-cols-2 gap-3">
          <F label="Dosage *" error={errors.prescribed_dosage}>
            <input name="prescribed_dosage" value={form.prescribed_dosage} onChange={set} className={inp(errors.prescribed_dosage)} placeholder="500mg, 1 tablet" />
          </F>
          <F label="Frequency *" error={errors.frequency}>
            <input name="frequency" value={form.frequency} onChange={set} className={inp(errors.frequency)} placeholder="Twice daily, Every 6hrs" />
          </F>
          <F label="Duration (Days)">
            <input type="number" name="duration_days" value={form.duration_days} onChange={set} className={inp()} placeholder="7, 14, 30" />
          </F>
          <F label="Quantity *" error={errors.quantity}>
            <input type="number" name="quantity" value={form.quantity} onChange={set} className={inp(errors.quantity)} placeholder="Number of units" />
          </F>
          <F label="Refills Remaining">
            <input type="number" name="refills_remaining" value={form.refills_remaining} onChange={set} className={inp()} placeholder="0" />
          </F>
          <F label="Status">
            <select name="status" value={form.status} onChange={set} className={sel}>
              {['Active','Completed','Cancelled','Suspended'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="Expiry Date">
            <input type="date" name="expiry_date" value={form.expiry_date} onChange={set} className={inp()} />
          </F>
        </div>

        <F label="Instructions">
          <textarea name="instructions" value={form.instructions} onChange={set} rows={2} className={ta} placeholder="General instructions for patient" />
        </F>
        <F label="Special Instructions">
          <textarea name="special_instructions" value={form.special_instructions} onChange={set} rows={2} className={ta} placeholder="Take with food, avoid alcohol…" />
        </F>
        <F label="Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Additional notes" />
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Issue Prescription' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;