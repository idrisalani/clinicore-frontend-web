import React, { useState, useEffect } from 'react';
import { Beaker, ClipboardList, Loader } from 'lucide-react';

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

const TESTS = [
  {value:'CBC',label:'Complete Blood Count'},{value:'CMP',label:'Comprehensive Metabolic Panel'},{value:'Lipid',label:'Lipid Panel'},
  {value:'TSH',label:'Thyroid Stimulating Hormone'},{value:'Glucose',label:'Fasting Glucose'},{value:'HbA1c',label:'Hemoglobin A1c'},
  {value:'UA',label:'Urinalysis'},{value:'PT/INR',label:'Prothrombin Time'},{value:'ECG',label:'Electrocardiogram'},{value:'Ultrasound',label:'Ultrasound'},{value:'Other',label:'Other'},
];

const emptyOrder = {
  patient_id:'', consultation_id:'', doctor_id:'', test_type:'', test_code:'', test_name:'',
  specimen_type:'', priority:'Routine', instructions:'', ordered_date:new Date().toISOString().split('T')[0], expected_date:'', status:'Ordered', notes:'',
};
const emptyResult = {
  result_value:'', unit:'', reference_range:'', result_status:'Pending', interpretation:'',
  test_date:new Date().toISOString().split('T')[0], completion_date:'', performed_by:'', notes:'',
};

const LabOrderForm = ({ labOrder=null, patientId=null, isLoading=false, onSubmit, onCancel, mode='add' }) => {
  const [form, setForm]       = useState({ ...emptyOrder, patient_id: patientId || '' });
  const [result, setResult]   = useState(emptyResult);
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (labOrder && (mode === 'edit' || mode === 'result')) {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(emptyOrder).map(k => [k, labOrder[k] ?? emptyOrder[k]])) }));
    }
  }, [labOrder, mode]);

  const setF = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };
  const setR = (e) => {
    const { name, value } = e.target;
    setResult(r => ({ ...r, [name]: value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'result') {
      if (!result.result_value.trim()) errs.result_value = 'Required';
    } else {
      if (!form.patient_id) errs.patient_id = 'Required';
      if (!form.test_type.trim()) errs.test_type = 'Required';
      if (!form.test_name.trim()) errs.test_name = 'Required';
    }
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(mode === 'result' ? result : form); };

  if (mode === 'result') return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider">Result Entry</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Result Value *" error={errors.result_value}>
            <input name="result_value" value={result.result_value} onChange={setR} className={inp(errors.result_value)} placeholder="e.g., 120, positive" />
          </F>
          <F label="Unit">
            <input name="unit" value={result.unit} onChange={setR} className={inp()} placeholder="mg/dL, mmol/L" />
          </F>
          <F label="Reference Range">
            <input name="reference_range" value={result.reference_range} onChange={setR} className={inp()} placeholder="70-100" />
          </F>
          <F label="Result Status">
            <select name="result_status" value={result.result_status} onChange={setR} className={sel}>
              {['Pending','Normal','Abnormal','Critical'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="Test Date">
            <input type="date" name="test_date" value={result.test_date} onChange={setR} className={inp()} />
          </F>
          <F label="Completion Date">
            <input type="date" name="completion_date" value={result.completion_date} onChange={setR} className={inp()} />
          </F>
          <div className="col-span-2">
            <F label="Performed By">
              <input name="performed_by" value={result.performed_by} onChange={setR} className={inp()} placeholder="Lab technician name" />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Interpretation">
              <textarea name="interpretation" value={result.interpretation} onChange={setR} rows={2} className={ta} placeholder="Clinical interpretation" />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Notes">
              <textarea name="notes" value={result.notes} onChange={setR} rows={2} className={ta} placeholder="Additional notes" />
            </F>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : 'Add Result'}
        </button>
      </div>
    </form>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Beaker className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Order Details</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Patient ID *" error={errors.patient_id}>
            <input type="number" name="patient_id" value={form.patient_id} onChange={setF} className={inp(errors.patient_id)} placeholder="Patient ID" />
          </F>
          <F label="Doctor ID">
            <input type="number" name="doctor_id" value={form.doctor_id} onChange={setF} className={inp()} placeholder="Doctor ID (optional)" />
          </F>
          <F label="Test Type *" error={errors.test_type}>
            <select name="test_type" value={form.test_type} onChange={setF} className={`${sel} ${errors.test_type ? 'border-red-300' : ''}`}>
              <option value="">Select Test Type</option>
              {TESTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </F>
          <F label="Test Name *" error={errors.test_name}>
            <input name="test_name" value={form.test_name} onChange={setF} className={inp(errors.test_name)} placeholder="Test name" />
          </F>
          <F label="Specimen Type">
            <input name="specimen_type" value={form.specimen_type} onChange={setF} className={inp()} placeholder="Blood, Urine…" />
          </F>
          <F label="Priority">
            <select name="priority" value={form.priority} onChange={setF} className={sel}>
              {['Routine','Urgent','Stat'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="Ordered Date">
            <input type="date" name="ordered_date" value={form.ordered_date} onChange={setF} className={inp()} />
          </F>
          <F label="Expected Date">
            <input type="date" name="expected_date" value={form.expected_date} onChange={setF} className={inp()} />
          </F>
          <F label="Status">
            <select name="status" value={form.status} onChange={setF} className={sel}>
              {['Ordered','In Progress','Completed','Pending','Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
          <F label="Test Code">
            <input name="test_code" value={form.test_code} onChange={setF} className={inp()} placeholder="LAB-001" />
          </F>
          <div className="col-span-2">
            <F label="Instructions (Fasting, etc.)">
              <textarea name="instructions" value={form.instructions} onChange={setF} rows={2} className={ta} placeholder="Special instructions" />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Notes">
              <textarea name="notes" value={form.notes} onChange={setF} rows={2} className={ta} placeholder="Additional notes" />
            </F>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Create Order' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default LabOrderForm;