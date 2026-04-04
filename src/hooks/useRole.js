// ============================================
// useRole Hook — Central RBAC for CliniCore
// File: frontend-web/src/hooks/useRole.js
// ============================================

/**
 * Reads the current user's role from localStorage and returns
 * a permissions object for every module. Import this in any page
 * to gate buttons, actions and entire sections by role.
 *
 * Usage:
 *   const { role, permissions } = useRole();
 *   const { canCreate, canEdit, canDelete, canView, isBlocked } = permissions.patients;
 */

// ── Permission matrix ─────────────────────────────────────────────────────────
// Each role gets { canView, canCreate, canEdit, canDelete, extras }
// extras = role-specific flags (e.g. canPrescribe, canDispense, canAddResult)
const PERMISSIONS = {
  admin: {
    patients:      { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
    appointments:  { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
    consultations: { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
    lab:           { canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canAddResult: true  },
    pharmacy:      { canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canPrescribe: true, canDispense: true },
    billing:       { canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canRecordPayment: true },
    queue:         { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
  },
  doctor: {
    patients:      { canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
    appointments:  { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
    consultations: { canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
    lab:           { canView: true,  canCreate: true,  canEdit: false, canDelete: false, canAddResult: false },
    pharmacy:      { canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canPrescribe: true, canDispense: false },
    billing:       { canView: true,  canCreate: false, canEdit: false, canDelete: false, canRecordPayment: false },
    queue:         { canView: true,  canCreate: false, canEdit: true,  canDelete: false },  // can call/update but not check-in
  },
  nurse: {
    patients:      { canView: true,  canCreate: false, canEdit: true,  canDelete: false },
    appointments:  { canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
    consultations: { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    lab:           { canView: true,  canCreate: false, canEdit: false, canDelete: false, canAddResult: true  },
    pharmacy:      { canView: true,  canCreate: false, canEdit: false, canDelete: false, canPrescribe: false, canDispense: false },
    billing:       { canView: true,  canCreate: false, canEdit: false, canDelete: false, canRecordPayment: false },
    queue:         { canView: true,  canCreate: true,  canEdit: true,  canDelete: false }, // can check-in & update status
  },
  pharmacist: {
    patients:      { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    appointments:  { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    consultations: { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    lab:           { canView: true,  canCreate: false, canEdit: false, canDelete: false, canAddResult: false },
    pharmacy:      { canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canPrescribe: false, canDispense: true },
    billing:       { canView: true,  canCreate: false, canEdit: false, canDelete: false, canRecordPayment: true },
    queue:         { canView: true,  canCreate: false, canEdit: false, canDelete: false }, // view only
  },
  lab_technician: {
    patients:      { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    appointments:  { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    consultations: { canView: true,  canCreate: false, canEdit: false, canDelete: false },
    lab:           { canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canAddResult: true  },
    pharmacy:      { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true },
    billing:       { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true },
    queue:         { canView: true,  canCreate: false, canEdit: false, canDelete: false }, // view only
  },
  receptionist: {
    patients:      { canView: true,  canCreate: true,  canEdit: false, canDelete: false },
    appointments:  { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
    consultations: { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true },
    lab:           { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true },
    pharmacy:      { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true },
    billing:       { canView: true,  canCreate: true,  canEdit: false, canDelete: false, canRecordPayment: true },
    queue:         { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  }, // full queue — receptionist owns this
  },
  patient: {
    patients:      { canView: true,  canCreate: false, canEdit: false, canDelete: false, ownOnly: true },
    appointments:  { canView: true,  canCreate: true,  canEdit: false, canDelete: false, ownOnly: true },
    consultations: { canView: true,  canCreate: false, canEdit: false, canDelete: false, ownOnly: true },
    lab:           { canView: true,  canCreate: false, canEdit: false, canDelete: false, ownOnly: true, canAddResult: false },
    pharmacy:      { canView: true,  canCreate: false, canEdit: false, canDelete: false, ownOnly: true, canPrescribe: false },
    billing:       { canView: true,  canCreate: false, canEdit: false, canDelete: false, ownOnly: true, canRecordPayment: true },
    queue:         { canView: false, canCreate: false, canEdit: false, canDelete: false, isBlocked: true }, // patients don't see queue
  },
};

// Default fallback — view only, nothing else
const DEFAULT_PERMS = {
  canView: true, canCreate: false, canEdit: false, canDelete: false,
  canAddResult: false, canPrescribe: false, canDispense: false,
  canRecordPayment: false, isBlocked: false, ownOnly: false,
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useRole = () => {
  let role = '';
  let userId = null;
  try {
    const stored = localStorage.getItem('clinicore_user');
    if (stored && stored !== 'null' && stored !== 'undefined') {
      const u = JSON.parse(stored);
      const userData = u?.user || u;
      role = (userData?.role || '').toLowerCase().replace(/\s+/g, '_');
      userId = userData?.user_id || null;
    }
  } catch (_) {}

  const rolePerms = PERMISSIONS[role] || {};

  const getModulePerms = (module) => {
    const base = rolePerms[module] || DEFAULT_PERMS;
    return {
      ...DEFAULT_PERMS,
      ...base,
      isBlocked: base.isBlocked === true,
    };
  };

  return {
    role,
    userId,
    isAdmin:       role === 'admin',
    isDoctor:      role === 'doctor',
    isNurse:       role === 'nurse',
    isPharmacist:  role === 'pharmacist',
    isLabTech:     role === 'lab_technician',
    isReceptionist:role === 'receptionist',
    isPatient:     role === 'patient',
    permissions: {
      patients:      getModulePerms('patients'),
      appointments:  getModulePerms('appointments'),
      consultations: getModulePerms('consultations'),
      lab:           getModulePerms('lab'),
      pharmacy:      getModulePerms('pharmacy'),
      billing:       getModulePerms('billing'),
      queue:         getModulePerms('queue'),
    },
  };
};

export default useRole;