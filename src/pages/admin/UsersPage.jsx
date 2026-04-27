// ============================================
// UsersPage.jsx
// File: frontend-web/src/pages/admin/UsersPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, RefreshCw,
  Edit2, Trash2, X, Loader, User, Shield,
} from 'lucide-react';
import api from '../../services/api.js';
import UserForm from '../../components/admin/UserForm.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPhone = (raw = '') => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('234') && d.length >= 13)
    return `+234-${d.slice(3,6)}-${d.slice(6,9)}-${d.slice(9)}`;
  if (d.startsWith('0') && d.length === 11)
    return `+234-${d.slice(1,4)}-${d.slice(4,7)}-${d.slice(7)}`;
  return raw || '—';
};

const friendlyError = (err) => {
  const msg = err?.response?.data?.error || err?.message || 'Something went wrong';
  if (msg.includes('UNIQUE constraint failed: users.email'))    return 'This email address is already registered.';
  if (msg.includes('UNIQUE constraint failed: users.username')) return 'This username is already taken.';
  if (msg.includes('UNIQUE constraint failed'))                 return 'A user with these details already exists.';
  if (msg.includes('NOT NULL constraint'))                      return 'Please fill in all required fields.';
  return msg;
};

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700', super_admin: 'bg-red-100 text-red-800',
  doctor: 'bg-blue-100 text-blue-700', nurse: 'bg-teal-100 text-teal-700',
  pharmacist: 'bg-purple-100 text-purple-700', lab_tech: 'bg-amber-100 text-amber-700',
  receptionist: 'bg-green-100 text-green-700', manager: 'bg-orange-100 text-orange-700',
  staff: 'bg-slate-100 text-slate-600', patient: 'bg-gray-100 text-gray-600',
};
const roleBadge = (role) =>
  `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
   ${ROLE_COLORS[role?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`;

const avatarBg = (name = '') => {
  const c = ['bg-teal-500','bg-blue-500','bg-purple-500','bg-red-500','bg-amber-500','bg-green-500'];
  return c[(name.charCodeAt(0) || 0) % c.length];
};
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';

// ── Confirm delete modal ──────────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onCancel, isLoading }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">Delete User?</h3>
        <p className="text-sm text-slate-500 text-center mb-6">
          You are about to delete <span className="font-bold">{user.full_name}</span>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users,        setUsers]       = useState([]);
  const [roles,        setRoles]       = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [search,       setSearch]      = useState('');
  const [roleFilter,   setRoleFilter]  = useState('');
  const [showCreate,   setShowCreate]  = useState(false);
  const [editUser,     setEditUser]    = useState(null);
  const [deleteUser,   setDeleteUser]  = useState(null);
  const [submitting,   setSubmitting]  = useState(false);
  const [createError,  setCreateError] = useState('');
  const [editError,    setEditError]   = useState('');
  const [toast,        setToast]       = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { limit: 200 } });
      // Handle ALL possible response shapes from adminController
      // Shape A: { users: [...] }           — CliniCore standard
      // Shape B: { data: [...] }            — some controllers
      // Shape C: { status:'success', data: [...] } — older pattern
      // Shape D: [...]                      — raw array
      const d = res.data;
      const list = d?.users
        || (Array.isArray(d?.data) ? d.data : null)
        || (Array.isArray(d)       ? d       : null)
        || [];
      setUsers(list);
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch roles with static fallback
  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get('/admin/roles');
      const fetched = res.data.roles || [];
      if (fetched.length > 0) { setRoles(fetched); return; }
    } catch {}
    setRoles([
      { role_id: 1, role_name: 'admin',        description: 'Full system access' },
      { role_id: 2, role_name: 'doctor',       description: 'Clinical staff' },
      { role_id: 3, role_name: 'nurse',        description: 'Nursing staff' },
      { role_id: 4, role_name: 'pharmacist',   description: 'Pharmacy staff' },
      { role_id: 5, role_name: 'lab_tech',     description: 'Laboratory staff' },
      { role_id: 6, role_name: 'receptionist', description: 'Front desk' },
      { role_id: 7, role_name: 'patient',      description: 'Patient user' },
    ]);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]);

  // Create
  const handleCreate = async (data) => {
    setSubmitting(true);
    setCreateError('');
    try {
      await api.post('/admin/users', data);
      showToast('User created successfully');
      setShowCreate(false);
      setCreateError('');
      await fetchUsers();  // await so table refreshes before spinner stops
    } catch (err) {
      const msg = friendlyError(err);
      setCreateError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit
  const handleEdit = async (data) => {
    setSubmitting(true);
    setEditError('');
    try {
      await api.put(`/admin/users/${editUser.user_id}`, data);
      showToast('User updated successfully');
      setEditUser(null);
      setEditError('');
      await fetchUsers();
    } catch (err) {
      const msg = friendlyError(err);
      setEditError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/users/${deleteUser.user_id}`);
      showToast('User deleted');
      setDeleteUser(null);
      await fetchUsers();
    } catch (err) {
      showToast(friendlyError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role?.toLowerCase() === roleFilter;
    return matchSearch && matchRole;
  });

  const sel = `px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
    focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none appearance-none cursor-pointer`;

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Users Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {users.length} users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => { setShowCreate(true); setCreateError(''); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Create form — inline panel, key forces fresh UserForm on each open */}
      {showCreate && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Create New User</h3>
            <button onClick={() => { setShowCreate(false); setCreateError(''); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <UserForm
              key="create"
              roles={roles}
              onSubmit={handleCreate}
              onCancel={() => { setShowCreate(false); setCreateError(''); }}
              isLoading={submitting}
              serverError={createError}
            />
          </div>
        </div>
      )}

      {/* Edit form — inline panel */}
      {editUser && (
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Edit User: {editUser.full_name}</h3>
            <button onClick={() => { setEditUser(null); setEditError(''); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <UserForm
              key={editUser.user_id}
              initialData={editUser}
              roles={roles}
              onSubmit={handleEdit}
              onCancel={() => { setEditUser(null); setEditError(''); }}
              isLoading={submitting}
              serverError={editError}
            />
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search by name, email or username…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
              focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={sel}>
          <option value="">All Roles</option>
          {roles.map(r => {
            const name = r.role_name || r.name || '';
            return <option key={r.role_id || name} value={name.toLowerCase()}>{name}</option>;
          })}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 rounded-full animate-spin"
              style={{ border: '3px solid #e2e8f0', borderTopColor: '#3b82f6' }} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['User','Email','Role','Status','Phone','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${avatarBg(u.full_name)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold text-white">{initials(u.full_name)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{u.full_name}</p>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                      ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{formatPhone(u.phone)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setEditUser(u); setEditError(''); }}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteUser(u)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete modal */}
      <DeleteModal
        user={deleteUser}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
        isLoading={submitting}
      />
    </div>
  );
}