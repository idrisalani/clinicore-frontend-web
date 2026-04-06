// ============================================
// ActivityLogsPage - Professional Activity Logs
// File: frontend-web/src/pages/admin/ActivityLogsPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Trash2, Eye, X, Search, RefreshCw, ChevronLeft,
  ChevronRight, AlertTriangle, Activity, Clock, Check, Loader,
} from 'lucide-react';

const PAGE_SIZE = 50;

// \u2500\u2500 Action Badge \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ActionBadge = ({ action }) => {
  const map = {
    CREATE: 'bg-green-100 text-green-700 border-green-200',
    UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
    LOGIN:  'bg-purple-100 text-purple-700 border-purple-200',
    VIEW:   'bg-gray-100 text-gray-600 border-gray-200',
    LIST:   'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  const key = (action || '').toUpperCase().split('_')[0];
  const cls = map[key] || map.VIEW;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>
      {action || '\u2014'}
    </span>
  );
};

// \u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium ${
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.message}
    </div>
  );
};

// \u2500\u2500 Log Detail Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;
  const fields = [
    { label: 'Log ID',      value: log.log_id },
    { label: 'User',        value: log.username || 'System' },
    { label: 'Action',      value: log.action },
    { label: 'Resource',    value: log.resource_type },
    { label: 'Resource ID', value: log.resource_id || '\u2014' },
    { label: 'IP Address',  value: log.ip_address || '\u2014' },
    { label: 'Timestamp',   value: log.created_at ? new Date(log.created_at).toLocaleString() : '\u2014' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-800">Log Details</h3>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{f.label}</p>
                <p className="text-sm font-semibold text-gray-800 break-all">{f.value ?? '\u2014'}</p>
              </div>
            ))}
          </div>
          {log.details && (
            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Details</p>
              <pre className="text-xs text-gray-700 overflow-auto max-h-32 whitespace-pre-wrap">
                {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
              </pre>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// \u2500\u2500 Clear Logs Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ClearLogsModal = ({ onConfirm, onCancel, loading }) => {
  const [days, setDays] = useState(90);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Clear Old Logs</h3>
          <p className="text-sm text-gray-500 mb-5">
            Delete all activity logs older than the specified number of days.
          </p>
          <div className="mb-5 text-left">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Days old (1\u2013365)
            </label>
            <input
              type="number" value={days} min={1} max={365}
              onChange={e => setDays(parseInt(e.target.value) || 90)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={() => onConfirm(days)} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {loading ? 'Clearing...' : 'Clear Logs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// \u2500\u2500 Main Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default function ActivityLogsPage() {
  const [page, setPage]               = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showClear, setShowClear]     = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [search, setSearch]           = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [toast, setToast]             = useState(null);
  const [error, setError]             = useState('');

  const { activityLogs, loading, fetchActivityLogs, getActivityLogById, clearOldActivityLogs } = useAdmin();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadLogs = useCallback(async () => {
    try {
      setError('');
      await fetchActivityLogs(PAGE_SIZE, page * PAGE_SIZE);
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Admin access required to view activity logs.'
        : 'Failed to load activity logs.');
    }
  }, [page, fetchActivityLogs]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleView = async (log) => {
    try {
      const details = await getActivityLogById(log.log_id);
      setSelectedLog(details);
    } catch {
      setSelectedLog(log); // fallback to row data
    }
  };

  const handleClear = async (days) => {
    setClearLoading(true);
    try {
      await clearOldActivityLogs(days);
      showToast(`Logs older than ${days} days cleared successfully`);
      setShowClear(false);
      setPage(0);
      loadLogs();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to clear logs.', 'error');
    } finally {
      setClearLoading(false);
    }
  };

  // Client-side filter
  const filtered = (activityLogs || []).filter(log => {
    const matchSearch = !search ||
      log.username?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' ||
      (log.action || '').toUpperCase().startsWith(actionFilter.toUpperCase());
    return matchSearch && matchAction;
  });

  const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'VIEW'];

  return (
    <div className="p-6 space-y-5">
      <Toast toast={toast} />
      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
      {showClear && (
        <ClearLogsModal
          onConfirm={handleClear}
          onCancel={() => setShowClear(false)}
          loading={clearLoading}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} entries \u00b7 Page {page + 1}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadLogs()}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowClear(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Trash2 className="w-4 h-4" />
            Clear Old Logs
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by user, action or resource..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-50" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {actions.map(a => (
            <button key={a} onClick={() => setActionFilter(a)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                actionFilter === a
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {a === 'all' ? 'All' : a}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
              <p className="mt-3 text-sm text-gray-500">Loading activity logs...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No activity logs found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || actionFilter !== 'all' ? 'Try adjusting your filters' : 'Activity will appear here as users interact with the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Action</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Resource</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">IP Address</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Timestamp</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, idx) => (
                  <tr key={log.log_id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                          {(log.username || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{log.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><ActionBadge action={log.action} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{log.resource_type || '\u2014'}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{log.ip_address || '\u2014'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString('en-NG', {
                              day: 'numeric', month: 'short',
                              hour: '2-digit', minute: '2-digit'
                            })
                          : '\u2014'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleView(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Page {page + 1} \u00b7 {filtered.length} entries shown
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold">
                  {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!activityLogs || activityLogs.length < PAGE_SIZE}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}