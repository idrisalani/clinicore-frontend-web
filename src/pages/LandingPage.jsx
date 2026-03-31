import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star, Users } from 'lucide-react';

/**
 * Professional Landing Page
 * Welcome screen for CliniCore Healthcare Management System
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CliniCore</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-gray-900 transition cursor-pointer">Features</button>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-gray-900 transition cursor-pointer">Pricing</button>
            <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-600 hover:text-gray-900 transition cursor-pointer">Testimonials</button>
          </div>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Modern Healthcare Management for Nigeria
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Complete clinic management system in Nigerian Naira. Patient records, appointments, consultations, lab tests, pharmacy, and billing—all in one platform.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl h-96 flex items-center justify-center shadow-2xl">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-xl font-semibold">Healthcare System Demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">8+</div>
              <p className="text-gray-600">Core Modules</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">65+</div>
              <p className="text-gray-600">REST APIs</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">7500+</div>
              <p className="text-gray-600">Lines of Code</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">₦</div>
              <p className="text-gray-600">Nigerian Naira Ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Healthcare Solution</h2>
            <p className="text-xl text-gray-600">Everything you need to run a modern clinic</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Patient Management</h3>
              <p className="text-gray-600">Complete patient records, medical history, emergency contacts, and insurance information.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Appointment Scheduling</h3>
              <p className="text-gray-600">Easy appointment booking, doctor availability management, and automated reminders.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Consultations</h3>
              <p className="text-gray-600">Record clinical notes, vital signs, diagnosis, and treatment plans in one place.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Laboratory Tests</h3>
              <p className="text-gray-600">Order lab tests, track results, and maintain complete test history for patients.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pharmacy System</h3>
              <p className="text-gray-600">Issue prescriptions, manage medications, track refills, and maintain drug interactions database.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Billing & Invoicing</h3>
              <p className="text-gray-600">Create invoices, record payments, track receivables in Nigerian Naira (₦).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your clinic</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">For small clinics</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₦49,999<span className="text-sm text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Up to 5 doctors</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Patient management</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Appointments</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold transition">
                Get Started
              </button>
            </div>

            {/* Professional Plan (Popular) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white transform scale-105 shadow-xl">
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full inline-block mb-4 font-bold text-sm">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-blue-100 mb-6">For growing clinics</p>
              <div className="text-4xl font-bold mb-6">
                ₦99,999<span className="text-sm text-blue-100">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>Unlimited doctors</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>All Starter features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>Consultations & Notes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>Laboratory Tests</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>Pharmacy System</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-200" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold transition">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large hospital groups</p>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                Custom<span className="text-sm text-gray-600">/pricing</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">All Professional features</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Billing & Invoicing</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Healthcare Professionals</h2>
            <p className="text-xl text-gray-600">See what clinics in Nigeria are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "CliniCore has transformed how we manage our clinic. Patient records are organized, appointments run smoothly, and billing is now automated. Highly recommended!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                <div>
                  <p className="font-bold text-gray-900">Dr. Chioma Nwosu</p>
                  <p className="text-sm text-gray-600">Lagos Medical Center</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The pharmacy integration and prescription tracking have been game-changers. Our medication management is now efficient and accurate."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-xl">👩‍⚕️</div>
                <div>
                  <p className="font-bold text-gray-900">Pharm. Tunde Adeyemi</p>
                  <p className="text-sm text-gray-600">Abuja Health Clinic</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The billing system is straightforward and the Nigerian Naira support is perfect for our operations. Great platform!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                <div>
                  <p className="font-bold text-gray-900">Dr. Oluwaseun Oladele</p>
                  <p className="text-sm text-gray-600">Port Harcourt Medical</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Clinic?</h2>
          <p className="text-xl text-blue-100 mb-8">Join healthcare professionals across Nigeria using CliniCore</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-bold transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-lg font-bold transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <span className="text-lg font-bold text-white">CliniCore</span>
              </div>
              <p className="text-sm">Healthcare Management System for Nigeria</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition cursor-pointer">Features</button></li>
                <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition cursor-pointer">Pricing</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Security</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition cursor-pointer">About</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Blog</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition cursor-pointer">Privacy</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Terms</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">© 2026 CliniCore. All rights reserved. Built for Nigeria's healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;