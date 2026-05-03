// ============================================
// PharmacyWorkflowPage.jsx
// File: frontend-web/src/pages/PharmacyWorkflowPage.jsx
// Route: /pharmacy/workflow
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { Pill, RefreshCw, CheckCircle2, Loader, Package } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import api from '../services/api.js';

export default function PharmacyWorkflowPage() {
  const { showToast, Toast } = useToast();
  const [consultations, setConsultations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [dispensing,    setDispensing]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [notes,         setNotes]         = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch consultations with prescriptions not yet dispensed
      const res = await api.get('/consultations', {
        params: { status: 'Completed', has_prescription: true, limit: 50 }
      });
      setConsultations(res.data.consultations || []);
    } catch (err) {
      showToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleDispense = async (consultation) => {
    setSaving(true);
    try {
      // Create pharmacy dispense record + update visit status
      await api.post('/pharmacy/dispense', {
        consultation_id:  consultation.consultation_id,
        patient_id:       consultation.patient_id,
        visit_id:         consultation.visit_id,
        medications:      consultation.medications_prescribed,
        dispensed_by:     'current_user',
        notes,
      });
      if (consultation.visit_id) {
        await api.put(`/visits/${consultation.visit_id}/status`, {
          status: 'Discharged',
          discharge_type: 'Home',
          notes: 'Medications dispensed',
        }).catch(() => {});
      }
      showToast(`Medications dispensed for ${consultation.patient_name || 'patient'}`);
      setDispensing(null);
      setNotes('');
      await fetchPending();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to dispense', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
    focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast/>
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Pharmacy Dispensing</h1>
              <p className="text-sm text-slate-400">{consultations.length} prescriptions awaiting dispensing</p>
            </div>
          </div>
          <button onClick={fetchPending}
            className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`}/>
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }}/>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm font-medium">No prescriptions pending dispensing</p>
          </div>
        ) : consultations.map(c => (
          <div key={c.consultation_id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-black text-teal-700">
                    {(c.first_name?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {c.first_name} {c.last_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {c.diagnosis} · {new Date(c.consultation_date).toLocaleDateString('en-NG')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full">
                Awaiting Dispensing
              </span>
            </div>

            {/* Prescription */}
            <div className="px-5 py-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Prescribed Medications
              </p>
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 whitespace-pre-line font-mono">
                {c.medications_prescribed || 'No medications prescribed'}
              </div>

              {c.medications_prescribed && (
                <div className="mt-3">
                  {dispensing?.consultation_id === c.consultation_id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Dispensing Notes
                        </label>
                        <textarea value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={2} className={`${inp} resize-none`}
                          placeholder="Substitutions made, counselling given, quantity dispensed…"/>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setDispensing(null); setNotes(''); }}
                          className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                          Cancel
                        </button>
                        <button onClick={() => handleDispense(c)} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50">
                          {saving ? <Loader className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                          {saving ? 'Dispensing…' : 'Confirm Dispensed'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setDispensing(c)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all">
                      <Pill className="w-4 h-4"/> Dispense Medications
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}