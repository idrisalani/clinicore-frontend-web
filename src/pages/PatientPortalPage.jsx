import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, FileText, Beaker, Pill, CreditCard, User,
  ChevronRight, Activity, AlertTriangle, Download, Loader
} from 'lucide-react';
import api from '../services/api.js';

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const STATUS_COLOR = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed:  'bg-emerald-100 text-emerald-700',
  Cancelled:  'bg-red-100 text-red-700',
  'No Show':  'bg-slate-100 text-slate-500',
  Draft:      'bg-amber-100 text-amber-700',
  Signed:     'bg-blue-100 text-blue-700',
  Normal:     'bg-emerald-100 text-emerald-700',
  Abnormal:   'bg-amber-100 text-amber-700',
  Critical:   'bg-red-100 text-red-700',
  Ordered:    'bg-blue-100 text-blue-700',
  Active:     'bg-emerald-100 text-emerald-700',
  Paid:       'bg-emerald-100 text-emerald-700',
  Unpaid:     'bg-red-100 text-red-700',
};

const QuickAction = ({ icon: Icon, label, color, bg, to, onClick }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={onClick || (() => navigate(to))}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
    >
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <span className="text-xs font-semibold text-slate-600 text-center leading-tight">{label}</span>
    </button>
  );
};

const SummaryCard = ({ label, value, sub, color, bg, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const PatientPortalPage = () => {
  const navigate = useNavigate();
  const [patient, setPatient]           = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [labOrders, setLabOrders]       = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pdfLoading, setPdfLoading]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [patRes, apptRes, consultRes, labRes, rxRes, billRes] = await Promise.allSettled([
        api.get('/patients/me'),
        api.get('/appointments', { params: { limit: 5 } }),
        api.get('/consultations', { params: { limit: 5 } }),
        api.get('/lab', { params: { limit: 5 } }),
        api.get('/pharmacy/prescriptions', { params: { limit: 5 } }),
        api.get('/billing/invoices', { params: { limit: 5 } }),
      ]);

      if (patRes.status === 'fulfilled')    setPatient(patRes.value.data.patient);
      if (apptRes.status === 'fulfilled')   setAppointments(apptRes.value.data.appointments || []);
      if (consultRes.status === 'fulfilled') setConsultations(consultRes.value.data.consultations || []);
      if (labRes.status === 'fulfilled')    setLabOrders(labRes.value.data.orders || []);
      if (rxRes.status === 'fulfilled')     setPrescriptions(rxRes.value.data.prescriptions || []);
      if (billRes.status === 'fulfilled')   setInvoices(billRes.value.data.invoices || []);
    } catch (e) {
      console.error('Portal fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const downloadSummaryPDF = async () => {
    if (!patient || pdfLoading) return;
    setPdfLoading(true);
    try {
      const res = await api.get(`/pdf/patient/${patient.patient_id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `My-Health-Summary.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  const nextAppt = appointments.find(a => a.status === 'Scheduled' && new Date(a.appointment_date) >= new Date());
  const activeRx = prescriptions.filter(p => p.status === 'Active');
  const unpaidBills = invoices.filter(i => i.status !== 'Paid');
  const criticalResults = labOrders.filter(o => o.result_status === 'Critical');

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3, borderStyle: 'solid' }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Hero header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="fade-in">
              <p className="text-teal-200 text-sm font-medium">Welcome back</p>
              <h1 className="text-2xl font-black text-white mt-0.5">
                {patient ? `${patient.first_name} ${patient.last_name}` : 'My Health Portal'}
              </h1>
              <p className="text-teal-200 text-sm mt-1">
                Patient ID: #{patient?.patient_id} &nbsp;·&nbsp; {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button
              onClick={downloadSummaryPDF}
              disabled={pdfLoading || !patient}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {pdfLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Health Summary PDF
            </button>
          </div>

          {/* Alerts */}
          {criticalResults.length > 0 && (
            <div className="mt-4 flex items-center gap-3 bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0" />
              <p className="text-sm text-red-100 font-medium">
                You have {criticalResults.length} critical lab result{criticalResults.length > 1 ? 's' : ''} — please contact your doctor.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <SummaryCard label="Next Appointment" value={nextAppt ? fmtDate(nextAppt.appointment_date) : 'None'} sub={nextAppt?.reason_for_visit} color="text-teal-700" bg="bg-teal-50" icon={Calendar} />
          <SummaryCard label="Active Medications" value={activeRx.length} sub="current prescriptions" color="text-violet-700" bg="bg-violet-50" icon={Pill} />
          <SummaryCard label="Lab Orders" value={labOrders.length} sub="total tests" color="text-blue-700" bg="bg-blue-50" icon={Beaker} />
          <SummaryCard label="Outstanding Bills" value={unpaidBills.length} sub="awaiting payment" color="text-amber-700" bg="bg-amber-50" icon={CreditCard} />
        </div>

        {/* Quick actions */}
        <div className="fade-in">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <QuickAction icon={Calendar} label="Book Appointment" color="text-teal-600" bg="bg-teal-50" to="/appointments" />
            <QuickAction icon={FileText} label="My Records" color="text-blue-600" bg="bg-blue-50" to="/consultations" />
            <QuickAction icon={Beaker} label="Lab Results" color="text-indigo-600" bg="bg-indigo-50" to="/lab" />
            <QuickAction icon={Pill} label="Prescriptions" color="text-violet-600" bg="bg-violet-50" to="/pharmacy" />
            <QuickAction icon={CreditCard} label="My Bills" color="text-amber-600" bg="bg-amber-50" to="/billing" />
            <QuickAction icon={User} label="My Profile" color="text-slate-600" bg="bg-slate-100" to="/portal/profile" />
          </div>
        </div>

        {/* Two-column layout for recent activity */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Recent appointments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-700">Recent Appointments</h3>
              </div>
              <button onClick={() => navigate('/appointments')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {appointments.length === 0
              ? <div className="py-8 text-center text-slate-400 text-sm">No appointments yet</div>
              : appointments.slice(0, 4).map(a => (
                <div key={a.appointment_id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{fmtDate(a.appointment_date)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.reason_for_visit || 'General consultation'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[a.status] || 'bg-slate-100 text-slate-500'}`}>{a.status}</span>
                </div>
              ))
            }
          </div>

          {/* Recent lab results */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-700">Recent Lab Results</h3>
              </div>
              <button onClick={() => navigate('/lab')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {labOrders.length === 0
              ? <div className="py-8 text-center text-slate-400 text-sm">No lab orders yet</div>
              : labOrders.slice(0, 4).map(o => (
                <div key={o.lab_order_id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{o.test_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmtDate(o.ordered_date)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-500'}`}>{o.status}</span>
                </div>
              ))
            }
          </div>

          {/* Recent consultations */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-700">Consultation Records</h3>
              </div>
              <button onClick={() => navigate('/consultations')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {consultations.length === 0
              ? <div className="py-8 text-center text-slate-400 text-sm">No consultations yet</div>
              : consultations.slice(0, 4).map(c => (
                <div key={c.consultation_id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{c.chief_complaint?.substring(0, 35) || 'Consultation'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{fmtDate(c.consultation_date)} · {c.diagnosis?.substring(0, 25)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status] || 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </div>
              ))
            }
          </div>

          {/* Active prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-700">Active Prescriptions</h3>
              </div>
              <button onClick={() => navigate('/pharmacy')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {activeRx.length === 0
              ? <div className="py-8 text-center text-slate-400 text-sm">No active prescriptions</div>
              : activeRx.slice(0, 4).map(rx => (
                <div key={rx.prescription_id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{rx.generic_name}{rx.brand_name ? ` (${rx.brand_name})` : ''}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{rx.prescribed_dosage} · {rx.frequency}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                </div>
              ))
            }
          </div>

        </div>

        {/* Bills section */}
        {unpaidBills.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-800">Outstanding Bills ({unpaidBills.length})</h3>
            </div>
            <div className="space-y-2">
              {unpaidBills.slice(0, 3).map(inv => (
                <div key={inv.invoice_id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{inv.invoice_number || `INV-${inv.invoice_id}`}</p>
                    <p className="text-xs text-slate-400">{fmtDate(inv.invoice_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-700">₦{Number(inv.amount_due || 0).toLocaleString('en-NG')}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/billing')} className="mt-3 text-sm text-amber-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all bills <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Medical info summary */}
        {patient && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-700">Medical Information</h3>
              </div>
              <button onClick={() => navigate('/portal/profile')} className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                Edit profile <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Blood Type', patient.blood_type || 'Unknown'],
                ['Gender', patient.gender || '—'],
                ['Date of Birth', fmtDate(patient.date_of_birth)],
                ['Allergies', patient.allergies || 'None recorded'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${label === 'Allergies' && patient.allergies ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientPortalPage;