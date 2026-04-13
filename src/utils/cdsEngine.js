// ============================================
// cdsEngine.js — Clinical Decision Support Engine
// File: frontend-web/src/utils/cdsEngine.js
//
// Runs entirely on the frontend — no API calls.
// Three check types:
//   1. Allergy alerts  — drug vs patient's known allergies
//   2. Drug interactions — common dangerous combinations
//   3. Vital sign flags — abnormal readings
// ============================================

// ── Allergy cross-reference ───────────────────────────────────────────────────
// Maps allergy keywords → drugs that should trigger an alert
const ALLERGY_DRUG_MAP = {
  penicillin:     ['amoxicillin', 'ampicillin', 'flucloxacillin', 'co-amoxiclav', 'augmentin', 'piperacillin'],
  amoxicillin:    ['amoxicillin', 'co-amoxiclav', 'augmentin'],
  sulfa:          ['cotrimoxazole', 'trimethoprim', 'sulfamethoxazole', 'septrin'],
  sulfonamide:    ['cotrimoxazole', 'trimethoprim', 'sulfamethoxazole', 'septrin'],
  aspirin:        ['aspirin', 'asa', 'acetylsalicylic'],
  nsaid:          ['ibuprofen', 'diclofenac', 'naproxen', 'meloxicam', 'piroxicam', 'indomethacin', 'ketorolac', 'aspirin'],
  ibuprofen:      ['ibuprofen', 'brufen', 'advil'],
  diclofenac:     ['diclofenac', 'voltaren', 'cataflam'],
  codeine:        ['codeine', 'co-codamol', 'tramadol'],
  morphine:       ['morphine', 'oxycodone', 'fentanyl', 'pethidine', 'tramadol'],
  opioid:         ['morphine', 'codeine', 'tramadol', 'oxycodone', 'fentanyl', 'pethidine', 'hydrocodone'],
  metronidazole:  ['metronidazole', 'flagyl'],
  ciprofloxacin:  ['ciprofloxacin', 'ciproxin', 'levofloxacin', 'ofloxacin'],
  quinolone:      ['ciprofloxacin', 'levofloxacin', 'ofloxacin', 'moxifloxacin', 'norfloxacin'],
  tetracycline:   ['tetracycline', 'doxycycline', 'minocycline'],
  erythromycin:   ['erythromycin', 'azithromycin', 'clarithromycin'],
  macrolide:      ['erythromycin', 'azithromycin', 'clarithromycin', 'roxithromycin'],
  cephalosporin:  ['cephalexin', 'cefuroxime', 'ceftriaxone', 'cefixime', 'cefazolin'],
  vancomycin:     ['vancomycin'],
  chloroquine:    ['chloroquine', 'hydroxychloroquine'],
  artemether:     ['artemether', 'coartem', 'lumefantrine'],
  amlodipine:     ['amlodipine', 'norvasc'],
  lisinopril:     ['lisinopril', 'enalapril', 'ramipril', 'perindopril'],
  ace:            ['lisinopril', 'enalapril', 'ramipril', 'perindopril', 'captopril'],
  metformin:      ['metformin', 'glucophage'],
  statins:        ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin'],
};

// ── Drug interaction database ─────────────────────────────────────────────────
// [drugA, drugB, severity, message]
const INTERACTIONS = [
  // Anticoagulant interactions
  ['warfarin',      'aspirin',        'danger', 'Warfarin + Aspirin: major bleeding risk. Avoid combination.'],
  ['warfarin',      'ibuprofen',      'danger', 'Warfarin + NSAIDs: significantly increased bleeding risk.'],
  ['warfarin',      'diclofenac',     'danger', 'Warfarin + Diclofenac: major bleeding risk.'],
  ['warfarin',      'ciprofloxacin',  'warning','Ciprofloxacin may increase warfarin effect. Monitor INR closely.'],
  ['warfarin',      'metronidazole',  'danger', 'Metronidazole markedly increases warfarin effect. Monitor closely.'],
  ['warfarin',      'clarithromycin', 'danger', 'Clarithromycin increases warfarin — high bleeding risk.'],
  // NSAID combinations
  ['ibuprofen',     'diclofenac',     'danger', 'Two NSAIDs together: increased GI bleeding and renal toxicity risk.'],
  ['ibuprofen',     'aspirin',        'warning','Ibuprofen + Aspirin: reduced cardioprotective effect of aspirin. GI risk.'],
  ['naproxen',      'diclofenac',     'danger', 'Dual NSAIDs: do not combine. GI bleed and nephrotoxicity risk.'],
  // Cardiac
  ['metformin',     'contrast',       'warning','Hold metformin before iodinated contrast procedures.'],
  ['amlodipine',    'simvastatin',    'warning','Amlodipine increases simvastatin levels — consider dose reduction.'],
  ['amlodipine',    'clarithromycin', 'warning','Clarithromycin can increase amlodipine exposure. Monitor BP.'],
  ['lisinopril',    'potassium',      'warning','ACE inhibitor + potassium supplements: hyperkalemia risk.'],
  ['lisinopril',    'spironolactone', 'danger', 'ACE inhibitor + spironolactone: serious hyperkalemia risk.'],
  ['enalapril',     'spironolactone', 'danger', 'ACE inhibitor + spironolactone: serious hyperkalemia risk.'],
  // Antimicrobials
  ['ciprofloxacin', 'antacid',        'warning','Antacids/dairy reduce ciprofloxacin absorption. Give 2h apart.'],
  ['metronidazole', 'alcohol',        'danger', 'Metronidazole + alcohol: severe disulfiram-like reaction.'],
  ['doxycycline',   'antacid',        'warning','Antacids/calcium reduce doxycycline absorption. Give 2h apart.'],
  ['doxycycline',   'iron',           'warning','Iron supplements reduce doxycycline absorption. Space by 2–3h.'],
  // CNS
  ['tramadol',      'ssri',           'danger', 'Tramadol + SSRIs: serotonin syndrome risk. Avoid or monitor closely.'],
  ['tramadol',      'sertraline',     'danger', 'Tramadol + Sertraline: serotonin syndrome risk.'],
  ['tramadol',      'fluoxetine',     'danger', 'Tramadol + Fluoxetine: serotonin syndrome risk.'],
  ['tramadol',      'diazepam',       'danger', 'Opioid + Benzodiazepine: additive CNS/respiratory depression.'],
  ['morphine',      'diazepam',       'danger', 'Opioid + Benzodiazepine: respiratory depression risk.'],
  ['codeine',       'diazepam',       'danger', 'Opioid + Benzodiazepine: respiratory depression risk.'],
  // Antidiabetics
  ['metformin',     'alcohol',        'warning','Alcohol + metformin: lactic acidosis risk. Advise no alcohol.'],
  ['glibenclamide', 'ciprofloxacin',  'warning','Fluoroquinolones can cause hypoglycaemia with sulphonylureas.'],
  // Antimalarials
  ['chloroquine',   'amiodarone',     'danger', 'Chloroquine + Amiodarone: serious QT prolongation risk.'],
  ['artemether',    'halofantrine',   'danger', 'Do not combine antimalarials — QT prolongation risk.'],
];

// ── Vital sign thresholds ─────────────────────────────────────────────────────
const VITAL_THRESHOLDS = {
  bp: {
    parse: (val) => {
      const m = String(val).match(/(\d+)\s*\/\s*(\d+)/);
      return m ? { sys: parseInt(m[1]), dia: parseInt(m[2]) } : null;
    },
    check: ({ sys, dia }) => {
      if (sys >= 180 || dia >= 120) return { level: 'danger',  msg: `BP ${sys}/${dia} mmHg: Hypertensive crisis. Immediate intervention required.` };
      if (sys >= 160 || dia >= 100) return { level: 'danger',  msg: `BP ${sys}/${dia} mmHg: Severe hypertension. Urgent treatment needed.` };
      if (sys >= 140 || dia >= 90)  return { level: 'warning', msg: `BP ${sys}/${dia} mmHg: Stage 2 hypertension. Review management.` };
      if (sys >= 130 || dia >= 80)  return { level: 'info',    msg: `BP ${sys}/${dia} mmHg: Stage 1 hypertension. Monitor closely.` };
      if (sys < 90  || dia < 60)    return { level: 'danger',  msg: `BP ${sys}/${dia} mmHg: Hypotension. Check for shock/dehydration.` };
      if (sys < 100)                return { level: 'warning', msg: `BP ${sys}/${dia} mmHg: Low blood pressure. Monitor patient.` };
      return null;
    },
  },
  temp: {
    parse: (val) => parseFloat(String(val).replace(',', '.')),
    check: (t) => {
      if (isNaN(t)) return null;
      if (t >= 40.0) return { level: 'danger',  msg: `Temperature ${t}°C: Hyperpyrexia. Emergency cooling required.` };
      if (t >= 39.0) return { level: 'danger',  msg: `Temperature ${t}°C: High fever. Investigate cause urgently.` };
      if (t >= 38.0) return { level: 'warning', msg: `Temperature ${t}°C: Fever. Investigate and treat.` };
      if (t >= 37.5) return { level: 'info',    msg: `Temperature ${t}°C: Low-grade fever. Monitor.` };
      if (t < 35.0)  return { level: 'danger',  msg: `Temperature ${t}°C: Hypothermia. Immediate warming required.` };
      if (t < 36.0)  return { level: 'warning', msg: `Temperature ${t}°C: Subnormal. Monitor for hypothermia.` };
      return null;
    },
  },
  pulse: {
    parse: (val) => parseInt(String(val)),
    check: (p) => {
      if (isNaN(p)) return null;
      if (p >= 150)  return { level: 'danger',  msg: `Pulse ${p} bpm: Severe tachycardia. Urgent cardiac evaluation.` };
      if (p >= 100)  return { level: 'warning', msg: `Pulse ${p} bpm: Tachycardia. Investigate cause.` };
      if (p < 40)    return { level: 'danger',  msg: `Pulse ${p} bpm: Severe bradycardia. Urgent evaluation.` };
      if (p < 60)    return { level: 'info',    msg: `Pulse ${p} bpm: Bradycardia. May be normal in athletes.` };
      return null;
    },
  },
  respiration: {
    parse: (val) => parseInt(String(val)),
    check: (r) => {
      if (isNaN(r)) return null;
      if (r >= 30)   return { level: 'danger',  msg: `Respiration ${r}/min: Severe tachypnoea. Urgent respiratory evaluation.` };
      if (r >= 20)   return { level: 'warning', msg: `Respiration ${r}/min: Tachypnoea. Investigate cause.` };
      if (r < 8)     return { level: 'danger',  msg: `Respiration ${r}/min: Bradypnoea. Risk of respiratory failure.` };
      if (r < 12)    return { level: 'warning', msg: `Respiration ${r}/min: Slow breathing. Monitor closely.` };
      return null;
    },
  },
};

// ── Helper: tokenise drug text ────────────────────────────────────────────────
const tokenise = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s\/\-]/g, ' ')
    .split(/[\s,;\/\n]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);

const containsToken = (tokens, keyword) =>
  tokens.some(t => t.includes(keyword) || keyword.includes(t));

// ── 1. Allergy check ──────────────────────────────────────────────────────────
export const checkAllergies = (medicationsPrescribed, patientAllergies) => {
  if (!medicationsPrescribed || !patientAllergies) return [];
  const drugTokens    = tokenise(medicationsPrescribed);
  const allergyTokens = tokenise(patientAllergies);
  const alerts = [];

  for (const allergyToken of allergyTokens) {
    // Direct match: the prescribed drug contains the allergen name
    if (drugTokens.some(d => d.includes(allergyToken) || allergyToken.includes(d))) {
      alerts.push({
        type:     'allergy',
        level:    'danger',
        allergen: allergyToken,
        message:  `ALLERGY ALERT: Patient is allergic to "${allergyToken}" — check prescribed medications.`,
      });
      continue;
    }
    // Cross-reactivity: allergen maps to related drug families
    for (const [allergyKey, relatedDrugs] of Object.entries(ALLERGY_DRUG_MAP)) {
      if (!allergyToken.includes(allergyKey) && !allergyKey.includes(allergyToken)) continue;
      const matched = relatedDrugs.filter(drug => drugTokens.some(d => d.includes(drug) || drug.includes(d)));
      if (matched.length > 0) {
        alerts.push({
          type:     'allergy',
          level:    'danger',
          allergen: allergyToken,
          message:  `ALLERGY ALERT: Patient allergic to "${allergyToken}". "${matched[0]}" may cause cross-reaction.`,
        });
      }
    }
  }
  return alerts;
};

// ── 2. Drug interaction check ─────────────────────────────────────────────────
export const checkInteractions = (medicationsPrescribed, currentMedications) => {
  const prescribed = tokenise(medicationsPrescribed);
  const current    = tokenise(currentMedications || '');
  const allDrugs   = [...prescribed, ...current];
  const alerts     = [];

  for (const [drugA, drugB, severity, message] of INTERACTIONS) {
    const hasA = allDrugs.some(t => t.includes(drugA) || drugA.includes(t));
    const hasB = allDrugs.some(t => t.includes(drugB) || drugB.includes(t));
    if (hasA && hasB) {
      alerts.push({ type: 'interaction', level: severity, message });
    }
  }
  return alerts;
};

// ── 3. Vital signs check ──────────────────────────────────────────────────────
export const checkVitals = (vitals = {}) => {
  const alerts = [];
  for (const [key, config] of Object.entries(VITAL_THRESHOLDS)) {
    const raw = vitals[key];
    if (!raw || String(raw).trim() === '') continue;
    const parsed = config.parse(raw);
    if (parsed == null) continue;
    const result = config.check(parsed);
    if (result) alerts.push({ type: 'vital', field: key, ...result });
  }
  return alerts;
};

// ── Master check — runs all three ─────────────────────────────────────────────
export const runCDSChecks = ({
  medicationsPrescribed = '',
  currentMedications    = '',
  allergies             = '',
  vital_signs_bp        = '',
  vital_signs_temp      = '',
  vital_signs_pulse     = '',
  vital_signs_respiration = '',
}) => {
  const allergyAlerts     = checkAllergies(medicationsPrescribed, allergies);
  const interactionAlerts = checkInteractions(medicationsPrescribed, currentMedications);
  const vitalAlerts = checkVitals({
    bp:          vital_signs_bp,
    temp:        vital_signs_temp,
    pulse:       vital_signs_pulse,
    respiration: vital_signs_respiration,
  });

  const allAlerts = [...allergyAlerts, ...interactionAlerts, ...vitalAlerts];
  return {
    alerts:     allAlerts,
    hasDanger:  allAlerts.some(a => a.level === 'danger'),
    hasWarning: allAlerts.some(a => a.level === 'warning'),
    count:      allAlerts.length,
  };
};