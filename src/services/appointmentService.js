import api from './api.js';

const APPOINTMENTS_API = '/appointments';

// ==========================================
// GET Endpoints
// ==========================================

/**
 * Get all appointments with filters
 */
export const getAppointments = async (page = 1, limit = 10, status = '', doctorId = '', fromDate = '', toDate = '') => {
  try {
    console.log('📅 Fetching appointments...');
    const response = await api.get(APPOINTMENTS_API, {
      params: { 
        page, 
        limit, 
        status, 
        doctor_id: doctorId,
        from_date: fromDate,
        to_date: toDate
      },
    });
    console.log(`✅ Appointments fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Get single appointment
 */
export const getAppointmentById = async (id) => {
  try {
    console.log(`📅 Fetching appointment ${id}...`);
    const response = await api.get(`${APPOINTMENTS_API}/${id}`);
    console.log(`✅ Appointment fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    throw error;
  }
};

/**
 * Get appointments for a specific patient
 */
export const getPatientAppointments = async (patientId, upcoming = true) => {
  try {
    console.log(`📅 Fetching appointments for patient ${patientId}...`);
    const response = await api.get(`${APPOINTMENTS_API}/patient/${patientId}`, {
      params: { upcoming }
    });
    console.log(`✅ Patient appointments fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching patient appointments:', error);
    throw error;
  }
};

/**
 * Get doctor availability
 */
export const getDoctorAvailability = async (doctorId, date) => {
  try {
    console.log(`📅 Getting availability for doctor ${doctorId} on ${date}...`);
    const response = await api.get(`${APPOINTMENTS_API}/doctor/${doctorId}/availability`, {
      params: { doctor_id: doctorId, date }
    });
    console.log(`✅ Availability fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching availability:', error);
    throw error;
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async () => {
  try {
    console.log('📊 Fetching appointment statistics...');
    const response = await api.get(`${APPOINTMENTS_API}/stats/overview`);
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
 * Create new appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    console.log('➕ Creating appointment:', appointmentData);
    const response = await api.post(APPOINTMENTS_API, appointmentData);
    console.log(`✅ Appointment created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    throw error;
  }
};

// ==========================================
// PUT Endpoints
// ==========================================

/**
 * Update appointment
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    console.log(`✏️ Updating appointment ${id}:`, appointmentData);
    const response = await api.put(`${APPOINTMENTS_API}/${id}`, appointmentData);
    console.log(`✅ Appointment updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    throw error;
  }
};

// ==========================================
// DELETE Endpoints
// ==========================================

/**
 * Cancel/Delete appointment
 */
export const deleteAppointment = async (id) => {
  try {
    console.log(`🗑️ Cancelling appointment ${id}...`);
    const response = await api.delete(`${APPOINTMENTS_API}/${id}`);
    console.log(`✅ Appointment cancelled:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    throw error;
  }
};