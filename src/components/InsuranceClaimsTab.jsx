// ============================================
// InsuranceClaimsTab — embedded in BillingPage
// File: frontend-web/src/components/InsuranceClaimsTab.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Plus, RefreshCw, Search, Edit2, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, X,
  ChevronDown, FileText, DollarSign,
} from 'lucide-react';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../hooks/useToast';
import { useRole } from '../hooks/useRole';
import {
  getAllClaims, getClaimStats, createClaim,
  updateClaimStatus, updateClaim, deleteClaim,
} from '../services/insuranceService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => `₦${parseFloat(v||0).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
const today = () => new Date().toISOString().split('T')[0];

const STATUS_CONFIG = {
  Submitted:           { color:'bg-blue-100 text-blue-700',     icon:<Clock     className="w-3 h-3"/> },
  'Under Review':      { color:'bg-amber-100 text-amber-700',   icon:<Clock     className="w-3 h-3"/> },
  Approved:            { color:'bg-emerald-100 text-emerald-700',icon:<CheckCircle className="w-3 h-3"/> },
  'Partially Approved':{ color:'bg-teal-100 text-teal-700',     icon:<CheckCircle className="w-3 h-3"/> },
  Rejected:            { color:'bg-red-100 text-red-700',       icon:<XCircle   className="w-3 h-3"/> },
  Paid:                { color:'bg-violet-100 text-violet-700', icon:<DollarSign className="w-3 h-3"/> },
  Appealed:            { color:'bg-orange-100 text-orange-700', icon:<AlertTriangle className="w-3 h-3"/> },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color:'bg-slate-100 text-slate-600', icon:null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      {cfg.icon} {status}
    </span>
  );
};

const StatCard = ({ label, value, sub, bg, color }) => (
  <div className={`${bg} rounded-2xl p-4 border border-transparent`}>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Claim Form ────────────────────────────────────────────────────────────────
const EMPTY_CLAIM = {
  invoice_id:'', patient_id:'', insurance_provider:'', insurance_policy_number:'',
  insurance_group_number:'', member_id:'', claim_number:'', claim_date: today(),
  claim_amount:'', approved_amount:0, patient_liability:0, status:'Submitted',
  notes:'', diagnosis_codes:'', procedure_codes:'',
};

const inp = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all";
const sel = `${inp} appearance-none cursor-pointer`;
const ta  = `${inp} resize-none`;

const ClaimForm = ({ claim=null, invoices=[], onSubmit, onCancel, isLoading, mode='add' }) => {
  const [form, setForm] = useState(claim ? {...EMPTY_CLAIM, ...claim} : EMPTY_CLAIM);
  const [errors, setErrors] = useState({});

  const set = (e) => {
    const { name, value } = e.target;
    setForm(f => ({...f, [name]: value}));
    if (errors[name]) setErrors(ev => ({...ev, [name]:''}));
  };

  const validate = () => {
    const errs = {};
    if (!form.invoice_id)         errs.invoice_id         = 'Required';
    if (!form.patient_id)         errs.patient_id         = 'Required';
    if (!form.insurance_provider) errs.insurance_provider = 'Required';
    if (!form.claim_date)         errs.claim_date         = 'Required';
    if (!form.claim_amount || parseFloat(form.claim_amount) <= 0) errs.claim_amount = 'Must be > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => { e.preventDefault(); if (validate()) onSubmit(form); };

  // Auto-fill patient_id when invoice selected
  const handleInvoiceChange = (e) => {
    const inv = invoices.find(i => String(i.invoice_id) === e.target.value);
    setForm(f => ({
      ...f,
      invoice_id: e.target.value,
      patient_id: inv?.patient_id || f.patient_id,
      claim_amount: inv?.total_amount || f.claim_amount,
      insurance_provider: inv?.insurance_provider || f.insurance_provider || '',
    }));
  };

  const F = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4">

      {/* Invoice & Patient */}
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5"/> Invoice & Patient
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <F label="Invoice *" error={errors.invoice_id}>
            {invoices.length > 0 ? (
              <select name="invoice_id" value={form.invoice_id} onChange={handleInvoiceChange} className={`${sel} ${errors.invoice_id?'border-red-300':''}`}>
                <option value="">Select invoice…</option>
                {invoices.map(i => (
                  <option key={i.invoice_id} value={i.invoice_id}>
                    {i.invoice_number} — {i.first_name} {i.last_name} ({fmt(i.total_amount)})
                  </option>
                ))}
              </select>
            ) : (
              <input name="invoice_id" value={form.invoice_id} onChange={set}
                className={`${inp} ${errors.invoice_id?'border-red-300':''}`} placeholder="Invoice ID" type="number" />
            )}
          </F>
          <F label="Patient ID *" error={errors.patient_id}>
            <input name="patient_id" value={form.patient_id} onChange={set} type="number"
              className={`${inp} ${errors.patient_id?'border-red-300':''}`} placeholder="Patient ID" />
          </F>
        </div>
      </div>

      {/* Insurer Details */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5"/> Insurer Details
        </h4>
        <F label="Insurance Provider *" error={errors.insurance_provider}>
          <input name="insurance_provider" value={form.insurance_provider} onChange={set}
            className={`${inp} ${errors.insurance_provider?'border-red-300':''}`}
            placeholder="e.g. NHIS, AXA Mansard, Leadway Health" />
        </F>
        <div className="grid grid-cols-2 gap-3">
          <F label="Policy Number">
            <input name="insurance_policy_number" value={form.insurance_policy_number} onChange={set} className={inp} placeholder="POL-XXXX" />
          </F>
          <F label="Group Number">
            <input name="insurance_group_number" value={form.insurance_group_number} onChange={set} className={inp} placeholder="GRP-XXXX" />
          </F>
          <F label="Member ID">
            <input name="member_id" value={form.member_id} onChange={set} className={inp} placeholder="MBR-XXXX" />
          </F>
          <F label="Claim Number">
            <input name="claim_number" value={form.claim_number} onChange={set} className={inp} placeholder="Auto-generated if empty" />
          </F>
        </div>
      </div>

      {/* Financials */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Financial Details (₦)</h4>
        <div className="grid grid-cols-3 gap-3">
          <F label="Claim Amount *" error={errors.claim_amount}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">₦</span>
              <input name="claim_amount" value={form.claim_amount} onChange={set} type="number" step="0.01" min="0"
                className={`${inp} pl-7 ${errors.claim_amount?'border-red-300':''}`} placeholder="0.00" />
            </div>
          </F>
          <F label="Approved Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">₦</span>
              <input name="approved_amount" value={form.approved_amount} onChange={set} type="number" step="0.01" min="0"
                className={`${inp} pl-7`} placeholder="0.00" />
            </div>
          </F>
          <F label="Patient Liability">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">₦</span>
              <input name="patient_liability" value={form.patient_liability} onChange={set} type="number" step="0.01" min="0"
                className={`${inp} pl-7`} placeholder="0.00" />
            </div>
          </F>
        </div>
      </div>

      {/* Claim Details */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Claim Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <F label="Claim Date *" error={errors.claim_date}>
            <input type="date" name="claim_date" value={form.claim_date} onChange={set}
              className={`${inp} ${errors.claim_date?'border-red-300':''}`} />
          </F>
          <F label="Status">
            <select name="status" value={form.status} onChange={set} className={sel}>
              {['Submitted','Under Review','Approved','Partially Approved','Rejected','Paid','Appealed'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </F>
          <F label="Diagnosis Codes (ICD-10)">
            <input name="diagnosis_codes" value={form.diagnosis_codes} onChange={set} className={inp} placeholder="J06.9, K21.0" />
          </F>
          <F label="Procedure Codes">
            <input name="procedure_codes" value={form.procedure_codes} onChange={set} className={inp} placeholder="99213, 93000" />
          </F>
        </div>
        <F label="Notes">
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Additional claim notes…" />
        </F>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
          {mode === 'add' ? 'Submit Claim' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

// ── Status Update Form ────────────────────────────────────────────────────────
const StatusForm = ({ claim, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    status: claim?.status || 'Under Review',
    approved_amount: claim?.approved_amount || 0,
    patient_liability: claim?.patient_liability || 0,
    rejection_reason: claim?.rejection_reason || '',
    reference_number: claim?.reference_number || '',
    response_date: today(),
    notes: '',
  });

  const set = (e) => setForm(f => ({...f, [e.target.name]: e.target.value}));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
        <p className="text-sm text-slate-500">
          Updating claim <span className="font-bold text-slate-700">{claim?.claim_number}</span> for{' '}
          <span className="font-bold text-slate-700">{claim?.first_name} {claim?.last_name}</span>
        </p>
        <p className="text-sm text-slate-500">
          Claimed: <span className="font-bold text-teal-700">{fmt(claim?.claim_amount)}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Status *</label>
        <select name="status" value={form.status} onChange={set} className={sel}>
          {['Submitted','Under Review','Approved','Partially Approved','Rejected','Paid','Appealed'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {['Approved','Partially Approved','Paid'].includes(form.status) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Approved Amount (₦)</label>
            <input name="approved_amount" type="number" step="0.01" min="0" value={form.approved_amount} onChange={set} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Patient Liability (₦)</label>
            <input name="patient_liability" type="number" step="0.01" min="0" value={form.patient_liability} onChange={set} className={inp} />
          </div>
        </div>
      )}

      {form.status === 'Rejected' && (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rejection Reason</label>
          <textarea name="rejection_reason" value={form.rejection_reason} onChange={set} rows={2}
            className={ta} placeholder="Reason for rejection…" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Response Date</label>
          <input type="date" name="response_date" value={form.response_date} onChange={set} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reference Number</label>
          <input name="reference_number" value={form.reference_number} onChange={set} className={inp} placeholder="Insurer ref…" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
        <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Additional notes…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2">
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
          Update Status
        </button>
      </div>
    </form>
  );
};

// ── Main Tab Component ────────────────────────────────────────────────────────
const InsuranceClaimsTab = ({ invoices = [] }) => {
  const { permissions } = useRole();
  const p = permissions.billing;
  const { showToast, Toast } = useToast();

  const [claims,      setClaims]      = useState([]);
  const [stats,       setStats]       = useState({});
  const [byProvider,  setByProvider]  = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination,  setPagination]  = useState({});
  const [showClaimModal,  setShowClaimModal]  = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedClaim,   setSelectedClaim]   = useState(null);
  const [deleteTarget,    setDeleteTarget]     = useState(null);
  const [modalMode,       setModalMode]        = useState('add');

  const fetchClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllClaims({ page: currentPage, limit: 10, status: statusFilter, provider: searchQuery });
      setClaims(data.claims || []);
      setPagination(data.pagination || {});
    } catch { showToast('Failed to load claims', 'error'); }
    finally { setIsLoading(false); }
  }, [currentPage, statusFilter, searchQuery, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getClaimStats();
      setStats(data.stats || {});
      setByProvider(data.byProvider || []);
    } catch {}
  }, []);

  useEffect(() => { fetchClaims(); fetchStats(); }, [fetchClaims, fetchStats]);

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      const result = await createClaim(formData);
      showToast(`Claim ${result.claim_number} submitted successfully`);
      setShowClaimModal(false);
      fetchClaims(); fetchStats();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to submit claim', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await updateClaim(selectedClaim.claim_id, formData);
      showToast('Claim updated successfully');
      setShowClaimModal(false); setSelectedClaim(null);
      fetchClaims(); fetchStats();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update claim', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleStatusUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await updateClaimStatus(selectedClaim.claim_id, formData);
      showToast(`Status updated to ${formData.status}`);
      setShowStatusModal(false); setSelectedClaim(null);
      fetchClaims(); fetchStats();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update status', 'error');
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteClaim(deleteTarget.claim_id);
      showToast('Claim deleted');
      setDeleteTarget(null); fetchClaims(); fetchStats();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete claim', 'error');
    }
  };

  const STATUSES = ['','Submitted','Under Review','Approved','Partially Approved','Rejected','Paid','Appealed'];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total Claims"  value={stats.total_claims||0}       bg="bg-slate-50"   color="text-slate-800" />
        <StatCard label="Submitted"     value={stats.submitted||0}           bg="bg-blue-50"    color="text-blue-700" />
        <StatCard label="Under Review"  value={stats.under_review||0}        bg="bg-amber-50"   color="text-amber-700" />
        <StatCard label="Approved"      value={stats.approved||0}            bg="bg-emerald-50" color="text-emerald-700" />
        <StatCard label="Rejected"      value={stats.rejected||0}            bg="bg-red-50"     color="text-red-700" />
        <StatCard label="Paid"          value={stats.paid||0}                bg="bg-violet-50"  color="text-violet-700" />
        <StatCard label="Approval Rate" value={`${stats.approval_rate||0}%`} bg="bg-teal-50"    color="text-teal-700" />
      </div>

      {/* Claimed vs Approved summary */}
      {(stats.total_claimed > 0) && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Claimed</p>
            <p className="text-xl font-black text-slate-800 mt-1">{fmt(stats.total_claimed)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Approved</p>
            <p className="text-xl font-black text-emerald-700 mt-1">{fmt(stats.total_approved)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Patient Liability</p>
            <p className="text-xl font-black text-orange-700 mt-1">{fmt(stats.total_patient_liability)}</p>
          </div>
        </div>
      )}

      {/* Filters + actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by provider…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5"/>
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400 appearance-none cursor-pointer min-w-40">
          {STATUSES.map(s => <option key={s} value={s}>{s||'All Status'}</option>)}
        </select>
        <button onClick={fetchClaims}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
          <RefreshCw className="w-4 h-4"/>
        </button>
        {p.canCreate && (
          <button onClick={() => { setSelectedClaim(null); setModalMode('add'); setShowClaimModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all">
            <Plus className="w-4 h-4"/> Submit Claim
          </button>
        )}
      </div>

      {/* Claims table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full animate-spin" style={{border:'3px solid #e2e8f0',borderTopColor:'#0d9488'}}/>
          </div>
        ) : claims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Claim #','Patient','Provider','Claimed','Approved','Liability','Date','Status',''].map((h,i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((c, i) => (
                  <tr key={c.claim_id} className={`border-b border-slate-50 hover:bg-teal-50/30 transition-colors ${i%2===0?'bg-white':'bg-slate-50/40'}`}>
                    <td className="px-4 py-3 font-bold text-slate-800">{c.claim_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-36 truncate">{c.insurance_provider}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{fmt(c.claim_amount)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{c.approved_amount > 0 ? fmt(c.approved_amount) : '—'}</td>
                    <td className="px-4 py-3 text-orange-600 font-medium">{c.patient_liability > 0 ? fmt(c.patient_liability) : '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{c.claim_date?.slice(0,10)}</td>
                    <td className="px-4 py-3"><Badge status={c.status}/></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {p.canEdit && !['Paid'].includes(c.status) && (
                          <button onClick={() => { setSelectedClaim(c); setShowStatusModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-100 text-teal-600 transition-colors" title="Update Status">
                            <ChevronDown className="w-4 h-4"/>
                          </button>
                        )}
                        {p.canEdit && (
                          <button onClick={() => { setSelectedClaim(c); setModalMode('edit'); setShowClaimModal(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4"/>
                          </button>
                        )}
                        {p.canDelete && !['Paid','Approved'].includes(c.status) && (
                          <button onClick={() => setDeleteTarget(c)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-slate-300"/>
            </div>
            <p className="text-slate-500 font-semibold">No insurance claims found</p>
            {p.canCreate && (
              <button onClick={() => { setSelectedClaim(null); setModalMode('add'); setShowClaimModal(true); }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all">
                <Plus className="w-4 h-4"/> Submit First Claim
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-slate-100">
            <button disabled={currentPage<=1} onClick={() => setCurrentPage(p=>p-1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">← Prev</button>
            <span className="text-sm text-slate-500">Page {currentPage} of {pagination.totalPages}</span>
            <button disabled={currentPage>=pagination.totalPages} onClick={() => setCurrentPage(p=>p+1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all">Next →</button>
          </div>
        )}
      </div>

      {/* Provider breakdown */}
      {byProvider.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Claims by Insurance Provider</h3>
          <div className="space-y-3">
            {byProvider.map((prov, i) => {
              const maxClaimed = Math.max(...byProvider.map(p => p.total_claimed));
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{prov.insurance_provider}</span>
                    <span className="text-slate-400">{prov.claims} claims · {prov.approval_rate_pct}% approved</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{width:`${(prov.total_claimed/maxClaimed)*100}%`}}/>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                    <span>Claimed: {fmt(prov.total_claimed)}</span>
                    <span>Approved: {fmt(prov.total_approved)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Toast/>

      {/* Claim form modal */}
      <Modal isOpen={showClaimModal}
        title={modalMode==='add' ? 'Submit Insurance Claim' : 'Edit Insurance Claim'}
        onClose={() => { setShowClaimModal(false); setSelectedClaim(null); }}
        size="large">
        <ClaimForm
          claim={selectedClaim}
          invoices={invoices}
          mode={modalMode}
          onSubmit={modalMode==='add' ? handleCreate : handleUpdate}
          onCancel={() => { setShowClaimModal(false); setSelectedClaim(null); }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Status update modal */}
      <Modal isOpen={showStatusModal}
        title="Update Claim Status"
        onClose={() => { setShowStatusModal(false); setSelectedClaim(null); }}
        size="medium">
        {selectedClaim && (
          <StatusForm
            claim={selectedClaim}
            onSubmit={handleStatusUpdate}
            onCancel={() => { setShowStatusModal(false); setSelectedClaim(null); }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Claim?"
        message={`Delete claim ${deleteTarget?.claim_number}? This cannot be undone.`}
        confirmLabel="Delete Claim"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default InsuranceClaimsTab;