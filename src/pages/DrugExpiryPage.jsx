import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill, AlertTriangle, XCircle, CheckCircle, Clock,
  Search, RefreshCw, Package, Edit3, X, Truck,
} from 'lucide-react';
import Modal from '../components/Modal';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

// ── Service calls ─────────────────────────────────────────────────────────────
const getMedicationExpiry  = (params) => api.get('/pharmacy/medications/expiry',    { params }).then(r => r.data);
const getLowStock          = ()        => api.get('/pharmacy/medications/low-stock').then(r => r.data);
const updateInventory      = (id, d)   => api.put(`/pharmacy/medications/${id}/inventory`, d).then(r => r.data);

// ── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-10 h-10 rounded-full animate-spin" style={{border:'3px solid #e2e8f0',borderTopColor:'#0d9488'}} />
  </div>
);

const EXPIRY_CONFIG = {
  expired:        { color:'bg-red-100 text-red-700',      icon:<XCircle      className="w-3.5 h-3.5"/>, label:'Expired',         ring:'border-red-300'    },
  expiring_soon:  { color:'bg-orange-100 text-orange-700',icon:<AlertTriangle className="w-3.5 h-3.5"/>, label:'Expiring Soon',  ring:'border-orange-300' },
  expiring_90days:{ color:'bg-amber-100 text-amber-700',  icon:<Clock         className="w-3.5 h-3.5"/>, label:'90 Days',        ring:'border-amber-200'  },
  ok:             { color:'bg-emerald-100 text-emerald-700',icon:<CheckCircle  className="w-3.5 h-3.5"/>, label:'OK',            ring:'border-emerald-200'},
  no_date:        { color:'bg-slate-100 text-slate-500',  icon:<Package       className="w-3.5 h-3.5"/>, label:'No Date Set',   ring:'border-slate-200'  },
};

const STOCK_CONFIG = (med) => {
  if (med.stock_quantity === 0)                                     return { color:'text-red-600',    label:'Out of Stock' };
  if (med.reorder_level > 0 && med.stock_quantity <= med.reorder_level) return { color:'text-orange-600', label:'Low Stock'     };
  return { color:'text-emerald-600', label:'In Stock' };
};

// ── Inventory Edit Form ───────────────────────────────────────────────────────
const InventoryForm = ({ med, onSave, onCancel, isLoading }) => {
  const [form, setForm] = useState({
    stock_quantity:    med?.stock_quantity    || '',
    reorder_level:     med?.reorder_level     || '',
    expiry_date:       med?.expiry_date       || '',
    batch_number:      med?.batch_number      || '',
    supplier_name:     med?.supplier_name     || '',
    supplier_phone:    med?.supplier_phone    || '',
    supplier_email:    med?.supplier_email    || '',
    storage_location:  med?.storage_location  || '',
    last_restocked_at: med?.last_restocked_at || '',
  });

  const inp = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all";
  const set = (k,v) => setForm(f => ({...f, [k]: v}));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      {/* Stock */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> Stock Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Stock *</label>
            <input type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)}
              className={inp} placeholder="e.g. 150" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reorder Level</label>
            <input type="number" min="0" value={form.reorder_level} onChange={e => set('reorder_level', e.target.value)}
              className={inp} placeholder="e.g. 20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Batch Number</label>
            <input type="text" value={form.batch_number} onChange={e => set('batch_number', e.target.value)}
              className={inp} placeholder="e.g. BAT-2024-001" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Storage Location</label>
            <input type="text" value={form.storage_location} onChange={e => set('storage_location', e.target.value)}
              className={inp} placeholder="e.g. Shelf A3" />
          </div>
        </div>
      </div>

      {/* Expiry */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Expiry Details
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
            <input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Restocked</label>
            <input type="date" value={form.last_restocked_at} onChange={e => set('last_restocked_at', e.target.value)} className={inp} />
          </div>
        </div>
      </div>

      {/* Supplier */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Supplier Information
        </h4>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name</label>
          <input type="text" value={form.supplier_name} onChange={e => set('supplier_name', e.target.value)}
            className={inp} placeholder="e.g. PharmaCo Nigeria Ltd" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
            <input type="tel" value={form.supplier_phone} onChange={e => set('supplier_phone', e.target.value)}
              className={inp} placeholder="+234..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={form.supplier_email} onChange={e => set('supplier_email', e.target.value)}
              className={inp} placeholder="supplier@email.com" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Save Inventory
        </button>
      </div>
    </form>
  );
};

// ── Medication Card ───────────────────────────────────────────────────────────
const MedCard = ({ med, onEdit, canEdit }) => {
  const ex  = EXPIRY_CONFIG[med.expiry_status] || EXPIRY_CONFIG.no_date;
  const stk = STOCK_CONFIG(med);

  return (
    <div className={`bg-white rounded-2xl border-2 ${ex.ring} shadow-sm hover:shadow-md transition-all`}>
      {/* Expiry alert bar */}
      {['expired','expiring_soon'].includes(med.expiry_status) && (
        <div className={`h-1 rounded-t-2xl ${med.expiry_status==='expired'?'bg-red-500':'bg-orange-400'} animate-pulse`} />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{med.generic_name}</p>
            {med.brand_name && <p className="text-xs text-slate-400">{med.brand_name}</p>}
            <p className="text-xs text-slate-400 mt-0.5">{med.drug_class} {med.strength && `· ${med.strength}${med.unit||''}`}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${ex.color}`}>
              {ex.icon} {ex.label}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-50">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">Stock</p>
            <p className={`text-base font-black ${stk.color}`}>{med.stock_quantity ?? '—'}</p>
            <p className="text-[10px] text-slate-400">{stk.label}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">Reorder At</p>
            <p className="text-base font-black text-slate-600">{med.reorder_level ?? '—'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">Days Left</p>
            <p className={`text-base font-black ${
              med.days_to_expiry < 0 ? 'text-red-600' :
              med.days_to_expiry <= 30 ? 'text-orange-600' :
              med.days_to_expiry <= 90 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {med.days_to_expiry != null ? (med.days_to_expiry < 0 ? `${Math.abs(med.days_to_expiry)}d ago` : `${med.days_to_expiry}d`) : '—'}
            </p>
          </div>
        </div>

        {/* Expiry date & supplier */}
        {(med.expiry_date || med.supplier_name) && (
          <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 space-y-0.5">
            {med.expiry_date && <p>Expires: <span className="font-medium text-slate-600">{med.expiry_date}</span></p>}
            {med.batch_number && <p>Batch: <span className="font-medium text-slate-600">{med.batch_number}</span></p>}
            {med.supplier_name && (
              <p className="flex items-center gap-1"><Truck className="w-3 h-3" /> {med.supplier_name}</p>
            )}
          </div>
        )}

        {/* Edit button */}
        {canEdit && (
          <button onClick={() => onEdit(med)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-teal-200 transition-all">
            <Edit3 className="w-3.5 h-3.5" /> Update Inventory
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { label:'All',            value:''              },
  { label:'Expired',        value:'expired'       },
  { label:'Expiring Soon',  value:'expiring_soon' },
  { label:'OK',             value:'ok'            },
];

const DrugExpiryPage = () => {
  const { permissions } = useRole();
  const p = permissions.pharmacy;
  const { showToast, Toast } = useToast();

  const [medications,  setMedications]  = useState([]);
  const [lowStock,     setLowStock]     = useState([]);
  const [summary,      setSummary]      = useState({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [editTarget,   setEditTarget]   = useState(null);
  const [activeTab,    setActiveTab]    = useState('expiry');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [expiryData, stockData] = await Promise.all([
        getMedicationExpiry({ status: statusFilter, search }),
        getLowStock(),
      ]);
      setMedications(expiryData.medications || []);
      setSummary(expiryData.summary || {});
      setLowStock(stockData.medications || []);
    } catch { showToast('Failed to load inventory data', 'error'); }
    finally { setIsLoading(false); }
  }, [statusFilter, search, showToast]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveInventory = async (formData) => {
    if (!editTarget) return;
    const clean = Object.fromEntries(Object.entries(formData).filter(([,v]) => v !== '' && v !== null));
    try {
      setIsSubmitting(true);
      await updateInventory(editTarget.medication_id, clean);
      showToast(`Inventory updated for ${editTarget.generic_name}`);
      setEditTarget(null);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update inventory.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (p.isBlocked) return <AccessDenied message="You do not have access to pharmacy inventory." />;

  const statCards = [
    { label:'Expired',       value:summary.expired       || 0, bg:'bg-red-50',    icon:<XCircle      className="w-5 h-5 text-red-500"    />, alert: (summary.expired||0) > 0 },
    { label:'Expiring ≤30d', value:summary.expiring_soon || 0, bg:'bg-orange-50', icon:<AlertTriangle className="w-5 h-5 text-orange-500" />, alert: (summary.expiring_soon||0) > 0 },
    { label:'Expiring ≤90d', value:summary.expiring_90days||0, bg:'bg-amber-50',  icon:<Clock        className="w-5 h-5 text-amber-500"   /> },
    { label:'OK / Safe',     value:summary.ok             || 0, bg:'bg-emerald-50',icon:<CheckCircle  className="w-5 h-5 text-emerald-500" /> },
    { label:'Low Stock',     value:summary.low_stock      || 0, bg:'bg-violet-50', icon:<Package      className="w-5 h-5 text-violet-500"  />, alert: (summary.low_stock||0) > 0 },
    { label:'Out of Stock',  value:summary.out_of_stock   || 0, bg:'bg-red-50',    icon:<XCircle      className="w-5 h-5 text-red-500"    />, alert: (summary.out_of_stock||0) > 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Drug Expiry & Inventory</h1>
            <p className="text-slate-400 text-sm mt-0.5">Stock levels · Expiry alerts · Supplier management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search medication…"
                className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 w-52 transition-all" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Alert banners */}
        {(summary.expired || 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 fade-in">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-700">
              {summary.expired} medication{summary.expired!==1?'s':''} have <b>expired</b> and must be removed from dispensing immediately.
            </p>
          </div>
        )}
        {(summary.expiring_soon || 0) > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 fade-in">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-orange-700">
              {summary.expiring_soon} medication{summary.expiring_soon!==1?'s':''} will expire within <b>30 days</b>. Review and restock.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 fade-in">
          {statCards.map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 border ${s.alert?'border-red-200 animate-pulse':'border-transparent'} relative`}>
              <div className="flex items-center justify-between mb-2">
                {s.icon}
                {s.alert && <span className="w-2 h-2 bg-red-500 rounded-full" />}
              </div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
          {[{label:'Expiry Dashboard',value:'expiry'},{label:'Low Stock',value:'lowstock'}].map(t => (
            <button key={t.value} onClick={() => setActiveTab(t.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab===t.value?'bg-teal-600 text-white shadow-sm':'text-slate-500 hover:bg-slate-100'
              }`}>
              {t.label}
              {t.value==='lowstock' && lowStock.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{lowStock.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── EXPIRY DASHBOARD ── */}
        {activeTab === 'expiry' && (
          <>
            {/* Status filters */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    statusFilter===f.value
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {isLoading ? <Spinner /> : medications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-in">
                {medications.map(med => (
                  <MedCard key={med.medication_id} med={med} onEdit={setEditTarget} canEdit={p.canEdit} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-semibold">
                  {statusFilter ? `No medications with status: ${statusFilter}` : 'No medications found'}
                </p>
                <p className="text-slate-400 text-sm mt-1">Update inventory to track expiry dates</p>
              </div>
            )}
          </>
        )}

        {/* ── LOW STOCK ── */}
        {activeTab === 'lowstock' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Low Stock Medications</h3>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                {lowStock.length} items below reorder level
              </span>
            </div>
            {isLoading ? <Spinner /> : lowStock.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Medication','Strength','Stock Qty','Reorder At','Supplier','Expiry','Action'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((med, i) => {
                      const stk = STOCK_CONFIG(med);
                      return (
                        <tr key={med.medication_id} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/40'} hover:bg-teal-50/30 transition-colors`}>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{med.generic_name}</p>
                            {med.brand_name && <p className="text-xs text-slate-400">{med.brand_name}</p>}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{med.strength}{med.unit||''}</td>
                          <td className="py-3 px-4">
                            <span className={`text-lg font-black ${stk.color}`}>{med.stock_quantity ?? '—'}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{med.reorder_level ?? '—'}</td>
                          <td className="py-3 px-4 text-slate-500">{med.supplier_name || <span className="text-slate-300">Not set</span>}</td>
                          <td className="py-3 px-4">
                            {med.expiry_date
                              ? <span className={med.days_to_expiry < 30 ? 'text-red-500 font-semibold' : 'text-slate-500'}>{med.expiry_date}</span>
                              : <span className="text-slate-300">Not set</span>}
                          </td>
                          <td className="py-3 px-4">
                            {p.canEdit && (
                              <button onClick={() => { setEditTarget(med); setActiveTab('expiry'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded-lg transition-all border border-teal-200">
                                <Edit3 className="w-3 h-3" /> Update
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">All medications are above reorder levels</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Toast />

      {/* Edit modal */}
      <Modal isOpen={!!editTarget} title={`Update Inventory — ${editTarget?.generic_name || ''}`}
        onClose={() => setEditTarget(null)} size="large">
        {editTarget && (
          <InventoryForm
            med={editTarget}
            onSave={handleSaveInventory}
            onCancel={() => setEditTarget(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default DrugExpiryPage;