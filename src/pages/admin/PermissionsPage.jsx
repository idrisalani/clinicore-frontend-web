// ============================================
// PermissionsPage Component - Permission Management
// File: frontend-web/src/pages/admin/PermissionsPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Save } from 'lucide-react';

export default function PermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { fetchRoles, fetchPermissions, getRolePermissions, assignPermissionsToRole } = useAdmin();

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        fetchRoles(),
        fetchPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      
      // Load permissions for first role
      if (rolesData.length > 0) {
        const firstRole = rolesData[0];
        setSelectedRole(firstRole);
        const perms = await getRolePermissions(firstRole.role_id);
        setRolePermissions(perms);
        setSelectedPermissions(perms.map(p => p.permission_id));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchRoles, fetchPermissions, getRolePermissions]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadRolePermissions = async (roleId) => {
    try {
      setLoading(true);
      const role = roles.find(r => r.role_id === roleId);
      setSelectedRole(role);
      const perms = await getRolePermissions(roleId);
      setRolePermissions(perms);
      setSelectedPermissions(perms.map(p => p.permission_id));
    } catch (err) {
      alert('Failed to load permissions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      await assignPermissionsToRole(selectedRole.role_id, selectedPermissions);
      alert('Permissions updated successfully');
      loadRolePermissions(selectedRole.role_id);
    } catch (err) {
      alert('Failed to update permissions: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPermissions(rolePermissions.map(p => p.permission_id));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const hasChanges = JSON.stringify(selectedPermissions.sort()) !==
    JSON.stringify(rolePermissions.map(p => p.permission_id).sort());

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Permissions Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-200 h-fit">
            <h3 className="text-lg font-bold mb-4">Select Role</h3>
            <div className="space-y-2">
              {roles?.map(role => (
                <button
                  key={role.role_id}
                  onClick={() => loadRolePermissions(role.role_id)}
                  className={`w-full text-left px-4 py-2 rounded transition ${
                    selectedRole?.role_id === role.role_id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <p className="font-semibold">{role.role_name}</p>
                  <p className="text-xs opacity-75">Level {role.level}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : selectedRole ? (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedRole.role_name}</h3>
                  <p className="text-sm text-gray-600">{selectedRole.description}</p>
                </div>
                <div className="flex gap-2">
                  {hasChanges && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-white transition ${
                      hasChanges && !saving
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="border-t pt-6 first:border-t-0 first:pt-0">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                      {resource}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map(perm => (
                        <label
                          key={perm.permission_id}
                          className="flex items-start gap-3 p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.permission_id)}
                            onChange={() => handlePermissionToggle(perm.permission_id)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{perm.name}</p>
                            <p className="text-xs text-gray-600">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a role to manage permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}