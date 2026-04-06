// ============================================
// PermissionsPage - Professional Permission Management
// File: frontend-web/src/pages/admin/PermissionsPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Save, Shield, Check, AlertTriangle, Loader,
  RefreshCw, RotateCcw, Lock,
} from 'lucide-react';

// \u2500\u2500 Module icon map \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const MODULE_COLORS = {
  patients:      { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100'   },
  appointments:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100'  },
  consultations: { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100'   },
  lab:           { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  pharmacy:      { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  billing:       { bg: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-100'   },
  admin:         { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100'    },
  dashboard:     { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
};
const defaultModuleColor = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };

// \u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium ${
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.message}
    </div>
  );
};

// \u2500\u2500 Permission Checkbox \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PermCheckbox = ({ perm, checked, onChange }) => (
  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
    checked
      ? 'bg-blue-50 border-blue-200'
      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
  }`}>
    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
      checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
    }`}>
      {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    <div className="min-w-0">
      <p className={`text-xs font-bold truncate ${checked ? 'text-blue-800' : 'text-gray-700'}`}>
        {perm.name}
      </p>
      {perm.description && (
        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{perm.description}</p>
      )}
    </div>
  </label>
);

// \u2500\u2500 Module Section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const ModuleSection = ({ resource, perms, selected, onToggle, onToggleAll }) => {
  const c = MODULE_COLORS[resource?.toLowerCase()] || defaultModuleColor;
  const allSelected = perms.every(p => selected.includes(p.permission_id));

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 ${c.bg} border-b ${c.border}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{resource}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.bg} ${c.text} border ${c.border}`}>
            {perms.filter(p => selected.includes(p.permission_id)).length}/{perms.length}
          </span>
        </div>
        <button
          onClick={() => onToggleAll(perms, allSelected)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
            allSelected
              ? `${c.text} border-current hover:opacity-70`
              : 'text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {perms.map(perm => (
          <PermCheckbox
            key={perm.permission_id}
            perm={perm}
            checked={selected.includes(perm.permission_id)}
            onChange={() => onToggle(perm.permission_id)}
          />
        ))}
      </div>
    </div>
  );
};

// \u2500\u2500 Main Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default function PermissionsPage() {
  const [roles, setRoles]                       = useState([]);
  const [selectedRole, setSelectedRole]         = useState(null);
  const [permissions, setPermissions]           = useState([]);
  const [savedPermissions, setSavedPermissions] = useState([]);
  const [selected, setSelected]                 = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [toast, setToast]                       = useState(null);
  const [error, setError]                       = useState('');

  const { fetchRoles, fetchPermissions, getRolePermissions, assignPermissionsToRole } = useAdmin();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [rolesData, permsData] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);
      if (rolesData?.length > 0) {
        const first = rolesData[0];
        setSelectedRole(first);
        const rp = await getRolePermissions(first.role_id);
        const ids = (rp || []).map(p => p.permission_id);
        setSavedPermissions(ids);
        setSelected(ids);
      }
    } catch (err) {
      setError(err?.response?.status === 403 ? 'Admin access required.' : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, fetchPermissions, getRolePermissions]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const handleSelectRole = async (role) => {
    try {
      setLoading(true);
      setSelectedRole(role);
      const rp = await getRolePermissions(role.role_id);
      const ids = (rp || []).map(p => p.permission_id);
      setSavedPermissions(ids);
      setSelected(ids);
    } catch {
      showToast('Failed to load permissions for this role.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleToggleAll = (perms, allSelected) => {
    const ids = perms.map(p => p.permission_id);
    setSelected(prev =>
      allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      setSaving(true);
      await assignPermissionsToRole(selectedRole.role_id, selected);
      setSavedPermissions([...selected]);
      showToast(`Permissions saved for "${selectedRole.role_name}"`);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to save permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...savedPermissions].sort());

  const grouped = permissions.reduce((acc, p) => {
    const key = p.resource || p.module || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const ROLE_COLORS = {
    admin: 'bg-purple-600', doctor: 'bg-blue-600', nurse: 'bg-teal-600',
    pharmacist: 'bg-emerald-600', lab_technician: 'bg-orange-600',
    receptionist: 'bg-pink-600', patient: 'bg-indigo-600',
  };

  return (
    <div className="p-6 space-y-5">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Permissions Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure access control per role</p>
        </div>
        <button onClick={loadInitialData}
          className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all self-start">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Role selector — horizontal pill strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Role</p>
        <div className="flex flex-wrap gap-2">
          {roles.map(role => {
            const isActive = selectedRole?.role_id === role.role_id;
            const color = ROLE_COLORS[role.role_name?.toLowerCase()] || 'bg-gray-600';
            return (
              <button
                key={role.role_id}
                onClick={() => handleSelectRole(role)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md ${color} flex items-center justify-center flex-shrink-0`}>
                  <Shield className="w-3 h-3 text-white" />
                </div>
                {role.role_name}
                <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                  L{role.level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions panel — full width, scrolls with the page */}
      <div>
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="mt-3 text-sm text-gray-500">Loading permissions...</p>
              </div>
            </div>
          ) : selectedRole ? (
            <div className="space-y-4">
              {/* Save bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{selectedRole.role_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selected.length} of {permissions.length} permissions granted
                    {hasChanges && <span className="ml-2 text-amber-500 font-semibold">\u00b7 Unsaved changes</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <button onClick={() => setSelected([...savedPermissions])}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ${
                      hasChanges && !saving
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Module sections */}
              {Object.entries(grouped).map(([resource, perms]) => (
                <ModuleSection
                  key={resource}
                  resource={resource}
                  perms={perms}
                  selected={selected}
                  onToggle={handleToggle}
                  onToggleAll={handleToggleAll}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-center">
                <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Select a role to manage permissions</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}