// ============================================
// InsurancePage.jsx
// File: frontend-web/src/pages/InsurancePage.jsx
//
// Matches insuranceController.js (Document 8) API exactly:
//   GET    /api/v1/insurance/stats
//   GET    /api/v1/insurance
//   GET    /api/v1/insurance/:id
//   POST   /api/v1/insurance
//   PUT    /api/v1/insurance/:id/status
//   PUT    /api/v1/insurance/:id
//   DELETE /api/v1/insurance/:id
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, Search, TrendingUp, Clock, CheckCircle, ChevronRight, Building, X, Loader, RefreshCw
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n) => `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_CFG = {
  'Submitted':          { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  'Under Review':       { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  'Approved':           { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Partially Approved': { bg: 'bg-teal-100',    text: 'text-teal-700'    },
  'Rejected':           { bg: 'bg-red-100',     text: 'text-red-700'     },
  'Paid':               { bg: 'bg-green-100',   text: 'text-green-700'   },
  'Appealed':           { bg: 'bg-purple-100',  text: 'text-purple-700'  },
};
const ALL_STATUSES = Object.keys(STATUS_CFG);

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>{status}</span>;
};

// ── Shared form helpers ───────────────────────────────────────────────────────
const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const sel = `${inp} appearance-none cursor-pointer`;
const ta  = `${inp} resize-none`;

const F = ({ label, children, col = false }) => (
  <div className={col ? 'col-span-2' : ''}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconCl }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
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

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, title, onClose, children, size = 'medium' }) => {
  if (!isOpen) return null;
  const ws = { small: 'max-w-md', medium: 'max-w-xl', large: 'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${ws[size]} max-h-[90vh] flex flex-col`}>
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

// ── Providers list (fetched from backend seed) ────────────────────────────────
const FALLBACK_PROVIDERS = [
  'LASHMA / Ilera Eko', 'NHIS Federal', 'Hygeia HMO', 'Reliance HMO',
  'AXA Mansard Health', 'Leadway Health', 'Total Health Trust',
  'Clearline HMO', 'Fountain Health', 'Employer / Corporate', 'Other',
];

// ── Create Claim Form ─────────────────────────────────────────────────────────
const ClaimForm = ({ mode = 'add', claim = null, onSubmit, onCancel, isLoading }) => {
  const [invoices,   setInvoices]   = useState([]);
  const [providers,  setProviders]  = useState(FALLBACK_PROVIDERS);
  const [form, setForm] = useState({
    invoice_id: '', patient_id: '',
    insurance_provider: '', insurance_policy_number: '',
    insurance_group_number: '', member_id: '',
    claim_number: '', claim_date: new Date().toISOString().split('T')[0],
    claim_amount: '', approved_amount: '', patient_liability: '',
    status: 'Submitted', status_date: new Date().toISOString().split('T')[0],
    rejection_reason: '', appeal_notes: '',
    reference_number: '', notes: '',
    diagnosis_codes: '', procedure_codes: '',
  });

  useEffect(() => {
    api.get('/billing/invoices', { params: { limit: 100, status: 'Issued,Partially Paid,Overdue' } })
      .then(r => setInvoices(r.data.invoices || []))
      .catch(() => {});
    api.get('/insurance/providers')
      .then(r => setProviders((r.data.providers || []).map(p => p.name)))
      .catch(() => {});
    if (claim && mode === 'edit') {
      setForm(f => ({ ...f, ...Object.fromEntries(Object.keys(f).map(k => [k, claim[k] ?? ''])) }));
    }
  }, [claim, mode]);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleInvoiceChange = e => {
    const inv = invoices.find(i => i.invoice_id === parseInt(e.target.value));
    setForm(f => ({
      ...f,
      invoice_id:    e.target.value,
      patient_id:    inv?.patient_id || '',
      claim_amount:  inv?.amount_due || inv?.total_amount || '',
      insurance_provider: inv?.insurance_provider || f.insurance_provider,
      insurance_policy_number: inv?.insurance_policy_number || f.insurance_policy_number,
    }));
  };

  const submit = e => {
    e.preventDefault();
    onSubmit({
      ...form,
      invoice_id:        parseInt(form.invoice_id),
      patient_id:        parseInt(form.patient_id),
      claim_amount:      parseFloat(form.claim_amount) || 0,
      approved_amount:   parseFloat(form.approved_amount) || 0,
      patient_liability: parseFloat(form.patient_liability) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Invoice + Provider */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 grid grid-cols-2 gap-3">
        <p className="col-span-2 text-xs font-bold text-blue-600 uppercase tracking-wider">Claim Details</p>
        <F label="Invoice *">
          <select name="invoice_id" value={form.invoice_id} onChange={handleInvoiceChange} className={sel} required>
            <option value="">Select invoice…</option>
            {invoices.map(i => (
              <option key={i.invoice_id} value={i.invoice_id}>
                {i.invoice_number} — {i.first_name} {i.last_name} ({fmt(i.amount_due || i.total_amount)})
              </option>
            ))}
          </select>
        </F>
        <F label="Claim Date *">
          <input type="date" name="claim_date" value={form.claim_date} onChange={set} className={inp} required />
        </F>
        <F label="Insurance Provider *">
          <select name="insurance_provider" value={form.insurance_provider} onChange={set} className={sel} required>
            <option value="">Select provider…</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </F>
        <F label="Policy Number">
          <input name="insurance_policy_number" value={form.insurance_policy_number} onChange={set} className={inp} placeholder="e.g., POL-2026-12345" />
        </F>
        <F label="Group Number">
          <input name="insurance_group_number" value={form.insurance_group_number} onChange={set} className={inp} placeholder="Group / employer code" />
        </F>
        <F label="Member ID">
          <input name="member_id" value={form.member_id} onChange={set} className={inp} placeholder="Member ID" />
        </F>
        <F label="Claim Number">
          <input name="claim_number" value={form.claim_number} onChange={set} className={inp} placeholder="Auto-generated if blank" />
        </F>
        <F label="Reference Number">
          <input name="reference_number" value={form.reference_number} onChange={set} className={inp} placeholder="Insurer reference" />
        </F>
      </div>

      {/* Financials */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 grid grid-cols-3 gap-3">
        <p className="col-span-3 text-xs font-bold text-emerald-600 uppercase tracking-wider">Financials (₦)</p>
        <F label="Claim Amount *">
          <input type="number" name="claim_amount" value={form.claim_amount} onChange={set} className={inp} placeholder="0.00" min="0" step="0.01" required />
        </F>
        <F label="Approved Amount">
          <input type="number" name="approved_amount" value={form.approved_amount} onChange={set} className={inp} placeholder="0.00" min="0" step="0.01" />
        </F>
        <F label="Patient Liability">
          <input type="number" name="patient_liability" value={form.patient_liability} onChange={set} className={inp} placeholder="0.00" min="0" step="0.01" />
        </F>
      </div>

      {/* Status */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3">
        <p className="col-span-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</p>
        <F label="Status">
          <select name="status" value={form.status} onChange={set} className={sel}>
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="Status Date">
          <input type="date" name="status_date" value={form.status_date} onChange={set} className={inp} />
        </F>
        {form.status === 'Rejected' && (
          <F label="Rejection Reason" col>
            <input name="rejection_reason" value={form.rejection_reason} onChange={set} className={inp} placeholder="Reason for rejection" />
          </F>
        )}
        {form.status === 'Appealed' && (
          <F label="Appeal Notes" col>
            <textarea name="appeal_notes" value={form.appeal_notes} onChange={set} rows={2} className={ta} placeholder="Details of the appeal…" />
          </F>
        )}
      </div>

      {/* Clinical codes + notes */}
      <div className="grid grid-cols-2 gap-3">
        <F label="Diagnosis Codes (ICD-10)">
          <input name="diagnosis_codes" value={form.diagnosis_codes} onChange={set} className={inp} placeholder="e.g., J45.901, E11.9" />
        </F>
        <F label="Procedure Codes (CPT)">
          <input name="procedure_codes" value={form.procedure_codes} onChange={set} className={inp} placeholder="e.g., 99213" />
        </F>
        <F label="Notes" col>
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Internal notes about this claim…" />
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : mode === 'add' ? 'Submit Claim' : 'Update Claim'}
        </button>
      </div>
    </form>
  );
};

// ── Quick Status Update Form ──────────────────────────────────────────────────
const StatusForm = ({ claim, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    status:            claim.status,
    approved_amount:   claim.approved_amount || '',
    patient_liability: claim.patient_liability || '',
    rejection_reason:  claim.rejection_reason || '',
    appeal_notes:      claim.appeal_notes || '',
    reference_number:  claim.reference_number || '',
    response_date:     claim.response_date || new Date().toISOString().split('T')[0],
    payment_date:      claim.payment_date || '',
    notes:             claim.notes || '',
  });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    onSubmit({
      ...form,
      approved_amount:   parseFloat(form.approved_amount) || 0,
      patient_liability: parseFloat(form.patient_liability) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="New Status *">
          <select name="status" value={form.status} onChange={set} className={sel} required>
            {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
        <F label="Response Date">
          <input type="date" name="response_date" value={form.response_date} onChange={set} className={inp} />
        </F>
        <F label="Approved Amount (₦)">
          <input type="number" name="approved_amount" value={form.approved_amount} onChange={set} className={inp} min="0" step="0.01" placeholder="0.00" />
        </F>
        <F label="Patient Liability (₦)">
          <input type="number" name="patient_liability" value={form.patient_liability} onChange={set} className={inp} min="0" step="0.01" placeholder="0.00" />
        </F>
        {form.status === 'Paid' && (
          <F label="Payment Date">
            <input type="date" name="payment_date" value={form.payment_date} onChange={set} className={inp} />
          </F>
        )}
        <F label="Reference Number">
          <input name="reference_number" value={form.reference_number} onChange={set} className={inp} placeholder="Insurer reference" />
        </F>
        {form.status === 'Rejected' && (
          <F label="Rejection Reason" col>
            <input name="rejection_reason" value={form.rejection_reason} onChange={set} className={inp} placeholder="Reason for rejection" />
          </F>
        )}
        {form.status === 'Appealed' && (
          <F label="Appeal Notes" col>
            <textarea name="appeal_notes" value={form.appeal_notes} onChange={set} rows={2} className={ta} placeholder="Appeal details…" />
          </F>
        )}
        <F label="Notes" col>
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Internal notes…" />
        </F>
      </div>

      {form.status === 'Paid' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 font-medium">
          Marking as Paid will automatically record a payment on the invoice for the approved amount.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          Update Status
        </button>
      </div>
    </form>
  );
};

// ── Claim Detail Panel ────────────────────────────────────────────────────────
const ClaimDetail = ({ claim, onEdit, onUpdateStatus, onDelete, onClose }) => {
  const Row = ({ label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 text-right flex-1 ml-2">{value || '—'}</span>
    </div>
  );

  const canDelete = !['Paid', 'Approved'].includes(claim.status);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xl font-black">{claim.claim_number || `CLM-${claim.claim_id}`}</p>
            <p className="text-teal-200 text-sm mt-0.5">{claim.first_name} {claim.last_name}</p>
            <p className="text-teal-300 text-xs mt-0.5">{claim.invoice_number}</p>
          </div>
          <Badge status={claim.status} />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
          {[
            ['Claimed',  fmt(claim.claim_amount)],
            ['Approved', fmt(claim.approved_amount)],
            ['Pt. Pays', fmt(claim.patient_liability)],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-teal-300 text-xs uppercase tracking-wide">{l}</p>
              <p className="font-bold text-sm mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Claim Information</p>
        <Row label="Provider"         value={claim.insurance_provider} />
        <Row label="Policy Number"    value={claim.insurance_policy_number} />
        <Row label="Group Number"     value={claim.insurance_group_number} />
        <Row label="Member ID"        value={claim.member_id} />
        <Row label="Claim Date"       value={fmtDate(claim.claim_date)} />
        <Row label="Status Date"      value={fmtDate(claim.status_date)} />
        <Row label="Response Date"    value={fmtDate(claim.response_date)} />
        <Row label="Payment Date"     value={fmtDate(claim.payment_date)} />
        <Row label="Reference #"      value={claim.reference_number} />
        <Row label="Diagnosis Codes"  value={claim.diagnosis_codes} />
        <Row label="Procedure Codes"  value={claim.procedure_codes} />
        {claim.rejection_reason && <Row label="Rejection"  value={claim.rejection_reason} />}
        {claim.appeal_notes     && <Row label="Appeal"     value={claim.appeal_notes} />}
        {claim.notes            && <Row label="Notes"      value={claim.notes} />}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={onUpdateStatus} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all">
          Update Status
        </button>
        <button onClick={onEdit} className="flex-1 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all">
          Edit Details
        </button>
        {canDelete && (
          <button onClick={onDelete} className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
            Delete
          </button>
        )}
        <button onClick={onClose} className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
          Close
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InsurancePage() {
  const [claims, setClaims]             = useState([]);
  const [stats, setStats]               = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setSubmitting]   = useState(false);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setPage]          = useState(1);
  const [pagination, setPagination]     = useState({});
  const [showForm, setShowForm]         = useState(false);
  const [showDetail, setShowDetail]     = useState(false);
  const [showStatus, setShowStatus]     = useState(false);
  const [selectedClaim, setSelected]   = useState(null);
  const [modalMode, setModalMode]       = useState('add');
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClaims = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/insurance', { params: { page: p, limit: 15, status: statusFilter } });
      setClaims(res.data.claims || []);
      setPagination(res.data.pagination || {});
    } catch { showToast('Failed to load claims', 'error'); }
    finally { setIsLoading(false); }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/insurance/stats');
      setStats(res.data.stats);
    } catch {}
  }, []);

  useEffect(() => { fetchClaims(currentPage); fetchStats(); }, [currentPage, fetchClaims, fetchStats]);

  const handleCreateOrEdit = async (data) => {
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await api.post('/insurance', data);
        showToast('Claim submitted successfully');
      } else {
        await api.put(`/insurance/${selectedClaim.claim_id}`, data);
        showToast('Claim updated');
      }
      setShowForm(false);
      setShowDetail(false);
      fetchClaims(1); fetchStats(); setPage(1);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save claim', 'error');
    } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (data) => {
    setSubmitting(true);
    try {
      await api.put(`/insurance/${selectedClaim.claim_id}/status`, data);
      showToast(`Status updated to ${data.status}`);
      setShowStatus(false);
      setShowDetail(false);
      fetchClaims(currentPage); fetchStats();
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to update status', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete claim ${selectedClaim.claim_number || selectedClaim.claim_id}? This cannot be undone.`)) return;
    try {
      await api.delete(`/insurance/${selectedClaim.claim_id}`);
      showToast('Claim deleted');
      setShowDetail(false);
      fetchClaims(1); fetchStats(); setPage(1);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to delete claim', 'error');
    }
  };

  const openDetail = async (claim) => {
    try {
      const res = await api.get(`/insurance/${claim.claim_id}`);
      setSelected(res.data.claim);
      setShowDetail(true);
    } catch { showToast('Failed to load claim', 'error'); }
  };

  const filtered = claims.filter(c =>
    !search || `${c.first_name} ${c.last_name} ${c.claim_number || ''} ${c.insurance_provider}`.toLowerCase().includes(search.toLowerCase())
  );

  const pending  = (stats?.submitted || 0) + (stats?.under_review || 0);
  const approved = (stats?.approved || 0) + (stats?.partially_approved || 0) + (stats?.paid || 0);

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
              <Shield className="w-6 h-6 text-teal-500" /> Insurance Claims
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage HMO, NHIS and LASHMA insurance claims</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchClaims(currentPage); fetchStats(); }}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setSelected(null); setModalMode('add'); setShowForm(true); }}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all">
              <Plus className="w-4 h-4" /> New Claim
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={Shield}       label="Total Claims"   value={stats?.total_claims || 0}    sub={fmt(stats?.total_claimed || 0) + ' claimed'} iconBg="bg-blue-50"    iconCl="text-blue-500" />
          <StatCard icon={Clock}        label="Pending"        value={pending}                     sub="submitted + reviewing"                        iconBg="bg-amber-50"   iconCl="text-amber-500" />
          <StatCard icon={CheckCircle}  label="Approved/Paid"  value={approved}                    sub={fmt(stats?.total_approved || 0) + ' approved'} iconBg="bg-emerald-50" iconCl="text-emerald-500" />
          <StatCard icon={TrendingUp}   label="Approval Rate"  value={stats?.approval_rate ? `${stats.approval_rate}%` : '—'} iconBg="bg-purple-50" iconCl="text-purple-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search by patient, claim number, or provider…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none outline-none cursor-pointer appearance-none">
              <option value="">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold">No insurance claims found</p>
              <p className="text-slate-400 text-sm mt-1">Submit your first claim to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {['Claim #','Patient','Provider','Claim Date','Claimed','Approved','Status',''].map(h => (
                        <th key={h} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr key={c.claim_id} onClick={() => openDetail(c)}
                        className={`border-b border-slate-50 hover:bg-teal-50/40 transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-bold text-teal-700">{c.claim_number || `CLM-${c.claim_id}`}</p>
                          <p className="text-xs text-slate-400">{c.invoice_number}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 text-sm">{c.first_name} {c.last_name}</p>
                          <p className="text-xs text-slate-400">{c.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 truncate max-w-[120px]">{c.insurance_provider}</span>
                          </div>
                          {c.insurance_policy_number && <p className="text-xs text-slate-400 mt-0.5">{c.insurance_policy_number}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{fmtDate(c.claim_date)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{fmt(c.claim_amount)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{fmt(c.approved_amount)}</td>
                        <td className="px-4 py-3"><Badge status={c.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4 border-t border-slate-100">
                  <button disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${pg === currentPage ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{pg}</button>
                  ))}
                  <button disabled={currentPage >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showForm} title={modalMode === 'add' ? 'New Insurance Claim' : 'Edit Claim'} onClose={() => setShowForm(false)} size="large">
        <ClaimForm claim={selectedClaim} mode={modalMode} isLoading={isSubmitting}
          onSubmit={handleCreateOrEdit} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={showDetail && !!selectedClaim} title="Claim Details" onClose={() => { setShowDetail(false); setSelected(null); }} size="medium">
        {selectedClaim && (
          <ClaimDetail
            claim={selectedClaim}
            onEdit={() => { setShowDetail(false); setModalMode('edit'); setShowForm(true); }}
            onUpdateStatus={() => { setShowDetail(false); setShowStatus(true); }}
            onDelete={handleDelete}
            onClose={() => { setShowDetail(false); setSelected(null); }}
          />
        )}
      </Modal>

      <Modal isOpen={showStatus && !!selectedClaim} title="Update Claim Status" onClose={() => setShowStatus(false)} size="medium">
        {selectedClaim && (
          <StatusForm claim={selectedClaim} isLoading={isSubmitting}
            onSubmit={handleStatusUpdate} onCancel={() => setShowStatus(false)} />
        )}
      </Modal>
    </div>
  );
}