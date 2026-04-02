import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

/**
 * AccessDenied — shown when a 403 is returned or role check fails
 * Usage: <AccessDenied />  or  <AccessDenied message="Admins only" />
 */
const AccessDenied = ({ message = 'You do not have permission to access this page.' }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes shieldShake {
          0%,100% { transform: rotate(0deg);   }
          20%      { transform: rotate(-8deg);  }
          40%      { transform: rotate(8deg);   }
          60%      { transform: rotate(-5deg);  }
          80%      { transform: rotate(5deg);   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .shield-anim { animation: shieldShake 0.6s ease 0.3s both; }
        .fade-up     { animation: fadeUp 0.4s ease both; }
        .fade-up-1   { animation: fadeUp 0.4s ease 0.1s both; }
        .fade-up-2   { animation: fadeUp 0.4s ease 0.2s both; }
        .fade-up-3   { animation: fadeUp 0.4s ease 0.35s both; }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">

          {/* Icon */}
          <div className="shield-anim inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-red-50 border-2 border-red-100 mb-6">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>

          {/* Heading */}
          <h1 className="fade-up text-3xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="fade-up-1 text-gray-500 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {/* Error code badge */}
          <div className="fade-up-2 inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-xs font-mono font-semibold text-red-500">
              HTTP 403 — Forbidden
            </span>
          </div>

          {/* Actions */}
          <div className="fade-up-3 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-all"
            >
              <ArrowLeft size={15} />
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Home size={15} />
              My Dashboard
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AccessDenied;