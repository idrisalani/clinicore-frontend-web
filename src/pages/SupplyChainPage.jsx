// ============================================
// SupplyChainPage.jsx
// File: frontend-web/src/pages/SupplyChainPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Plus, Search, RefreshCw, Package, ShoppingCart,
  CheckCircle, Clock, AlertTriangle, X, ChevronRight,
  Loader, FileText, TrendingDown, Star, BarChart2,
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt  = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—';

const PO_STATUS = {
  Draft:              { bg:'bg-slate-100',   text:'text-slate-600',   dot:'bg-slate-400'  },
  Submitted:          { bg:'bg-blue-100',    text:'text-blue-700',    dot:'bg-blue-500'   },
  Approved:           { bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-500'},
  Ordered:            { bg:'bg-purple-100',  text:'text-purple-700',  dot:'bg-purple-500' },
  'Partially Received':{ bg:'bg-amber-100',  text:'text-amber-700',   dot:'bg-amber-500'  },
  Received:           { bg:'bg-teal-100',    text:'text-teal-700',    dot:'bg-teal-500'   },
  Cancelled:          { bg:'bg-red-100',     text:'text-red-700',     dot:'bg-red-400'    },
};

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const sel = `${inp} appearance-none cursor-pointer`;
const ta  = `${inp} resize-none`;

// ── Shared modal ──────────────────────────────────────────────────────────────
const Modal = ({ isOpen, title, onClose, size='medium', children }) => {
  if (!isOpen) return null;
  const ws = { small:'max-w-md', medium:'max-w-xl', large:'max-w-3xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${ws[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
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

// ── PO status badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = PO_STATUS[status] || PO_STATUS.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

// ── Supplier form ─────────────────────────────────────────────────────────────
const SupplierForm = ({ initial, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState(initial || {
    name:'', contact_person:'', phone:'', email:'',
    address:'', supplier_type:'Drug', payment_terms:'Net 30',
    rating:3, notes:'',
  });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier name *</label>
          <input name="name" value={form.name} onChange={set} required className={inp} placeholder="e.g. Emzor Pharmaceuticals" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contact person</label>
          <input name="contact_person" value={form.contact_person} onChange={set} className={inp} placeholder="Full name" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
          <input name="phone" value={form.phone} onChange={set} className={inp} placeholder="+234..." />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
          <input name="email" value={form.email} onChange={set} className={inp} placeholder="orders@supplier.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
          <select name="supplier_type" value={form.supplier_type} onChange={set} className={sel}>
            {['Drug','Equipment','Consumable','Mixed'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Payment terms</label>
          <select name="payment_terms" value={form.payment_terms} onChange={set} className={sel}>
            {['Immediate','Net 7','Net 14','Net 30','Net 60'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rating</label>
          <select name="rating" value={form.rating} onChange={set} className={sel}>
            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} star{r>1?'s':''}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
          <input name="address" value={form.address} onChange={set} className={inp} placeholder="Street, city..." />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Any relevant notes..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />} Save Supplier
        </button>
      </div>
    </form>
  );
};

// ── PO form ───────────────────────────────────────────────────────────────────
const POForm = ({ suppliers, medications, onSubmit, onCancel, isLoading }) => {
  const [form, setForm] = useState({ supplier_id:'', expected_date:'', notes:'', items:[{ item_name:'', medication_id:'', quantity_ordered:1, unit_cost:0, unit:'units' }] });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const setItem = (i, e) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[e.target.name]:e.target.value}; return {...f,items}; });
  const addItem = () => setForm(f => ({ ...f, items:[...f.items,{ item_name:'', medication_id:'', quantity_ordered:1, unit_cost:0, unit:'units' }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items:f.items.filter((_,j)=>j!==i) }));
  const total = form.items.reduce((s,i) => s + (Number(i.quantity_ordered)||0) * (Number(i.unit_cost)||0), 0);

  const handleMedSelect = (i, medId) => {
    const med = medications.find(m => String(m.medication_id) === String(medId));
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], medication_id: medId, item_name: med ? `${med.generic_name}${med.brand_name?' ('+med.brand_name+')':''}` : items[i].item_name, unit_cost: med?.unit_cost || 0 };
      return { ...f, items };
    });
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier *</label>
          <select name="supplier_id" value={form.supplier_id} onChange={set} required className={sel}>
            <option value="">Select supplier…</option>
            {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected delivery</label>
          <input type="date" name="expected_date" value={form.expected_date} onChange={set} className={inp} />
        </div>
        <div className="flex items-end">
          <div className="w-full text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated total</p>
            <p className="text-xl font-black text-slate-800">{fmt(total)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Items *</label>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <select value={item.medication_id} onChange={e => handleMedSelect(i, e.target.value)} className={sel}>
                    <option value="">Custom item…</option>
                    {medications.map(m => <option key={m.medication_id} value={m.medication_id}>{m.generic_name}{m.brand_name?' ('+m.brand_name+')':''}</option>)}
                  </select>
                </div>
                <div className="col-span-4">
                  <input name="item_name" value={item.item_name} onChange={e => setItem(i, e)} className={inp} placeholder="Item description *" required />
                </div>
                <div className="col-span-2">
                  <input name="unit" value={item.unit} onChange={e => setItem(i, e)} className={inp} placeholder="Unit" />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-slate-300 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Qty *</label>
                  <input type="number" name="quantity_ordered" value={item.quantity_ordered} onChange={e => setItem(i, e)} min="1" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unit cost (₦) *</label>
                  <input type="number" name="unit_cost" value={item.unit_cost} onChange={e => setItem(i, e)} min="0" step="0.01" className={inp} />
                </div>
                <div className="flex items-end">
                  <p className="text-sm font-bold text-slate-700 pb-2.5">{fmt((item.quantity_ordered||0)*(item.unit_cost||0))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
        <textarea name="notes" value={form.notes} onChange={set} rows={2} className={ta} placeholder="Delivery instructions, special requirements…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isLoading || !form.supplier_id} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-2">
          {isLoading && <Loader className="w-4 h-4 animate-spin" />} Create Purchase Order
        </button>
      </div>
    </form>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SupplyChainPage() {
  const [tab, setTab]           = useState('dashboard');
  const [stats, setStats]       = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [pos, setPOs]           = useState([]);
  const [movements, setMovements] = useState([]);
  const [medications, setMeds]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [poStatus, setPOStatus] = useState('');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showCreatePO,    setShowCreatePO]    = useState(false);
  const [showAdjust,      setShowAdjust]      = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);
  const [adjustForm, setAdjustForm] = useState({ medication_id:'', adjustment:0, reason:'', notes:'' });
  const [selectedPO, setSelectedPO] = useState(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsR, suppR, posR, movR, medR] = await Promise.all([
        api.get('/supply-chain/stats'),
        api.get('/supply-chain/suppliers'),
        api.get('/supply-chain/purchase-orders', { params:{ limit:50, status:poStatus||undefined } }),
        api.get('/supply-chain/stock-movements', { params:{ limit:30 } }),
        api.get('/pharmacy/medications', { params:{ limit:200 } }),
      ]);
      setStats(statsR.data);
      setSuppliers(suppR.data.suppliers || []);
      setPOs(posR.data.purchase_orders || []);
      setMovements(movR.data.movements || []);
      setMeds(medR.data.medications || []);
    } catch { showToast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  }, [poStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddSupplier = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/supply-chain/suppliers', data);
      showToast('Supplier added successfully');
      setShowAddSupplier(false); fetchAll();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to add supplier', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCreatePO = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/supply-chain/purchase-orders', data);
      showToast('Purchase order created'); setShowCreatePO(false); fetchAll();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to create PO', 'error'); }
    finally { setSubmitting(false); }
  };

  const handlePOStatus = async (poId, status) => {
    try {
      await api.put(`/supply-chain/purchase-orders/${poId}/status`, { status });
      showToast(`PO ${status.toLowerCase()}`); setSelectedPO(null); fetchAll();
    } catch (e) { showToast(e.response?.data?.error || 'Status update failed', 'error'); }
  };

  const handleAdjust = async () => {
    setSubmitting(true);
    try {
      await api.post('/supply-chain/stock-movements/adjust', adjustForm);
      showToast('Stock adjusted successfully'); setShowAdjust(false);
      setAdjustForm({ medication_id:'', adjustment:0, reason:'', notes:'' }); fetchAll();
    } catch (e) { showToast(e.response?.data?.error || 'Adjustment failed', 'error'); }
    finally { setSubmitting(false); }
  };

  const s    = stats.po_stats || {};
  const tabs = [
    { key:'dashboard',  label:'Dashboard',       icon: BarChart2  },
    { key:'suppliers',  label:'Suppliers',        icon: Truck      },
    { key:'pos',        label:'Purchase Orders',  icon: ShoppingCart},
    { key:'movements',  label:'Stock Movements',  icon: Package    },
  ];

  const filteredSuppliers = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPOs = pos.filter(p => !search || p.po_number?.toLowerCase().includes(search.toLowerCase()) || p.supplier_name?.toLowerCase().includes(search.toLowerCase()));

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-teal-500" /> Supply Chain
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Suppliers · Purchase orders · Stock movements</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAll} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50"><RefreshCw className="w-4 h-4" /></button>
            {tab === 'suppliers' && <button onClick={() => setShowAddSupplier(true)} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-teal-700"><Plus className="w-4 h-4" /> Add Supplier</button>}
            {tab === 'pos'       && <button onClick={() => setShowCreatePO(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700"><Plus className="w-4 h-4" /> New PO</button>}
            {tab === 'movements' && <button onClick={() => setShowAdjust(true)} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-amber-600"><Plus className="w-4 h-4" /> Adjust Stock</button>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map(({ key, label, icon:Icon }) => (
            <button key={key} onClick={() => { setTab(key); setSearch(''); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all
                ${tab===key ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full animate-spin" style={{ border:'3px solid #e2e8f0', borderTopColor:'#0d9488' }} />
          </div>
        ) : (
          <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="space-y-5 fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total POs"       value={s.total_pos||0}         icon={FileText}      iconBg="bg-blue-50"    iconCl="text-blue-500"    sub={fmt(s.total_value)} />
                <StatCard label="Pending approval" value={s.pending_approval||0}  icon={Clock}         iconBg="bg-amber-50"   iconCl="text-amber-500"   warn={s.pending_approval>0} />
                <StatCard label="Active orders"   value={s.ordered||0}            icon={ShoppingCart}  iconBg="bg-purple-50"  iconCl="text-purple-500" />
                <StatCard label="Suppliers"       value={suppliers.length}         icon={Truck}         iconBg="bg-teal-50"    iconCl="text-teal-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Low stock alerts */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" /> Low stock alerts
                  </h3>
                  {(stats.low_stock||[]).length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">All stock levels healthy</p>
                  ) : (stats.low_stock||[]).map(m => (
                    <div key={m.medication_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{m.generic_name}</p>
                        <p className="text-xs text-slate-400">{m.supplier_name || 'No supplier'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-600">{m.stock_quantity} left</p>
                        <p className="text-xs text-slate-400">reorder at {m.reorder_level}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expiring soon */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Expiring within 60 days
                  </h3>
                  {(stats.expiring_soon||[]).length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No items expiring soon</p>
                  ) : (stats.expiring_soon||[]).map(m => (
                    <div key={m.medication_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{m.generic_name}</p>
                        <p className="text-xs text-slate-400">Qty: {m.stock_quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${m.days_left <= 14 ? 'text-red-600' : 'text-amber-600'}`}>{m.days_left}d</p>
                        <p className="text-xs text-slate-400">{fmtD(m.expiry_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top suppliers */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" /> Top suppliers by spend
                  </h3>
                  {(stats.top_suppliers||[]).map((s, i) => (
                    <div key={s.supplier_id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-300 w-5">{i+1}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.order_count} orders</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-700">{fmt(s.total_spend)}</p>
                    </div>
                  ))}
                  {!(stats.top_suppliers||[]).length && <p className="text-sm text-slate-400 py-4 text-center">No orders yet</p>}
                </div>

                {/* Recent GRNs */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Recent goods received
                  </h3>
                  {(stats.recent_grns||[]).map(g => (
                    <div key={g.grn_number} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{g.grn_number}</p>
                        <p className="text-xs text-slate-400">{g.supplier_name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${g.status==='Complete'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{g.status}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{fmtD(g.received_date)}</p>
                      </div>
                    </div>
                  ))}
                  {!(stats.recent_grns||[]).length && <p className="text-sm text-slate-400 py-4 text-center">No deliveries yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── SUPPLIERS ── */}
          {tab === 'suppliers' && (
            <div className="fade-in space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="Search suppliers…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map(s => (
                  <div key={s.supplier_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-teal-200 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.supplier_type} · {s.payment_terms}</p>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(r => <Star key={r} className={`w-3 h-3 ${r<=s.rating?'text-amber-400':'text-slate-200'}`} />)}
                      </div>
                    </div>
                    {s.contact_person && <p className="text-sm text-slate-600">{s.contact_person}</p>}
                    {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-400">{s.total_orders||0} orders</span>
                      <span className="font-semibold text-slate-600">{fmt(s.total_spend)}</span>
                    </div>
                  </div>
                ))}
                {filteredSuppliers.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No suppliers yet — add your first supplier</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PURCHASE ORDERS ── */}
          {tab === 'pos' && (
            <div className="fade-in space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="Search by PO# or supplier…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 transition-all" />
                </div>
                <select value={poStatus} onChange={e => setPOStatus(e.target.value)}
                  className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer">
                  <option value="">All statuses</option>
                  {Object.keys(PO_STATUS).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['PO Number','Supplier','Date','Items','Total','Status',''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPOs.map(po => (
                      <tr key={po.po_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-teal-600">{po.po_number}</td>
                        <td className="px-4 py-3 text-slate-700">{po.supplier_name}</td>
                        <td className="px-4 py-3 text-slate-500">{fmtD(po.order_date)}</td>
                        <td className="px-4 py-3 text-slate-500">{po.item_count}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{fmt(po.total_amount)}</td>
                        <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedPO(po)} className="text-slate-300 hover:text-teal-500">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPOs.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No purchase orders yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STOCK MOVEMENTS ── */}
          {tab === 'movements' && (
            <div className="fade-in space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Medication','Type','Qty','Before','After','Ref','Date','By'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(m => {
                      const isIn = ['Purchase','Return','Adjustment'].includes(m.movement_type) && m.quantity_after >= m.quantity_before;
                      return (
                        <tr key={m.movement_id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-700">{m.generic_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isIn?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td className={`px-4 py-3 font-bold ${isIn?'text-emerald-600':'text-red-600'}`}>{isIn?'+':'-'}{m.quantity}</td>
                          <td className="px-4 py-3 text-slate-400">{m.quantity_before}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{m.quantity_after}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{m.reference_type}{m.reference_id?` #${m.reference_id}`:''}</td>
                          <td className="px-4 py-3 text-slate-400">{fmtD(m.created_at?.split('T')[0])}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{m.created_by_name||'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {movements.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No stock movements yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* PO detail modal */}
      <Modal isOpen={!!selectedPO} title={selectedPO?.po_number || ''} onClose={() => setSelectedPO(null)} size="medium">
        {selectedPO && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={selectedPO.status} />
              <p className="text-sm text-slate-500">{fmtD(selectedPO.order_date)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm">
              <p><span className="text-slate-400">Supplier:</span> <span className="font-semibold">{selectedPO.supplier_name}</span></p>
              <p><span className="text-slate-400">Total:</span> <span className="font-bold">{fmt(selectedPO.total_amount)}</span></p>
              {selectedPO.expected_date && <p><span className="text-slate-400">Expected:</span> {fmtD(selectedPO.expected_date)}</p>}
              {selectedPO.approved_by_name && <p><span className="text-slate-400">Approved by:</span> {selectedPO.approved_by_name}</p>}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Update status</p>
              <div className="flex flex-wrap gap-2">
                {selectedPO.status === 'Draft'     && <button onClick={() => handlePOStatus(selectedPO.po_id,'Submitted')} className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200">Submit for Approval</button>}
                {selectedPO.status === 'Submitted' && <button onClick={() => handlePOStatus(selectedPO.po_id,'Approved')} className="px-4 py-2 text-sm font-semibold bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200">Approve</button>}
                {selectedPO.status === 'Approved'  && <button onClick={() => handlePOStatus(selectedPO.po_id,'Ordered')} className="px-4 py-2 text-sm font-semibold bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200">Mark as Ordered</button>}
                {!['Received','Cancelled'].includes(selectedPO.status) && <button onClick={() => handlePOStatus(selectedPO.po_id,'Cancelled')} className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-xl hover:bg-red-200">Cancel PO</button>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add supplier */}
      <Modal isOpen={showAddSupplier} title="Add Supplier" onClose={() => setShowAddSupplier(false)} size="medium">
        <SupplierForm onSubmit={handleAddSupplier} onCancel={() => setShowAddSupplier(false)} isLoading={submitting} />
      </Modal>

      {/* Create PO */}
      <Modal isOpen={showCreatePO} title="New Purchase Order" onClose={() => setShowCreatePO(false)} size="large">
        <POForm suppliers={suppliers} medications={medications} onSubmit={handleCreatePO} onCancel={() => setShowCreatePO(false)} isLoading={submitting} />
      </Modal>

      {/* Adjust stock */}
      <Modal isOpen={showAdjust} title="Manual Stock Adjustment" onClose={() => setShowAdjust(false)} size="small">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Medication *</label>
            <select value={adjustForm.medication_id} onChange={e => setAdjustForm(f => ({...f,medication_id:e.target.value}))} className={sel}>
              <option value="">Select medication…</option>
              {medications.map(m => <option key={m.medication_id} value={m.medication_id}>{m.generic_name}{m.brand_name?' ('+m.brand_name+')':''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Adjustment quantity *</label>
            <input type="number" value={adjustForm.adjustment} onChange={e => setAdjustForm(f => ({...f,adjustment:parseInt(e.target.value)||0}))}
              className={inp} placeholder="Positive to add, negative to reduce" />
            <p className="text-xs text-slate-400 mt-1">Use positive numbers to add stock, negative to deduct.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reason</label>
            <select value={adjustForm.reason} onChange={e => setAdjustForm(f => ({...f,reason:e.target.value}))} className={sel}>
              <option value="">Select reason…</option>
              {['Stock count correction','Damaged goods','Expired removal','Found stock','Data entry error','Other'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={adjustForm.notes} onChange={e => setAdjustForm(f => ({...f,notes:e.target.value}))} rows={2} className={ta} placeholder="Details…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdjust(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button onClick={handleAdjust} disabled={submitting || !adjustForm.medication_id || adjustForm.adjustment === 0}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader className="w-4 h-4 animate-spin" />} Apply Adjustment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}