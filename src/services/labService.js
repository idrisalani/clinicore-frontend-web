import api from './api.js';

const LAB_API = '/lab';

// ==========================================
// GET Endpoints
// ==========================================

/**
 * Get all lab orders
 */
export const getLabOrders = async (page = 1, limit = 10, patientId = '', status = '') => {
  try {
    console.log('🧪 Fetching lab orders...');
    const response = await api.get(LAB_API, {
      params: {
        page,
        limit,
        patient_id: patientId,
        status,
      },
    });
    console.log(`✅ Lab orders fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching lab orders:', error);
    throw error;
  }
};

/**
 * Get single lab order with results
 */
export const getLabOrderById = async (id) => {
  try {
    console.log(`🧪 Fetching lab order ${id}...`);
    const response = await api.get(`${LAB_API}/${id}`);
    console.log(`✅ Lab order fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching lab order:', error);
    throw error;
  }
};

/**
 * Get lab orders for a specific patient
 */
export const getPatientLabOrders = async (patientId, limit = 10) => {
  try {
    console.log(`🧪 Fetching lab orders for patient ${patientId}...`);
    const response = await api.get(`${LAB_API}/patient/${patientId}`, {
      params: { limit },
    });
    console.log(`✅ Patient lab orders fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient lab orders:', error);
    throw error;
  }
};

/**
 * Get lab statistics
 */
export const getLabStats = async () => {
  try {
    console.log('📊 Fetching lab statistics...');
    const response = await api.get(`${LAB_API}/stats/overview`);
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
 * Create new lab order
 */
export const createLabOrder = async (orderData) => {
  try {
    console.log('➕ Creating lab order:', orderData);
    const response = await api.post(LAB_API, orderData);
    console.log(`✅ Lab order created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating lab order:', error);
    throw error;
  }
};

/**
 * Add result to lab order
 */
export const addLabResult = async (orderId, resultData) => {
  try {
    console.log(`➕ Adding lab result to order ${orderId}:`, resultData);
    const response = await api.post(`${LAB_API}/${orderId}/results`, resultData);
    console.log(`✅ Lab result added:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding lab result:', error);
    throw error;
  }
};

// ==========================================
// PUT Endpoints
// ==========================================

/**
 * Update lab order
 */
export const updateLabOrder = async (id, orderData) => {
  try {
    console.log(`✏️ Updating lab order ${id}:`, orderData);
    const response = await api.put(`${LAB_API}/${id}`, orderData);
    console.log(`✅ Lab order updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating lab order:', error);
    throw error;
  }
};

// ==========================================
// DELETE Endpoints
// ==========================================

/**
 * Delete lab order
 */
export const deleteLabOrder = async (id) => {
  try {
    console.log(`🗑️ Deleting lab order ${id}...`);
    const response = await api.delete(`${LAB_API}/${id}`);
    console.log(`✅ Lab order deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting lab order:', error);
    throw error;
  }
};