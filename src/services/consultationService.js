import api from './api.js';

const CONSULTATIONS_API = '/consultations';

// ==========================================
// GET Endpoints
// ==========================================

/**
 * Get all consultations with pagination
 */
export const getConsultations = async (page = 1, limit = 10, patientId = '', status = '') => {
  try {
    console.log('📝 Fetching consultations...');
    const response = await api.get(CONSULTATIONS_API, {
      params: {
        page,
        limit,
        patient_id: patientId,
        status,
      },
    });
    console.log(`✅ Consultations fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching consultations:', error);
    throw error;
  }
};

/**
 * Get single consultation
 */
export const getConsultationById = async (id) => {
  try {
    console.log(`📝 Fetching consultation ${id}...`);
    const response = await api.get(`${CONSULTATIONS_API}/${id}`);
    console.log(`✅ Consultation fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching consultation:', error);
    throw error;
  }
};

/**
 * Get consultations for a specific patient
 */
export const getPatientConsultations = async (patientId, limit = 10) => {
  try {
    console.log(`📝 Fetching consultations for patient ${patientId}...`);
    const response = await api.get(`${CONSULTATIONS_API}/patient/${patientId}`, {
      params: { limit },
    });
    console.log(`✅ Patient consultations fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient consultations:', error);
    throw error;
  }
};

/**
 * Get consultation statistics
 */
export const getConsultationStats = async () => {
  try {
    console.log('📊 Fetching consultation statistics...');
    const response = await api.get(`${CONSULTATIONS_API}/stats/overview`);
    console.log(`✅ Statistics fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    throw error;
  }
};

// ==========================================
// POST Endpoints
// ==========================================

/**
 * Create new consultation
 */
export const createConsultation = async (consultationData) => {
  try {
    console.log('➕ Creating consultation:', consultationData);
    const response = await api.post(CONSULTATIONS_API, consultationData);
    console.log(`✅ Consultation created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating consultation:', error);
    throw error;
  }
};

// ==========================================
// PUT Endpoints
// ==========================================

/**
 * Update consultation
 */
export const updateConsultation = async (id, consultationData) => {
  try {
    console.log(`✏️ Updating consultation ${id}:`, consultationData);
    const response = await api.put(`${CONSULTATIONS_API}/${id}`, consultationData);
    console.log(`✅ Consultation updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating consultation:', error);
    throw error;
  }
};

// ==========================================
// DELETE Endpoints
// ==========================================

/**
 * Delete consultation
 */
export const deleteConsultation = async (id) => {
  try {
    console.log(`🗑️ Deleting consultation ${id}...`);
    const response = await api.delete(`${CONSULTATIONS_API}/${id}`);
    console.log(`✅ Consultation deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting consultation:', error);
    throw error;
  }
};