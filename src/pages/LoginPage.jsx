import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Shield, Activity, Users } from 'lucide-react';
import { authService } from '../services/authService';

/**
 * CliniCore Login Page — World-class redesign
 * Split layout: Left = immersive brand panel, Right = clean form
 */
export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin:  { email: 'admin1@clinicore.com', password: 'AdminPass123' },
      doctor: { email: 'doctor@clinicore.com', password: 'SecurePass123' },
    };
    const c = creds[role];
    setEmail(c.email);
    setPassword(c.password);
    setError('');
  };

  const features = [
    { icon: <Users className="w-4 h-4" />,    text: '7 Role-based access levels' },
    { icon: <Shield className="w-4 h-4" />,   text: 'HIPAA-compliant & encrypted' },
    { icon: <Activity className="w-4 h-4" />, text: 'Real-time clinic analytics' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fade-up   { animation: fadeUp 0.6s ease both; }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.2s both; }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.3s both; }
        .fade-up-4 { animation: fadeUp 0.6s ease 0.4s both; }
        .slide-in  { animation: slideIn 0.7s ease both; }
        .blob      { animation: pulse-slow 5s ease-in-out infinite; }
        .input-field {
          width: 100%;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          background: #fff;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
        }
        .input-field::placeholder { color: #94a3b8; }
        .login-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0284c7, #1d4ed8);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(14, 165, 233, 0.35);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .demo-btn {
          padding: 8px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          color: #475569;
        }
        .demo-btn:hover { border-color: #0ea5e9; color: #0284c7; background: #f0f9ff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── Left Panel — Brand ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-12">
        {/* Background blobs */}
        <div className="blob absolute top-16 left-16 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-25" />
        <div className="blob absolute bottom-16 right-8 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20" style={{ animationDelay: '2s' }} />
        <div className="blob absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-15" style={{ animationDelay: '1s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Top: Logo */}
        <div className="slide-in relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
              <span className="text-white font-black text-base">CC</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">CliniCore</span>
          </div>
        </div>

        {/* Middle: Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-300 px-4 py-2 rounded-full text-xs font-semibold mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Nigeria's Premier Healthcare Platform
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-5 tracking-tight">
            Healthcare<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">
              Simplified
            </span><br />
            for Nigeria
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Manage patients, appointments, lab tests, pharmacy and billing — all in one secure platform built for Nigerian clinics.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                  {f.icon}
                </div>
                {f.text}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
            {[['8+', 'Modules'], ['65+', 'REST APIs'], ['7', 'User Roles']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className="relative z-10 bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-300 text-xs leading-relaxed mb-3">
            "CliniCore transformed how we manage our clinic. Patient records, appointments and billing now run seamlessly."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-200 rounded-xl flex items-center justify-center text-xs font-bold text-blue-800">C</div>
            <div>
              <p className="text-white text-xs font-semibold">Dr. Chioma Nwosu</p>
              <p className="text-slate-500 text-[10px]">Lagos Medical Center</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">CC</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">CliniCore</span>
          </div>

          {/* Form header */}
          <div className="fade-up mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your CliniCore account</p>
          </div>

          {/* Demo credential pills */}
          <div className="fade-up-1 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick demo access</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => fillDemo('admin')} className="demo-btn">
                👑 Admin
              </button>
              <button onClick={() => fillDemo('doctor')} className="demo-btn">
                🩺 Doctor
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            <div className="fade-up-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="fade-up-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="fade-up bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="fade-up-4">
              <button type="submit" disabled={loading} className="login-btn mt-2">
                {loading ? (
                  <>
                    <svg className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security note */}
          <div className="fade-up-4 mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Secured with JWT authentication & role-based access control
          </div>

          {/* Back to landing */}
          <div className="fade-up-4 mt-4 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-sky-600 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}