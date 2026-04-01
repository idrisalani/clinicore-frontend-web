// ============================================
// RolesPage Component - Role Management
// File: frontend-web/src/pages/admin/RolesPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Trash2, Edit2, Plus, Users } from 'lucide-react';
import RoleForm from '../../components/admin/RoleForm';

export default function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [usersInRole, setUsersInRole] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { roles, loading, fetchRoles, createRole, updateRole, deleteRole, getUsersWithRole } = useAdmin();

  const loadRoles = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDelete = async (roleId) => {
    setDeleteConfirm(roleId);
  };

  const confirmDelete = async () => {
    try {
      await deleteRole(deleteConfirm);
      alert('Role deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete role: ' + err.message);
      setDeleteConfirm(null);
    }
  };

  const handleViewUsers = async (role) => {
    try {
      setSelectedRole(role);
      const users = await getUsersWithRole(role.role_id);
      setUsersInRole(users);
      setShowUsers(true);
    } catch (err) {
      alert('Failed to load users: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Roles Management</h2>
        <button
          onClick={() => {
            setEditingRole(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Role?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this role? Users with this role will be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <RoleForm
          onSubmit={editingRole ? updateRole : createRole}
          onCancel={() => {
            setShowForm(false);
            setEditingRole(null);
          }}
          initialData={editingRole}
        />
      )}

      {showUsers && selectedRole && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Users in {selectedRole.role_name}</h3>
            <button
              onClick={() => setShowUsers(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {usersInRole.length === 0 ? (
            <p className="text-gray-500">No users in this role</p>
          ) : (
            <div className="space-y-2">
              {usersInRole.map(user => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{user.full_name || user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.map(role => (
            <div key={role.role_id} className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{role.role_name}</h3>
                  <p className="text-sm text-gray-500">Level {role.level}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description || 'No description'}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewUsers(role)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition text-sm"
                >
                  <Users size={16} />
                  Users
                </button>
                <button
                  onClick={() => {
                    setEditingRole(role);
                    setShowForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition text-sm"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role.role_id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 transition text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}