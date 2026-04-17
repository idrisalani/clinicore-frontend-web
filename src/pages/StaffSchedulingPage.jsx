// ============================================
// StaffSchedulingPage.jsx
// File: frontend-web/src/pages/StaffSchedulingPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, RefreshCw,
  Users, Clock, AlertTriangle, X, Loader,
  ArrowLeftRight, Calendar, Moon, Sun, Sunset,
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate   = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { weekday:'short', day:'numeric', month:'short' }) : '—';
const fmtDay    = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { day:'numeric', month:'short' }) : '';
const fmtWeekday= (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { weekday:'short' }) : '';
const isoDate   = (d) => d.toISOString().split('T')[0];

const getMondayOfWeek = (d = new Date()) => {
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return mon;
};

const getWeekDates = (monday) =>
  Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return isoDate(d); });

// ── Shift type config ─────────────────────────────────────────────────────────
const SHIFT_CFG = {
  Morning:   { icon: Sun,      bg:'bg-amber-100',   text:'text-amber-800',   border:'border-amber-200',   label:'Morning'   },
  Afternoon: { icon: Sunset,   bg:'bg-orange-100',  text:'text-orange-800',  border:'border-orange-200',  label:'Afternoon' },
  Night:     { icon: Moon,     bg:'bg-indigo-100',  text:'text-indigo-800',  border:'border-indigo-200',  label:'Night'     },
  'On-call': { icon: Clock,    bg:'bg-purple-100',  text:'text-purple-800',  border:'border-purple-200',  label:'On-call'   },
  Off:       { icon: X,        bg:'bg-slate-100',   text:'text-slate-500',   border:'border-slate-200',   label:'Off'       },
  Custom:    { icon: CalendarDays, bg:'bg-teal-100', text:'text-teal-800',  border:'border-teal-200',    label:'Custom'    },
};

const STATUS_CFG = {
  Scheduled:  'bg-blue-100 text-blue-700',
  Confirmed:  'bg-emerald-100 text-emerald-700',
  Completed:  'bg-teal-100 text-teal-700',
  Absent:     'bg-red-100 text-red-700',
  Cancelled:  'bg-slate-100 text-slate-500',
};

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const sel = `${inp} appearance-none cursor-pointer`;
const ta  = `${inp} resize-none`;

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, title, onClose, size='medium', children }) => {
  if (!isOpen) return null;
  const ws = { small:'max-w-md', medium:'max-w-xl', large:'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${ws[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ── Shift cell ────────────────────────────────────────────────────────────────
const ShiftCell = ({ schedules, date, staffName, onAdd, onEdit, isAdmin }) => {
  const daySchedules = schedules.filter(s => s.schedule_date === date);
  if (daySchedules.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center group cursor-pointer hover:bg-slate-50 rounded-lg transition-all"
        onClick={() => isAdmin && onAdd(date)}>
        {isAdmin && <Plus className="w-4 h-4 text-slate-200 group-hover:text-teal-400 transition-colors" />}
      </div>
    );
  }
  return (
    <div className="space-y-1 p-1">
      {daySchedules.map(s => {
        const cfg = SHIFT_CFG[s.shift_type] || SHIFT_CFG.Custom;
        return (
          <div key={s.schedule_id}
            onClick={() => onEdit(s)}
            className={`text-xs rounded-lg px-2 py-1.5 cursor-pointer border ${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80 transition-all`}>
            <div className="font-semibold truncate">{s.shift_type}</div>
            {s.start_time && <div className="opacity-70">{s.start_time}–{s.end_time}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ── Add/Edit schedule form ────────────────────────────────────────────────────
const ScheduleForm = ({ schedule, date, staffList, templates, onSubmit, onDelete, onClose, isLoading }) => {
  const [form, setForm] = useState(schedule ? {
    user_id:       schedule.user_id,
    template_id:   schedule.template_id || '',
    schedule_date: schedule.schedule_date,
    shift_type:    schedule.shift_type,
    start_time:    schedule.start_time || '',
    end_time:      schedule.end_time   || '',
    department:    schedule.department || '',
    notes:         schedule.notes      || '',
    status:        schedule.status,
  } : {
    user_id:'', template_id:'', schedule_date: date || '',
    shift_type:'Morning', start_time:'07:00', end_time:'15:00',
    department:'', notes:'', status:'Scheduled',
  });

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleTemplateChange = (e) => {
    const tid = e.target.value;
    setForm(f => ({ ...f, template_id: tid }));
    if (tid) {
      const tmpl = templates.find(t => String(t.template_id) === tid);
      if (tmpl) setForm(f => ({ ...f, template_id: tid, shift_type: tmpl.shift_type, start_time: tmpl.start_time, end_time: tmpl.end_time }));
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      {!schedule && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Staff member *</label>
          <select name="user_id" value={form.user_id} onChange={set} required className={sel}>
            <option value="">Select staff…</option>
            {staffList.map(s => <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
          <input type="date" name="schedule_date" value={form.schedule_date} onChange={set} required className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Shift template</label>
          <select value={form.template_id} onChange={handleTemplateChange} className={sel}>
            <option value="">Custom / manual…</option>
            {templates.map(t => <option key={t.template_id} value={t.template_id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Shift type *</label>
          <select name="shift_type" value={form.shift_type} onChange={set} className={sel}>
            {Object.keys(SHIFT_CFG).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
          <input name="department" value={form.department} onChange={set} className={inp} placeholder="e.g. Emergency" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Start time</label>
          <input type="time" name="start_time" value={form.start_time} onChange={set} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">End time</label>
          <input type="time" name="end_time" value={form.end_time} onChange={set} className={inp} />
        </div>
        {schedule && (
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={set} className={sel}>
              {['Scheduled','Confirmed','Completed','Absent','Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Optional notes…" />
        </div>
      </div>
      <div className="flex justify-between gap-3 pt-2">
        <div>
          {schedule && onDelete && (
            <button type="button" onClick={() => onDelete(schedule.schedule_id)}
              className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100">
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
            {isLoading && <Loader className="w-4 h-4 animate-spin" />} {schedule ? 'Update' : 'Add Shift'}
          </button>
        </div>
      </div>
    </form>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StaffSchedulingPage() {
  const [tab, setTab]             = useState('calendar');
  const [monday, setMonday]       = useState(getMondayOfWeek());
  const [schedules, setSchedules] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [leaves, setLeaves]       = useState([]);
  const [swaps, setSwaps]         = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [newDate, setNewDate]     = useState('');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showSwapForm, setShowSwapForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState(null);
  const [leaveForm, setLeaveForm] = useState({ leave_type:'Annual', start_date:'', end_date:'', reason:'' });
  const [swapForm, setSwapForm]   = useState({ target_id:'', swap_date:'', reason:'' });

  const weekDates = getWeekDates(monday);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    const mon       = getMondayOfWeek(monday);
    const dates     = getWeekDates(mon);
    const startDate = dates[0];
    const endDate   = dates[6];
    setLoading(true);
    try {
      const [schedRes, staffRes, tmplRes, leaveRes, swapRes, statsRes] = await Promise.all([
        api.get('/scheduling', { params: { start_date: startDate, end_date: endDate, department: deptFilter || undefined } }),
        api.get('/users', { params: { limit: 100, role: 'all' } }),
        api.get('/scheduling/templates'),
        api.get('/scheduling/leaves', { params: { status: 'Pending' } }),
        api.get('/scheduling/swaps',  { params: { status: 'Pending'  } }),
        api.get('/scheduling/stats'),
      ]);
      setSchedules(schedRes.data.schedules || []);
      setStaffList((staffRes.data.users || []).filter(u => u.role !== 'patient'));
      setTemplates(tmplRes.data.templates || []);
      setLeaves(leaveRes.data.leaves || []);
      setSwaps(swapRes.data.swaps || []);
      setStats(statsRes.data);
    } catch { showToast('Failed to load scheduling data', 'error'); }
    finally { setLoading(false); }
  }, [monday, deptFilter, showToast]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddShift = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/scheduling', data);
      showToast('Shift added'); setShowForm(false); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleUpdateShift = async (data) => {
    setSubmitting(true);
    try {
      await api.put(`/scheduling/${editSchedule.schedule_id}`, data);
      showToast('Shift updated'); setEditSchedule(null); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteShift = async (id) => {
    try {
      await api.delete(`/scheduling/${id}`);
      showToast('Shift deleted'); setEditSchedule(null); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleLeaveRequest = async () => {
    setSubmitting(true);
    try {
      await api.post('/scheduling/leaves', leaveForm);
      showToast('Leave request submitted'); setShowLeaveForm(false);
      setLeaveForm({ leave_type:'Annual', start_date:'', end_date:'', reason:'' }); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await api.put(`/scheduling/leaves/${id}/review`, { status });
      showToast(`Leave ${status.toLowerCase()}`); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  const handleSwapRequest = async () => {
    setSubmitting(true);
    try {
      await api.post('/scheduling/swaps', swapForm);
      showToast('Swap request submitted'); setShowSwapForm(false);
      setSwapForm({ target_id:'', swap_date:'', reason:'' }); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const prevWeek = () => { const m = new Date(monday); m.setDate(m.getDate() - 7); setMonday(m); };
  const nextWeek = () => { const m = new Date(monday); m.setDate(m.getDate() + 7); setMonday(m); };
  const thisWeek = () => setMonday(getMondayOfWeek());

  const todayStr   = isoDate(new Date());
  const ws         = stats.week_stats || {};
  const isAdmin    = true; // TODO: get from auth context

  // Group schedules by user for the week view
  const staffInWeek = [...new Map(
    schedules.map(s => [s.user_id, { user_id: s.user_id, full_name: s.full_name, role: s.role, user_department: s.user_department }])
  ).values()];

  // Also show all staff if no schedules
  const allStaff = staffList.slice(0, 20);
  const displayStaff = staffInWeek.length > 0 ? staffInWeek : allStaff;

  const tabs = [
    { key:'calendar', label:'Week View', icon: CalendarDays },
    { key:'today',    label:'Today',     icon: Clock        },
    { key:'leaves',   label:`Leave Requests${leaves.length?` (${leaves.length})`:''}`, icon: Calendar },
    { key:'swaps',    label:`Shift Swaps${swaps.length?` (${swaps.length})`:''}`, icon: ArrowLeftRight },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .35s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type==='error'?'bg-red-500':'bg-teal-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-teal-500" /> Staff Scheduling
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Shifts · Leave · Swaps</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={() => setShowLeaveForm(true)} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600">
              <Calendar className="w-4 h-4" /> Request Leave
            </button>
            <button onClick={() => setShowSwapForm(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700">
              <ArrowLeftRight className="w-4 h-4" /> Request Swap
            </button>
            {isAdmin && (
              <button onClick={() => { setEditSchedule(null); setNewDate(''); setShowForm(true); }}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700">
                <Plus className="w-4 h-4" /> Add Shift
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-6">
        <div className="flex gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all
                ${tab===key?'border-teal-500 text-teal-600':'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in">
          {[
            { label:"Today's shifts",   value: stats.today_shifts?.length || 0, icon: Users,         bg:'bg-teal-50',   cl:'text-teal-500'   },
            { label:'This week total',  value: ws.total || 0,                   icon: CalendarDays,  bg:'bg-blue-50',   cl:'text-blue-500'   },
            { label:'Pending leaves',   value: stats.pending_leaves || 0,       icon: AlertTriangle, bg:'bg-amber-50',  cl:'text-amber-500', warn: (stats.pending_leaves||0)>0 },
            { label:'Staff on leave',   value: stats.staff_on_leave?.length||0, icon: Calendar,      bg:'bg-slate-100', cl:'text-slate-500'  },
          ].map(({ label, value, icon: Icon, bg, cl, warn }) => (
            <div key={label} className={`bg-white rounded-2xl border shadow-sm p-4 ${warn?'border-amber-200':'border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className={`text-2xl font-black mt-1 ${warn?'text-amber-600':'text-slate-800'}`}>{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${cl}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── WEEK CALENDAR VIEW ── */}
        {tab === 'calendar' && (
          <div className="fade-in space-y-3">
            {/* Week nav */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center justify-between">
              <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-800">{fmtDay(weekDates[0])} — {fmtDay(weekDates[6])}</span>
                <button onClick={thisWeek} className="text-xs px-3 py-1.5 bg-teal-50 text-teal-600 font-semibold rounded-lg hover:bg-teal-100">Today</button>
              </div>
              <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
            </div>

            {/* Dept filter */}
            <div className="flex gap-2 flex-wrap">
              {['', 'Clinical','Nursing','Laboratory','Pharmacy','Reception','Emergency'].map(d => (
                <button key={d} onClick={() => setDeptFilter(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all
                    ${deptFilter===d?'bg-teal-600 text-white border-teal-600':'bg-white text-slate-500 border-slate-200 hover:border-teal-300'}`}>
                  {d || 'All departments'}
                </button>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-10 h-10 rounded-full animate-spin" style={{ border:'3px solid #e2e8f0', borderTopColor:'#0d9488' }} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="w-40 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">Staff</th>
                      {weekDates.map(date => (
                        <th key={date} className={`px-2 py-3 text-center text-xs font-bold uppercase tracking-wider ${date===todayStr?'bg-teal-50 text-teal-700':'bg-slate-50 text-slate-500'}`}>
                          <div>{fmtWeekday(date)}</div>
                          <div className={`text-base font-black mt-0.5 ${date===todayStr?'text-teal-600':''}`}>{new Date(date+'T00:00:00').getDate()}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayStaff.map(staff => (
                      <tr key={staff.user_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <p className="text-sm font-semibold text-slate-800 truncate">{staff.full_name}</p>
                          <p className="text-xs text-slate-400 capitalize">{staff.role}</p>
                        </td>
                        {weekDates.map(date => (
                          <td key={date} className={`px-1 py-1 ${date===todayStr?'bg-teal-50/30':''}`}>
                            <ShiftCell
                              schedules={schedules.filter(s => s.user_id === staff.user_id)}
                              date={date}
                              staffName={staff.full_name}
                              onAdd={(d) => { setNewDate(d); setShowForm(true); }}
                              onEdit={(s) => setEditSchedule(s)}
                              isAdmin={isAdmin}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {displayStaff.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No staff shifts this week</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TODAY VIEW ── */}
        {tab === 'today' && (
          <div className="fade-in space-y-3">
            <p className="text-sm font-semibold text-slate-500">{fmtDate(todayStr)} — {(stats.today_shifts||[]).length} shifts scheduled</p>
            {(stats.today_shifts||[]).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No shifts scheduled for today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(stats.today_shifts||[]).map(s => {
                  const cfg = SHIFT_CFG[s.shift_type] || SHIFT_CFG.Custom;
                  const Icon = cfg.icon;
                  return (
                    <div key={s.schedule_id} className={`bg-white rounded-2xl border-2 ${cfg.border} p-4 shadow-sm`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-black text-slate-800">{s.full_name}</p>
                          <p className="text-xs text-slate-400 capitalize">{s.role}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon className="w-3 h-3" /> {s.shift_type}
                        </div>
                      </div>
                      {s.start_time && (
                        <p className="text-sm text-slate-600 mb-2">
                          <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                          {s.start_time} – {s.end_time}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${STATUS_CFG[s.status] || ''}`}>{s.status}</span>
                        {s.department && <span className="text-xs text-slate-400">{s.department}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── LEAVE REQUESTS ── */}
        {tab === 'leaves' && (
          <div className="fade-in space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Staff','Type','Dates','Days','Reason','Status',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No pending leave requests</td></tr>
                  ) : leaves.map(l => (
                    <tr key={l.leave_id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{l.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{l.leave_type}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(l.start_date)} – {fmtDate(l.end_date)}</td>
                      <td className="px-4 py-3 text-slate-500">{l.days_count}d</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{l.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${l.status==='Pending'?'bg-amber-100 text-amber-700':l.status==='Approved'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {l.status === 'Pending' && isAdmin && (
                          <div className="flex gap-2">
                            <button onClick={() => handleReviewLeave(l.leave_id, 'Approved')} className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200">Approve</button>
                            <button onClick={() => handleReviewLeave(l.leave_id, 'Rejected')} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SHIFT SWAPS ── */}
        {tab === 'swaps' && (
          <div className="fade-in space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Requested by','Swap with','Date','Reason','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {swaps.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No pending swap requests</td></tr>
                  ) : swaps.map(sw => (
                    <tr key={sw.swap_id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{sw.requester_name}</td>
                      <td className="px-4 py-3 text-slate-600">{sw.target_name}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(sw.swap_date)}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{sw.reason || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${sw.status==='Pending'?'bg-amber-100 text-amber-700':sw.status==='Approved'?'bg-emerald-100 text-emerald-700':sw.status==='Accepted'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>
                          {sw.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sw.status === 'Accepted' && isAdmin && (
                          <button onClick={async () => { try { await api.put(`/scheduling/swaps/${sw.swap_id}`, { action:'approve' }); showToast('Swap approved'); fetchData(); } catch { showToast('Failed', 'error'); } }}
                            className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200">Approve</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit shift modal */}
      <Modal isOpen={showForm || !!editSchedule} title={editSchedule ? 'Edit Shift' : 'Add Shift'}
        onClose={() => { setShowForm(false); setEditSchedule(null); }} size="medium">
        <ScheduleForm
          schedule={editSchedule}
          date={newDate}
          staffList={staffList}
          templates={templates}
          isLoading={submitting}
          onSubmit={editSchedule ? handleUpdateShift : handleAddShift}
          onDelete={editSchedule ? handleDeleteShift : null}
          onClose={() => { setShowForm(false); setEditSchedule(null); }}
        />
      </Modal>

      {/* Leave request modal */}
      <Modal isOpen={showLeaveForm} title="Request Leave" onClose={() => setShowLeaveForm(false)} size="small">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Leave type</label>
            <select value={leaveForm.leave_type} onChange={e => setLeaveForm(f => ({...f,leave_type:e.target.value}))} className={sel}>
              {['Annual','Sick','Emergency','Maternity','Paternity','Study','Unpaid'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">From *</label>
              <input type="date" value={leaveForm.start_date} onChange={e => setLeaveForm(f => ({...f,start_date:e.target.value}))} className={inp} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">To *</label>
              <input type="date" value={leaveForm.end_date} onChange={e => setLeaveForm(f => ({...f,end_date:e.target.value}))} className={inp} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({...f,reason:e.target.value}))} rows={3} className={ta} placeholder="Reason for leave…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowLeaveForm(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={handleLeaveRequest} disabled={submitting || !leaveForm.start_date || !leaveForm.end_date}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader className="w-4 h-4 animate-spin" />} Submit Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Swap request modal */}
      <Modal isOpen={showSwapForm} title="Request Shift Swap" onClose={() => setShowSwapForm(false)} size="small">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Swap with *</label>
            <select value={swapForm.target_id} onChange={e => setSwapForm(f => ({...f,target_id:e.target.value}))} className={sel}>
              <option value="">Select colleague…</option>
              {staffList.map(s => <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date *</label>
            <input type="date" value={swapForm.swap_date} onChange={e => setSwapForm(f => ({...f,swap_date:e.target.value}))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason</label>
            <textarea value={swapForm.reason} onChange={e => setSwapForm(f => ({...f,reason:e.target.value}))} rows={2} className={ta} placeholder="Why do you need to swap?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowSwapForm(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={handleSwapRequest} disabled={submitting || !swapForm.target_id || !swapForm.swap_date}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader className="w-4 h-4 animate-spin" />} Send Swap Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}