// ============================================
// pdfService.js — Frontend PDF download helper
// File: frontend-web/src/services/pdfService.js
// ============================================

import api from './api';

// ── Core: fetch PDF blob and trigger browser download ─────────────────────────
const downloadPDF = async (endpoint, filename) => {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const url      = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  );
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ── Open in new tab instead of downloading ────────────────────────────────────
const openPDF = async (endpoint) => {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const url      = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  );
  window.open(url, '_blank');
  // Clean up after a delay so the tab has time to load
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};

// ── Named exports ─────────────────────────────────────────────────────────────
export const downloadInvoicePDF = (invoiceId, invoiceNumber) =>
  downloadPDF(`/pdf/invoice/${invoiceId}`, `${invoiceNumber || `INV-${invoiceId}`}.pdf`);

export const openInvoicePDF = (invoiceId) =>
  openPDF(`/pdf/invoice/${invoiceId}`);

export const downloadPatientSummaryPDF = (patientId, patientName) =>
  downloadPDF(`/pdf/patient/${patientId}`, `${patientName.replace(/\s+/g, '-')}-Summary.pdf`);

export const downloadLabResultPDF = (orderId, testName) =>
  downloadPDF(`/pdf/lab/${orderId}`, `Lab-Result-${testName.replace(/\s+/g, '-')}.pdf`);

export const downloadReceiptPDF = (paymentId, receiptNumber) =>
  downloadPDF(`/pdf/receipt/${paymentId}`, `Receipt-${receiptNumber || paymentId}.pdf`);