// ============================================
// PatientTimelinePage.jsx
// File: frontend-web/src/pages/PatientTimelinePage.jsx
//
// Doctor's full patient history view.
// Shows all visits, vitals, consultations,
// lab results, prescriptions in one timeline.
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Activity, FileText, TestTube, Image,
  CreditCard, ArrowLeft, Clock,
  Stethoscope, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import api from '../services/api.js';

// ── Record type config ────────────────────────────────────────────────────────
const RECORD_CONFIG = {
  visit:        { icon: Clock,       color: 'bg-slate-100 text-slate-700',   label: 'Visit' },
  vitals:       { icon: Activity,    color: 'bg-blue-100 text-blue-700',     label: 'Vitals' },
  consultation: { icon: Stethoscope, color: 'bg-purple-100 text-purple-700', label: 'Consultation' },
  lab_order:    { icon: TestTube,    color: 'bg-amber-100 text-amber-700',   label: 'Lab Order' },
  lab_result:   { icon: TestTube,    color: 'bg-green-100 text-green-700',   label: 'Lab Result' },
  imaging:      { icon: Image,       color: 'bg-pink-100 text-pink-700',     label: 'Imaging' },
  invoice:      { icon: CreditCard,  color: 'bg-teal-100 text-teal-700',     label: 'Invoice' },
};

// ── Timeline item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ record }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = RECORD_CONFIG[record.record_type] || RECORD_CONFIG.visit;
  const Icon = cfg.icon;
  const date = new Date(record.event_date);

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4"/>
        </div>
        <div className="w-0.5 bg-slate-200 flex-1 mt-2"/>
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {record.sub_category && (
                    <span className="text-xs text-slate-400">{record.sub_category}</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {record.title || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-600">
                  {date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400">
                  {date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
            </div>
          </button>

          {expanded && record.detail && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{record.detail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Vitals summary card ───────────────────────────────────────────────────────
const VitalsSummary = ({ vitals }) => {
  if (!vitals?.length) return null;
  const latest = vitals[0];
  const items = [
    { label: 'BP',     value: latest.blood_pressure_sys ? `${latest.blood_pressure_sys}/${latest.blood_pressure_dia} mmHg` : null },
    { label: 'Temp',   value: latest.temperature  ? `${latest.temperature}°C` : null },
    { label: 'Pulse',  value: latest.pulse_rate   ? `${latest.pulse_rate} bpm` : null },
    { label: 'SpO₂',   value: latest.oxygen_saturation ? `${latest.oxygen_saturation}%` : null },
    { label: 'Weight', value: latest.weight       ? `${latest.weight} kg` : null },
    { label: 'BMI',    value: latest.bmi          ? `${latest.bmi}` : null },
  ].filter(i => i.value);

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Latest Vitals</p>
      <div className="grid grid-cols-3 gap-3">
        {items.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-blue-500 font-semibold">{label}</p>
            <p className="text-sm font-black text-blue-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PatientTimelinePage() {
  const { id } = useParams();
  const { showToast, Toast } = useToast();
  const [patient,  setPatient]  = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [vitals,   setVitals]   = useState([]);
  const [summary,  setSummary]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const [timeRes, vitRes] = await Promise.all([
        api.get(`/visits/timeline/${id}`),
        api.get(`/vitals/patient/${id}`, { params: { limit: 10 } }),
      ]);
      setPatient(timeRes.data.patient);
      setTimeline(timeRes.data.timeline || []);
      setSummary(timeRes.data.summary  || {});
      setVitals(vitRes.data.vitals || []);
    } catch (err) {
      showToast('Failed to load patient timeline', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => { fetchTimeline(); }, [fetchTimeline]);

  const filtered = typeFilter
    ? timeline.filter(r => r.record_type === typeFilter)
    : timeline;

  const typeFilters = [
    { key: '',            label: 'All' },
    { key: 'visit',       label: 'Visits' },
    { key: 'vitals',      label: 'Vitals' },
    { key: 'consultation',label: 'Consultations' },
    { key: 'lab_result',  label: 'Lab Results' },
    { key: 'imaging',     label: 'Imaging' },
    { key: 'invoice',     label: 'Finance' },
  ];

  const age = patient?.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-500"/>
          </button>
          {patient && (
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-black text-lg">
                  {patient.first_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  {patient.first_name} {patient.last_name}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  {age && <span className="text-xs text-slate-400">{age}y</span>}
                  {patient.gender && <span className="text-xs text-slate-400">{patient.gender}</span>}
                  {patient.blood_type && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                      {patient.blood_type}
                    </span>
                  )}
                  {patient.allergies && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                      ⚠️ {patient.allergies}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Summary counts */}
          <div className="flex gap-3">
            {Object.entries(summary).map(([type, count]) => {
              const cfg = RECORD_CONFIG[type];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <div key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.color}`}>
                  <Icon className="w-3 h-3"/>
                  {count}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 max-w-4xl mx-auto">
        {/* Latest vitals */}
        <VitalsSummary vitals={vitals}/>

        {/* Type filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {typeFilters.map(({ key, label }) => (
            <button key={key} onClick={() => setTypeFilter(key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all
                ${typeFilter === key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {label}
              {key && summary[key] ? ` (${summary[key]})` : ''}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-sm">No records found</p>
          </div>
        ) : (
          <div>
            {filtered.map((record, i) => (
              <TimelineItem key={`${record.record_type}-${record.record_id}-${i}`} record={record}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}