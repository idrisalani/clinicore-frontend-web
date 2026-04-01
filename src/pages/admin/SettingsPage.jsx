// ============================================
// SettingsPage Component - System Settings
// File: frontend-web/src/pages/admin/SettingsPage.jsx
// ============================================

import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [newSetting, setNewSetting] = useState({ key: '', value: '', type: 'string' });
  const [editingSetting, setEditingSetting] = useState(null);
  const [editValue, setEditValue] = useState('');
  const { settings, loading, fetchSettings, getSetting, updateSetting, deleteSetting } = useAdmin();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      await fetchSettings();
    } catch (err) {
      alert('Failed to load settings: ' + err.message);
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await updateSetting(newSetting.key, newSetting.value, newSetting.type);
      setNewSetting({ key: '', value: '', type: 'string' });
      await loadSettings();
    } catch (err) {
      alert('Failed to add setting: ' + err.message);
    }
  };

  const handleUpdateSetting = async (key) => {
    try {
      await updateSetting(key, editValue);
      setEditingSetting(null);
      await loadSettings();
    } catch (err) {
      alert('Failed to update setting: ' + err.message);
    }
  };

  const handleDeleteSetting = async (key) => {
    if (confirm(`Are you sure you want to delete this setting?`)) {
      try {
        await deleteSetting(key);
        await loadSettings();
      } catch (err) {
        alert('Failed to delete setting: ' + err.message);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">System Settings</h2>

      {/* Add New Setting */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Add New Setting</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
            <input
              type="text"
              value={newSetting.key}
              onChange={(e) => setNewSetting(prev => ({...prev, key: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., app_name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input
              type="text"
              value={newSetting.value}
              onChange={(e) => setNewSetting(prev => ({...prev, value: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Setting value"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={newSetting.type}
              onChange={(e) => setNewSetting(prev => ({...prev, type: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSetting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Setting
            </button>
          </div>
        </div>
      </div>

      {/* Settings List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {settings?.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No settings configured yet
            </div>
          ) : (
            <div className="divide-y">
              {settings?.map(setting => (
                <div key={setting.setting_key} className="p-6 hover:bg-gray-50 transition">
                  {editingSetting === setting.setting_key ? (
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {setting.setting_key}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleUpdateSetting(setting.setting_key)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Save size={18} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSetting(null)}
                            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{setting.setting_key}</h4>
                        <p className="text-gray-600 mt-1 break-all">{setting.setting_value}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Type: <span className="font-mono">{setting.setting_type || 'string'}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSetting(setting.setting_key);
                            setEditValue(setting.setting_value);
                          }}
                          className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.setting_key)}
                          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 flex items-center gap-2 text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}