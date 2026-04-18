// ============================================
// AuditTrailPage.jsx
// File: frontend-web/src/pages/AuditTrailPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Search, Download, RefreshCw, Filter,
  User, Clock, ChevronRight, X,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString('en-NG', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' })
  : '—';

// ── Action badge config ───────────────────────────────────────────────────────
const ACTION_CFG = {
  CREATE:        { bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-500' },
  UPDATE:        { bg:'bg-blue-100',    text:'text-blue-700',    dot:'bg-blue-500'    },
  DELETE:        { bg:'bg-red-100',     text:'text-red-700',     dot:'bg-red-500'     },
  PAYMENT:       { bg:'bg-teal-100',    text:'text-teal-700',    dot:'bg-teal-500'    },
  LOGIN:         { bg:'bg-purple-100',  text:'text-purple-700',  dot:'bg-purple-500'  },
  LOGOUT:        { bg:'bg-slate-100',   text:'text-slate-600',   dot:'bg-slate-400'   },
  ADMIT:         { bg:'bg-blue-100',    text:'text-blue-700',    dot:'bg-blue-500'    },
  DISCHARGE:     { bg:'bg-amber-100',   text:'text-amber-700',   dot:'bg-amber-500'   },
  STATUS_CHANGE: { bg:'bg-orange-100',  text:'text-orange-700',  dot:'bg-orange-500'  },
  UPLOAD:        { bg:'bg-indigo-100',  text:'text-indigo-700',  dot:'bg-indigo-500'  },
  ASSESS:        { bg:'bg-cyan-100',    text:'text-cyan-700',    dot:'bg-cyan-500'    },
  REVIEW:        { bg:'bg-violet-100',  text:'text-violet-700',  dot:'bg-violet-500'  },
  CHECK_IN:      { bg:'bg-green-100',   text:'text-green-700',   dot:'bg-green-500'   },
  CHECK_OUT:     { bg:'bg-lime-100',    text:'text-lime-700',    dot:'bg-lime-500'    },
};

const ActionBadge = ({ action }) => {
  const cfg = ACTION_CFG[action] || { bg:'bg-slate-100', text:'text-slate-600', dot:'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {action}
    </span>
  );
};

const StatusBadge = ({ code }) => {
  if (!code) return <span className="text-slate-400 text-xs">—</span>;
  const ok = code < 400;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
      {code}
    </span>
  );
};

const inp = `px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;

const StatCard = ({ label, value, icon:Icon, iconBg, iconCl, sub, warn }) => (
  <div className={`bg-white rounded-2xl border shadow-sm p-4 ${warn ? 'border-red-200' : 'border-slate-100'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-black mt-1 ${warn ? 'text-red-600' : 'text-slate-800'}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconCl}`} />
      </div>
    </div>
  </div>
);

// ── Detail drawer ─────────────────────────────────────────────────────────────
const LogDetail = ({ log, onClose }) => {
  if (!log) return null;

  const before = typeof log.changes_before === 'object' ? log.changes_before : null;
  const after  = typeof log.changes_after  === 'object' ? log.changes_after  : null;

  const changedKeys = before && after
    ? Object.keys({ ...before, ...after }).filter(k =>
        JSON.stringify(before[k]) !== JSON.stringify(after[k]) &&
        !['updated_at', 'created_at', 'password_hash'].includes(k)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background:'rgba(0,0,0,0.4)' }}>
      <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800">Log #{log.log_id}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-sm">
            {[
              ['Timestamp',  fmtDateTime(log.created_at)],
              ['Action',     <ActionBadge key="a" action={log.action} />],
              ['Resource',   `${log.resource_type || '—'}${log.resource_id ? ` #${log.resource_id}` : ''}`],
              ['Status',     <StatusBadge key="s" code={log.status_code} />],
              ['Method',     log.http_method || '—'],
              ['Endpoint',   log.endpoint || '—'],
              ['IP Address', log.ip_address || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">{k}</span>
                <span className="text-slate-700 flex-1">{v}</span>
              </div>
            ))}
          </div>

          {/* User */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Performed by</p>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{log.full_name || log.username || 'Unknown'}</p>
                <p className="text-xs text-slate-400 capitalize">{log.user_role || '—'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {log.description && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3">{log.description}</p>
            </div>
          )}

          {/* Changes diff */}
          {changedKeys.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Changes ({changedKeys.length} field{changedKeys.length !== 1 ? 's' : ''})
              </p>
              <div className="space-y-2">
                {changedKeys.map(k => (
                  <div key={k} className="bg-white border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">{k.replace(/_/g, ' ')}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                        <p className="font-semibold text-red-500 mb-1">Before</p>
                        <p className="text-red-700 break-all">{String(before[k] ?? 'null')}</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                        <p className="font-semibold text-emerald-500 mb-1">After</p>
                        <p className="text-emerald-700 break-all">{String(after[k] ?? 'null')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON (dev use) */}
          {log.user_agent && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Agent</p>
              <p className="text-xs text-slate-400 font-mono break-all bg-slate-50 rounded-xl p-3">{log.user_agent}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AuditTrailPage() {
  const [logs,      setLogs]      = useState([]);
  const [stats,     setStats]     = useState({});
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [page,      setPage]      = useState(1);
  const [pagination,setPagination]= useState({});

  const [filters, setFilters] = useState({
    search:'', action:'', resource_type:'', start_date:'', end_date:'', user_id:'',
  });

  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 50, ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      )};
      const res = await api.get('/audit', { params });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || {});
    } catch {} finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get('/audit/stats'); setStats(r.data); } catch {}
  }, []);

  useEffect(() => { fetchLogs(page); }, [page, fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const openDetail = async (log) => {
    try {
      const r = await api.get(`/audit/${log.log_id}`);
      setSelected(r.data.log);
    } catch { setSelected(log); }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      ));
      const res = await api.get(`/audit/export/csv?${params}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url; a.download = `audit-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch {}
  };

  const clearFilters = () => {
    setFilters({ search:'', action:'', resource_type:'', start_date:'', end_date:'', user_id:'' });
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const s = stats.summary || {};

  const ACTIONS = ['CREATE','UPDATE','DELETE','PAYMENT','LOGIN','LOGOUT','ADMIT',
                   'DISCHARGE','STATUS_CHANGE','UPLOAD','ASSESS','REVIEW','CHECK_IN','CHECK_OUT'];
  const RESOURCES = ['Patient','Appointment','Consultation','Lab','Pharmacy','Billing',
                     'User','Bed','SupplyChain','Schedule','Imaging','Maternity','Insurance'];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .35s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-500" /> Audit Trail
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Complete tamper-evident log of all system activity</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchLogs(page); fetchStats(); }}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 shadow-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard label="Total events"   value={s.total?.toLocaleString() || 0}  icon={Shield}        iconBg="bg-teal-50"    iconCl="text-teal-500"   sub="all time" />
          <StatCard label="Today"          value={s.today || 0}                     icon={Clock}         iconBg="bg-blue-50"    iconCl="text-blue-500" />
          <StatCard label="Errors (30d)"   value={s.errors || 0}                    icon={AlertTriangle} iconBg="bg-red-50"     iconCl="text-red-500"    warn={(s.errors||0)>0} />
          <StatCard label="Active users"   value={s.unique_users || 0}              icon={User}          iconBg="bg-purple-50"  iconCl="text-purple-500" sub="last 30 days" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search by user, description, resource…"
                value={filters.search} onChange={e => setF('search', e.target.value)}
                className={`${inp} w-full pl-10`} />
            </div>
            <select value={filters.action} onChange={e => setF('action', e.target.value)}
              className={`${inp} appearance-none cursor-pointer`}>
              <option value="">All actions</option>
              {ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={filters.resource_type} onChange={e => setF('resource_type', e.target.value)}
              className={`${inp} appearance-none cursor-pointer`}>
              <option value="">All resources</option>
              {RESOURCES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">Date range:</span>
            </div>
            <input type="date" value={filters.start_date} onChange={e => setF('start_date', e.target.value)} className={inp} />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={filters.end_date} onChange={e => setF('end_date', e.target.value)} className={inp} />
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 rounded-full animate-spin" style={{ border:'3px solid #e2e8f0', borderTopColor:'#0d9488' }} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No audit log entries{hasFilters ? ' match your filters' : ''}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Timestamp','User','Role','Action','Resource','Status','IP',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.log_id}
                      onClick={() => openDetail(log)}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {fmtDateTime(log.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-teal-700">{(log.full_name || log.username || 'S')[0]}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{log.full_name || log.username || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 capitalize">{log.user_role || '—'}</td>
                      <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {log.resource_type || '—'}
                        {log.resource_id && <span className="text-slate-400 ml-1 text-xs">#{log.resource_id}</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge code={log.status_code} /></td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.ip_address || '—'}</td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4 text-slate-300 hover:text-teal-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">
              ← Prev
            </button>
            <span className="text-sm text-slate-500">Page {page} of {pagination.totalPages} · {pagination.total?.toLocaleString()} entries</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && <LogDetail log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}