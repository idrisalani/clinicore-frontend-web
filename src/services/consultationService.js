import api from './api.js';

const BASE = '/consultations';

export const getConsultations = async (page = 1, limit = 10, patientId = '', status = '') => {
  const response = await api.get(BASE, {
    params: { page, limit, patient_id: patientId, status },
  });
  return response.data;
};

export const getConsultationById = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const getPatientConsultations = async (patientId, limit = 10) => {
  const response = await api.get(`${BASE}/patient/${patientId}`, { params: { limit } });
  return response.data;
};

export const getConsultationStats = async () => {
  const response = await api.get(`${BASE}/stats/overview`);
  return response.data;
};

export const createConsultation = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

export const updateConsultation = async (id, data) => {
  const response = await api.put(`${BASE}/${id}`, data);
  return response.data;
};

export const deleteConsultation = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};