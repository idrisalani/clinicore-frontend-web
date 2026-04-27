// ============================================
// UserForm.jsx
// File: frontend-web/src/components/admin/UserForm.jsx
//
// Reconciled: best of existing + new version.
// - Individual field useState (new) — no state wipe bugs
// - username disabled on edit (existing) — correct UX
// - Email regex validation (existing)
// - Password min length check (existing)
// - Roles from API prop (new) — all CliniCore roles
// - Phone formatting (new)
// - Eye icon password toggle (new)
// - serverError banner (new)
// - autoComplete off (new)
// - Teal design system (new)
// - No useEffect (new)
// ============================================
import React, { useState } from 'react';
import { Loader, Phone, Eye, EyeOff } from 'lucide-react';

// ── Phone helpers ─────────────────────────────────────────────────────────────
const formatNigerianPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('234') && d.length >= 13)
    return `+234-${d.slice(3,6)}-${d.slice(6,9)}-${d.slice(9)}`;
  if (d.startsWith('0') && d.length === 11)
    return `+234-${d.slice(1,4)}-${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `+234-${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return raw;
};

const normalisePhone = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('234')) return `+${d}`;
  if (d.startsWith('0'))   return `+234${d.slice(1)}`;
  if (d.length === 10)     return `+234${d}`;
  return `+${d}`;
};

// ── Styles ────────────────────────────────────────────────────────────────────
const inp = (err = false) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all
   ${err
     ? 'bg-red-50 border-red-300 focus:border-red-400'
     : 'bg-white border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'}`;

const sel = `w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
  focus:border-teal-400 focus:ring-2 focus:ring-teal-100
  outline-none transition-all appearance-none cursor-pointer`;

const F = ({ label, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ── UserForm ──────────────────────────────────────────────────────────────────
export default function UserForm({
  initialData  = null,
  roles        = [],
  onSubmit,
  onCancel,
  isLoading    = false,
  serverError  = '',
}) {
  const isEdit = !!initialData;

  // Individual field state — no object spreading, no accidental wipes
  const [fullName,     setFullName]     = useState(initialData?.full_name  || '');
  const [username,     setUsername]     = useState(initialData?.username   || '');
  const [email,        setEmail]        = useState(initialData?.email      || '');
  const [password,     setPassword]     = useState('');
  const [phone,        setPhone]        = useState(initialData?.phone      || '');
  const [phoneDisplay, setPhoneDisplay] = useState(
    initialData?.phone ? formatNigerianPhone(initialData.phone) : ''
  );
  const [department,   setDepartment]   = useState(initialData?.department || '');
  const [role,         setRole]         = useState(
    initialData?.role || (roles[0]?.role_name?.toLowerCase() || 'staff')
  );
  const [showPwd,      setShowPwd]      = useState(false);
  const [errors,       setErrors]       = useState({});

  const clearErr = (field) =>
    setErrors(prev => prev[field] ? { ...prev, [field]: '' } : prev);

  // ── Phone handlers ──────────────────────────────────────────────────────────
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    setPhoneDisplay(raw);
    setPhone(normalisePhone(raw));
    clearErr('phone');
  };
  const handlePhoneBlur = () => {
    if (phone) setPhoneDisplay(formatNigerianPhone(phone));
  };

  // ── Validation (from existing — email regex + min password) ────────────────
  const validate = () => {
    const errs = {};
    if (!fullName.trim())
      errs.fullName = 'Full name is required';
    if (!username.trim())
      errs.username = 'Username is required';
    if (!email.trim())
      errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = 'Invalid email format';
    if (!isEdit && !password.trim())
      errs.password = 'Password is required';
    else if (!isEdit && password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (!role)
      errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      full_name:  fullName.trim(),
      username:   username.trim(),
      email:      email.trim(),
      role,
      department: department.trim(),
      phone:      normalisePhone(phone),
    };
    if (password) data.password = password;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Full Name */}
        <F label="Full Name *" error={errors.fullName}>
          <input
            value={fullName}
            onChange={e => { setFullName(e.target.value); clearErr('fullName'); }}
            className={inp(!!errors.fullName)}
            placeholder="e.g., Dr Ahmed Hassan"
            autoComplete="off"
          />
        </F>

        {/* Username — disabled on edit (existing behaviour: username is immutable) */}
        <F label="Username *" error={errors.username}>
          <input
            value={username}
            onChange={e => { if (!isEdit) { setUsername(e.target.value); clearErr('username'); } }}
            className={`${inp(!!errors.username)} ${isEdit ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
            placeholder="e.g., @doctor1"
            disabled={isEdit}
            title={isEdit ? 'Username cannot be changed after account creation' : ''}
            autoComplete="off"
          />
          {isEdit && (
            <p className="text-xs text-slate-400 mt-1">Username cannot be changed</p>
          )}
        </F>

        {/* Email */}
        <F label="Email *" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearErr('email'); }}
            className={inp(!!errors.email)}
            placeholder="user@clinicore.com"
            autoComplete="off"
          />
        </F>

        {/* Password with eye toggle */}
        <F label={isEdit ? 'New Password (blank = keep current)' : 'Password *'} error={errors.password}>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); clearErr('password'); }}
              className={`${inp(!!errors.password)} pr-11`}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </F>

        {/* Phone with Nigerian formatting */}
        <F label="Phone" error={errors.phone}>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={phoneDisplay}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              className={`${inp(!!errors.phone)} pl-10`}
              placeholder="+234-XXX-XXX-XXXX"
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Auto-formats to +234-XXX-XXX-XXXX</p>
        </F>

        {/* Department */}
        <F label="Department">
          <input
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className={inp()}
            placeholder="e.g., Surgery, Cardiology"
            autoComplete="off"
          />
        </F>

        {/* Role — from API prop, falls back to hardcoded if empty */}
        <F label="Role *" error={errors.role} className="col-span-1 md:col-span-2">
          <select
            value={role}
            onChange={e => { setRole(e.target.value); clearErr('role'); }}
            className={`${sel} ${errors.role ? 'border-red-300' : ''}`}
          >
            <option value="">Select a role…</option>
            {(roles.length > 0 ? roles : [
              { role_id: 1, role_name: 'admin',        description: 'Full system access' },
              { role_id: 2, role_name: 'doctor',       description: 'Clinical staff' },
              { role_id: 3, role_name: 'nurse',        description: 'Nursing staff' },
              { role_id: 4, role_name: 'pharmacist',   description: 'Pharmacy staff' },
              { role_id: 5, role_name: 'lab_tech',     description: 'Laboratory staff' },
              { role_id: 6, role_name: 'receptionist', description: 'Front desk' },
              { role_id: 7, role_name: 'staff',        description: 'Support staff' },
              { role_id: 8, role_name: 'patient',      description: 'Patient user' },
            ]).map(r => {
              const name = r.role_name || r.name || '';
              const desc = r.description ? ` — ${r.description}` : '';
              return (
                <option key={r.role_id || name} value={name.toLowerCase()}>
                  {name}{desc}
                </option>
              );
            })}
          </select>
        </F>

      </div>

      {/* Server error banner */}
      {serverError && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </form>
  );
}