import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';

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

const METHODS = ['Cash','Bank Transfer','Card','Cheque','Mobile Money','Other'];

const PaymentForm = ({ invoice=null, isLoading=false, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    invoice_id: invoice?.invoice_id || '',
    patient_id: invoice?.patient_id || '',
    payment_date: new Date().toISOString().split('T')[0],
    amount_paid: '',
    payment_method: 'Cash',
    reference_number: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const remaining = invoice ? Math.max(0, (invoice.total_amount||0) - (invoice.amount_paid||0)) : 0;

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'amount_paid' ? parseFloat(value)||0 : value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.invoice_id)                             errs.invoice_id = 'Required';
    if (!form.amount_paid || parseFloat(form.amount_paid) <= 0) errs.amount_paid = 'Must be greater than 0';
    if (!form.payment_date)                           errs.payment_date = 'Required';
    setErrors(errs); return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Invoice Summary */}
      {invoice && (
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-teal-200" />
            <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">Invoice Summary</p>
          </div>
          <div className="space-y-2">
            {[['Invoice', invoice.invoice_number],['Total', fmt(invoice.total_amount)],['Already Paid', fmt(invoice.amount_paid||0)]].map(([l,v]) => (
              <div key={l} className="flex justify-between items-center">
                <span className="text-teal-200 text-sm">{l}</span>
                <span className="font-semibold text-sm">{v}</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 flex justify-between items-center">
              <span className="text-teal-200 font-semibold">Outstanding</span>
              <span className="text-2xl font-black">{fmt(remaining)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Payment Details</h4>

        <F label="Payment Date *" error={errors.payment_date}>
          <input type="date" name="payment_date" value={form.payment_date} onChange={set} className={inp(errors.payment_date)} />
        </F>

        <F label="Amount Paid (₦) *" error={errors.amount_paid}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₦</span>
            <input type="number" name="amount_paid" value={form.amount_paid} onChange={set}
              className={inp(errors.amount_paid,true)} placeholder="0.00" step="0.01" max={remaining} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Max payable: {fmt(remaining)}</p>
        </F>

        <F label="Payment Method">
          <select name="payment_method" value={form.payment_method} onChange={set} className={sel}>
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </F>

        <F label="Reference Number">
          <input name="reference_number" value={form.reference_number} onChange={set} className={inp()} placeholder="Cheque #, Transaction ID" />
        </F>

        <F label="Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Additional payment notes" />
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Recording…' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;