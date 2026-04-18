// ============================================
// ICD10Picker.jsx
// File: frontend-web/src/components/ICD10Picker.jsx
//
// Reusable ICD-10 code search & selection component.
// Drop into any consultation form that needs diagnosis coding.
//
// Usage:
//   <ICD10Picker
//     selected={selectedCodes}          // array of {code, description}
//     onChange={setCodes}               // setter for selected codes
//     maxCodes={4}                      // optional, default 4
//     placeholder="Search diagnosis…"  // optional
//   />
// ============================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Plus, Tag, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

// ── Category colour config ────────────────────────────────────────────────────
const CAT_COLORS = {
  'Infectious':      'bg-red-100 text-red-700 border-red-200',
  'Cardiovascular':  'bg-pink-100 text-pink-700 border-pink-200',
  'Respiratory':     'bg-blue-100 text-blue-700 border-blue-200',
  'Digestive':       'bg-amber-100 text-amber-700 border-amber-200',
  'Endocrine':       'bg-purple-100 text-purple-700 border-purple-200',
  'Neurological':    'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Musculoskeletal': 'bg-orange-100 text-orange-700 border-orange-200',
  'Genitourinary':   'bg-teal-100 text-teal-700 border-teal-200',
  'Obstetric':       'bg-rose-100 text-rose-700 border-rose-200',
  'Mental Health':   'bg-violet-100 text-violet-700 border-violet-200',
  'Neoplasm':        'bg-gray-100 text-gray-700 border-gray-200',
  'Blood':           'bg-red-50 text-red-600 border-red-100',
  'Skin':            'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Eye':             'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Ear':             'bg-sky-100 text-sky-700 border-sky-200',
  'Symptoms':        'bg-slate-100 text-slate-600 border-slate-200',
  'Injury':          'bg-orange-50 text-orange-700 border-orange-100',
  'Z-Code':          'bg-emerald-100 text-emerald-700 border-emerald-200',
  'External':        'bg-stone-100 text-stone-700 border-stone-200',
  'Perinatal':       'bg-lime-100 text-lime-700 border-lime-200',
  'Congenital':      'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
};

const catColor = (category) => CAT_COLORS[category] || 'bg-slate-100 text-slate-600 border-slate-200';

// ── Common diagnoses (shown before user types) ────────────────────────────────
const COMMON = [
  { code:'B54',   description:'Unspecified malaria',                    category:'Infectious'     },
  { code:'R50.9', description:'Fever, unspecified',                     category:'Symptoms'       },
  { code:'I10',   description:'Essential (primary) hypertension',       category:'Cardiovascular' },
  { code:'E11.9', description:'Type 2 diabetes without complications',  category:'Endocrine'      },
  { code:'J18.9', description:'Pneumonia, unspecified',                 category:'Respiratory'    },
  { code:'A01.0', description:'Typhoid fever',                          category:'Infectious'     },
  { code:'J45.9', description:'Asthma, unspecified',                    category:'Respiratory'    },
  { code:'N39.0', description:'Urinary tract infection',                category:'Genitourinary'  },
  { code:'R10.4', description:'Abdominal pain',                         category:'Symptoms'       },
  { code:'K29.7', description:'Gastritis, unspecified',                 category:'Digestive'      },
  { code:'D57.1', description:'Sickle-cell anaemia without crisis',     category:'Blood'          },
  { code:'O14.9', description:'Pre-eclampsia, unspecified',             category:'Obstetric'      },
];

export default function ICD10Picker({
  selected = [],
  onChange,
  maxCodes = 4,
  placeholder = 'Search ICD-10 code or diagnosis…',
  label = 'Diagnosis codes (ICD-10)',
  required = false,
}) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef  = useRef(null);
  const dropRef   = useRef(null);
  const debounce  = useRef(null);

  // ── Search ────────────────────────────────────────────────────────────────
  const search = useCallback(async (term) => {
    if (!term.trim()) { setResults(COMMON); return; }
    setLoading(true);
    try {
      const res = await api.get('/icd10/search', { params: { q: term, limit: 15 } });
      setResults(res.data.codes || []);
    } catch {
      setResults([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { if (open) search(query); }, 250);
    return () => clearTimeout(debounce.current);
  }, [query, open, search]);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFocus = () => {
    setOpen(true);
    setFocused(true);
    if (!query) setResults(COMMON);
  };

  const handleBlur = () => setFocused(false);

  // ── Select / remove ───────────────────────────────────────────────────────
  const selectCode = (code) => {
    if (selected.find(s => s.code === code.code)) return;
    if (selected.length >= maxCodes) return;
    onChange([...selected, { code: code.code, description: code.description, category: code.category }]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeCode = (code) => {
    onChange(selected.filter(s => s.code !== code));
  };

  const isSelected = (code) => selected.some(s => s.code === code);

  const showDropdown = open && results.length > 0;
  const canAdd = selected.length < maxCodes;

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}{required && ' *'}
        </label>
        {selected.length > 0 && (
          <span className="text-xs text-slate-400">{selected.length}/{maxCodes} codes</span>
        )}
      </div>

      {/* Selected codes */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((s, i) => (
            <div key={s.code}
              className={`inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-xl border text-xs font-semibold ${catColor(s.category)}`}>
              {i === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" title="Primary diagnosis" />
              )}
              <span className="font-black">{s.code}</span>
              <span className="font-medium opacity-80 max-w-[180px] truncate">{s.description}</span>
              <button type="button" onClick={() => removeCode(s.code)}
                className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center transition-all flex-shrink-0">
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      {canAdd && (
        <div className="relative">
          <div ref={inputRef}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border rounded-xl transition-all
              ${focused ? 'border-teal-400 bg-white ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
            <Search className={`w-4 h-4 flex-shrink-0 ${loading ? 'animate-pulse text-teal-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults(COMMON); }}
                className="text-slate-300 hover:text-slate-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div ref={dropRef}
              className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              {!query && (
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Common diagnoses</p>
                </div>
              )}
              <div className="max-h-72 overflow-y-auto">
                {results.map(code => {
                  const already = isSelected(code.code);
                  return (
                    <button key={code.code} type="button"
                      onClick={() => !already && selectCode(code)}
                      disabled={already}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-0 transition-colors
                        ${already ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-teal-50 cursor-pointer'}`}>
                      <span className="font-black text-slate-700 text-sm w-14 flex-shrink-0">{code.code}</span>
                      <span className="flex-1 text-sm text-slate-600">{code.description}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-lg border font-semibold ${catColor(code.category)}`}>
                          {code.category}
                        </span>
                        {already
                          ? <span className="text-xs text-slate-400">Added</span>
                          : <Plus className="w-3.5 h-3.5 text-teal-500" />
                        }
                      </div>
                    </button>
                  );
                })}
                {results.length === 0 && query && (
                  <div className="px-4 py-6 text-center">
                    <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No codes found for "{query}"</p>
                    <p className="text-xs text-slate-300 mt-1">Try a broader term or use the diagnosis text field below</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!canAdd && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Maximum {maxCodes} codes per consultation. Remove one to add another.
        </p>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-slate-400">
          First code = primary diagnosis. Additional codes = secondary/comorbidities.
        </p>
      )}
    </div>
  );
}