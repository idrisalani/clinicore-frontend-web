// ============================================
// useAdmin Hook - Admin State Management
// File: frontend-web/src/hooks/useAdmin.js
// ============================================

import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // DASHBOARD
  // ==========================================

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard');
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  const fetchUsers = useCallback(async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/users?limit=${limit}&offset=${offset}`);
      setUsers(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/admin/users', userData);
      await fetchUsers();
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/users/${userId}`, updates);
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const changeUserRole = useCallback(async (userId, role) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change user role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/users/${userId}/toggle`);
      await fetchUsers();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle user status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // ==========================================
  // ROLE MANAGEMENT
  // ==========================================

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/roles');
      setRoles(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch roles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoleById = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/roles/${roleId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/admin/roles', roleData);
      await fetchRoles();
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (roleId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/roles/${roleId}`, updates);
      await fetchRoles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/admin/roles/${roleId}`);
      await fetchRoles();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRoles]);

  const getUsersWithRole = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/roles/${roleId}/users`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // PERMISSION MANAGEMENT
  // ==========================================

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/permissions');
      setPermissions(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRolePermissions = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/roles/${roleId}/permissions`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignPermissionsToRole = useCallback(async (roleId, permissionIds) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/roles/${roleId}/permissions`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================

  const fetchActivityLogs = useCallback(async (limit = 100, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/activity-logs?limit=${limit}&offset=${offset}`);
      setActivityLogs(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activity logs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActivityLogById = useCallback(async (logId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/activity-logs/${logId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activity log');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserActivityLogs = useCallback(async (userId, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/users/${userId}/activity-logs?limit=${limit}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearOldActivityLogs = useCallback(async (daysOld = 90) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete('/admin/activity-logs/clear-old', {
        data: { daysOld }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clear logs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/settings');
      setSettings(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSetting = useCallback(async (key) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/settings/${key}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch setting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(async (key, value, type = 'string') => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/admin/settings/${key}`, { value, type });
      await fetchSettings();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update setting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  const deleteSetting = useCallback(async (key) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/admin/settings/${key}`);
      await fetchSettings();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete setting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  // ==========================================
  // RETURN HOOK STATE & FUNCTIONS
  // ==========================================

  return {
    // State
    users,
    roles,
    permissions,
    activityLogs,
    settings,
    loading,
    error,

    // Dashboard
    fetchDashboardStats,

    // Users
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    toggleUserStatus,

    // Roles
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    getUsersWithRole,

    // Permissions
    fetchPermissions,
    getRolePermissions,
    assignPermissionsToRole,

    // Activity Logs
    fetchActivityLogs,
    getActivityLogById,
    getUserActivityLogs,
    clearOldActivityLogs,

    // Settings
    fetchSettings,
    getSetting,
    updateSetting,
    deleteSetting,
  };
};

export default useAdmin;