import api from './api.js';

const PATIENTS_API = '/patients';

// ==========================================
// GET Endpoints
// ==========================================

/**
 * Get all patients with pagination and search
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {string} search - Search query
 * @returns {Promise}
 */
export const getPatients = async (page = 1, limit = 10, search = '') => {
  try {
    console.log(`📋 Fetching patients - Page: ${page}, Search: "${search}"`);
    const response = await api.get(PATIENTS_API, {
      params: { page, limit, search },
    });
    console.log(`✅ Patients fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    throw error;
  }
};

/**
 * Get single patient by ID
 * @param {number} id - Patient ID
 * @returns {Promise}
 */
export const getPatientById = async (id) => {
  try {
    console.log(`👤 Fetching patient: ${id}`);
    const response = await api.get(`${PATIENTS_API}/${id}`);
    console.log(`✅ Patient fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    throw error;
  }
};

/**
 * Search patients
 * @param {string} q - Search query
 * @returns {Promise}
 */
export const searchPatients = async (q) => {
  try {
    console.log(`🔍 Searching patients: "${q}"`);
    const response = await api.get(`${PATIENTS_API}/search`, {
      params: { q },
    });
    console.log(`✅ Search results:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error searching patients:', error);
    throw error;
  }
};

/**
 * Get patient medical history
 * @param {number} id - Patient ID
 * @returns {Promise}
 */
export const getPatientMedicalHistory = async (id) => {
  try {
    console.log(`📋 Fetching medical history for patient: ${id}`);
    const response = await api.get(`${PATIENTS_API}/${id}/medical-history`);
    console.log(`✅ Medical history fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching medical history:', error);
    throw error;
  }
};

/**
 * Get patient statistics
 * @returns {Promise}
 */
export const getPatientStats = async () => {
  try {
    console.log('📊 Fetching patient statistics');
    const response = await api.get(`${PATIENTS_API}/stats/overview`);
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
 * Create new patient
 * @param {object} patientData - Patient information
 * @returns {Promise}
 */
export const createPatient = async (patientData) => {
  try {
    console.log('➕ Creating patient:', patientData);
    const response = await api.post(PATIENTS_API, patientData);
    console.log(`✅ Patient created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating patient:', error);
    throw error;
  }
};

// ==========================================
// PUT Endpoints
// ==========================================

/**
 * Update patient
 * @param {number} id - Patient ID
 * @param {object} patientData - Updated patient information
 * @returns {Promise}
 */
export const updatePatient = async (id, patientData) => {
  try {
    console.log(`✏️ Updating patient: ${id}`, patientData);
    const response = await api.put(`${PATIENTS_API}/${id}`, patientData);
    console.log(`✅ Patient updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    throw error;
  }
};

// ==========================================
// DELETE Endpoints
// ==========================================

/**
 * Delete patient (soft delete)
 * @param {number} id - Patient ID
 * @returns {Promise}
 */
export const deletePatient = async (id) => {
  try {
    console.log(`🗑️ Deleting patient: ${id}`);
    const response = await api.delete(`${PATIENTS_API}/${id}`);
    console.log(`✅ Patient deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting patient:', error);
    throw error;
  }
};