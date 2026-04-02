import api from './api.js';

const BASE = '/billing';

export const getInvoices = async (page = 1, limit = 10, patientId = '', status = '', startDate = '', endDate = '') => {
  const response = await api.get(`${BASE}/invoices`, {
    params: { page, limit, patient_id: patientId, status, start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`${BASE}/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post(`${BASE}/invoices`, data);
  return response.data;
};

export const updateInvoice = async (id, data) => {
  const response = await api.put(`${BASE}/invoices/${id}`, data);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`${BASE}/invoices/${id}`);
  return response.data;
};

export const recordPayment = async (data) => {
  const response = await api.post(`${BASE}/payments`, data);
  return response.data;
};

export const getPayments = async (invoiceId = '', patientId = '') => {
  const response = await api.get(`${BASE}/payments`, {
    params: { invoice_id: invoiceId, patient_id: patientId },
  });
  return response.data;
};

export const getServices = async (isActive = 1) => {
  const response = await api.get(`${BASE}/services`, { params: { is_active: isActive } });
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post(`${BASE}/services`, data);
  return response.data;
};

export const getBillingStats = async (startDate = '', endDate = '') => {
  const response = await api.get(`${BASE}/stats/overview`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};