// ============================================
// PDFButton.jsx — Reusable PDF download button
// File: frontend-web/src/components/PDFButton.jsx
//
// Usage examples:
//
// <PDFButton type="invoice"  id={invoice.invoice_id}  label={invoice.invoice_number} />
// <PDFButton type="patient"  id={patient.patient_id}  label={`${patient.first_name} ${patient.last_name}`} />
// <PDFButton type="lab"      id={order.order_id}       label={order.test_name} />
// <PDFButton type="receipt"  id={payment.payment_id}  label={payment.receipt_number} />
// ============================================

import React, { useState } from 'react';
import { FileText, Loader } from 'lucide-react';
import {
  downloadInvoicePDF,
  downloadPatientSummaryPDF,
  downloadLabResultPDF,
  downloadReceiptPDF,
} from '../services/pdfService';

const HANDLERS = {
  invoice: (id, label) => downloadInvoicePDF(id, label),
  patient: (id, label) => downloadPatientSummaryPDF(id, label),
  lab:     (id, label) => downloadLabResultPDF(id, label),
  receipt: (id, label) => downloadReceiptPDF(id, label),
};

const PDFButton = ({
  type,
  id,
  label = '',
  variant = 'outline',   // 'outline' | 'ghost' | 'solid'
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleClick = async () => {
    if (loading) return;
    setError('');
    try {
      setLoading(true);
      const handler = HANDLERS[type];
      if (!handler) throw new Error(`Unknown PDF type: ${type}`);
      await handler(id, label);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate PDF';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
  };

  const variantClasses = {
    outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700',
    ghost:   'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-teal-600',
    solid:   'bg-teal-600 text-white hover:bg-teal-700 border border-teal-600',
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        title={`Download ${type} PDF`}
        className={`
          inline-flex items-center font-medium rounded-lg transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size] || sizeClasses.sm}
          ${variantClasses[variant] || variantClasses.outline}
          ${className}
        `}>
        {loading
          ? <Loader className="w-3 h-3 animate-spin" />
          : <FileText className="w-3 h-3" />
        }
        {showLabel && (
          <span>{loading ? 'Generating…' : 'Download PDF'}</span>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-500 max-w-[200px] leading-tight">{error}</span>
      )}
    </div>
  );
};

export default PDFButton;