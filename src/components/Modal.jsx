import React from 'react';
import { X } from 'lucide-react';

/**
 * Modal Wrapper Component
 * Wraps patient form and other modal content
 */
const Modal = ({
  isOpen = false,
  title = 'Modal',
  children,
  onClose = null,
  size = 'medium', // 'small', 'medium', 'large'
}) => {
  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;