// ============================================
// BarcodeButton.jsx — Barcode/label download button
// File: frontend-web/src/components/BarcodeButton.jsx
//
// Usage:
//   <BarcodeButton type="patient-card"    id={patient.patient_id} />
//   <BarcodeButton type="patient-qr"      id={patient.patient_id} />
//   <BarcodeButton type="lab-label"       id={order.order_id} />
//   <BarcodeButton type="rx-label"        id={prescription.prescription_id} />
// ============================================

import React, { useState } from 'react';
import { QrCode, Tag, Loader, CreditCard } from 'lucide-react';
import api from '../services/api';

const ENDPOINTS = {
  'patient-card': (id) => `/barcode/patient/${id}/card`,
  'patient-qr':   (id) => `/barcode/patient/${id}/qr`,
  'lab-label':    (id) => `/barcode/lab/${id}/label`,
  'rx-label':     (id) => `/barcode/prescription/${id}/label`,
};

const LABELS = {
  'patient-card': 'ID Card',
  'patient-qr':   'QR Code',
  'lab-label':    'Specimen Label',
  'rx-label':     'Rx Label',
};

const ICONS = {
  'patient-card': CreditCard,
  'patient-qr':   QrCode,
  'lab-label':    Tag,
  'rx-label':     Tag,
};

const MIME = {
  'patient-qr': 'image/png',
};

const BarcodeButton = ({
  type, id, variant = 'outline', size = 'sm', showLabel = true, className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const Icon = ICONS[type] || QrCode;

  const handleClick = async () => {
    if (loading) return;
    setError('');
    try {
      setLoading(true);
      const endpoint = ENDPOINTS[type]?.(id);
      if (!endpoint) throw new Error(`Unknown barcode type: ${type}`);

      const mime     = MIME[type] || 'application/pdf';
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url      = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
      const link     = document.createElement('a');
      link.href      = url;
      link.download  = `${type}-${id}.${mime === 'image/png' ? 'png' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate');
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
    solid:   'bg-teal-600 text-white hover:bg-teal-700',
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        title={`Print ${LABELS[type] || type}`}
        className={`
          inline-flex items-center font-medium rounded-lg transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size] || sizeClasses.sm}
          ${variantClasses[variant] || variantClasses.outline}
          ${className}
        `}>
        {loading
          ? <Loader className="w-3 h-3 animate-spin" />
          : <Icon className="w-3 h-3" />
        }
        {showLabel && <span>{loading ? 'Generating…' : LABELS[type] || 'Download'}</span>}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default BarcodeButton;