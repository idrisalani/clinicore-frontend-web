// ============================================
// maternityService.js
// File: frontend-web/src/services/maternityService.js
// Used by MaternityPage.jsx
// ============================================
import api from './api.js';

const BASE = '/maternity';

export const getCases       = (params) => api.get(BASE, { params });
export const getCaseById    = (id)     => api.get(`${BASE}/${id}`);
export const getPatientCases= (pid)    => api.get(`${BASE}/patient/${pid}`);
export const getStats       = ()       => api.get(`${BASE}/stats`);
export const createCase     = (data)   => api.post(BASE, data);
export const updateCase     = (id, data) => api.put(`${BASE}/${id}`, data);

export const addANCVisit    = (id, data)      => api.post(`${BASE}/${id}/visits`, data);
export const updateANCVisit = (visitId, data) => api.put(`${BASE}/visits/${visitId}`, data);

export const recordDelivery = (id, data)          => api.post(`${BASE}/${id}/delivery`, data);
export const updateDelivery = (deliveryId, data)  => api.put(`${BASE}/delivery/${deliveryId}`, data);