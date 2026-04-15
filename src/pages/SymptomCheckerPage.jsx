// ============================================
// SymptomCheckerPage.jsx
// File: frontend-web/src/pages/SymptomCheckerPage.jsx
//
// AI symptom triage powered by Claude via CliniCore backend.
// Available to: patients (via portal) + doctors/nurses (quick pre-triage)
//
// Backend endpoint: POST /api/v1/symptom-checker/assess
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, AlertTriangle, AlertOctagon, CheckCircle,
  Clock, ChevronRight, RotateCcw, BookOpen, Heart, Stethoscope, Shield, ArrowRight, MessageCircle,
} from 'lucide-react';
import api from '../services/api.js';

// ── Urgency config ────────────────────────────────────────────────────────────
const URGENCY = {
  emergency: {
    icon:      AlertOctagon,
    label:     'Go to Emergency Now',
    bg:        'bg-red-50',
    border:    'border-red-200',
    text:      'text-red-700',
    badge:     'bg-red-600 text-white',
    bar:       'bg-red-500',
    iconColor: 'text-red-500',
    pulse:     true,
  },
  urgent: {
    icon:      AlertTriangle,
    label:     'See a Doctor Today',
    bg:        'bg-orange-50',
    border:    'border-orange-200',
    text:      'text-orange-700',
    badge:     'bg-orange-500 text-white',
    bar:       'bg-orange-400',
    iconColor: 'text-orange-500',
    pulse:     false,
  },
  soon: {
    icon:      Clock,
    label:     'See a Doctor This Week',
    bg:        'bg-amber-50',
    border:    'border-amber-200',
    text:      'text-amber-700',
    badge:     'bg-amber-500 text-white',
    bar:       'bg-amber-400',
    iconColor: 'text-amber-500',
    pulse:     false,
  },
  routine: {
    icon:      Stethoscope,
    label:     'Book a Routine Appointment',
    bg:        'bg-blue-50',
    border:    'border-blue-200',
    text:      'text-blue-700',
    badge:     'bg-blue-500 text-white',
    bar:       'bg-blue-400',
    iconColor: 'text-blue-500',
    pulse:     false,
  },
  self_care: {
    icon:      CheckCircle,
    label:     'Home Care Recommended',
    bg:        'bg-emerald-50',
    border:    'border-emerald-200',
    text:      'text-emerald-700',
    badge:     'bg-emerald-500 text-white',
    bar:       'bg-emerald-400',
    iconColor: 'text-emerald-500',
    pulse:     false,
  },
};

// ── Common symptoms quick-select ──────────────────────────────────────────────
const COMMON_SYMPTOMS = [
  { label: 'Fever',          emoji: '🌡️' },
  { label: 'Headache',       emoji: '🤕' },
  { label: 'Cough',          emoji: '😮‍💨' },
  { label: 'Chest pain',     emoji: '💔' },
  { label: 'Abdominal pain', emoji: '😣' },
  { label: 'Vomiting',       emoji: '🤢' },
  { label: 'Diarrhoea',      emoji: '😰' },
  { label: 'Fatigue',        emoji: '😴' },
  { label: 'Shortness of breath', emoji: '😮' },
  { label: 'Joint pain',     emoji: '🦵' },
  { label: 'Rash',           emoji: '🔴' },
  { label: 'Dizziness',      emoji: '💫' },
];

// ── Shared input style ────────────────────────────────────────────────────────
const inp = `w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all`;

const sel = `${inp} appearance-none cursor-pointer`;

// ── Assessment result card ────────────────────────────────────────────────────
const ResultCard = ({ assessment, onReset, onBookAppointment }) => {
  const cfg = URGENCY[assessment.urgency] || URGENCY.routine;
  const Icon = cfg.icon;

  return (
    <div className="space-y-4 fade-in">
      {/* Urgency banner */}
      <div className={`${cfg.bg} ${cfg.border} border-2 rounded-2xl p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
            <Icon className={`w-6 h-6 ${cfg.iconColor} ${cfg.pulse ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
            <p className={`mt-2 text-sm font-medium leading-relaxed ${cfg.text}`}>
              {assessment.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Possible conditions */}
      {assessment.possible_conditions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Possible conditions
          </h3>
          <div className="flex flex-wrap gap-2">
            {assessment.possible_conditions.map((c, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warning signs */}
      {assessment.warning_signs?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Seek emergency care immediately if you notice
          </h3>
          <ul className="space-y-1.5">
            {assessment.warning_signs.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended actions + self-care */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessment.recommended_actions?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5" /> What to do
            </h3>
            <ul className="space-y-2">
              {assessment.recommended_actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {assessment.self_care_tips?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> Self-care tips
            </h3>
            <ul className="space-y-2">
              {assessment.self_care_tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Questions for doctor */}
      {assessment.questions_for_doctor?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5" /> Ask your doctor
          </h3>
          <ul className="space-y-1.5">
            {assessment.questions_for_doctor.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                <span className="text-blue-400 mt-0.5">→</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-xs text-slate-400 leading-relaxed flex gap-2">
          <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-300" />
          {assessment.disclaimer || 'This assessment is for informational purposes only and does not replace professional medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.'}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button onClick={onBookAppointment}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all">
          <Stethoscope className="w-4 h-4" /> Book Appointment
        </button>
        <button onClick={onReset}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all">
          <RotateCcw className="w-4 h-4" /> Check other symptoms
        </button>
      </div>
    </div>
  );
};

// ── Thinking animation ────────────────────────────────────────────────────────
const ThinkingState = () => {
  const steps = [
    'Analysing your symptoms…',
    'Checking for warning signs…',
    'Assessing urgency level…',
    'Preparing recommendations…',
  ];
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStepIdx(i => Math.min(i + 1, steps.length - 1)), 1400);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
        <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-6 h-6 text-teal-500" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-600 transition-all">
        {steps[stepIdx]}
      </p>
      <div className="flex gap-1.5 mt-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= stepIdx ? 'w-6 bg-teal-500' : 'w-1.5 bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SymptomCheckerPage() {
  const [step, setStep]         = useState('form');  // form | loading | result
  const [assessment, setAssessment] = useState(null);
  const [error, setError]       = useState('');
  const [selectedTags, setTags] = useState([]);
  const [form, setForm]         = useState({
    symptoms: '', duration: '', severity: '',
    age: '', gender: '', existing_conditions: '', current_medications: '',
  });
  const textareaRef = useRef(null);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleTag = (label) => {
    setTags(t => {
      const next = t.includes(label) ? t.filter(x => x !== label) : [...t, label];
      // Sync tags into symptoms textarea
      const tagText = next.join(', ');
      const rest = form.symptoms.replace(/^[^.!?]*?(,\s*)?/, '').trim();
      setForm(f => ({ ...f, symptoms: tagText + (rest ? '. ' + rest : '') }));
      return next;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.symptoms.trim()) {
      setError('Please describe your symptoms or select from the common ones below.');
      return;
    }
    setError('');
    setStep('loading');

    try {
      const res = await api.post('/symptom-checker/assess', form);
      setAssessment(res.data.assessment);
      setStep('result');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setStep('form');
    }
  };

  const handleReset = () => {
    setStep('form');
    setAssessment(null);
    setError('');
    setTags([]);
    setForm({ symptoms: '', duration: '', severity: '', age: '', gender: '', existing_conditions: '', current_medications: '' });
  };

  const handleBookAppointment = () => {
    window.location.href = '/appointments/new';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      <style>{`
        .fade-in { animation: fadeIn .4s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .tag-btn { transition: all .15s ease; }
        .tag-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 leading-none">AI Symptom Checker</h1>
            <p className="text-xs text-slate-400 mt-0.5">Powered by Claude — for guidance only, not diagnosis</p>
          </div>
          {step === 'result' && (
            <button onClick={handleReset} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {step === 'loading' && <ThinkingState />}

        {step === 'result' && assessment && (
          <ResultCard
            assessment={assessment}
            onReset={handleReset}
            onBookAppointment={handleBookAppointment}
          />
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-5 fade-in">

            {/* Quick select symptoms */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Quick select symptoms
              </p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map(({ label, emoji }) => (
                  <button key={label} type="button"
                    onClick={() => toggleTag(label)}
                    className={`tag-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all
                      ${selectedTags.includes(label)
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}>
                    <span className="text-base leading-none">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptom description */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Describe your symptoms *
              </label>
              <textarea
                ref={textareaRef}
                name="symptoms"
                value={form.symptoms}
                onChange={set}
                rows={4}
                placeholder="e.g. I have had a fever of 39°C since yesterday morning, with severe headache and body aches. I feel very weak and have no appetite…"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5">Be as specific as possible — when did it start, how bad is it, anything that makes it better or worse?</p>
            </div>

            {/* Duration + Severity */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">More details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Duration</label>
                  <select name="duration" value={form.duration} onChange={set} className={sel}>
                    <option value="">Select…</option>
                    <option>Less than 24 hours</option>
                    <option>1–2 days</option>
                    <option>3–7 days</option>
                    <option>1–2 weeks</option>
                    <option>More than 2 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Severity (1–10)</label>
                  <select name="severity" value={form.severity} onChange={set} className={sel}>
                    <option value="">Select…</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>
                        {n} — {n <= 3 ? 'Mild' : n <= 6 ? 'Moderate' : n <= 8 ? 'Severe' : 'Very severe'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Age</label>
                  <select name="age" value={form.age} onChange={set} className={sel}>
                    <option value="">Select…</option>
                    <option>Under 1 year</option>
                    <option>1–5 years</option>
                    <option>6–12 years</option>
                    <option>13–17 years</option>
                    <option>18–30 years</option>
                    <option>31–45 years</option>
                    <option>46–60 years</option>
                    <option>Over 60 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Gender</label>
                  <select name="gender" value={form.gender} onChange={set} className={sel}>
                    <option value="">Prefer not to say</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical background (collapsible) */}
            <details className="bg-white rounded-2xl border border-slate-100 shadow-sm group">
              <summary className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer list-none flex items-center justify-between select-none">
                Medical background (optional — improves accuracy)
                <ChevronRight className="w-4 h-4 text-slate-300 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Existing medical conditions</label>
                  <input name="existing_conditions" value={form.existing_conditions} onChange={set}
                    className={inp} placeholder="e.g. Diabetes, Hypertension, Sickle cell disease, Asthma" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current medications</label>
                  <input name="current_medications" value={form.current_medications} onChange={set}
                    className={inp} placeholder="e.g. Metformin, Amlodipine, Aspirin" />
                </div>
              </div>
            </details>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Emergency note */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
              <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">
                <strong>Emergency?</strong> If you are experiencing chest pain, difficulty breathing, unconsciousness, heavy bleeding, or a stroke — call emergency services or go to your nearest hospital immediately. Do not wait for this assessment.
              </p>
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
              <Activity className="w-4 h-4" />
              Assess My Symptoms
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-400">
              Your information is private and only visible to your care team.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}