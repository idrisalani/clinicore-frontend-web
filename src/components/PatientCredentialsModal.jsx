// ============================================
// PatientCredentialsModal.jsx
// File: frontend-web/src/components/PatientCredentialsModal.jsx
//
// Shown after successful patient creation.
// Staff copies credentials and hands them to the patient.
// ============================================

import React, { useState } from 'react';

const PatientCredentialsModal = ({ credentials, patientName, onClose }) => {
  const [emailCopied,    setEmailCopied]    = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  if (!credentials) return null;

  const copy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  const copyBoth = () => {
    copy(
      `CliniCore Patient Portal\nEmail: ${credentials.email}\nPassword: ${credentials.default_password}\nURL: ${window.location.origin}/login`,
      () => {}
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-teal-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg">
              ✓
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Patient Created!</h2>
              <p className="text-teal-100 text-sm">{patientName} has been registered</p>
            </div>
          </div>
        </div>

        {/* Credentials section */}
        <div className="p-6 space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <p className="text-teal-800 text-sm font-semibold mb-3 flex items-center gap-2">
              <span>🔑</span> Patient Portal Credentials
            </p>

            {/* Email */}
            <div className="space-y-1 mb-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Login Email
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 truncate">
                  {credentials.email}
                </code>
                <button
                  onClick={() => copy(credentials.email, setEmailCopied)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 transition-colors whitespace-nowrap">
                  {emailCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Default Password
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 font-bold tracking-widest">
                  {credentials.default_password}
                </code>
                <button
                  onClick={() => copy(credentials.default_password, setPasswordCopied)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 transition-colors whitespace-nowrap">
                  {passwordCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Password formula reminder */}
            <p className="text-xs text-teal-600 mt-3 bg-teal-100 rounded-lg px-3 py-2">
              ℹ Password = first 4 letters of surname + last 4 digits of phone
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-amber-500 text-base mt-0.5 flex-shrink-0">⚠</span>
            <div>
              <p className="text-amber-800 text-sm font-semibold">Give these credentials to the patient now</p>
              <p className="text-amber-700 text-xs mt-1">
                The patient can log in at <strong>{window.location.origin}/login</strong> to view
                their records, appointments, lab results and bills.
              </p>
            </div>
          </div>

          {/* Portal URL */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Portal URL</p>
            <code className="text-sm text-slate-700">{window.location.origin}/login</code>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={copyBoth}
            className="flex-1 bg-teal-50 border border-teal-200 text-teal-700 font-semibold py-3 rounded-xl text-sm hover:bg-teal-100 transition-colors">
            Copy All Details
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl text-sm hover:bg-teal-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientCredentialsModal;