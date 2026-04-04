import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Clock, CheckCircle, AlertTriangle, XCircle,
  Plus, RefreshCw, Search, ChevronRight, Zap, PhoneCall, Stethoscope, SkipForward,
} from 'lucide-react';
import Modal from '../components/Modal';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import ConfirmModal from '../components/ConfirmModal';
import {
  getTodayQueue, checkInPatient,
  updateQueueStatus, removeFromQueue, getNextPatient,
} from '../services/queueService';
import { searchPatients } from '../services/patientService';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Waiting:         { color:'bg-blue-100 text-blue-700',   icon:<Clock        className="w-3.5 h-3.5" />, dot:'bg-blue-500'    },
  Called:          { color:'bg-amber-100 text-amber-700', icon:<PhoneCall    className="w-3.5 h-3.5" />, dot:'bg-amber-500'   },
  'In Consultation':{ color:'bg-teal-100 text-teal-700', icon:<Stethoscope  className="w-3.5 h-3.5" />, dot:'bg-teal-500'    },
  Completed:       { color:'bg-emerald-100 text-emerald-700', icon:<CheckCircle className="w-3.5 h-3.5" />, dot:'bg-emerald-500' },
  'No-Show':       { color:'bg-red-100 text-red-700',    icon:<XCircle      className="w-3.5 h-3.5" />, dot:'bg-red-500'     },
  Skipped:         { color:'bg-slate-100 text-slate-600',icon:<SkipForward  className="w-3.5 h-3.5" />, dot:'bg-slate-400'   },
};

const PRIORITY_CONFIG = {
  Normal:    { color:'bg-slate-100 text-slate-600', ring:'border-slate-200' },
  Urgent:    { color:'bg-orange-100 text-orange-700', ring:'border-orange-300' },
  Emergency: { color:'bg-red-100 text-red-700', ring:'border-red-400' },
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, bg, iconColor, pulse = false }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center relative`}>
        {pulse && <span className="absolute inset-0 rounded-2xl animate-ping opacity-30 bg-red-400" />}
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const QueueCard = ({ entry, onStatusChange, onRemove, canEdit, canDelete }) => {
  const s = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Waiting;
  const p = PRIORITY_CONFIG[entry.priority] || PRIORITY_CONFIG.Normal;
  const isActive = ['Waiting','Called'].includes(entry.status);

  const age = entry.date_of_birth
    ? `${new Date().getFullYear() - new Date(entry.date_of_birth).getFullYear()}y`
    : null;

  return (
    <div className={`bg-white rounded-2xl border-2 ${p.ring} shadow-sm hover:shadow-md transition-all`}>
      {/* Priority bar */}
      {entry.priority !== 'Normal' && (
        <div className={`h-1 rounded-t-2xl ${entry.priority === 'Emergency' ? 'bg-red-500' : 'bg-orange-400'} animate-pulse`} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Queue number badge */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 ${
            entry.priority === 'Emergency' ? 'bg-red-600 text-white' :
            entry.priority === 'Urgent'   ? 'bg-orange-500 text-white' :
            'bg-teal-600 text-white'
          }`}>
            {String(entry.queue_number).padStart(2,'0')}
          </div>

          {/* Patient info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-800 text-sm">
                {entry.first_name} {entry.last_name}
              </p>
              {entry.priority !== 'Normal' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.color}`}>
                  {entry.priority.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {entry.phone}{age ? ` · ${age}` : ''}
              {entry.blood_type ? ` · ${entry.blood_type}` : ''}
            </p>
            {entry.reason_for_visit && (
              <p className="text-xs text-slate-500 mt-1 truncate">{entry.reason_for_visit}</p>
            )}
            {entry.allergies && (
              <p className="text-xs text-red-500 mt-0.5 font-medium">⚠ {entry.allergies}</p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
              {s.icon} {entry.status}
            </span>
          </div>
        </div>

        {/* Wait time */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {entry.check_in_time
              ? `Checked in ${new Date(entry.check_in_time).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}`
              : 'Just arrived'}
            {entry.current_wait_minutes > 0 && (
              <span className={`font-semibold ml-1 ${entry.current_wait_minutes > 30 ? 'text-red-500' : 'text-slate-600'}`}>
                · {entry.current_wait_minutes}m wait
              </span>
            )}
          </div>
          {entry.doctor_name && (
            <div className="flex items-center gap-1 text-xs text-teal-600">
              <Stethoscope className="w-3 h-3" />
              {entry.doctor_name}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {canEdit && isActive && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {entry.status === 'Waiting' && (
              <button onClick={() => onStatusChange(entry.queue_id, 'Called')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-all">
                <PhoneCall className="w-3.5 h-3.5" /> Call Patient
              </button>
            )}
            {entry.status === 'Called' && (
              <button onClick={() => onStatusChange(entry.queue_id, 'In Consultation')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-all">
                <Stethoscope className="w-3.5 h-3.5" /> Start Consult
              </button>
            )}
            {entry.status === 'In Consultation' && (
              <button onClick={() => onStatusChange(entry.queue_id, 'Completed')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all">
                <CheckCircle className="w-3.5 h-3.5" /> Complete
              </button>
            )}
            {['Waiting','Called'].includes(entry.status) && (
              <>
                <button onClick={() => onStatusChange(entry.queue_id, 'No-Show')}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-all border border-red-200">
                  No-Show
                </button>
                <button onClick={() => onStatusChange(entry.queue_id, 'Skipped')}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-all border border-slate-200">
                  Skip
                </button>
              </>
            )}
          </div>
        )}

        {/* Delete button for completed/terminal states */}
        {canDelete && ['No-Show','Skipped'].includes(entry.status) && (
          <button onClick={() => onRemove(entry)}
            className="w-full mt-2 text-xs text-slate-400 hover:text-red-500 transition-colors text-center">
            Remove from queue
          </button>
        )}
      </div>
    </div>
  );
};

// ── Check-In Modal Form ───────────────────────────────────────────────────────
const CheckInForm = ({ onSubmit, onCancel, isLoading }) => {
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    priority: 'Normal', reason_for_visit: '', notes: '', doctor_id: '',
  });
  const debounce = useRef(null);

  const handleSearch = (val) => {
    setSearch(val);
    setSelected(null);
    clearTimeout(debounce.current);
    if (val.length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchPatients(val);
        setResults(data.patients || []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    onSubmit({ patient_id: selected.patient_id, ...form });
  };

  const inp = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all";
  const sel = `${inp} appearance-none cursor-pointer`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Patient search */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Search Patient *
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            className={`${inp} pl-10`} placeholder="Name, phone, or email…" />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && !selected && (
          <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {results.map(pt => (
              <button key={pt.patient_id} type="button"
                onClick={() => { setSelected(pt); setSearch(`${pt.first_name} ${pt.last_name}`); setResults([]); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {pt.first_name?.[0]}{pt.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{pt.first_name} {pt.last_name}</p>
                  <p className="text-xs text-slate-400">{pt.phone}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
              </button>
            ))}
          </div>
        )}

        {/* Selected patient chip */}
        {selected && (
          <div className="mt-2 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {selected.first_name?.[0]}{selected.last_name?.[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-teal-800">{selected.first_name} {selected.last_name}</p>
              <p className="text-xs text-teal-600">{selected.phone}</p>
            </div>
            <button type="button" onClick={() => { setSelected(null); setSearch(''); }}
              className="text-teal-400 hover:text-teal-700 text-xs font-semibold">Change</button>
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
        <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} className={sel}>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="Emergency">🚨 Emergency</option>
        </select>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason for Visit</label>
        <input type="text" value={form.reason_for_visit}
          onChange={e => setForm(f => ({...f, reason_for_visit: e.target.value}))}
          className={inp} placeholder="e.g. General checkup, Fever, Follow-up" />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
          rows={2} placeholder="Additional notes (optional)"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={!selected || isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Check In Patient
        </button>
      </div>
    </form>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const FILTERS = ['All','Waiting','Called','In Consultation','Completed','No-Show','Skipped'];

const QueuePage = () => {
  const { permissions } = useRole();
  const p = permissions.queue;

  const [queue, setQueue]           = useState([]);
  const [stats, setStats]           = useState({});
  const [isLoading, setIsLoading]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCheckIn, setShowCheckIn]   = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [autoRefresh, setAutoRefresh]   = useState(true);
  const { showToast, Toast } = useToast();
  const intervalRef = useRef(null);

  const fetchQueue = useCallback(async () => {
    if (p.isBlocked) return;
    try {
      setIsLoading(true);
      const data = await getTodayQueue('', statusFilter === 'All' ? '' : statusFilter);
      setQueue(data.queue || []);
      setStats(data.stats || {});
    } catch { }
    finally { setIsLoading(false); }
  }, [p.isBlocked, statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchQueue, 30000);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, fetchQueue]);

  if (p.isBlocked) return <AccessDenied message="You do not have permission to view the queue." />;

  const handleCheckIn = async (formData) => {
    try {
      setIsSubmitting(true);
      const result = await checkInPatient(formData);
      showToast(`Patient checked in — Queue #${String(result.queue_number).padStart(2,'0')}`);
      setShowCheckIn(false);
      fetchQueue();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to check in patient.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (queueId, newStatus) => {
    try {
      await updateQueueStatus(queueId, newStatus);
      showToast(`Status updated to ${newStatus}`);
      fetchQueue();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update status.', 'error');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    try {
      await removeFromQueue(removeTarget.queue_id);
      showToast('Patient removed from queue');
      setRemoveTarget(null);
      fetchQueue();
    } catch {
      showToast('Failed to remove patient.', 'error');
      setRemoveTarget(null);
    }
  };

  const handleCallNext = async () => {
    try {
      const data = await getNextPatient();
      if (!data.next) { showToast('No patients waiting in queue', 'warning'); return; }
      await updateQueueStatus(data.next.queue_id, 'Called');
      showToast(`Calling ${data.next.first_name} ${data.next.last_name} — Queue #${String(data.next.queue_number).padStart(2,'0')}`);
      fetchQueue();
    } catch { showToast('Failed to call next patient.', 'error'); }
  };

  const statCards = [
    { icon: Users,     label: 'Waiting',         value: stats.waiting,         bg:'bg-blue-50',    iconColor:'text-blue-500'    },
    { icon: PhoneCall, label: 'Called',           value: stats.called,          bg:'bg-amber-50',   iconColor:'text-amber-500'   },
    { icon: Stethoscope,label:'In Consultation',  value: stats.in_consultation, bg:'bg-teal-50',    iconColor:'text-teal-500'    },
    { icon: CheckCircle,label:'Completed Today',  value: stats.completed,       bg:'bg-emerald-50', iconColor:'text-emerald-500' },
    { icon: AlertTriangle,label:'Emergencies',    value: stats.emergencies,     bg:'bg-red-50',     iconColor:'text-red-500',    pulse: (stats.emergencies||0) > 0 },
    { icon: Clock,     label: 'Avg Wait (min)',   value: stats.avg_wait_minutes, bg:'bg-violet-50', iconColor:'text-violet-500'  },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Queue Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Digital waiting room · {new Date().toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Auto-refresh toggle */}
            <button onClick={() => setAutoRefresh(a => !a)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-500'
              }`}>
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`}
                style={autoRefresh ? {animationDuration:'3s'} : {}} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>

            {/* Manual refresh */}
            <button onClick={fetchQueue}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Call next */}
            {p.canEdit && (stats.waiting || 0) > 0 && (
              <button onClick={handleCallNext}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow-md">
                <Zap className="w-4 h-4" /> Call Next
              </button>
            )}

            {/* Check in */}
            {p.canCreate && (
              <button onClick={() => setShowCheckIn(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow-md">
                <Plus className="w-4 h-4" /> Check In Patient
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 fade-in">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === f
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}>
              {f}
              {f === 'Waiting' && (stats.waiting||0) > 0 && (
                <span className="ml-1.5 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {stats.waiting}
                </span>
              )}
              {f === 'In Consultation' && (stats.in_consultation||0) > 0 && (
                <span className="ml-1.5 bg-teal-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {stats.in_consultation}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
          </div>
        ) : queue.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {queue.map(entry => (
              <QueueCard
                key={entry.queue_id}
                entry={entry}
                onStatusChange={handleStatusChange}
                onRemove={setRemoveTarget}
                canEdit={!!p.canEdit}
                canDelete={!!p.canDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">
              {statusFilter === 'All' ? 'No patients in queue today' : `No patients with status: ${statusFilter}`}
            </p>
            {p.canCreate && statusFilter === 'All' && (
              <button onClick={() => setShowCheckIn(true)}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all">
                <Plus className="w-4 h-4" /> Check In First Patient
              </button>
            )}
          </div>
        )}
      </div>

      <Toast />

      {/* Check-in modal */}
      <Modal isOpen={showCheckIn} title="Check In Patient"
        onClose={() => setShowCheckIn(false)} size="medium">
        <CheckInForm
          onSubmit={handleCheckIn}
          onCancel={() => setShowCheckIn(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Remove confirm */}
      <ConfirmModal
        isOpen={!!removeTarget}
        title="Remove from Queue?"
        message={`Remove ${removeTarget?.first_name || ''} ${removeTarget?.last_name || ''} from today's queue?`}
        confirmLabel="Remove"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};

export default QueuePage;