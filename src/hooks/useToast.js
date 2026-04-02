// ============================================
// useToast — Shared toast notification hook
// File: frontend-web/src/hooks/useToast.js
// ============================================
import { useState, useCallback } from 'react';

/**
 * Usage:
 *   const { toast, showToast, Toast } = useToast();
 *   showToast('Patient deleted', 'success');
 *   showToast('Failed to delete', 'error');
 *   // In JSX: <Toast />
 */
export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Inline Toast component — no extra import needed
  const Toast = () => {
    if (!toast) return null;
    return (
      <div
        key={toast.id}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'error'   ? 'bg-red-600'   :
          toast.type === 'warning' ? 'bg-amber-500'  : 'bg-gray-800'
        }`}
        style={{ animation: 'slideToast 0.3s ease' }}
      >
        <style>{`
          @keyframes slideToast {
            from { opacity:0; transform: translateY(12px); }
            to   { opacity:1; transform: translateY(0); }
          }
        `}</style>
        <span>{
          toast.type === 'success' ? '✓' :
          toast.type === 'error'   ? '✕' :
          toast.type === 'warning' ? '⚠' : 'ℹ'
        }</span>
        {toast.message}
        <button onClick={hideToast} className="ml-2 opacity-70 hover:opacity-100 text-xs">✕</button>
      </div>
    );
  };

  return { toast, showToast, hideToast, Toast };
};

export default useToast;