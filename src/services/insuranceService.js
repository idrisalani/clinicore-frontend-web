// ============================================
// Insurance Service
// File: frontend-web/src/services/insuranceService.js
// ============================================
import api from './api';

const BASE = '/insurance';

export const getAllClaims        = (params) => api.get(BASE, { params }).then(r => r.data);
export const getClaimStats       = ()        => api.get(`${BASE}/stats`).then(r => r.data);
export const getClaimById        = (id)      => api.get(`${BASE}/${id}`).then(r => r.data);
export const getClaimsByInvoice  = (invoiceId) => api.get(`${BASE}/invoice/${invoiceId}`).then(r => r.data);
export const createClaim         = (data)    => api.post(BASE, data).then(r => r.data);
export const updateClaimStatus   = (id, data)=> api.put(`${BASE}/${id}/status`, data).then(r => r.data);
export const updateClaim         = (id, data)=> api.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteClaim         = (id)      => api.delete(`${BASE}/${id}`).then(r => r.data);