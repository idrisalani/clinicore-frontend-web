import api from './api.js';

const BASE = '/pharmacy';

export const getPrescriptions = async (page = 1, limit = 10, patientId = '', status = '') => {
  const response = await api.get(`${BASE}/prescriptions`, {
    params: { page, limit, patient_id: patientId, status },
  });
  return response.data;
};

export const getPrescriptionById = async (id) => {
  const response = await api.get(`${BASE}/prescriptions/${id}`);
  return response.data;
};

export const getPatientPrescriptions = async (patientId) => {
  const response = await api.get(`${BASE}/prescriptions/patient/${patientId}`);
  return response.data;
};

export const createPrescription = async (data) => {
  const response = await api.post(`${BASE}/prescriptions`, data);
  return response.data;
};

export const updatePrescription = async (id, data) => {
  const response = await api.put(`${BASE}/prescriptions/${id}`, data);
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await api.delete(`${BASE}/prescriptions/${id}`);
  return response.data;
};

export const getMedications = async (search = '', isActive = 1) => {
  const response = await api.get(`${BASE}/medications`, {
    params: { search, is_active: isActive },
  });
  return response.data;
};

export const getMedicationById = async (id) => {
  const response = await api.get(`${BASE}/medications/${id}`);
  return response.data;
};

export const createMedication = async (data) => {
  const response = await api.post(`${BASE}/medications`, data);
  return response.data;
};

export const getPharmacyStats = async () => {
  const response = await api.get(`${BASE}/stats/overview`);
  return response.data;
};