import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, FileText, Loader } from 'lucide-react';
import { getDoctorAvailability } from '../services/appointmentService';

const F = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
const inp = (err) => `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${err ? 'bg-red-50 border-red-300 focus:border-red-400' : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;
const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all appearance-none cursor-pointer`;

const Section = ({ icon: Icon, title, color, children }) => (
  <div className="space-y-3">
    <div className={`flex items-center gap-2 pb-2 border-b border-slate-100`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</h4>
    </div>
    {children}
  </div>
);

const AppointmentForm = ({ appointment = null, patientId = null, isLoading = false, onSubmit, onCancel, mode = 'add' }) => {
  const [form, setForm] = useState({
    patient_id: patientId || '', doctor_id: '',
    appointment_date: '', appointment_time: '',
    duration_minutes: 30, reason_for_visit: '',
    notes: '', status: 'Scheduled', is_confirmed: 0,
  });
  const [errors, setErrors] = useState({});
  const [slots, setSlots]   = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (appointment && mode === 'edit') {
      setForm(f => ({ ...f,
        patient_id: appointment.patient_id || '',
        doctor_id: appointment.doctor_id || '',
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        duration_minutes: appointment.duration_minutes || 30,
        reason_for_visit: appointment.reason_for_visit || '',
        notes: appointment.notes || '',
        status: appointment.status || 'Scheduled',
        is_confirmed: appointment.is_confirmed || 0,
      }));
    }
  }, [appointment, mode]);

  const loadSlots = useCallback(async () => {
    if (!form.doctor_id || !form.appointment_date || mode !== 'add') return;
    try {
      setLoadingSlots(true);
      const data = await getDoctorAvailability(form.doctor_id, form.appointment_date);
      setSlots(data.available_slots || []);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  }, [form.doctor_id, form.appointment_date, mode]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const set = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_id) errs.patient_id = 'Required';
    if (!form.appointment_date) errs.appointment_date = 'Required';
    if (!form.appointment_time) errs.appointment_time = 'Required';
    if (!form.reason_for_visit.trim()) errs.reason_for_visit = 'Required';
    if (mode === 'add' && new Date(form.appointment_date) < new Date(new Date().toDateString())) errs.appointment_date = 'Cannot be in the past';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate() && onSubmit) onSubmit(form); };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section icon={Calendar} title="Appointment Details" color="text-teal-500">
        <div className="grid grid-cols-2 gap-3">
          {!patientId && (
            <F label="Patient ID *" error={errors.patient_id}>
              <input type="number" name="patient_id" value={form.patient_id} onChange={set} className={inp(errors.patient_id)} placeholder="Patient ID" />
            </F>
          )}
          <F label="Doctor ID">
            <input type="number" name="doctor_id" value={form.doctor_id} onChange={set} className={inp(false)} placeholder="Doctor ID (optional)" />
          </F>
          <F label="Date *" error={errors.appointment_date}>
            <input type="date" name="appointment_date" value={form.appointment_date} onChange={set}
              min={mode === 'add' ? new Date().toISOString().split('T')[0] : undefined} className={inp(errors.appointment_date)} />
          </F>
          <F label="Time *" error={errors.appointment_time}>
            {loadingSlots ? <p className="text-sm text-slate-400 py-2">Loading slots…</p> : (
              <select name="appointment_time" value={form.appointment_time} onChange={set} className={`${sel} ${errors.appointment_time ? 'border-red-300' : ''}`}>
                <option value="">Select time</option>
                {mode === 'add' && slots.length > 0
                  ? slots.map(s => <option key={s} value={s}>{s}</option>)
                  : <option value={form.appointment_time}>{form.appointment_time || 'Manual entry'}</option>}
              </select>
            )}
          </F>
        </div>
      </Section>

      <Section icon={Clock} title="Duration & Status" color="text-blue-500">
        <div className="grid grid-cols-2 gap-3">
          <F label="Duration">
            <select name="duration_minutes" value={form.duration_minutes} onChange={set} className={sel}>
              {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d < 60 ? `${d} min` : `${d/60}h`}</option>)}
            </select>
          </F>
          <F label="Status">
            <select name="status" value={form.status} onChange={set} className={sel}>
              {['Scheduled','Completed','Cancelled','No-Show','Rescheduled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </F>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer mt-1">
          <input type="checkbox" name="is_confirmed" checked={form.is_confirmed === 1} onChange={set}
            className="w-4 h-4 accent-teal-600 rounded" />
          <span className="text-sm text-slate-600 font-medium">Mark as confirmed</span>
        </label>
      </Section>

      <Section icon={FileText} title="Visit Details" color="text-violet-500">
        <F label="Reason for Visit *" error={errors.reason_for_visit}>
          <input type="text" name="reason_for_visit" value={form.reason_for_visit} onChange={set}
            className={inp(errors.reason_for_visit)} placeholder="e.g., General Checkup, Follow-up" />
        </F>
        <F label="Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={3}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            placeholder="Additional notes (optional)" />
        </F>
      </Section>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Schedule Appointment' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;