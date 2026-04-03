import React, { useState, useEffect } from 'react';
import { Receipt, Calculator, Loader } from 'lucide-react';

const F = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const inp = (err=false,pre=false) => `w-full ${pre?'pl-8':'px-3.5'} pr-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${err ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;
const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer`;
const ta  = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none`;

const fmt = (v) => `₦${parseFloat(v||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

const empty = {
  patient_id:'', recipient_name:'', recipient_email:'', recipient_phone:'',
  consultation_id:'', doctor_id:'',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
  subtotal:'', tax_percentage:0, tax_amount:0, discount_percentage:0, discount_amount:0,
  total_amount:'', status:'Draft', notes:'', payment_terms:'',
};

const InvoiceForm = ({ invoice=null, patientId=null, isLoading=false, onSubmit, onCancel, mode='add' }) => {
  const [form, setForm] = useState({ ...empty, patient_id: patientId || '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoice && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(empty).map(k => [k, invoice[k] ?? empty[k]])) }));
    }
  }, [invoice, mode]);

  useEffect(() => {
    const sub  = parseFloat(form.subtotal) || 0;
    const tax  = Math.round(sub * (form.tax_percentage / 100) * 100) / 100;
    const disc = Math.round(sub * (form.discount_percentage / 100) * 100) / 100;
    setForm(f => ({ ...f, tax_amount: tax, discount_amount: disc, total_amount: Math.round((sub + tax - disc) * 100) / 100 }));
  }, [form.subtotal, form.tax_percentage, form.discount_percentage]);

  const set = (e) => {
    const { name, value } = e.target;
    const num = ['subtotal','tax_percentage','discount_percentage','tax_amount','discount_amount'];
    setForm(f => ({ ...f, [name]: num.includes(name) ? parseFloat(value)||0 : value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_id)              errs.patient_id = 'Required';
    if (!form.recipient_name)          errs.recipient_name = 'Required';
    if (!form.recipient_email)         errs.recipient_email = 'Required';
    if (!form.invoice_date)            errs.invoice_date = 'Required';
    if (!form.subtotal || parseFloat(form.subtotal) <= 0) errs.subtotal = 'Must be greater than 0';
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Recipient */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-4 h-4 text-violet-600" />
          <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider">Recipient Information</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Patient ID" error={errors.patient_id}>
            <input type="text" name="patient_id" value={form.patient_id} onChange={set} className={inp(errors.patient_id)} placeholder="Patient ID" />
          </F>
          <F label="Recipient Name *" error={errors.recipient_name}>
            <input name="recipient_name" value={form.recipient_name} onChange={set} className={inp(errors.recipient_name)} placeholder="Mr Ahmed Hassan" />
          </F>
          <F label="Email *" error={errors.recipient_email}>
            <input type="email" name="recipient_email" value={form.recipient_email} onChange={set} className={inp(errors.recipient_email)} placeholder="ahmed@example.com" />
          </F>
          <F label="Phone">
            <input type="tel" name="recipient_phone" value={form.recipient_phone} onChange={set} className={inp()} placeholder="+234-XXX-XXX-XXXX" />
          </F>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Invoice Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <F label="Invoice Date *" error={errors.invoice_date}>
            <input type="date" name="invoice_date" value={form.invoice_date} onChange={set} className={inp(errors.invoice_date)} />
          </F>
          <F label="Due Date">
            <input type="date" name="due_date" value={form.due_date} onChange={set} className={inp()} />
          </F>
          <div className="col-span-2">
            <F label="Status">
              <select name="status" value={form.status} onChange={set} className={sel}>
                {['Draft','Issued','Sent','Partially Paid','Paid','Cancelled'].map(s => <option key={s}>{s}</option>)}
              </select>
            </F>
          </div>
        </div>
      </div>

      {/* Financial */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Financial Details (₦)</h4>
        </div>
        <F label="Subtotal *" error={errors.subtotal}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₦</span>
            <input type="number" name="subtotal" value={form.subtotal} onChange={set} className={inp(errors.subtotal,true)} placeholder="0.00" step="0.01" />
          </div>
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Tax %">
            <input type="number" name="tax_percentage" value={form.tax_percentage} onChange={set} className={inp()} step="0.01" />
          </F>
          <F label="Tax Amount">
            <input value={fmt(form.tax_amount)} disabled className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
          </F>
          <F label="Discount %">
            <input type="number" name="discount_percentage" value={form.discount_percentage} onChange={set} className={inp()} step="0.01" />
          </F>
          <F label="Discount Amount">
            <input value={fmt(form.discount_amount)} disabled className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
          </F>
        </div>
        {/* Total */}
        <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 flex justify-between items-center">
          <span className="font-bold text-slate-700">Total Amount</span>
          <span className="text-2xl font-black text-emerald-600">{fmt(form.total_amount)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <F label="Payment Terms">
          <input name="payment_terms" value={form.payment_terms} onChange={set} className={inp()} placeholder="Net 30 days, Due on receipt" />
        </F>
        <F label="Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Additional notes" />
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Create Invoice' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;