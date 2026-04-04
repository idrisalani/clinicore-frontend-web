// ============================================
// Financial Report Service
// File: frontend-web/src/services/financialReportService.js
// ============================================
import api from './api';

const BASE = '/billing';

export const getFinancialSummary    = ()       => api.get(`${BASE}/reports/summary`).then(r => r.data);
export const getRevenueReport       = (params) => api.get(`${BASE}/reports/revenue`, { params }).then(r => r.data);
export const getRevenueByService    = (params) => api.get(`${BASE}/reports/by-service`, { params }).then(r => r.data);
export const getOutstandingReport   = ()       => api.get(`${BASE}/reports/outstanding`).then(r => r.data);