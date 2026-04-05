// ============================================
// maternityService.js
// File: frontend-web/src/services/maternityService.js
// ============================================

import api from './api';

const BASE = '/maternity';

// ── Cases ─────────────────────────────────────────────────────────────────────
export const getCases       = (params) => api.get(BASE, { params });
export const getCaseById    = (id)     => api.get(`${BASE}/${id}`);
export const getPatientCases= (pid)    => api.get(`${BASE}/patient/${pid}`);
export const getStats       = ()       => api.get(`${BASE}/stats`);
export const createCase     = (data)   => api.post(BASE, data);
export const updateCase     = (id, data) => api.put(`${BASE}/${id}`, data);

// ── ANC Visits ────────────────────────────────────────────────────────────────
export const addANCVisit    = (caseId, data) => api.post(`${BASE}/${caseId}/visits`, data);
export const updateANCVisit = (visitId, data) => api.put(`${BASE}/visits/${visitId}`, data);

// ── Delivery ──────────────────────────────────────────────────────────────────
export const recordDelivery = (caseId, data) => api.post(`${BASE}/${caseId}/delivery`, data);
export const updateDelivery = (deliveryId, data) => api.put(`${BASE}/delivery/${deliveryId}`, data);