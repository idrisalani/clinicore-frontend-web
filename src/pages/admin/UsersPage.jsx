// ============================================
// UsersPage - Professional User Management
// File: frontend-web/src/pages/admin/UsersPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import {
  Trash2, Edit2, Plus, Search, RefreshCw, X,
  UserCheck, UserX, Shield, AlertTriangle, ChevronDown,
  Check, Loader,
} from 'lucide-react';
import UserForm from '../../components/admin/UserForm';

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const colors = {
    admin:          'bg-purple-100 text-purple-700 border-purple-200',
    doctor:         'bg-blue-100 text-blue-700 border-blue-200',
    nurse:          'bg-teal-100 text-teal-700 border-teal-200',
    pharmacist:     'bg-emerald-100 text-emerald-700 border-emerald-200',
    lab_technician: 'bg-orange-100 text-orange-700 border-orange-200',
    receptionist:   'bg-pink-100 text-pink-700 border-pink-200',
    patient:        'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  const cls = colors[(role || '').toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} capitalize`}>
      {role || 'N/A'}
    </span>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
    active
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ── Toast Notification ────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.message}
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onCancel, loading }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Delete User?</h3>
          <p className="text-sm text-gray-500 mb-1">
            You're about to delete <span className="font-semibold text-gray-700">{user.full_name || user.username}</span>.
          </p>
          <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [showForm, setShowForm]         = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [toast, setToast]               = useState(null);
  const [error, setError]               = useState('');

  const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useAdmin();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = useCallback(async () => {
    try {
      setError('');
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'You do not have permission to view users.'
        : 'Failed to load users. Please refresh.');
    }
  }, [fetchUsers]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Filtered users ──
  const filtered = (users || []).filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role?.toLowerCase() === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Create/Update ──
  const handleSubmit = async (data) => {
    try {
      if (editUser) {
        await updateUser(editUser.user_id, data);
        showToast(`${data.full_name || 'User'} updated successfully`);
      } else {
        await createUser(data);
        showToast(`${data.full_name || 'User'} created successfully`);
      }
      setShowForm(false);
      setEditUser(null);
      loadUsers();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Operation failed. Please try again.', 'error');
    }
  };

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget.user_id);
      showToast(`${deleteTarget.full_name || 'User'} deleted successfully`);
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete user.', 'error');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const roles = ['all', 'admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'patient'];

  return (
    <div className="space-y-5">
      <Toast toast={toast} />

      <DeleteModal
        user={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {users?.length || 0} users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
            title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditUser(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-purple-200"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── User Form (slide in) ── */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">{editUser ? 'Edit User' : 'Create New User'}</h3>
            <button onClick={() => { setShowForm(false); setEditUser(null); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <UserForm
              initialData={editUser}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditUser(null); }}
            />
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Role filter */}
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 bg-white appearance-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.replace('_', ' ')}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              <p className="mt-3 text-sm text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserX className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || roleFilter !== 'all' ? 'Try adjusting your filters' : 'Add the first user to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(user.full_name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user.full_name || '—'}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-5 py-4"><StatusBadge active={user.is_active} /></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditUser(user); setShowForm(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing {filtered.length} of {users?.length || 0} users
              </p>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-green-500" />
                <p className="text-xs text-gray-400">
                  {users?.filter(u => u.is_active).length || 0} active
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}