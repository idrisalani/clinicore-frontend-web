import api from './api.js';

const BASE = '/lab';

export const getLabOrders = async (page = 1, limit = 10, patientId = '', status = '') => {
  const response = await api.get(BASE, {
    params: { page, limit, patient_id: patientId, status },
  });
  return response.data;
};

export const getLabOrderById = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const getPatientLabOrders = async (patientId, limit = 10) => {
  const response = await api.get(`${BASE}/patient/${patientId}`, { params: { limit } });
  return response.data;
};

export const getLabStats = async () => {
  const response = await api.get(`${BASE}/stats/overview`);
  return response.data;
};

export const createLabOrder = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

export const addLabResult = async (orderId, data) => {
  const response = await api.post(`${BASE}/${orderId}/results`, data);
  return response.data;
};

export const updateLabOrder = async (id, data) => {
  const response = await api.put(`${BASE}/${id}`, data);
  return response.data;
};

export const deleteLabOrder = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};