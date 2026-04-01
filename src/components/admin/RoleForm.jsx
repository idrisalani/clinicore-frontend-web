// ============================================
// RoleForm Component - Create/Edit Roles
// File: frontend-web/src/components/admin/RoleForm.jsx
// ============================================

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function RoleForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      role_name: '',
      description: '',
      level: 5,
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const levels = [
    { value: 1, label: 'Level 1 - Super Admin (Highest)' },
    { value: 2, label: 'Level 2 - System Admin' },
    { value: 3, label: 'Level 3 - Manager' },
    { value: 4, label: 'Level 4 - Doctor' },
    { value: 5, label: 'Level 5 - Staff' },
    { value: 6, label: 'Level 6 - Patient (Lowest)' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role_name?.trim()) {
      newErrors.role_name = 'Role name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      
      if (!initialData) {
        setFormData({
          role_name: '',
          description: '',
          level: 5,
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {initialData ? 'Edit Role' : 'Create New Role'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              disabled={initialData ? true : false}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role_name ? 'border-red-500' : 'border-gray-300'
              } ${initialData ? 'bg-gray-50' : ''}`}
              placeholder="e.g., Doctor, Manager"
            />
            {errors.role_name && (
              <p className="text-red-500 text-xs mt-1">{errors.role_name}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe what this role does..."
            rows="3"
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : initialData ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}