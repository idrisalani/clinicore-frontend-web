// ============================================
// LabWorkflowPage.jsx
// File: frontend-web/src/pages/LabWorkflowPage.jsx
// Route: /lab/workflow
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { TestTube, RefreshCw, Upload, CheckCircle2, Loader, Clock } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import api from '../services/api.js';

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const PRIORITY_COLOR = {
  STAT:    'bg-red-100 text-red-700',
  Urgent:  'bg-amber-100 text-amber-700',
  Routine: 'bg-slate-100 text-slate-600',
};

export default function LabWorkflowPage() {
  const { showToast, Toast } = useToast();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);  // order being processed
  const [result,   setResult]   = useState({ result_value: '', result_units: '', reference_range: '', status: 'Completed', notes: '' });
  const [saving,   setSaving]   = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/lab/orders', { params: { status: 'Pending', limit: 50 } });
      setOrders(res.data.orders || res.data.lab_orders || []);
    } catch (err) {
      showToast('Failed to load lab orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUploadResult = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.post('/lab/results', {
        lab_order_id:    selected.lab_order_id,
        result_value:    result.result_value,
        result_units:    result.result_units,
        reference_range: result.reference_range,
        status:          'Final',
        notes:           result.notes,
        result_date:     new Date().toISOString().split('T')[0],
      });
      // Update order status
      await api.put(`/lab/orders/${selected.lab_order_id}`, { status: 'Completed' });
      // Update visit status back to With Doctor
      if (selected.visit_id) {
        await api.put(`/visits/${selected.visit_id}/status`, {
          status: 'With Doctor',
          notes: `Lab result uploaded: ${selected.test_name}`,
        }).catch(() => {});
      }
      showToast(`Result uploaded for ${selected.test_name}`);
      setSelected(null);
      setResult({ result_value: '', result_units: '', reference_range: '', notes: '' });
      await fetchOrders();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to upload result', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast/>
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Lab Workflow</h1>
              <p className="text-sm text-slate-400">{orders.length} pending orders</p>
            </div>
          </div>
          <button onClick={fetchOrders}
            className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`}/>
          </button>
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-2 gap-6">
        {/* Order list */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pending Orders</h2>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid #e2e8f0', borderTopColor: '#f59e0b' }}/>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <TestTube className="w-8 h-8 mx-auto mb-2 opacity-30"/>
              <p className="text-sm">No pending lab orders</p>
            </div>
          ) : orders.map(order => (
            <button key={order.lab_order_id} type="button"
              onClick={() => { setSelected(order); setResult({ result_value:'', result_units:'', reference_range:'', notes:'' }); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all
                ${selected?.lab_order_id === order.lab_order_id
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-bold text-slate-800">{order.test_name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[order.priority] || PRIORITY_COLOR.Routine}`}>
                  {order.priority}
                </span>
              </div>
              <p className="text-xs text-slate-500">{order.first_name} {order.last_name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-slate-400"/>
                <span className="text-xs text-slate-400">
                  {new Date(order.ordered_date).toLocaleDateString('en-NG')}
                </span>
                {order.clinical_notes && (
                  <span className="text-xs text-slate-400 truncate">· {order.clinical_notes}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Result entry */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Upload Result</h2>
          {!selected ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Select an order to upload results</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUploadResult}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{selected.test_name}</p>
                  <p className="text-xs text-slate-400">{selected.first_name} {selected.last_name}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[selected.priority]}`}>
                  {selected.priority}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Result Value *
                </label>
                <textarea value={result.result_value}
                  onChange={e => setResult(r => ({ ...r, result_value: e.target.value }))}
                  rows={3} required className={`${inp} resize-none`}
                  placeholder="Enter result value or findings…"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Units</label>
                  <input value={result.result_units}
                    onChange={e => setResult(r => ({ ...r, result_units: e.target.value }))}
                    className={inp} placeholder="e.g. g/dL, mmol/L" autoComplete="off"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Reference Range</label>
                  <input value={result.reference_range}
                    onChange={e => setResult(r => ({ ...r, reference_range: e.target.value }))}
                    className={inp} placeholder="e.g. 11.5–16.0" autoComplete="off"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Interpretation / Notes
                </label>
                <textarea value={result.notes}
                  onChange={e => setResult(r => ({ ...r, notes: e.target.value }))}
                  rows={2} className={`${inp} resize-none`}
                  placeholder="Normal / Abnormal — interpretation notes"/>
              </div>

              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold
                  text-white bg-amber-500 hover:bg-amber-600 rounded-xl disabled:opacity-50 shadow-sm">
                {saving ? <Loader className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                {saving ? 'Uploading…' : 'Upload Result & Notify Doctor'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}