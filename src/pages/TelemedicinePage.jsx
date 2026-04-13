// ============================================
// TelemedicinePage.jsx
// File: frontend-web/src/pages/TelemedicinePage.jsx
// ============================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Video, Plus, Search, Clock, Phone, PhoneOff, Calendar, ChevronRight, X, Copy, Loader, Activity
} from 'lucide-react';
import api from '../services/api.js';
import { useRole } from '../hooks/useRole.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—';

const STATUS_CONFIG = {
  Scheduled:  { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  Active:     { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Completed:  { bg: 'bg-slate-100',   text: 'text-slate-600'   },
  Cancelled:  { bg: 'bg-red-100',     text: 'text-red-700'     },
  'No Show':  { bg: 'bg-amber-100',   text: 'text-amber-700'   },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Scheduled;
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{status}</span>;
};

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all`;
const sel = `${inp} appearance-none cursor-pointer`;

// ── Modal shell ───────────────────────────────────────────────────────────────
const Modal = ({ isOpen, title, onClose, children, size = 'medium' }) => {
  if (!isOpen) return null;
  const ws = { small: 'max-w-md', medium: 'max-w-xl', large: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${ws[size]} max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Schedule Form ─────────────────────────────────────────────────────────────
const ScheduleForm = ({ onSubmit, onCancel, isLoading }) => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ appointment_id: '' });

  useEffect(() => {
    // Fetch upcoming appointments not yet linked to a telemedicine session
    api.get('/appointments', { params: { status: 'Scheduled', limit: 50 } })
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => {});
  }, []);

  const submit = e => {
    e.preventDefault();
    if (!form.appointment_id) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">How it works</p>
        <p className="text-sm text-blue-700">Select an existing appointment to convert to telemedicine. A secure video room is automatically created on Daily.co and unique join links are generated for the doctor and patient.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Appointment *</label>
        <select value={form.appointment_id} onChange={e => setForm({ appointment_id: e.target.value })} className={sel} required>
          <option value="">Select an upcoming appointment…</option>
          {appointments.map(a => (
            <option key={a.appointment_id} value={a.appointment_id}>
              {a.first_name} {a.last_name} · {fmtDate(a.appointment_date)} at {a.appointment_time || '—'} · {a.reason_for_visit || 'General'}
            </option>
          ))}
        </select>
        {appointments.length === 0 && (
          <p className="text-xs text-slate-400 mt-1">No scheduled appointments found. Create an appointment first.</p>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading || !form.appointment_id}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Creating Room…' : 'Create Video Room'}
        </button>
      </div>
    </form>
  );
};

// ── Video Room Component ──────────────────────────────────────────────────────
const VideoRoom = ({ session, joinUrl, onEnd, onClose, isDoctor }) => {
  const iframeRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [endNotes, setEndNotes]     = useState('');
  const [showEndForm, setShowEndForm] = useState(false);

  // Timer
  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [hasStarted]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl).catch(() => {});
  };

  return (
    <div className="space-y-4">
      {/* Session info bar */}
      <div className="flex items-center justify-between bg-slate-800 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          {hasStarted ? (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-bold font-mono">{formatTime(elapsed)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
              <span className="text-amber-400 text-sm font-semibold">Not started</span>
            </div>
          )}
          <span className="text-slate-400 text-sm">·</span>
          <span className="text-slate-300 text-sm">{session.first_name} {session.last_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} title="Copy patient join link"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors">
            <Copy className="w-3.5 h-3.5" /> Copy patient link
          </button>
          {isDoctor && !hasStarted && (
            <button onClick={() => { setHasStarted(true); onEnd && onEnd('start'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors">
              <Phone className="w-3.5 h-3.5" /> Start session
            </button>
          )}
          {isDoctor && hasStarted && (
            <button onClick={() => setShowEndForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
              <PhoneOff className="w-3.5 h-3.5" /> End session
            </button>
          )}
        </div>
      </div>

      {/* Daily.co iframe */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900" style={{ height: 480 }}>
        {joinUrl ? (
          <iframe
            ref={iframeRef}
            src={joinUrl}
            title="Video consultation"
            allow="camera; microphone; fullscreen; speaker; display-capture"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Video room link not available</p>
            </div>
          </div>
        )}
      </div>

      {/* End session form */}
      {showEndForm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-red-700">End this session?</p>
          <textarea
            value={endNotes} onChange={e => setEndNotes(e.target.value)}
            placeholder="Session notes (optional — will be saved to the record)…"
            rows={3} className={`${inp} border-red-200 focus:border-red-400 focus:ring-red-100`}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowEndForm(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={() => onEnd('end', endNotes)}
              className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all flex items-center gap-2">
              <PhoneOff className="w-4 h-4" /> End & Save
            </button>
          </div>
        </div>
      )}

      {/* Share link */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
        <p className="text-xs font-semibold text-blue-600 mb-1">Patient join link</p>
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-blue-700 flex-1 truncate">{joinUrl}</p>
          <button onClick={copyLink} className="flex-shrink-0 text-blue-600 hover:text-blue-800">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-blue-500 mt-1">Send this link to the patient via WhatsApp or SMS</p>
      </div>
    </div>
  );
};

// ── Session Detail ────────────────────────────────────────────────────────────
const SessionDetail = ({ session, joinUrl, onStart, onEnd, onCancel, isDoctor }) => {
  const [showRoom, setShowRoom] = useState(false);
  const isActive    = session.status === 'Active';
  const isScheduled = session.status === 'Scheduled';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xl font-black">{session.first_name} {session.last_name}</p>
            <p className="text-blue-200 text-sm mt-0.5">{session.doctor_name}</p>
          </div>
          <Badge status={session.status} />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
          {[
            ['Date', fmtDate(session.scheduled_at || session.appointment_date)],
            ['Time', fmtTime(session.scheduled_at) || session.appointment_time || '—'],
            ['Duration', session.duration_minutes ? `${session.duration_minutes} min` : '—'],
          ].map(([l,v]) => (
            <div key={l}>
              <p className="text-blue-300 text-xs uppercase tracking-wide">{l}</p>
              <p className="font-bold text-sm mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reason */}
      {session.reason_for_visit && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason for visit</p>
          <p className="text-sm text-slate-700">{session.reason_for_visit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {(isScheduled || isActive) && (
          <button onClick={() => setShowRoom(r => !r)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm text-white
              ${isActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <Video className="w-4 h-4" />
            {showRoom ? 'Hide room' : isActive ? 'Resume call' : 'Open video room'}
          </button>
        )}
        {isScheduled && isDoctor && (
          <button onClick={onCancel}
            className="px-4 py-3 rounded-xl font-semibold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-all">
            Cancel
          </button>
        )}
      </div>

      {/* Video room */}
      {showRoom && (
        <VideoRoom
          session={session}
          joinUrl={joinUrl}
          isDoctor={isDoctor}
          onEnd={(action, notes) => {
            if (action === 'start') onStart(session.session_id);
            if (action === 'end')   onEnd(session.session_id, notes);
          }}
          onClose={() => setShowRoom(false)}
        />
      )}

      {/* Notes */}
      {session.notes && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Session notes</p>
          <p className="text-sm text-slate-700">{session.notes}</p>
        </div>
      )}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconCl }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconCl}`} />
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TelemedicinePage() {
  const [sessions, setSessions]     = useState([]);
  const [stats, setStats]           = useState({});
  const [isLoading, setIsLoading]   = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [currentPage, setPage]      = useState(1);
  const [pagination, setPagination] = useState({});
  const [showSchedule, setShowSchedule] = useState(false);
  const [showDetail, setShowDetail]     = useState(false);
  const [selected, setSelected]     = useState(null);
  const [joinUrl, setJoinUrl]       = useState(null);
  const [toast, setToast]           = useState(null);
  const { role } = useRole();
  const isDoctor = ['admin','doctor'].includes((role||'').toLowerCase());

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSessions = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const r = await api.get('/telemedicine/sessions', { params: { page: p, limit: 15, status: statusFilter } });
      setSessions(r.data.sessions || []);
      setPagination(r.data.pagination || {});
    } catch { showToast('Failed to load sessions', 'error'); }
    finally { setIsLoading(false); }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get('/telemedicine/stats'); setStats(r.data); } catch {}
  }, []);

  useEffect(() => { fetchSessions(currentPage); fetchStats(); }, [currentPage, fetchSessions, fetchStats]);

  const openDetail = async (session) => {
    try {
      const r = await api.get(`/telemedicine/sessions/${session.session_id}`);
      setSelected(r.data.session);
      setJoinUrl(r.data.join_url);
      setShowDetail(true);
    } catch { showToast('Failed to load session', 'error'); }
  };

  const handleSchedule = async (data) => {
    setSubmitting(true);
    try {
      const r = await api.post('/telemedicine/sessions', data);
      showToast('Video room created! Share the patient link.');
      setShowSchedule(false);
      fetchSessions(1); fetchStats(); setPage(1);
      // Open the new session immediately
      setSelected(r.data.session);
      setJoinUrl(r.data.doctor_url);
      setShowDetail(true);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to create session', 'error');
    } finally { setSubmitting(false); }
  };

  const handleStart = async (sessionId) => {
    try { await api.post(`/telemedicine/sessions/${sessionId}/start`); showToast('Session started'); fetchSessions(currentPage); }
    catch (e) { showToast(e.response?.data?.error || 'Failed to start', 'error'); }
  };

  const handleEnd = async (sessionId, notes) => {
    try {
      await api.post(`/telemedicine/sessions/${sessionId}/end`, { notes });
      showToast('Session ended and saved');
      setShowDetail(false);
      fetchSessions(currentPage); fetchStats();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to end session', 'error'); }
  };

  const handleCancel = async (sessionId) => {
    try {
      await api.delete(`/telemedicine/sessions/${sessionId}`);
      showToast('Session cancelled');
      setShowDetail(false);
      fetchSessions(currentPage); fetchStats();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to cancel', 'error'); }
  };

  const filtered = sessions.filter(s =>
    !search || `${s.first_name} ${s.last_name} ${s.doctor_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .35s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${toast.type==='error'?'bg-red-500':'bg-teal-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-500" /> Telemedicine
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Secure video consultations powered by Daily.co</p>
          </div>
          {isDoctor && (
            <button onClick={() => setShowSchedule(true)}
              className="fade-in inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4" /> New Video Session
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={Video}        label="Total Sessions"   value={stats.total}        iconBg="bg-blue-50"    iconCl="text-blue-500" />
          <StatCard icon={Calendar}     label="Today"            value={stats.today}        iconBg="bg-teal-50"    iconCl="text-teal-500" />
          <StatCard icon={Activity}     label="Active now"       value={stats.by_status?.Active || 0} iconBg="bg-emerald-50" iconCl="text-emerald-500" />
          <StatCard icon={Clock}        label="Avg duration"     value={stats.avg_duration ? `${stats.avg_duration}m` : '—'} iconBg="bg-purple-50" iconCl="text-purple-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search by patient or doctor name…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none outline-none cursor-pointer appearance-none">
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 rounded-full animate-spin" style={{border:'3px solid #e2e8f0',borderTopColor:'#3b82f6'}} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-slate-500 font-semibold">No telemedicine sessions</p>
              <p className="text-slate-400 text-sm mt-1">Schedule your first video consultation</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {['Patient','Doctor','Scheduled','Duration','Status',''].map(h => (
                      <th key={h} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.session_id}
                      onClick={() => openDetail(s)}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer ${i%2===0?'bg-white':'bg-slate-50/40'}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 text-sm">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-slate-400">{s.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{s.doctor_name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-700">{fmtDate(s.scheduled_at || s.appointment_date)}</p>
                        <p className="text-xs text-slate-400">{fmtTime(s.scheduled_at) || s.appointment_time || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {s.duration_minutes ? `${s.duration_minutes} min` : '—'}
                      </td>
                      <td className="px-4 py-3"><Badge status={s.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100">
                  <button disabled={currentPage<=1} onClick={() => setPage(p=>p-1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
                  {Array.from({length:pagination.totalPages},(_,i)=>i+1).map(pg=>(
                    <button key={pg} onClick={()=>setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg===currentPage?'bg-blue-600 text-white':'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
                  ))}
                  <button disabled={currentPage>=pagination.totalPages} onClick={() => setPage(p=>p+1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showSchedule} title="Schedule Video Consultation" onClose={() => setShowSchedule(false)} size="medium">
        <ScheduleForm onSubmit={handleSchedule} onCancel={() => setShowSchedule(false)} isLoading={isSubmitting} />
      </Modal>

      <Modal isOpen={showDetail && !!selected} title="Video Session" onClose={() => { setShowDetail(false); setSelected(null); }} size="large">
        {selected && (
          <SessionDetail
            session={selected}
            joinUrl={joinUrl}
            isDoctor={isDoctor}
            onStart={handleStart}
            onEnd={handleEnd}
            onCancel={() => handleCancel(selected.session_id)}
          />
        )}
      </Modal>
    </div>
  );
}