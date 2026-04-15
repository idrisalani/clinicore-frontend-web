// ============================================
// ImagingPage.jsx
// File: frontend-web/src/pages/ImagingPage.jsx
// ============================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScanLine, Upload, X, Search, Flag,
  Loader, ZoomIn, Download, Brain, FileText, RefreshCw,
  AlertTriangle, Image as ImageIcon,
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024)       return `${bytes}B`;
  if (bytes < 1048576)    return `${(bytes/1024).toFixed(1)}KB`;
  return `${(bytes/1048576).toFixed(1)}MB`;
};

const IMAGE_TYPES = [
  'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG',
  'Endoscopy', 'Mammogram', 'PET Scan', 'Other',
];

const TYPE_COLORS = {
  'X-Ray':      'bg-blue-100 text-blue-700',
  'CT Scan':    'bg-purple-100 text-purple-700',
  'MRI':        'bg-indigo-100 text-indigo-700',
  'Ultrasound': 'bg-teal-100 text-teal-700',
  'ECG':        'bg-red-100 text-red-700',
  'Endoscopy':  'bg-orange-100 text-orange-700',
  'Mammogram':  'bg-pink-100 text-pink-700',
  'PET Scan':   'bg-violet-100 text-violet-700',
  'Other':      'bg-slate-100 text-slate-600',
};

const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
  focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;

const sel = `${inp} appearance-none cursor-pointer`;

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, iconBg, iconCl }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconCl}`} />
      </div>
    </div>
  </div>
);

// ── Upload modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onUploaded }) => {
  const fileRef    = useRef(null);
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({
    patient_id: '', image_type: 'X-Ray', body_part: '',
    laterality: '', study_date: new Date().toISOString().split('T')[0],
    study_description: '', clinical_notes: '',
  });
  const [patients, setPatients] = useState([]);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    if (search.length >= 2) {
      api.get('/patients/search', { params: { q: search } })
        .then(r => setPatients(r.data.patients || []))
        .catch(() => {});
    } else {
      setPatients([]);
    }
  }, [search]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('File must be under 20MB'); return; }
    setFile(f);
    setError('');
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile({ target: { files: [f] } });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file)           return setError('Please select a file');
    if (!form.patient_id)return setError('Please select a patient');
    if (!form.image_type)return setError('Please select an image type');

    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });

      await api.post('/imaging/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800">Upload Medical Image</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
              ${file ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300 bg-slate-50'}`}
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
              accept="image/jpeg,image/png,image/webp,image/tiff,application/pdf" />
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
            ) : (
              <div>
                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">{file ? file.name : 'Drop image here or click to browse'}</p>
                <p className="text-xs text-slate-400 mt-1">JPEG · PNG · WEBP · TIFF · PDF — max 20MB</p>
              </div>
            )}
            {file && !preview && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-semibold text-teal-700">{file.name} ({fmtSize(file.size)})</span>
              </div>
            )}
          </div>

          {/* Patient search */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Patient *</label>
            <div className="relative">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search patient by name or phone…"
                className={inp} />
              {patients.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {patients.map(p => (
                    <button key={p.patient_id} type="button"
                      onClick={() => { setForm(f => ({ ...f, patient_id: p.patient_id })); setSearch(`${p.first_name} ${p.last_name}`); setPatients([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-sm border-b border-slate-50 last:border-0">
                      <span className="font-semibold">{p.first_name} {p.last_name}</span>
                      <span className="text-slate-400 ml-2 text-xs">{p.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type, Body part, Laterality, Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Image type *</label>
              <select value={form.image_type} onChange={e => setForm(f => ({ ...f, image_type: e.target.value }))} className={sel}>
                {IMAGE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Body part</label>
              <input value={form.body_part} onChange={e => setForm(f => ({ ...f, body_part: e.target.value }))}
                className={inp} placeholder="e.g. Chest, Abdomen, Knee" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Laterality</label>
              <select value={form.laterality} onChange={e => setForm(f => ({ ...f, laterality: e.target.value }))} className={sel}>
                <option value="">N/A</option>
                {['Left','Right','Bilateral'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Study date</label>
              <input type="date" value={form.study_date} onChange={e => setForm(f => ({ ...f, study_date: e.target.value }))} className={inp} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Study description</label>
            <input value={form.study_description} onChange={e => setForm(f => ({ ...f, study_description: e.target.value }))}
              className={inp} placeholder="e.g. Chest X-Ray PA view — evaluate for pneumonia" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Clinical notes</label>
            <textarea value={form.clinical_notes} onChange={e => setForm(f => ({ ...f, clinical_notes: e.target.value }))}
              rows={2} className={`${inp} resize-none`} placeholder="Relevant clinical context for the radiologist…" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2">
              {loading ? <><Loader className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Image viewer modal ────────────────────────────────────────────────────────
const ImageViewer = ({ image, onClose, onUpdate }) => {
  const [analysis, setAnalysis]   = useState(image.ai_analysis || '');
  const [report,   setReport]     = useState(image.radiologist_report || '');
  const [flagged,  setFlagged]    = useState(!!image.findings_flagged);
  const [loading,  setLoading]    = useState(false);
  const [analyzing,setAnalyzing]  = useState(false);
  const [tab, setTab]             = useState('image');

  const isPDF = image.cloudinary_format === 'pdf' || image.cloudinary_public_id?.includes('.pdf');

  const saveReport = async () => {
    setLoading(true);
    try {
      await api.put(`/imaging/${image.image_id}`, {
        radiologist_report: report,
        findings_flagged:   flagged,
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const runAI = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/imaging/${image.image_id}/analyze`);
      setAnalysis(res.data.analysis);
      onUpdate();
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally { setAnalyzing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.85)' }}>
      {/* Left panel — image */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <button onClick={onClose} className="absolute top-4 left-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all">
          <X className="w-5 h-5" />
        </button>
        {isPDF ? (
          <div className="text-center text-white">
            <FileText className="w-20 h-20 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold mb-4">{image.image_type} — PDF document</p>
            <a href={image.cloudinary_secure_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all">
              <Download className="w-4 h-4" /> Open PDF
            </a>
          </div>
        ) : (
          <img src={image.cloudinary_secure_url} alt={`${image.image_type} — ${image.body_part || ''}`}
            className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
        )}
        {image.findings_flagged === 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
            <Flag className="w-3 h-3" /> Findings flagged
          </div>
        )}
      </div>

      {/* Right panel — details */}
      <div className="w-96 bg-white flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${TYPE_COLORS[image.image_type] || TYPE_COLORS.Other}`}>
              {image.image_type}
            </span>
            {image.laterality && image.laterality !== 'N/A' && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">{image.laterality}</span>
            )}
          </div>
          <p className="font-black text-slate-800 text-base">{image.body_part || 'Unspecified'}</p>
          <p className="text-xs text-slate-400 mt-1">
            {image.first_name} {image.last_name} · {fmtDate(image.study_date)}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[['image','Details'],['report','Report'],['ai','AI Analysis']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold transition-all
                ${tab === t ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-400 hover:text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'image' && (
            <div className="space-y-3 text-sm">
              {[
                ['Study description', image.study_description],
                ['Clinical notes',   image.clinical_notes],
                ['Uploaded by',      image.uploaded_by_name],
                ['File size',        fmtSize(image.file_size_bytes)],
                ['Format',           image.cloudinary_format?.toUpperCase()],
                ['Dimensions',       image.width && image.height ? `${image.width} × ${image.height}px` : null],
              ].filter(([,v]) => v).map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{l}</p>
                  <p className="text-slate-700 mt-0.5">{v}</p>
                </div>
              ))}

              {/* Flag toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)}
                    className="w-4 h-4 accent-red-500" />
                  <span className="text-sm font-semibold text-slate-700">Flag findings for review</span>
                </label>
              </div>

              <a href={image.cloudinary_secure_url} download target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all w-full">
                <Download className="w-4 h-4" /> Download original
              </a>
            </div>
          )}

          {tab === 'report' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Radiologist report</label>
              <textarea value={report} onChange={e => setReport(e.target.value)}
                rows={10} className={`${inp} resize-none`}
                placeholder="Enter radiologist findings and report here…" />
              <button onClick={saveReport} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-all">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                Save report
              </button>
            </div>
          )}

          {tab === 'ai' && (
            <div className="space-y-3">
              {analysis ? (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI observations</p>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {analysis}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-400" />
                    AI observations are preliminary. Always confirm with a qualified radiologist.
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Brain className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 mb-1">No AI analysis yet</p>
                  <p className="text-xs text-slate-400 mb-4">Claude will describe visible findings and flag areas of concern</p>
                </div>
              )}
              {!isPDF && (
                <button onClick={runAI} disabled={analyzing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50 transition-all">
                  {analyzing ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                  {analyzing ? 'Analysing…' : analysis ? 'Re-analyse with AI' : 'Analyse with AI'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ImagingPage() {
  const [images, setImages]         = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [flaggedOnly, setFlagged]   = useState(false);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({});
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected]     = useState(null);

  const fetchImages = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/imaging', {
        params: { page: p, limit: 20, image_type: typeFilter, flagged: flaggedOnly || undefined },
      });
      setImages(res.data.images || []);
      setPagination(res.data.pagination || {});
    } catch {} finally { setLoading(false); }
  }, [typeFilter, flaggedOnly]);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get('/imaging/stats'); setStats(r.data); } catch {}
  }, []);

  useEffect(() => { fetchImages(page); fetchStats(); }, [page, fetchImages, fetchStats]);

  const filtered = images.filter(img =>
    !search || `${img.first_name} ${img.last_name} ${img.image_type} ${img.body_part || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const openImage = async (img) => {
    try {
      const res = await api.get(`/imaging/${img.image_id}`);
      setSelected(res.data.image);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .35s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ScanLine className="w-6 h-6 text-teal-500" /> Medical Imaging
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">X-Rays, CT, MRI, Ultrasound — with AI-assisted analysis</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { fetchImages(page); fetchStats(); }} className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowUpload(true)}
              className="fade-in inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all">
              <Upload className="w-4 h-4" /> Upload Image
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <StatCard icon={ScanLine}       label="Total images"    value={stats.total || 0}        iconBg="bg-teal-50"    iconCl="text-teal-500" />
          <StatCard icon={Flag}           label="Flagged"         value={stats.flagged || 0}      iconBg="bg-red-50"     iconCl="text-red-500" />
          <StatCard icon={Brain}          label="AI analysed"     value={stats.ai_analysed || 0}  iconBg="bg-purple-50"  iconCl="text-purple-500" />
          <StatCard icon={ImageIcon}      label="Storage used"    value={stats.total_mb ? `${stats.total_mb}MB` : '0MB'} iconBg="bg-slate-100" iconCl="text-slate-500" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search by patient or body part…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
            </div>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none cursor-pointer">
              <option value="">All types</option>
              {IMAGE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all">
              <input type="checkbox" checked={flaggedOnly} onChange={e => { setFlagged(e.target.checked); setPage(1); }}
                className="w-3.5 h-3.5 accent-red-500" />
              <span className="text-sm font-semibold text-slate-600">Flagged only</span>
            </label>
          </div>
        </div>

        {/* Grid */}
        <div className="fade-in">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#0d9488' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 text-center py-16">
              <ScanLine className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No images found</p>
              <p className="text-slate-400 text-sm mt-1">Upload the first scan to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(img => (
                <div key={img.image_id}
                  onClick={() => openImage(img)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative bg-slate-900 aspect-square overflow-hidden">
                    {img.cloudinary_format === 'pdf' || img.resource_type === 'raw' ? (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="w-12 h-12 text-slate-600" />
                      </div>
                    ) : (
                      <img
                        src={img.cloudinary_secure_url?.replace('/upload/', '/upload/c_fill,w_300,h_300,q_auto/')}
                        alt={img.image_type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                    {img.findings_flagged === 1 && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <Flag className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {img.ai_analysis && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${TYPE_COLORS[img.image_type] || TYPE_COLORS.Other}`}>
                        {img.image_type}
                      </span>
                      {img.laterality && img.laterality !== 'N/A' && (
                        <span className="text-xs text-slate-400">{img.laterality}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {img.first_name} {img.last_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{img.body_part || 'Unspecified'}</p>
                    <p className="text-xs text-slate-300 mt-1">{fmtDate(img.study_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">← Prev</button>
            <span className="px-4 py-2 text-sm text-slate-500">Page {page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50">Next →</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => { setShowUpload(false); fetchImages(1); fetchStats(); setPage(1); }}
        />
      )}

      {selected && (
        <ImageViewer
          image={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => { fetchImages(page); fetchStats(); }}
        />
      )}
    </div>
  );
}