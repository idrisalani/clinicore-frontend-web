import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, ChevronDown, Activity, Shield, Zap } from 'lucide-react';

/**
 * CliniCore Landing Page — World-class redesign
 * Aesthetic: Dark-accented medical premium with deep navy + electric teal
 * Typography: System serif for headings, clean sans for body
 */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '👤',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      title: 'Patient Management',
      desc: 'Complete records, medical history, emergency contacts and insurance — all in one unified profile.',
    },
    {
      icon: '📅',
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      title: 'Smart Scheduling',
      desc: 'Intelligent appointment booking with doctor availability, automated reminders, and no-show tracking.',
    },
    {
      icon: '🩺',
      color: 'from-purple-500 to-violet-500',
      bg: 'bg-purple-50',
      title: 'Clinical Notes',
      desc: 'SOAP notes, vital signs, diagnosis codes and treatment plans — structured for clinical accuracy.',
    },
    {
      icon: '🧪',
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-50',
      title: 'Laboratory',
      desc: 'Order tests, track samples, receive results and build a complete diagnostic history per patient.',
    },
    {
      icon: '💊',
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      title: 'Pharmacy System',
      desc: 'e-Prescriptions, drug inventory, refill alerts and interaction warnings — all integrated.',
    },
    {
      icon: '₦',
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      title: 'Billing & Invoicing',
      desc: 'Naira-native invoicing, payment tracking, insurance claims and financial reporting built in.',
    },
  ];

  const stats = [
    { value: '8+', label: 'Core Modules', icon: <Zap className="w-5 h-5" /> },
    { value: '65+', label: 'REST APIs', icon: <Activity className="w-5 h-5" /> },
    { value: '7', label: 'User Roles', icon: <Shield className="w-5 h-5" /> },
    { value: '₦', label: 'Naira Native', icon: <Star className="w-5 h-5" /> },
  ];

  // const testimonials = [
  //   {
  //     quote: 'CliniCore has completely transformed how we manage our clinic. Patient records are organized, appointments run smoothly, and billing is automated.',
  //     name: 'Dr. Chioma Nwosu',
  //     title: 'Lagos Medical Center',
  //     color: 'bg-blue-100 text-blue-800',
  //     initial: 'C',
  //   },
  //   {
  //     quote: 'The pharmacy integration and prescription tracking have been game-changers. Our medication management is now efficient and error-free.',
  //     name: 'Pharm. Tunde Adeyemi',
  //     title: 'Abuja Health Clinic',
  //     color: 'bg-purple-100 text-purple-800',
  //     initial: 'T',
  //   },
  //   {
  //     quote: 'The billing system is straightforward and the Nigerian Naira support is perfect for our operations. An exceptional healthcare platform.',
  //     name: 'Dr. Oluwaseun Oladele',
  //     title: 'Port Harcourt Medical',
  //     color: 'bg-emerald-100 text-emerald-800',
  //     initial: 'O',
  //   },
  // ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .hero-title   { animation: fadeUp 0.7s ease 0.1s both; }
        .hero-sub     { animation: fadeUp 0.7s ease 0.25s both; }
        .hero-btns    { animation: fadeUp 0.7s ease 0.4s both; }
        .hero-visual  { animation: fadeIn 0.9s ease 0.3s both; }
        .stat-card    { animation: fadeUp 0.5s ease both; }
        .blob         { animation: pulse-slow 4s ease-in-out infinite; }
        .float-card   { animation: float 3s ease-in-out infinite; }
        .feature-card { transition: all 0.25s ease; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.10); }
        .nav-link { position: relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#0ea5e9; transition: width 0.2s; }
        .nav-link:hover::after { width: 100%; }
        .pricing-card { transition: all 0.3s ease; }
        .pricing-card:hover { transform: translateY(-6px); }
      `}</style>

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-black text-sm tracking-tight">CC</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">CliniCore</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['features', 'pricing', 'testimonials'].map(id => (
              <button key={id} onClick={() => scrollTo(id)}
                className="nav-link text-gray-600 hover:text-gray-900 font-medium capitalize text-sm tracking-wide transition-colors">
                {id}
              </button>
            ))}
          </div>

          <Link to="/login"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5">
            Login <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 pt-20">
        {/* Background blobs */}
        <div className="blob absolute top-20 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20" />
        <div className="blob absolute bottom-20 right-10 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20" style={{ animationDelay: '1.5s' }} />
        <div className="blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-10" style={{ animationDelay: '0.8s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <div className="hero-title inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Built for Nigerian Healthcare
            </div>

            <h1 className="hero-title text-5xl md:text-6xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Modern Clinic<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">
                Management
              </span><br />
              for Nigeria
            </h1>

            <p className="hero-sub text-lg text-slate-300 leading-relaxed mb-10 max-w-lg">
              Complete healthcare management in Nigerian Naira. Patients, appointments, consultations, lab, pharmacy and billing — unified in one powerful platform.
            </p>

            <div className="hero-btns flex flex-wrap gap-4">
              <Link to="/login"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-cyan-900/50 transition-all hover:-translate-y-1 hover:shadow-2xl">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => scrollTo('features')}
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-base transition-all">
                See Features <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="hero-sub mt-10 flex flex-wrap gap-6">
              {['HIPAA Compliant', 'Role-Based Access', 'Naira Billing'].map(badge => (
                <div key={badge} className="flex items-center gap-2 text-slate-400 text-sm">
                  <Check className="w-4 h-4 text-cyan-400" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating dashboard preview */}
          <div className="hero-visual hidden md:block relative">
            {/* Main card */}
            <div className="float-card bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-white/40 text-xs font-mono">clinicore.app/dashboard</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Patients', value: '1,247', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Appointments', value: '38', color: 'from-emerald-500 to-teal-500' },
                  { label: 'Lab Tests', value: '94', color: 'from-orange-500 to-amber-500' },
                  { label: 'Revenue', value: '₦2.4M', color: 'from-purple-500 to-violet-500' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">{item.label}</p>
                    <p className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-xs mb-3">Today's Schedule</p>
                {['Dr. Hassan — 9:00 AM', 'Dr. Eze — 11:30 AM', 'Dr. Adeyemi — 2:00 PM'].map((appt, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                    <span className="text-white/70 text-xs">{appt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-emerald-900/40 text-sm font-bold">
              ✓ Live System
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs font-semibold">
              🔒 RBAC Secured
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo('stats')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="bg-gradient-to-r from-sky-600 to-blue-700 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="stat-card text-center" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex justify-center mb-2 text-sky-200">{s.icon}</div>
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sky-200 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Everything Your Clinic Needs
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              A complete suite of tools built specifically for Nigerian healthcare operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="feature-card bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center text-2xl mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>

                {/* Gradient bar at bottom */}
                <div className={`mt-5 h-0.5 rounded-full bg-gradient-to-r ${f.color} opacity-40`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Simple, Transparent Plans
            </h2>
            <p className="text-xl text-gray-500">All prices in Nigerian Naira. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Starter */}
            <div className="pricing-card bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-1">Starter</h3>
                <p className="text-gray-400 text-sm">For small clinics</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-gray-900">₦49,999</span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Up to 5 doctors', 'Patient management', 'Appointments', 'Email support'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-gray-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block text-center border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 py-3 rounded-2xl font-semibold text-sm transition-all">
                Get Started
              </Link>
            </div>

            {/* Professional — featured */}
            <div className="pricing-card relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-2xl shadow-blue-200 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-black px-5 py-2 rounded-full shadow-lg uppercase tracking-widest">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-1">Professional</h3>
                <p className="text-blue-200 text-sm">For growing clinics</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">₦99,999</span>
                <span className="text-blue-200 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited doctors', 'All Starter features', 'Consultations & Notes', 'Laboratory Tests', 'Pharmacy System', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block text-center bg-white hover:bg-blue-50 text-blue-700 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="pricing-card bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-1">Enterprise</h3>
                <p className="text-slate-400 text-sm">For hospital groups</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">Custom</span>
                <span className="text-slate-400 text-sm ml-1">/pricing</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['All Professional features', 'Billing & Invoicing', 'Custom integrations', 'Dedicated support', 'SLA guarantee'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-cyan-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="block w-full text-center bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-cyan-900/30">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {/*<section id="testimonials" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Loved Across Nigeria
            </h2>
            <p className="text-xl text-gray-500">Trusted by clinics from Lagos to Abuja</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="feature-card bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                  <div className={`w-11 h-11 rounded-2xl ${t.color} flex items-center justify-center font-black text-lg`}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 px-6">
        <div className="blob absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-20" />
        <div className="blob absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-20" style={{ animationDelay: '1.5s' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to Transform<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">
              Your Clinic?
            </span>
          </h2>
          {/* <p className="text-xl text-slate-400 mb-10">
            Join healthcare professionals across Nigeria using CliniCore
          </p> */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login"
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-cyan-900/30 transition-all hover:-translate-y-0.5">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 border border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">CC</span>
                </div>
                <span className="text-lg font-black text-white tracking-tight">CliniCore</span>
              </div>
              <p className="text-sm leading-relaxed">Healthcare Management System built for Nigeria's modern clinics.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'HIPAA'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <button className="text-sm hover:text-white transition-colors">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 CliniCore. All rights reserved.</p>
            <p className="text-sm text-slate-500">Built for Nigeria's healthcare 🇳🇬</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;