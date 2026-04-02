import React from 'react';
import AccessDenied from './AccessDenied';

/**
 * RoleGuard — protects routes by role
 * 
 * Usage:
 *   <RoleGuard allowedRoles={['admin']}>
 *     <AdminPage />
 *   </RoleGuard>
 *
 *   <RoleGuard allowedRoles={['admin', 'doctor']}>
 *     <SharedPage />
 *   </RoleGuard>
 */
const RoleGuard = ({ allowedRoles = [], children }) => {
  let userRole = '';
  try {
    const stored = localStorage.getItem('clinicore_user');
    if (stored && stored !== 'null' && stored !== 'undefined') {
      const u = JSON.parse(stored);
      const userData = u?.user || u;
      userRole = (userData?.role || '').toLowerCase();
    }
  } catch (_) {}

  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

  if (!normalizedAllowed.includes(userRole)) {
    return (
      <AccessDenied
        message={`This area requires ${allowedRoles.join(' or ')} access. Your current role (${userRole || 'unknown'}) does not have permission.`}
      />
    );
  }

  return children;
};

export default RoleGuard;