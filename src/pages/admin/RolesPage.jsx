// ============================================
// RolesPage - Professional Role Management
// File: frontend-web/src/pages/admin/RolesPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Trash2, Edit2, Plus, Users, X, Shield,
  AlertTriangle, Check, Loader, RefreshCw,
} from 'lucide-react';
import RoleForm from '../../components/admin/RoleForm';

// ── Level Badge ───────────────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const colors = [
    '', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700',
    'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700', 'bg-gray-100 text-gray-600',
  ];
  const cls = colors[level] || colors[colors.length - 1];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>
      Level {level}
    </span>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
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

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ role, onConfirm, onCancel, loading }) => {
  if (!role) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Role?</h3>
          <p className="text-sm text-gray-500 mb-1">
            You're about to delete <span className="font-semibold text-gray-700">"{role.role_name}"</span>.
          </p>
          <p className="text-xs text-red-500 mb-6">Users assigned this role will be affected.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {loading ? 'Deleting...' : 'Delete Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Users Panel ───────────────────────────────────────────────────────────────
const UsersPanel = ({ role, users, onClose }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">Users in "{role.role_name}"</p>
          <p className="text-xs text-gray-400">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
    <div className="p-4">
      {users.length === 0 ? (
        <div className="py-6 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No users assigned this role</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.full_name || user.username}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                user.is_active
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Role Card ─────────────────────────────────────────────────────────────────
const RoleCard = ({ role, onEdit, onDelete, onViewUsers }) => {
  const accentColors = [
    '', 'from-red-500 to-rose-600', 'from-orange-500 to-amber-600',
    'from-yellow-500 to-orange-500', 'from-blue-500 to-indigo-600',
    'from-teal-500 to-emerald-600', 'from-gray-500 to-slate-600',
  ];
  const accent = accentColors[role.level] || accentColors[accentColors.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{role.role_name}</h3>
            <LevelBadge level={role.level} />
          </div>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
            <Shield className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[2rem]">
          {role.description || 'No description provided'}
        </p>
        <div className="flex gap-1.5">
          <button onClick={() => onViewUsers(role)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all">
            <Users className="w-3.5 h-3.5" /> Users
          </button>
          <button onClick={() => onEdit(role)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-all">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(role)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [showForm,      setShowForm]      = useState(false);
  const [editingRole,   setEditingRole]   = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [usersPanel,    setUsersPanel]    = useState(null);
  const [usersInRole,   setUsersInRole]   = useState([]);
  const [toast,         setToast]         = useState(null);
  const [error,         setError]         = useState('');

  const { roles, loading, fetchRoles, createRole, updateRole, deleteRole, getUsersWithRole } = useAdmin();

  // Stable showToast — won't cause re-render loops if used in effects
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setError('');
      await fetchRoles();
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Admin access required.'
        : 'Failed to load roles.');
    }
  }, [fetchRoles]);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const handleViewUsers = async (role) => {
    try {
      const users = await getUsersWithRole(role.role_id);
      setUsersInRole(users);
      setUsersPanel(role);
    } catch {
      showToast('Failed to load users for this role.', 'error');
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.role_id, data);
        showToast(`Role "${data.role_name || editingRole.role_name}" updated`);
      } else {
        await createRole(data);
        showToast(`Role "${data.role_name}" created successfully`);
      }
      setShowForm(false);
      setEditingRole(null);
      loadRoles();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Operation failed.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteRole(deleteTarget.role_id);
      showToast(`Role "${deleteTarget.role_name}" deleted`);
      setDeleteTarget(null);
      loadRoles();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete role.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeForm = () => { setShowForm(false); setEditingRole(null); };

  return (
    <div className="p-6 space-y-5">
      <Toast toast={toast} />
      <DeleteModal
        role={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Roles Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{roles?.length || 0} roles configured</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadRoles}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditingRole(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Role Form — inline panel, key forces fresh mount on each open */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button onClick={closeForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {/* key prop ensures RoleForm remounts fresh on each open — fixes typing issue */}
            <RoleForm
              key={editingRole?.role_id ?? 'new-role'}
              initialData={editingRole}
              onSubmit={handleSubmit}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}

      {/* Users Panel */}
      {usersPanel && (
        <UsersPanel
          role={usersPanel}
          users={usersInRole}
          onClose={() => { setUsersPanel(null); setUsersInRole([]); }}
        />
      )}

      {/* Roles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <p className="mt-3 text-sm text-gray-500">Loading roles...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.map(role => (
            <RoleCard
              key={role.role_id}
              role={role}
              onEdit={r => { setEditingRole(r); setShowForm(true); }}
              onDelete={setDeleteTarget}
              onViewUsers={handleViewUsers}
            />
          ))}
        </div>
      )}
    </div>
  );
}