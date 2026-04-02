import React, { useEffect, useRef } from 'react';
import { LogOut, X, ShieldCheck } from 'lucide-react';

/**
 * LogoutModal — Professional animated logout confirmation
 * Usage: <LogoutModal isOpen={show} onConfirm={handleLogout} onCancel={() => setShow(false)} userName="Dr Ahmed Hassan" />
 */
const LogoutModal = ({ isOpen, onConfirm, onCancel, userName = '' }) => {
  const cancelRef = useRef(null);

  // Focus cancel button when modal opens (accessibility)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const firstName = userName?.split(' ')[0] || 'User';

  return (
    <>
      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes iconPulse {
          0%,100% { transform: scale(1);    }
          50%      { transform: scale(1.08); }
        }
        .logout-backdrop  { animation: backdropIn   0.2s ease forwards; }
        .logout-modal     { animation: modalSlideIn 0.25s cubic-bezier(.34,1.56,.64,1) forwards; }
        .logout-icon-ring { animation: iconPulse 2s ease-in-out infinite; }
      `}</style>

      {/* Backdrop */}
      <div
        className="logout-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      >
        {/* Modal Card */}
        <div
          className="logout-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="px-8 pt-8 pb-7 text-center">
            {/* Icon */}
            <div className="logout-icon-ring inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-5">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>

            {/* Heading */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Signing out, {firstName}?
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your session will end and you'll need to log back in to access CliniCore.
            </p>

            {/* Security note */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-7 text-left">
              <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                All unsaved changes will be discarded. Your data is safe.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Stay logged in
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-red-200"
              >
                <LogOut size={15} />
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;