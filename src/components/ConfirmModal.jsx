// ============================================
// ConfirmModal — Reusable confirmation dialog
// File: frontend-web/src/components/ConfirmModal.jsx
// ============================================
import React, { useEffect } from 'react';
import { AlertTriangle, Loader, X } from 'lucide-react';

/**
 * Professional confirmation modal — replaces window.confirm()
 *
 * Usage:
 *   <ConfirmModal
 *     isOpen={showConfirm}
 *     title="Delete Patient?"
 *     message="This action cannot be undone."
 *     confirmLabel="Delete"          // optional, default "Confirm"
 *     confirmColor="bg-red-500 hover:bg-red-600"  // optional
 *     loading={deleteLoading}
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
const ConfirmModal = ({
  isOpen,
  title       = 'Are you sure?',
  message     = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  confirmColor = 'bg-red-500 hover:bg-red-600',
  loading     = false,
  onConfirm,
  onCancel,
  icon,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape' && !loading) onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes backdropIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes modalSlideIn {
          from { opacity:0; transform: translateY(-12px) scale(0.97); }
          to   { opacity:1; transform: translateY(0)     scale(1);    }
        }
        .confirm-backdrop { animation: backdropIn   0.18s ease forwards; }
        .confirm-modal    { animation: modalSlideIn 0.22s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="confirm-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => { if (!loading) onCancel(); }}
      >
        {/* Modal */}
        <div
          className="confirm-modal bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

          {/* Close button */}
          <button
            onClick={() => { if (!loading) onCancel(); }}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-30"
          >
            <X size={15} />
          </button>

          {/* Content */}
          <div className="px-7 pt-7 pb-6 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-4">
              {icon || <AlertTriangle className="w-7 h-7 text-red-500" />}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { if (!loading) onCancel(); }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 ${confirmColor}`}
              >
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Working...</>
                  : confirmLabel
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;