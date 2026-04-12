import React, { useState } from 'react';
import { Edit2, Trash2, Download, ChevronDown, ChevronUp, AlertTriangle, Activity, Stethoscope, CalendarCheck, MessageSquare, Search, Loader } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' }) : '—';

const STATUS = {
  Draft:     'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Signed:    'bg-blue-100 text-blue-700',
  Reviewed:  'bg-violet-100 text-violet-700',
};

const Section = ({ icon: Icon, title, color, bg, id, expanded, onToggle, children }) => (
  <div className={`rounded-2xl border overflow-hidden ${bg}`}>
    <button onClick={() => onToggle(id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:opacity-90 transition-opacity">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{title}</span>
      </div>
      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
    </button>
    {expanded && <div className="px-5 pb-5 space-y-3 bg-white/60">{children}</div>}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-40 flex-shrink-0">{label}</span>
    <span className="text-sm text-slate-800 text-right flex-1">{value || <span className="text-slate-300 italic">Not recorded</span>}</span>
  </div>
);

const ConsultationNotes = ({ consultation = null, isLoading = false, onEdit, onDelete, canEdit = true }) => {
  const [expanded, setExpanded] = useState({ complaint:true, history:true, vitals:true, exam:false, diagnosis:true, followup:true });
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // ── PDF download state ───────────────────────────────────────────────────────
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError,   setPdfError]   = useState('');

  const handleDownloadPDF = async () => {
    if (pdfLoading) return;
    setPdfError('');
    setPdfLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'https://clinicore-backend-71qa.onrender.com';
      const response = await fetch(
        `${baseUrl}/api/v1/pdf/consultation/${consultation.consultation_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${response.status}`);
      }
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Consultation-${consultation.consultation_id}-${consultation.last_name || 'Record'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
      setPdfError(err.message || 'Failed to generate PDF');
      setTimeout(() => setPdfError(''), 5000);
    } finally {
      setPdfLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} /></div>;
  if (!consultation) return <div className="text-center py-12 text-slate-400">No consultation data available</div>;

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight">{consultation.first_name} {consultation.last_name}</h2>
            <p className="text-teal-200 text-sm mt-0.5">Consultation — {fmtDate(consultation.consultation_date)}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS[consultation.status] || STATUS.Draft}`}>
            {consultation.status}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/20">
          {[['Patient ID', `#${consultation.patient_id}`], ['Phone', consultation.phone], ['Blood Type', consultation.blood_type || 'Unknown'], ['Allergies', consultation.allergies || 'None']].map(([l,v]) => (
            <div key={l}>
              <p className="text-teal-300 text-xs uppercase tracking-wide">{l}</p>
              <p className={`text-sm font-bold mt-0.5 ${l === 'Allergies' && consultation.allergies ? 'text-red-300' : 'text-white'}`}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={() => onEdit(consultation.consultation_id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-sm">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(consultation.consultation_id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-all shadow-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {pdfLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {pdfLoading ? 'Generating…' : 'PDF'}
            </button>
          </div>
          {pdfError && (
            <p className="text-xs text-red-500">{pdfError}</p>
          )}
        </div>
      )}

      <Section icon={MessageSquare} title="Chief Complaint & History" color="text-blue-600" bg="bg-blue-50 border-blue-100" id="complaint" expanded={expanded.complaint} onToggle={toggle}>
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Chief Complaint</p>
            <p className="text-sm text-slate-800">{consultation.chief_complaint}</p>
          </div>
          <Row label="HPI" value={consultation.history_of_present_illness} />
          <Row label="Past Medical History" value={consultation.past_medical_history} />
          <Row label="Current Medications" value={consultation.medications} />
          {consultation.allergies && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700">Allergies: {consultation.allergies}</p>
            </div>
          )}
        </div>
      </Section>

      <Section icon={Activity} title="Vital Signs" color="text-emerald-600" bg="bg-emerald-50 border-emerald-100" id="vitals" expanded={expanded.vitals} onToggle={toggle}>
        <div className="grid grid-cols-2 gap-3">
          {[['Blood Pressure', consultation.vital_signs_bp ? `${consultation.vital_signs_bp} mmHg` : null],
            ['Temperature',   consultation.vital_signs_temp ? `${consultation.vital_signs_temp}°C` : null],
            ['Pulse',         consultation.vital_signs_pulse ? `${consultation.vital_signs_pulse} bpm` : null],
            ['Respiration',   consultation.vital_signs_respiration ? `${consultation.vital_signs_respiration}/min` : null]
          ].map(([l,v]) => (
            <div key={l} className="bg-white rounded-xl p-3 border border-emerald-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{l}</p>
              <p className={`text-lg font-black mt-0.5 ${v ? 'text-slate-800' : 'text-slate-300'}`}>{v || '—'}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Search} title="Physical Examination" color="text-amber-600" bg="bg-amber-50 border-amber-100" id="exam" expanded={expanded.exam} onToggle={toggle}>
        <p className="text-sm text-slate-700 leading-relaxed">{consultation.physical_examination || <span className="text-slate-300 italic">Not recorded</span>}</p>
      </Section>

      <Section icon={Stethoscope} title="Diagnosis & Treatment" color="text-rose-600" bg="bg-rose-50 border-rose-100" id="diagnosis" expanded={expanded.diagnosis} onToggle={toggle}>
        <div className="bg-white rounded-xl p-4 border border-rose-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Primary Diagnosis</p>
          <p className="text-xl font-black text-rose-700">{consultation.diagnosis}</p>
          {consultation.diagnosis_icd && <p className="text-xs text-slate-400 mt-1">ICD: {consultation.diagnosis_icd}</p>}
        </div>
        <Row label="Treatment Plan" value={consultation.treatment_plan} />
        {consultation.medications_prescribed && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Medications Prescribed</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{consultation.medications_prescribed}</p>
          </div>
        )}
        {consultation.procedures && <Row label="Procedures" value={consultation.procedures} />}
      </Section>

      <Section icon={CalendarCheck} title="Follow-up & Referral" color="text-violet-600" bg="bg-violet-50 border-violet-100" id="followup" expanded={expanded.followup} onToggle={toggle}>
        {consultation.follow_up_date && <Row label="Follow-up Date" value={fmtDate(consultation.follow_up_date)} />}
        {consultation.follow_up_notes && <Row label="Instructions" value={consultation.follow_up_notes} />}
        {consultation.referral_needed === 1 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-orange-700">Referral needed — {consultation.referral_to || 'Specialist not specified'}</p>
          </div>
        )}
      </Section>

      {consultation.notes && (
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Notes</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{consultation.notes}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center pb-2">
        Created: {fmtDate(consultation.created_at)} · Updated: {fmtDate(consultation.updated_at)}
      </p>
    </div>
  );
};

export default ConsultationNotes;