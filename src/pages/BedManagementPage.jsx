// ============================================
// BedManagementPage.jsx
// File: frontend-web/src/pages/BedManagementPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  BedDouble, Search, RefreshCw, Users, X,
  ChevronRight, CheckCircle, Clock,
  Wrench, Sparkles, LogOut, Loader,
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—';

const daysSince = (d) => d
  ? Math.floor((Date.now() - new Date(d)) / 86400000)
  : null;

// ── Bed status config ─────────────────────────────────────────────────────────
const STATUS = {
  Available:   { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle,  dot: 'bg-emerald-500' },
  Occupied:    { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    icon: Users,        dot: 'bg-blue-500'    },
  Reserved:    { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock,        dot: 'bg-amber-400'   },
  Maintenance: { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200',     icon: Wrench,       dot: 'bg-red-400'     },
  Cleaning:    { bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200',  icon: Sparkles,     dot: 'bg-purple-400'  },
};

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const sel = `${inp} appearance-none cursor-pointer`;
const ta  = `${inp} resize-none`;

// ── Modal shell ───────────────────────────────────────────────────────────────
const Modal = ({ isOpen, title, onClose, size = 'medium', children }) => {
  if (!isOpen) return null;
  const ws = { small: 'max-w-md', medium: 'max-w-xl', large: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${ws[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, iconBg, iconCl, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconCl}`} />
      </div>
    </div>
  </div>
);

// ── Bed card ──────────────────────────────────────────────────────────────────
const BedCard = ({ bed, onAction }) => {
  const cfg = STATUS[bed.status] || STATUS.Available;
  const Icon = cfg.icon;
  const days = bed.status === 'Occupied' ? daysSince(bed.admission_date) : null;

  return (
    <div
      className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-4 cursor-pointer hover:shadow-md transition-all`}
      onClick={() => onAction(bed)}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-black text-slate-800 text-lg leading-none">Bed {bed.bed_number}</p>
          <p className="text-xs text-slate-500 mt-0.5">{bed.bed_type}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
          <Icon className="w-3 h-3" />
          {bed.status}
        </div>
      </div>

      {bed.status === 'Occupied' && bed.first_name && (
        <div className="mt-3 pt-3 border-t border-white/60">
          <p className="text-sm font-semibold text-slate-700">{bed.first_name} {bed.last_name}</p>
          <p className="text-xs text-slate-500">{bed.admission_reason}</p>
          {days !== null && (
            <p className="text-xs text-blue-600 font-semibold mt-1">Day {days + 1} of admission</p>
          )}
        </div>
      )}

      {bed.features && (
        <p className="text-xs text-slate-400 mt-2 truncate">{bed.features}</p>
      )}
    </div>
  );
};

// ── Admit form ────────────────────────────────────────────────────────────────
const AdmitForm = ({ bed, onSubmit, onCancel, isLoading }) => {
  const [patients, setPatients] = useState([]);
  const [search,   setSearch]   = useState('');
  const [doctors,  setDoctors]  = useState([]);
  const [form, setForm] = useState({
    patient_id: '', admitting_doctor_id: '',
    admission_type: 'Elective', admission_reason: '',
    diagnosis: '', expected_discharge: '',
  });

  useEffect(() => {
    api.get('/users', { params: { role: 'doctor', limit: 50 } })
      .then(r => setDoctors(r.data.users || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (search.length >= 2) {
      api.get('/patients/search', { params: { q: search, limit: 10 } })
        .then(r => setPatients(r.data.patients || [])).catch(() => {});
    } else setPatients([]);
  }, [search]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = e => {
    e.preventDefault();
    onSubmit({ ...form, bed_id: bed.bed_id, patient_id: parseInt(form.patient_id) });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
        Admitting to <strong>Bed {bed.bed_number}</strong> — {bed.ward_name} ({bed.bed_type})
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Patient *</label>
        <div className="relative">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient by name or phone…" className={inp} />
          {patients.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
              {patients.map(p => (
                <button key={p.patient_id} type="button"
                  onClick={() => { setForm(f => ({ ...f, patient_id: p.patient_id })); setSearch(`${p.first_name} ${p.last_name}`); setPatients([]); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-sm border-b border-slate-50 last:border-0">
                  <span className="font-semibold">{p.first_name} {p.last_name}</span>
                  <span className="text-slate-400 ml-2 text-xs">{p.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Admitting doctor</label>
          <select name="admitting_doctor_id" value={form.admitting_doctor_id} onChange={set} className={sel}>
            <option value="">Select doctor…</option>
            {doctors.map(d => <option key={d.user_id} value={d.user_id}>{d.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Admission type *</label>
          <select name="admission_type" value={form.admission_type} onChange={set} className={sel}>
            {['Elective','Emergency','Transfer','Maternity'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason for admission *</label>
        <textarea name="admission_reason" value={form.admission_reason} onChange={set}
          rows={2} className={ta} placeholder="Chief complaint / reason for admission…" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Diagnosis</label>
          <input name="diagnosis" value={form.diagnosis} onChange={set} className={inp} placeholder="Working diagnosis" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected discharge</label>
          <input type="date" name="expected_discharge" value={form.expected_discharge} onChange={set} className={inp} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isLoading || !form.patient_id || !form.admission_reason}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          Admit Patient
        </button>
      </div>
    </form>
  );
};

// ── Discharge form ────────────────────────────────────────────────────────────
const DischargeForm = ({ admission, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({ discharge_notes: '', discharge_type: 'Recovered' });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">
        Discharging <strong>{admission.first_name} {admission.last_name}</strong> from Bed {admission.bed_number} — {admission.ward_name}
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discharge type *</label>
        <select name="discharge_type" value={form.discharge_type} onChange={set} className={sel}>
          {['Recovered','Transferred','AMA','Deceased'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discharge notes</label>
        <textarea name="discharge_notes" value={form.discharge_notes} onChange={set}
          rows={3} className={ta} placeholder="Summary, instructions, follow-up…" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          Discharge Patient
        </button>
      </div>
    </form>
  );
};

// ── Bed action modal ──────────────────────────────────────────────────────────
const BedActionModal = ({ bed, admissions, onClose, onAdmit, onDischarge, onStatusChange, isLoading }) => {
  const activeAdmission = admissions?.find(a => a.status === 'Active');
  const cfg = STATUS[bed.status] || STATUS.Available;

  return (
    <div className="space-y-4">
      {/* Bed info */}
      <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-slate-800">Bed {bed.bed_number}</p>
            <p className="text-sm text-slate-500">{bed.ward_name} · {bed.bed_type}</p>
            {bed.features && <p className="text-xs text-slate-400 mt-0.5">{bed.features}</p>}
          </div>
          <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
            {bed.status}
          </span>
        </div>
        {activeAdmission && (
          <div className="mt-3 pt-3 border-t border-white/60">
            <p className="font-semibold text-slate-700">{activeAdmission.first_name} {activeAdmission.last_name}</p>
            <p className="text-xs text-slate-500">Admitted {fmtDateTime(activeAdmission.admission_date)}</p>
            <p className="text-xs text-slate-500">{activeAdmission.admission_reason}</p>
            {activeAdmission.expected_discharge && (
              <p className="text-xs text-blue-600 mt-0.5">Expected discharge: {fmtDate(activeAdmission.expected_discharge)}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {bed.status === 'Available' && (
          <button onClick={onAdmit}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all">
            <Users className="w-4 h-4" /> Admit Patient to This Bed
          </button>
        )}
        {bed.status === 'Occupied' && activeAdmission && (
          <button onClick={() => onDischarge(activeAdmission)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-all">
            <LogOut className="w-4 h-4" /> Discharge Patient
          </button>
        )}
        {bed.status === 'Cleaning' && (
          <button onClick={() => onStatusChange(bed.bed_id, 'Available')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all">
            <CheckCircle className="w-4 h-4" /> Mark as Available (Cleaning Done)
          </button>
        )}
        {['Available','Cleaning'].includes(bed.status) && (
          <button onClick={() => onStatusChange(bed.bed_id, 'Maintenance')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-red-200 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 transition-all">
            <Wrench className="w-4 h-4" /> Mark for Maintenance
          </button>
        )}
        {bed.status === 'Maintenance' && (
          <button onClick={() => onStatusChange(bed.bed_id, 'Available')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all">
            <CheckCircle className="w-4 h-4" /> Mark as Available (Maintenance Done)
          </button>
        )}
        <button onClick={onClose}
          className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all">
          Close
        </button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BedManagementPage() {
  const [wards,    setWards]    = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [selectedWard, setSelectedWard]   = useState(null);
  const [wardBeds,     setWardBeds]       = useState([]);
  const [selectedBed,  setSelectedBed]    = useState(null);
  const [bedHistory,   setBedHistory]     = useState([]);
  const [showAction,   setShowAction]     = useState(false);
  const [showAdmit,    setShowAdmit]      = useState(false);
  const [showDischarge,setShowDischarge]  = useState(false);
  const [activeAdmission, setActiveAdmission] = useState(null);
  const [submitting,   setSubmitting]     = useState(false);
  const [toast,        setToast]          = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [wardsRes, statsRes] = await Promise.all([
        api.get('/beds/wards'),
        api.get('/beds/stats'),
      ]);
      setWards(wardsRes.data.wards || []);
      setStats(statsRes.data.summary || {});
    } catch { showToast('Failed to load ward data', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openWard = async (ward) => {
    setSelectedWard(ward);
    try {
      const res = await api.get(`/beds/wards/${ward.ward_id}`);
      setWardBeds(res.data.beds || []);
    } catch { showToast('Failed to load beds', 'error'); }
  };

  const openBed = async (bed) => {
    setSelectedBed(bed);
    try {
      const res = await api.get(`/beds/${bed.bed_id}`);
      setBedHistory(res.data.history || []);
    } catch {}
    setShowAction(true);
  };

  const handleAdmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/beds/admissions', data);
      showToast('Patient admitted successfully');
      setShowAdmit(false); setShowAction(false);
      fetchData();
      if (selectedWard) openWard(selectedWard);
    } catch (e) { showToast(e.response?.data?.error || 'Admission failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDischarge = async (data) => {
    setSubmitting(true);
    try {
      await api.put(`/beds/admissions/${activeAdmission.admission_id}/discharge`, data);
      showToast('Patient discharged — bed marked for cleaning');
      setShowDischarge(false); setShowAction(false);
      fetchData();
      if (selectedWard) openWard(selectedWard);
    } catch (e) { showToast(e.response?.data?.error || 'Discharge failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (bedId, status) => {
    try {
      await api.put(`/beds/${bedId}/status`, { status });
      showToast(`Bed marked as ${status}`);
      setShowAction(false);
      fetchData();
      if (selectedWard) openWard(selectedWard);
    } catch (e) { showToast(e.response?.data?.error || 'Status update failed', 'error'); }
  };

  const filteredWards = wards.filter(w =>
    (!search || w.name.toLowerCase().includes(search.toLowerCase())) &&
    (!wardFilter || w.ward_type === wardFilter)
  );

  const occupancyRate = stats.occupancy_rate || 0;
  const occupancyColor = occupancyRate >= 90 ? 'bg-red-500' : occupancyRate >= 70 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .35s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-teal-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BedDouble className="w-6 h-6 text-teal-500" /> Bed Management
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Ward and inpatient bed occupancy</p>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 fade-in">
          <StatCard label="Total beds"   value={stats.total_beds || 0}   icon={BedDouble}    iconBg="bg-slate-100"    iconCl="text-slate-500" />
          <StatCard label="Available"    value={stats.available || 0}    icon={CheckCircle}  iconBg="bg-emerald-50"   iconCl="text-emerald-500" />
          <StatCard label="Occupied"     value={stats.occupied || 0}     icon={Users}        iconBg="bg-blue-50"      iconCl="text-blue-500" />
          <StatCard label="Cleaning"     value={stats.cleaning || 0}     icon={Sparkles}     iconBg="bg-purple-50"    iconCl="text-purple-500" />
          <StatCard label="Maintenance"  value={stats.maintenance || 0}  icon={Wrench}       iconBg="bg-red-50"       iconCl="text-red-500" />
        </div>

        {/* Occupancy bar */}
        {stats.total_beds > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-600">Overall occupancy</p>
              <p className="text-sm font-black text-slate-800">{occupancyRate}%</p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${occupancyColor} rounded-full transition-all duration-700`}
                style={{ width: `${occupancyRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>{stats.occupied} occupied of {stats.total_beds} total beds</span>
              <span className={occupancyRate >= 90 ? 'text-red-500 font-semibold' : ''}>
                {occupancyRate >= 90 ? '⚠ Near capacity' : `${stats.available} available`}
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search ward…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
          </div>
          <select value={wardFilter} onChange={e => setWardFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer">
            <option value="">All types</option>
            {['General','ICU','Maternity','Paediatrics','Surgical','Medical','Private','Isolation','Emergency'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Ward cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
            {filteredWards.map(ward => {
              const total    = ward.total_beds || 1;
              const pct      = Math.round(((ward.occupied || 0) / total) * 100);
              const barColor = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400';
              return (
                <div key={ward.ward_id} onClick={() => openWard(ward)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 p-5 cursor-pointer transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-black text-slate-800">{ward.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ward.ward_type} · {ward.floor}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                  </div>

                  {/* Mini bed grid */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {[...Array(Math.min(ward.occupied || 0, 20))].map((_, i) => (
                      <div key={`o${i}`} className="w-4 h-4 rounded bg-blue-400" />
                    ))}
                    {[...Array(Math.min(ward.available || 0, 20))].map((_, i) => (
                      <div key={`a${i}`} className="w-4 h-4 rounded bg-emerald-300" />
                    ))}
                    {[...Array(Math.min((ward.cleaning || 0) + (ward.maintenance || 0), 20))].map((_, i) => (
                      <div key={`m${i}`} className="w-4 h-4 rounded bg-slate-200" />
                    ))}
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span><strong className="text-blue-600">{ward.occupied || 0}</strong> occupied</span>
                    <span><strong className="text-emerald-600">{ward.available || 0}</strong> available</span>
                    <span>{pct}% full</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ward detail modal — bed grid */}
      <Modal isOpen={!!selectedWard && !showAction && !showAdmit && !showDischarge}
        title={selectedWard ? `${selectedWard.name} — Bed Map` : ''}
        onClose={() => { setSelectedWard(null); setWardBeds([]); }}
        size="large">
        {selectedWard && (
          <div>
            <div className="flex gap-4 mb-4 text-xs flex-wrap">
              {Object.entries(STATUS).map(([s, cfg]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${cfg.dot}`} />
                  <span className="text-slate-500">{s}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {wardBeds.map(bed => <BedCard key={bed.bed_id} bed={bed} onAction={openBed} />)}
              {wardBeds.length === 0 && (
                <div className="col-span-4 text-center py-12 text-slate-400">
                  <BedDouble className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No beds configured for this ward</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Bed action modal */}
      <Modal isOpen={showAction && !!selectedBed} title="Bed Actions"
        onClose={() => { setShowAction(false); setSelectedBed(null); }}>
        {selectedBed && (
          <BedActionModal
            bed={{ ...selectedBed, ward_name: selectedWard?.name }}
            admissions={bedHistory}
            isLoading={submitting}
            onAdmit={() => { setShowAction(false); setShowAdmit(true); }}
            onDischarge={(adm) => { setActiveAdmission(adm); setShowAction(false); setShowDischarge(true); }}
            onStatusChange={handleStatusChange}
            onClose={() => { setShowAction(false); setSelectedBed(null); }}
          />
        )}
      </Modal>

      {/* Admit modal */}
      <Modal isOpen={showAdmit && !!selectedBed} title="Admit Patient"
        onClose={() => setShowAdmit(false)} size="large">
        {selectedBed && (
          <AdmitForm
            bed={{ ...selectedBed, ward_name: selectedWard?.name }}
            isLoading={submitting}
            onSubmit={handleAdmit}
            onCancel={() => setShowAdmit(false)}
          />
        )}
      </Modal>

      {/* Discharge modal */}
      <Modal isOpen={showDischarge && !!activeAdmission} title="Discharge Patient"
        onClose={() => setShowDischarge(false)}>
        {activeAdmission && (
          <DischargeForm
            admission={{ ...activeAdmission, ward_name: selectedWard?.name }}
            isLoading={submitting}
            onSubmit={handleDischarge}
            onCancel={() => setShowDischarge(false)}
          />
        )}
      </Modal>
    </div>
  );
}