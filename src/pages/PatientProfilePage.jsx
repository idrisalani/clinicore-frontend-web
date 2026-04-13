import React, { useState, useEffect } from 'react';
import { User, Phone, AlertTriangle, Save, Loader, CheckCircle } from 'lucide-react';
import api from '../services/api.js';

const F = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);
const inp = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 outline-none transition-all`;
const inp_ro = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed`;

const PatientProfilePage = () => {
  const [patient, setPatient]   = useState(null);
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then(r => {
        setPatient(r.data.patient);
        const p = r.data.patient;
        setForm({
          phone:                          p.phone || '',
          address:                        p.address || '',
          city:                           p.city || '',
          state:                          p.state || '',
          emergency_contact_name:         p.emergency_contact_name || '',
          emergency_contact_phone:        p.emergency_contact_phone || '',
          emergency_contact_relationship: p.emergency_contact_relationship || '',
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.put('/patients/me', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3, borderStyle: 'solid' }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">My Profile</h1>
            <p className="text-slate-400 text-sm mt-0.5">Update your contact and emergency information</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Read-only medical info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Medical Information</h2>
            <span className="text-xs text-slate-400 ml-1">(managed by your doctor)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <F label="Full Name"><input className={inp_ro} value={`${patient?.first_name || ''} ${patient?.last_name || ''}`} readOnly /></F>
            <F label="Date of Birth"><input className={inp_ro} value={patient?.date_of_birth || '—'} readOnly /></F>
            <F label="Gender"><input className={inp_ro} value={patient?.gender || '—'} readOnly /></F>
            <F label="Blood Type"><input className={inp_ro} value={patient?.blood_type || 'Unknown'} readOnly /></F>
            <div className="col-span-2">
              <F label="Allergies">
                <div className={`${inp_ro} ${patient?.allergies ? 'text-red-600 font-medium' : ''}`}>
                  {patient?.allergies || 'None recorded'}
                </div>
              </F>
            </div>
          </div>
        </div>

        {/* Editable contact info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <F label="Phone Number" hint="We'll use this for appointment reminders">
              <input name="phone" value={form.phone} onChange={set} className={inp} placeholder="+234-800-000-0000" />
            </F>
            <F label="Home Address">
              <input name="address" value={form.address} onChange={set} className={inp} placeholder="Street address" />
            </F>
            <div className="grid grid-cols-2 gap-4">
              <F label="City">
                <input name="city" value={form.city} onChange={set} className={inp} placeholder="Lagos" />
              </F>
              <F label="State">
                <input name="state" value={form.state} onChange={set} className={inp} placeholder="Lagos State" />
              </F>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Emergency Contact</h2>
          </div>
          <div className="space-y-4">
            <F label="Full Name">
              <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={set} className={inp} placeholder="Contact person's name" />
            </F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Phone Number">
                <input name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={set} className={inp} placeholder="+234-800-000-0000" />
              </F>
              <F label="Relationship">
                <input name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={set} className={inp} placeholder="Spouse, Parent, Sibling…" />
              </F>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PatientProfilePage;