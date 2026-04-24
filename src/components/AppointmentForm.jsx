import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Clock, FileText, Loader, Search, User, X, ChevronDown } from 'lucide-react';
import api from '../services/api.js';

// ── Style helpers ─────────────────────────────────────────────────────────────
const F = ({ label, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const inp = (err = false) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${
    err ? 'bg-red-50 border-red-300 focus:border-red-400'
        : 'bg-slate-50 border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100'}`;

const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100
  outline-none transition-all appearance-none cursor-pointer`;

const Section = ({ icon: Icon, title, color, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      <Icon className={`w-4 h-4 ${color}`} />
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title}</h4>
    </div>
    {children}
  </div>
);

// ── Reusable search-dropdown (patient or doctor) ──────────────────────────────
const SearchSelect = ({ placeholder, fetchUrl, formatLabel, formatSub, onSelect, selected, onClear, error, disabled = false }) => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref     = useRef(null);
  const debounce = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounce.current);
    if (!open) return;
    debounce.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(fetchUrl, { params: { search: query, limit: 15 } });
        // Support both /patients and /admin/users response shapes
        setResults(res.data.patients || res.data.users || []);
      } catch { setResults([]); }
      finally  { setLoading(false); }
    }, 280);
    return () => clearTimeout(debounce.current);
  }, [query, open, fetchUrl]);

  const handleFocus = () => { setOpen(true); if (!query) setResults([]); };

  if (selected) {
    return (
      <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${error ? 'border-red-300 bg-red-50' : 'border-teal-300 bg-teal-50'}`}>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800">{formatLabel(selected)}</p>
            <p className="text-xs text-slate-500">{formatSub(selected)}</p>
          </div>
        </div>
        {!disabled && (
          <button type="button" onClick={onClear} className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && setOpen(true)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border cursor-text
          ${error ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-slate-50 focus-within:border-teal-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
        />
        {loading
          ? <Loader className="w-3.5 h-3.5 text-teal-500 animate-spin flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        }
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="w-5 h-5 text-teal-500 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">
              {query ? 'No results found' : 'Start typing to search…'}
            </div>
          ) : results.map((item, idx) => (
            <button
              key={item.patient_id || item.user_id || idx}
              type="button"
              onMouseDown={() => { onSelect(item); setOpen(false); setQuery(''); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left"
            >
              <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-teal-700">
                  {(formatLabel(item)[0] || '?').toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{formatLabel(item)}</p>
                <p className="text-xs text-slate-400">{formatSub(item)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Time slot picker ──────────────────────────────────────────────────────────
const TimeSlotPicker = ({ slots, value, onChange, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
        <Loader className="w-4 h-4 text-teal-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading available slots…</span>
      </div>
    );
  }

  if (slots.length > 0) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {slots.map(slot => (
            <button
              key={slot}
              type="button"
              onClick={() => onChange(slot)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                ${value === slot
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
            >
              {slot}
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }

  // Fallback — manual time input (no doctor selected or no slots available)
  return (
    <div className="space-y-1">
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inp(!!error)}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const empty = {
  patient_id: '', doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  duration_minutes: 30,
  reason_for_visit: '',
  notes: '',
  status: 'Scheduled',
  is_confirmed: 0,
};

// ── Main form ─────────────────────────────────────────────────────────────────
const AppointmentForm = ({
  appointment = null,
  patientId   = null,
  isLoading   = false,
  onSubmit,
  onCancel,
  mode        = 'add',
}) => {
  const [form, setForm]         = useState({ ...empty, patient_id: patientId || '' });
  const [errors, setErrors]     = useState({});
  const [slots, setSlots]       = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected objects (for display)
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor,  setSelectedDoctor]  = useState(null);

  // Populate form on edit
  useEffect(() => {
    if (appointment && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(
        Object.keys(empty).map(k => [k, appointment[k] ?? empty[k]])
      )}));
      // In edit mode, reconstruct display objects from appointment data
      if (appointment.patient_id) {
        setSelectedPatient({
          patient_id: appointment.patient_id,
          first_name: appointment.first_name || '',
          last_name:  appointment.last_name  || 'Patient',
          phone:      appointment.phone      || '',
        });
      }
      if (appointment.doctor_id) {
        setSelectedDoctor({
          user_id:   appointment.doctor_id,
          full_name: appointment.doctor_name || 'Doctor',
          role:      'doctor',
        });
      }
    }
  }, [appointment, mode]);

  // Fetch available slots whenever doctor + date are both set
  const loadSlots = useCallback(async () => {
    if (!form.doctor_id || !form.appointment_date || mode !== 'add') return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await api.get(`/appointments/doctor/${form.doctor_id}/availability`, {
        params: { date: form.appointment_date },
      });
      setSlots(res.data.available_slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [form.doctor_id, form.appointment_date, mode]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Clear time when date or doctor changes so stale slot isn't submitted
  useEffect(() => {
    setForm(f => ({ ...f, appointment_time: '' }));
  }, [form.doctor_id, form.appointment_date]);

  const set = (e) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target.checked ? 1 : 0) : value }));
    if (errors[name]) setErrors(ev => ({ ...ev, [name]: '' }));
  };

  const setTime = (time) => {
    setForm(f => ({ ...f, appointment_time: time }));
    if (errors.appointment_time) setErrors(ev => ({ ...ev, appointment_time: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient_id)                  errs.patient_id        = 'Please select a patient';
    if (!form.appointment_date)            errs.appointment_date  = 'Date is required';
    if (!form.appointment_time)            errs.appointment_time  = 'Time is required';
    if (!form.reason_for_visit?.trim())    errs.reason_for_visit  = 'Required';
    if (mode === 'add' && form.appointment_date) {
      const chosen = new Date(form.appointment_date);
      const today  = new Date(new Date().toDateString());
      if (chosen < today) errs.appointment_date = 'Cannot be in the past';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) onSubmit(form);
  };

  const today = new Date().toISOString().split('T')[0];
  const doctorSelected = !!form.doctor_id;
  const dateSelected   = !!form.appointment_date;

  return (
    <form onSubmit={submit} className="space-y-6">

      {/* ── Patient + Doctor ── */}
      <Section icon={Calendar} title="Appointment Details" color="text-teal-500">
        <div className="space-y-3">

          {/* Patient picker */}
          {!patientId && (
            <F label="Patient *" error={errors.patient_id}>
              <SearchSelect
                placeholder="Search patient by name or ID…"
                fetchUrl="/patients"
                formatLabel={p => `${p.first_name} ${p.last_name}`}
                formatSub={p  => `ID: ${p.patient_id}${p.phone ? ` · ${p.phone}` : ''}`}
                selected={selectedPatient}
                error={!!errors.patient_id}
                onSelect={p => {
                  setSelectedPatient(p);
                  setForm(f => ({ ...f, patient_id: p.patient_id }));
                  if (errors.patient_id) setErrors(ev => ({ ...ev, patient_id: '' }));
                }}
                onClear={() => {
                  setSelectedPatient(null);
                  setForm(f => ({ ...f, patient_id: '' }));
                }}
              />
            </F>
          )}

          {/* Doctor picker */}
          <F label="Doctor (optional — required for time slots)">
            <SearchSelect
              placeholder="Search doctor by name…"
              fetchUrl="/admin/users"
              formatLabel={u => u.full_name || u.username}
              formatSub={u  => `${u.role} · ${u.department || 'General'}`}
              selected={selectedDoctor}
              onSelect={u => {
                setSelectedDoctor(u);
                setForm(f => ({ ...f, doctor_id: u.user_id }));
              }}
              onClear={() => {
                setSelectedDoctor(null);
                setForm(f => ({ ...f, doctor_id: '', appointment_time: '' }));
                setSlots([]);
              }}
            />
            {!doctorSelected && (
              <p className="text-xs text-amber-600 mt-1">
                💡 Select a doctor to see available time slots
              </p>
            )}
          </F>

          {/* Date */}
          <F label="Date *" error={errors.appointment_date}>
            <input
              type="date"
              name="appointment_date"
              value={form.appointment_date}
              onChange={set}
              min={mode === 'add' ? today : undefined}
              className={inp(!!errors.appointment_date)}
            />
          </F>

          {/* Time — smart: shows slots if available, falls back to time input */}
          <F label={`Time * ${doctorSelected && dateSelected ? '— select an available slot' : ''}`}
             error={errors.appointment_time}>
            {!dateSelected ? (
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400">
                Please select a date first
              </div>
            ) : (
              <TimeSlotPicker
                slots={slots}
                value={form.appointment_time}
                onChange={setTime}
                loading={loadingSlots}
                error={errors.appointment_time}
              />
            )}
            {doctorSelected && dateSelected && !loadingSlots && slots.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">
                No pre-set slots found — enter time manually above
              </p>
            )}
          </F>
        </div>
      </Section>

      {/* ── Duration & Status ── */}
      <Section icon={Clock} title="Duration & Status" color="text-blue-500">
        <div className="grid grid-cols-2 gap-3">
          <F label="Duration">
            <select name="duration_minutes" value={form.duration_minutes} onChange={set} className={sel}>
              {[15, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>{d < 60 ? `${d} min` : `${d / 60}h`}</option>
              ))}
            </select>
          </F>
          <F label="Status">
            <select name="status" value={form.status} onChange={set} className={sel}>
              {['Scheduled', 'Completed', 'Cancelled', 'No-Show', 'Rescheduled'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </F>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer mt-1">
          <input
            type="checkbox"
            name="is_confirmed"
            checked={form.is_confirmed === 1}
            onChange={set}
            className="w-4 h-4 accent-teal-600 rounded"
          />
          <span className="text-sm text-slate-600 font-medium">Mark as confirmed</span>
        </label>
      </Section>

      {/* ── Visit Details ── */}
      <Section icon={FileText} title="Visit Details" color="text-violet-500">
        <F label="Reason for Visit *" error={errors.reason_for_visit}>
          <input
            type="text"
            name="reason_for_visit"
            value={form.reason_for_visit}
            onChange={set}
            className={inp(!!errors.reason_for_visit)}
            placeholder="e.g., General Checkup, Follow-up, Antenatal"
          />
        </F>
        <F label="Notes">
          <textarea
            name="notes"
            value={form.notes}
            onChange={set}
            rows={3}
            className={`${inp()} resize-none`}
            placeholder="Additional notes (optional)"
          />
        </F>
      </Section>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
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