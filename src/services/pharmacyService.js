import api from './api.js';

const PHARMACY_API = '/pharmacy';

// ==========================================
// PRESCRIPTION ENDPOINTS
// ==========================================

/**
 * Get all prescriptions
 */
export const getPrescriptions = async (page = 1, limit = 10, patientId = '', status = '') => {
  try {
    console.log('💊 Fetching prescriptions...');
    const response = await api.get(`${PHARMACY_API}/prescriptions`, {
      params: {
        page,
        limit,
        patient_id: patientId,
        status,
      },
    });
    console.log(`✅ Prescriptions fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error);
    throw error;
  }
};

/**
 * Get single prescription
 */
export const getPrescriptionById = async (id) => {
  try {
    console.log(`💊 Fetching prescription ${id}...`);
    const response = await api.get(`${PHARMACY_API}/prescriptions/${id}`);
    console.log(`✅ Prescription fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching prescription:', error);
    throw error;
  }
};

/**
 * Get prescriptions for a patient
 */
export const getPatientPrescriptions = async (patientId) => {
  try {
    console.log(`💊 Fetching prescriptions for patient ${patientId}...`);
    const response = await api.get(`${PHARMACY_API}/prescriptions/patient/${patientId}`);
    console.log(`✅ Patient prescriptions fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient prescriptions:', error);
    throw error;
  }
};

/**
 * Create prescription
 */
export const createPrescription = async (prescriptionData) => {
  try {
    console.log('➕ Creating prescription:', prescriptionData);
    const response = await api.post(`${PHARMACY_API}/prescriptions`, prescriptionData);
    console.log(`✅ Prescription created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    throw error;
  }
};

/**
 * Update prescription
 */
export const updatePrescription = async (id, prescriptionData) => {
  try {
    console.log(`✏️ Updating prescription ${id}:`, prescriptionData);
    const response = await api.put(`${PHARMACY_API}/prescriptions/${id}`, prescriptionData);
    console.log(`✅ Prescription updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating prescription:', error);
    throw error;
  }
};

/**
 * Delete prescription
 */
export const deletePrescription = async (id) => {
  try {
    console.log(`🗑️ Deleting prescription ${id}...`);
    const response = await api.delete(`${PHARMACY_API}/prescriptions/${id}`);
    console.log(`✅ Prescription deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting prescription:', error);
    throw error;
  }
};

// ==========================================
// MEDICATION ENDPOINTS
// ==========================================

/**
 * Get all medications
 */
export const getMedications = async (search = '', isActive = 1) => {
  try {
    console.log('💊 Fetching medications...');
    const response = await api.get(`${PHARMACY_API}/medications`, {
      params: {
        search,
        is_active: isActive,
      },
    });
    console.log(`✅ Medications fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching medications:', error);
    throw error;
  }
};

/**
 * Get single medication
 */
export const getMedicationById = async (id) => {
  try {
    console.log(`💊 Fetching medication ${id}...`);
    const response = await api.get(`${PHARMACY_API}/medications/${id}`);
    console.log(`✅ Medication fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching medication:', error);
    throw error;
  }
};

/**
 * Create medication
 */
export const createMedication = async (medicationData) => {
  try {
    console.log('➕ Creating medication:', medicationData);
    const response = await api.post(`${PHARMACY_API}/medications`, medicationData);
    console.log(`✅ Medication created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating medication:', error);
    throw error;
  }
};

// ==========================================
// STATISTICS
// ==========================================

/**
 * Get pharmacy statistics
 */
export const getPharmacyStats = async () => {
  try {
    console.log('📊 Fetching pharmacy statistics...');
    const response = await api.get(`${PHARMACY_API}/stats/overview`);
    console.log(`✅ Statistics fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    throw error;
  }
};