import api from './api.js';

const BASE = '/appointments';

export const getAppointments = async (page = 1, limit = 10, status = '', doctorId = '', fromDate = '', toDate = '') => {
  const response = await api.get(BASE, {
    params: { page, limit, status, doctor_id: doctorId, from_date: fromDate, to_date: toDate },
  });
  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await api.get(`${BASE}/${id}`);
  return response.data;
};

export const getPatientAppointments = async (patientId, upcoming = true) => {
  const response = await api.get(`${BASE}/patient/${patientId}`, { params: { upcoming } });
  return response.data;
};

export const getDoctorAvailability = async (doctorId, date) => {
  const response = await api.get(`${BASE}/doctor/${doctorId}/availability`, {
    params: { doctor_id: doctorId, date },
  });
  return response.data;
};

export const getAppointmentStats = async () => {
  const response = await api.get(`${BASE}/stats/overview`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post(BASE, data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await api.put(`${BASE}/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};