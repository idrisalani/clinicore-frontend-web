// ============================================
// SettingsPage - Professional System Settings
// File: frontend-web/src/pages/admin/SettingsPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Save, Plus, Trash2, Edit2, X, Check,
  AlertTriangle, Loader, RefreshCw, Settings,
  ToggleLeft, Hash, Type,
} from 'lucide-react';

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

// \u2500\u2500 Delete Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const DeleteModal = ({ settingKey, onConfirm, onCancel, loading }) => {
  if (!settingKey) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Setting?</h3>
          <p className="text-sm text-gray-500 mb-1">
            Remove <span className="font-mono font-semibold text-gray-700">"{settingKey}"</span>?
          </p>
          <p className="text-xs text-red-500 mb-6">This may affect system behaviour.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// \u2500\u2500 Type Icon \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TypeIcon = ({ type }) => {
  if (type === 'number')  return <Hash className="w-3.5 h-3.5 text-blue-500" />;
  if (type === 'boolean') return <ToggleLeft className="w-3.5 h-3.5 text-purple-500" />;
  return <Type className="w-3.5 h-3.5 text-gray-400" />;
};

// \u2500\u2500 Setting Row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const SettingRow = ({ setting, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <TypeIcon type={setting.setting_type} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800 font-mono">{setting.setting_key}</p>
        <p className="text-sm text-gray-500 truncate mt-0.5">{setting.setting_value}</p>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
          setting.setting_type === 'number'  ? 'bg-blue-50 text-blue-600' :
          setting.setting_type === 'boolean' ? 'bg-purple-50 text-purple-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {setting.setting_type || 'string'}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-1.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => onEdit(setting)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
      <button onClick={() => onDelete(setting.setting_key)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  </div>
);

// \u2500\u2500 Main Component \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default function SettingsPage() {
  const [newSetting, setNewSetting]       = useState({ key: '', value: '', type: 'string' });
  const [editTarget, setEditTarget]       = useState(null);
  const [editValue, setEditValue]         = useState('');
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addLoading, setAddLoading]       = useState(false);
  const [saveLoading, setSaveLoading]     = useState(false);
  const [toast, setToast]                 = useState(null);
  const [error, setError]                 = useState('');

  const { settings, loading, fetchSettings, updateSetting, deleteSetting } = useAdmin();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = useCallback(async () => {
    try {
      setError('');
      await fetchSettings();
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Admin access required to view settings.'
        : 'Failed to load system settings.');
    }
  }, [fetchSettings]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleAdd = async () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      showToast('Please fill in both key and value.', 'error');
      return;
    }
    setAddLoading(true);
    try {
      await updateSetting(newSetting.key.trim(), newSetting.value.trim(), newSetting.type);
      showToast(`Setting "${newSetting.key}" added successfully`);
      setNewSetting({ key: '', value: '', type: 'string' });
      loadSettings();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to add setting.', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTarget || !editValue.trim()) return;
    setSaveLoading(true);
    try {
      await updateSetting(editTarget.setting_key, editValue.trim(), editTarget.setting_type);
      showToast(`Setting "${editTarget.setting_key}" updated`);
      setEditTarget(null);
      loadSettings();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update setting.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteSetting(deleteTarget);
      showToast(`Setting "${deleteTarget}" deleted`);
      setDeleteTarget(null);
      loadSettings();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete setting.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all";

  return (
    <div className="p-6 space-y-5">
      <Toast toast={toast} />
      <DeleteModal
        settingKey={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {settings?.length || 0} configuration{settings?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={loadSettings}
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

      {/* Add New Setting */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-500" /> Add New Setting
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Key</label>
              <input type="text" value={newSetting.key}
                onChange={e => setNewSetting(p => ({...p, key: e.target.value}))}
                className={inputCls} placeholder="e.g., clinic_name" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Value</label>
              <input type="text" value={newSetting.value}
                onChange={e => setNewSetting(p => ({...p, value: e.target.value}))}
                className={inputCls} placeholder="Setting value" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
              <select value={newSetting.type}
                onChange={e => setNewSetting(p => ({...p, type: e.target.value}))}
                className={inputCls + ' cursor-pointer'}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={handleAdd} disabled={addLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-70">
              {addLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {addLoading ? 'Adding...' : 'Add Setting'}
            </button>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" /> Configuration List
          </p>
          <span className="text-xs text-gray-400">{settings?.length || 0} settings</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
              <p className="mt-3 text-sm text-gray-500">Loading settings...</p>
            </div>
          </div>
        ) : settings?.length === 0 ? (
          <div className="py-12 text-center">
            <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No settings configured</p>
            <p className="text-gray-400 text-sm mt-1">Add your first setting above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {settings.map(setting => (
              editTarget?.setting_key === setting.setting_key ? (
                <div key={setting.setting_key} className="p-4 bg-blue-50/30">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 font-mono">
                    {setting.setting_key}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text" value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className={inputCls + ' flex-1'}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditTarget(null); }}
                    />
                    <button onClick={handleSaveEdit} disabled={saveLoading}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-70">
                      {saveLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button onClick={() => setEditTarget(null)}
                      className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <SettingRow
                  key={setting.setting_key}
                  setting={setting}
                  onEdit={s => { setEditTarget(s); setEditValue(s.setting_value); }}
                  onDelete={setDeleteTarget}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}