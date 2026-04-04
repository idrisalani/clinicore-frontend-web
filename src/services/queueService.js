// ============================================
// Queue Service
// File: frontend-web/src/services/queueService.js
// ============================================

import api from './api';

const BASE = '/queue';

export const getTodayQueue = async (date = '', status = '', doctorId = '', page = 1) => {
  const response = await api.get(BASE, {
    params: { date, status, doctor_id: doctorId, page, limit: 50 },
  });
  return response.data;
};

export const getNextPatient = async (doctorId = '') => {
  const response = await api.get(`${BASE}/next`, {
    params: { doctor_id: doctorId },
  });
  return response.data;
};

export const getQueueStats = async (date = '') => {
  const response = await api.get(`${BASE}/stats`, { params: { date } });
  return response.data;
};

export const getPatientQueueHistory = async (patientId, limit = 10) => {
  const response = await api.get(`${BASE}/patient/${patientId}`, { params: { limit } });
  return response.data;
};

export const checkInPatient = async (data) => {
  const response = await api.post(`${BASE}/check-in`, data);
  return response.data;
};

export const updateQueueStatus = async (queueId, status, notes = '', doctorId = '') => {
  const response = await api.put(`${BASE}/${queueId}/status`, {
    status, notes, doctor_id: doctorId || undefined,
  });
  return response.data;
};

export const updateQueueEntry = async (queueId, data) => {
  const response = await api.put(`${BASE}/${queueId}`, data);
  return response.data;
};

export const removeFromQueue = async (queueId) => {
  const response = await api.delete(`${BASE}/${queueId}`);
  return response.data;
};