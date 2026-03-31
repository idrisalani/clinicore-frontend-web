import api from './api.js';

const BILLING_API = '/billing';

// ==========================================
// INVOICE ENDPOINTS
// ==========================================

/**
 * Get all invoices
 */
export const getInvoices = async (page = 1, limit = 10, patientId = '', status = '', startDate = '', endDate = '') => {
  try {
    console.log('💰 Fetching invoices...');
    const response = await api.get(`${BILLING_API}/invoices`, {
      params: {
        page,
        limit,
        patient_id: patientId,
        status,
        start_date: startDate,
        end_date: endDate,
      },
    });
    console.log(`✅ Invoices fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Get single invoice with line items and payments
 */
export const getInvoiceById = async (id) => {
  try {
    console.log(`💰 Fetching invoice ${id}...`);
    const response = await api.get(`${BILLING_API}/invoices/${id}`);
    console.log(`✅ Invoice fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Create invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    console.log('➕ Creating invoice:', invoiceData);
    const response = await api.post(`${BILLING_API}/invoices`, invoiceData);
    console.log(`✅ Invoice created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (id, invoiceData) => {
  try {
    console.log(`✏️ Updating invoice ${id}:`, invoiceData);
    const response = await api.put(`${BILLING_API}/invoices/${id}`, invoiceData);
    console.log(`✅ Invoice updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    throw error;
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id) => {
  try {
    console.log(`🗑️ Deleting invoice ${id}...`);
    const response = await api.delete(`${BILLING_API}/invoices/${id}`);
    console.log(`✅ Invoice deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    throw error;
  }
};

// ==========================================
// PAYMENT ENDPOINTS
// ==========================================

/**
 * Record payment
 */
export const recordPayment = async (paymentData) => {
  try {
    console.log('💳 Recording payment:', paymentData);
    const response = await api.post(`${BILLING_API}/payments`, paymentData);
    console.log(`✅ Payment recorded:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error recording payment:', error);
    throw error;
  }
};

/**
 * Get payments
 */
export const getPayments = async (invoiceId = '', patientId = '') => {
  try {
    console.log('💳 Fetching payments...');
    const response = await api.get(`${BILLING_API}/payments`, {
      params: {
        invoice_id: invoiceId,
        patient_id: patientId,
      },
    });
    console.log(`✅ Payments fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    throw error;
  }
};

// ==========================================
// SERVICE ENDPOINTS
// ==========================================

/**
 * Get all services
 */
export const getServices = async (isActive = 1) => {
  try {
    console.log('💰 Fetching services...');
    const response = await api.get(`${BILLING_API}/services`, {
      params: {
        is_active: isActive,
      },
    });
    console.log(`✅ Services fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    throw error;
  }
};

/**
 * Create service
 */
export const createService = async (serviceData) => {
  try {
    console.log('➕ Creating service:', serviceData);
    const response = await api.post(`${BILLING_API}/services`, serviceData);
    console.log(`✅ Service created:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating service:', error);
    throw error;
  }
};

// ==========================================
// STATISTICS
// ==========================================

/**
 * Get billing statistics
 */
export const getBillingStats = async (startDate = '', endDate = '') => {
  try {
    console.log('📊 Fetching billing statistics...');
    const response = await api.get(`${BILLING_API}/stats/overview`, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    console.log(`✅ Statistics fetched:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    throw error;
  }
};