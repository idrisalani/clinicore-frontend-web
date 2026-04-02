import api from './api.js';

const BASE = '/patients';

export const getPatients = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(BASE, { params: { page, limit, search } });
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const searchPatients = async (q) => {
  const response = await api.get(`${BASE}/search`, { params: { q } });
  return response.data;
};

export const getPatientMedicalHistory = async (id) => {
  const response = await api.get(`${BASE}/${id}/medical-history`);
  return response.data;
};

export const getPatientStats = async () => {
  const response = await api.get(`${BASE}/stats/overview`);
  return response.data;
};

export const createPatient = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

export const updatePatient = async (id, data) => {
  const response = await api.put(`${BASE}/${id}`, data);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};