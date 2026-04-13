// ============================================
// AnalyticsPage.jsx
// File: frontend-web/src/pages/AnalyticsPage.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Calendar,
  CreditCard, Beaker, Heart, FileText, AlertTriangle,
  RefreshCw, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import api from '../services/api.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt  = (n) => `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtK = (n) => {
  const v = Number(n ?? 0);
  return v >= 1_000_000 ? `₦${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `₦${(v/1_000).toFixed(0)}K` : `₦${v}`;
};
const pct  = (n) => n == null ? '—' : `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(1)}%`;
const num  = (n) => Number(n ?? 0).toLocaleString('en-NG');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: BarChart3   },
  { id: 'revenue',       label: 'Revenue',       icon: TrendingUp  },
  { id: 'patients',      label: 'Patients',      icon: Users       },
  { id: 'clinical',      label: 'Clinical',      icon: Activity    },
  { id: 'appointments',  label: 'Appointments',  icon: Calendar    },
  { id: 'outstanding',   label: 'Outstanding',   icon: AlertTriangle},
];

// ── Mini bar chart (pure SVG, no lib needed) ──────────────────────────────────
const BarChartSVG = ({ data = [], keyX = 'label', keyY = 'count', color = '#0d9488', height = 120 }) => {
  if (!data.length) return <div className="text-center text-slate-400 text-sm py-8">No data</div>;
  const max = Math.max(...data.map(d => Number(d[keyY]) || 0), 1);
  const barW = Math.min(40, Math.floor(480 / data.length) - 4);
  const gap  = Math.floor(480 / data.length);
  return (
    <svg viewBox={`0 0 ${data.length * gap} ${height + 32}`} className="w-full" style={{ height: height + 32 }}>
      {data.map((d, i) => {
        const val = Number(d[keyY]) || 0;
        const bh  = Math.max(2, (val / max) * height);
        const x   = i * gap + (gap - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={height - bh} width={barW} height={bh} rx="3" fill={color} opacity="0.85" />
            <text x={x + barW/2} y={height + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">
              {String(d[keyX]).slice(0, 6)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Horizontal bar ────────────────────────────────────────────────────────────
const HBar = ({ label, value, max, total, color = 'bg-teal-500', extra = '' }) => {
  const pctW = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{label}</span>
        <span className="text-slate-500 ml-2 flex-shrink-0">{num(value)}{extra}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pctW}%` }} />
      </div>
    </div>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, growth, icon: Icon, iconBg, iconCl, isCurrency = false }) => {
  const g = parseFloat(growth);
  const GrowthIcon = isNaN(g) ? Minus : g > 0 ? ArrowUpRight : ArrowDownRight;
  const growthCl   = isNaN(g) ? 'text-slate-400' : g > 0 ? 'text-emerald-600' : 'text-red-500';
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconCl}`} />
        </div>
        {growth != null && (
          <div className={`flex items-center gap-1 text-xs font-bold ${growthCl}`}>
            <GrowthIcon className="w-3.5 h-3.5" />
            {pct(growth)}
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800">{isCurrency ? fmtK(value) : num(value)}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
};

// ── Section card wrapper ──────────────────────────────────────────────────────
const Card = ({ title, icon: Icon, iconCl = 'text-teal-500', children, action }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconCl}`} />}
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ data }) => {
  if (!data) return <Skeleton />;
  const { patients, consultations, revenue, appointments, lab, maternity } = data;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Patients"     value={patients?.total}           sub={`+${patients?.new_this_month||0} this month`}       growth={patients?.growth_pct}  icon={Users}     iconBg="bg-blue-50"    iconCl="text-blue-500" />
        <KPI label="Revenue This Month" value={revenue?.this_month}       sub={`Today: ${fmtK(revenue?.today)}`}                   growth={revenue?.growth_pct}   icon={CreditCard} iconBg="bg-teal-50"    iconCl="text-teal-500"  isCurrency />
        <KPI label="Outstanding"        value={revenue?.outstanding}      sub="unpaid invoices"                                    icon={AlertTriangle}           iconBg="bg-amber-50"   iconCl="text-amber-500" isCurrency />
        <KPI label="Consultations"      value={consultations?.this_month} sub={`Today: ${consultations?.today||0}`}                icon={FileText}                iconBg="bg-purple-50"  iconCl="text-purple-500" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Appointments"       value={appointments?.this_month}  sub={`Today: ${appointments?.today||0}`}                 icon={Calendar}                iconBg="bg-indigo-50"  iconCl="text-indigo-500" />
        <KPI label="Lab Orders"         value={lab?.total}                sub={`${lab?.pending||0} pending`}                      icon={Beaker}                  iconBg="bg-orange-50"  iconCl="text-orange-500" />
        <KPI label="Active Maternity"   value={maternity?.active}         sub="open ANC cases"                                    icon={Heart}                   iconBg="bg-pink-50"    iconCl="text-pink-500" />
        <KPI label="Appts Today"        value={appointments?.today}       sub="scheduled today"                                    icon={Calendar}                iconBg="bg-green-50"   iconCl="text-green-500" />
      </div>
    </div>
  );
};

// ── Revenue Tab ───────────────────────────────────────────────────────────────
const RevenueTab = ({ data, payData, year, setYear }) => {
  const YEARS = [2023, 2024, 2025, 2026];
  if (!data) return <Skeleton />;
  const { trend = [], summary } = data;
  const maxRev = Math.max(...trend.map(r => r.revenue || 0), 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Revenue"  value={summary?.total}          icon={CreditCard} iconBg="bg-teal-50"    iconCl="text-teal-500"  isCurrency />
        <KPI label="Total Payments" value={summary?.payments}       icon={TrendingUp}  iconBg="bg-blue-50"    iconCl="text-blue-500" />
        <KPI label="Avg Payment"    value={summary?.avg_payment}    icon={Activity}    iconBg="bg-purple-50"  iconCl="text-purple-500" isCurrency />
        <KPI label="Largest Single" value={summary?.largest_payment}icon={ArrowUpRight}iconBg="bg-emerald-50" iconCl="text-emerald-500" isCurrency />
      </div>

      <Card title="Monthly Revenue Trend" icon={BarChart3} action={
        <select value={year} onChange={e => setYear(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 outline-none">
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
      }>
        {trend.length > 0 ? (
          <div className="space-y-2">
            <BarChartSVG data={trend} keyX="label" keyY="revenue" color="#0d9488" height={140} />
            <div className="space-y-2 mt-4">
              {trend.map((r, i) => (
                <HBar key={i} label={r.label} value={r.revenue} max={maxRev} color="bg-teal-500" extra={` · ${r.payment_count} payments`} />
              ))}
            </div>
          </div>
        ) : <p className="text-center text-slate-400 text-sm py-8">No payment data for {year}</p>}
      </Card>

      {payData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Payment Methods" icon={CreditCard}>
            <div className="space-y-3">
              {(payData.by_method || []).map((m, i) => (
                <HBar key={i} label={m.payment_method || 'Unknown'} value={m.total} max={payData.by_method[0]?.total || 1}
                  color="bg-indigo-500" extra={` (${m.pct}%)`} />
              ))}
            </div>
          </Card>
          <Card title="Top Paying Patients" icon={Users}>
            <div className="space-y-3">
              {(payData.top_patients || []).slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.invoices} invoice{p.invoices!==1?'s':''}</p>
                  </div>
                  <p className="text-sm font-bold text-teal-700 flex-shrink-0">{fmtK(p.total_paid)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ── Patients Tab ──────────────────────────────────────────────────────────────
const PatientsTab = ({ data }) => {
  if (!data) return <Skeleton />;
  const maxGender = Math.max(...(data.by_gender||[]).map(g=>g.count), 1);
  const maxAge    = Math.max(...(data.by_age_group||[]).map(a=>a.count), 1);
  return (
    <div className="space-y-5">
      <Card title="Patient Growth (Last 12 Months)" icon={TrendingUp}>
        <BarChartSVG data={data.growth||[]} keyX="month" keyY="new_patients" color="#3b82f6" height={120} />
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="By Gender" icon={Users}>
          <div className="space-y-3">
            {(data.by_gender||[]).map((g,i)=>(
              <HBar key={i} label={g.gender||'Unknown'} value={g.count} max={maxGender}
                color={g.gender==='Male'?'bg-blue-500':g.gender==='Female'?'bg-pink-500':'bg-slate-400'} />
            ))}
          </div>
        </Card>
        <Card title="By Age Group" icon={Users}>
          <div className="space-y-3">
            {(data.by_age_group||[]).map((a,i)=>(
              <HBar key={i} label={a.age_group} value={a.count} max={maxAge} color="bg-purple-500" />
            ))}
          </div>
        </Card>
        <Card title="Top Cities/LGAs" icon={Activity}>
          <div className="space-y-3">
            {(data.top_lgas||[]).map((l,i)=>(
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium truncate">{l.city}</span>
                <span className="text-slate-500 ml-2 flex-shrink-0 font-bold">{l.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Clinical Tab ──────────────────────────────────────────────────────────────
const ClinicalTab = ({ data, days, setDays }) => {
  if (!data) return <Skeleton />;
  const maxDx  = Math.max(...(data.top_diagnoses||[]).map(d=>d.count), 1);
  const maxLab = Math.max(...(data.top_lab_tests||[]).map(l=>l.orders), 1);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Period:</span>
        {[30, 60, 90, 180].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${days===d?'bg-teal-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {d}d
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Avg Visits/Patient" value={data.avg_visits_per_patient} icon={Users}  iconBg="bg-blue-50"    iconCl="text-blue-500" />
        <KPI label="Lab Tests"          value={data.lab_completion?.total}  icon={Beaker}  iconBg="bg-orange-50"  iconCl="text-orange-500" />
        <KPI label="Lab Completed"      value={data.lab_completion?.completed} icon={Activity} iconBg="bg-emerald-50" iconCl="text-emerald-500" />
        <KPI label="Completion Rate"    value={data.lab_completion?.completion_rate} icon={TrendingUp} iconBg="bg-teal-50" iconCl="text-teal-500" sub="%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Top Diagnoses" icon={FileText} iconCl="text-rose-500">
          <div className="space-y-3">
            {(data.top_diagnoses||[]).map((d,i)=>(
              <HBar key={i} label={d.diagnosis} value={d.count} max={maxDx} color="bg-rose-500" />
            ))}
            {!data.top_diagnoses?.length && <p className="text-slate-400 text-sm text-center py-4">No diagnoses recorded in this period</p>}
          </div>
        </Card>
        <Card title="Top Complaints" icon={Activity} iconCl="text-amber-500">
          <div className="space-y-3">
            {(data.top_complaints||[]).map((c,i)=>(
              <HBar key={i} label={c.chief_complaint} value={c.count} max={Math.max(...(data.top_complaints||[]).map(x=>x.count),1)} color="bg-amber-500" />
            ))}
            {!data.top_complaints?.length && <p className="text-slate-400 text-sm text-center py-4">No complaints recorded in this period</p>}
          </div>
        </Card>
        <Card title="Top Lab Tests" icon={Beaker} iconCl="text-orange-500">
          <div className="space-y-3">
            {(data.top_lab_tests||[]).map((l,i)=>(
              <HBar key={i} label={l.test_name} value={l.orders} max={maxLab} color="bg-orange-500"
                extra={` · ${l.completed} done`} />
            ))}
            {!data.top_lab_tests?.length && <p className="text-slate-400 text-sm text-center py-4">No lab orders in this period</p>}
          </div>
        </Card>
        <Card title="Consultations by Doctor" icon={Users} iconCl="text-blue-500">
          <div className="space-y-3">
            {(data.consults_by_doctor||[]).map((d,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">{i+1}</div>
                <p className="flex-1 text-sm font-medium text-slate-700 truncate">{d.doctor}</p>
                <span className="text-sm font-bold text-blue-700">{d.consultations}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Appointments Tab ──────────────────────────────────────────────────────────
const AppointmentsTab = ({ data }) => {
  if (!data) return <Skeleton />;
  const maxDay = Math.max(...(data.by_day||[]).map(d=>d.count), 1);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPI label="Total Appts"    value={data.by_status?.reduce((a,b)=>a+(b.count||0),0)} icon={Calendar} iconBg="bg-indigo-50" iconCl="text-indigo-500" />
        <KPI label="No-Show Rate"   value={data.no_show_rate?.no_show_rate} icon={AlertTriangle} iconBg="bg-red-50" iconCl="text-red-500" sub="%" />
        <KPI label="No-Shows"       value={data.no_show_rate?.no_shows}     icon={TrendingDown}  iconBg="bg-amber-50" iconCl="text-amber-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="By Status" icon={Activity}>
          <div className="space-y-3">
            {(data.by_status||[]).map((s,i)=>(
              <HBar key={i} label={s.status} value={s.count} max={data.by_status[0]?.count||1}
                color={s.status==='Completed'?'bg-emerald-500':s.status==='No Show'?'bg-red-500':s.status==='Cancelled'?'bg-slate-400':'bg-indigo-500'} />
            ))}
          </div>
        </Card>
        <Card title="Busiest Days of Week" icon={Calendar}>
          <div className="space-y-3">
            {(data.by_day||[]).map((d,i)=>(
              <HBar key={i} label={d.day} value={d.count} max={maxDay} color="bg-teal-500" />
            ))}
          </div>
        </Card>
        <Card title="Monthly Volume" icon={BarChart3} iconCl="text-indigo-500">
          <BarChartSVG data={data.by_month||[]} keyX="month" keyY="count" color="#6366f1" height={100} />
        </Card>
        <Card title="By Doctor" icon={Users}>
          <div className="space-y-3">
            {(data.by_doctor||[]).map((d,i)=>(
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">{i+1}</div>
                <p className="flex-1 text-sm font-medium text-slate-700 truncate">{d.doctor||'Unassigned'}</p>
                <span className="text-sm font-bold text-indigo-700">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Outstanding Tab ───────────────────────────────────────────────────────────
const OutstandingTab = ({ data }) => {
  if (!data) return <Skeleton />;
  const { aging = [], summary = {} } = data;
  const BUCKET_COLORS = {
    '0-30 days': 'bg-amber-100 text-amber-700',
    '31-60 days':'bg-orange-100 text-orange-700',
    '61-90 days':'bg-red-100 text-red-700',
    '90+ days':  'bg-red-200 text-red-800',
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total Outstanding" value={summary.total_outstanding}  icon={AlertTriangle} iconBg="bg-red-50"    iconCl="text-red-500"    isCurrency />
        <KPI label="0-30 Days"         value={summary.age_0_30}           icon={Activity}      iconBg="bg-amber-50"  iconCl="text-amber-500"  isCurrency />
        <KPI label="31-90 Days"        value={(summary.age_31_60||0)+(summary.age_61_90||0)} icon={TrendingUp} iconBg="bg-orange-50" iconCl="text-orange-500" isCurrency />
        <KPI label="90+ Days"          value={summary.age_90_plus}        icon={AlertTriangle} iconBg="bg-red-50"    iconCl="text-red-500"    isCurrency />
      </div>

      <Card title={`Unpaid Invoices (${aging.length})`} icon={CreditCard} iconCl="text-red-500">
        {aging.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-600 font-semibold">No outstanding invoices!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Invoice','Patient','Due Date','Total','Due','Days','Age',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aging.map((inv, i) => (
                  <tr key={inv.invoice_id} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/50'}`}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{inv.invoice_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{inv.patient_name}</p>
                      <p className="text-slate-400">{inv.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(inv.due_date||inv.invoice_date)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{fmt(inv.total_amount)}</td>
                    <td className="px-4 py-3 font-bold text-red-600">{fmt(inv.amount_due)}</td>
                    <td className="px-4 py-3 text-slate-600">{inv.days_overdue > 0 ? `${inv.days_overdue}d` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${BUCKET_COLORS[inv.aging_bucket] || 'bg-slate-100 text-slate-600'}`}>
                        {inv.aging_bucket}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
    {[...Array(8)].map((_,i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-28">
        <div className="w-8 h-8 bg-slate-100 rounded-xl mb-3" />
        <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
        <div className="h-6 bg-slate-100 rounded w-3/4" />
      </div>
    ))}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  const [overview, setOverview]     = useState(null);
  const [revenue, setRevenue]       = useState(null);
  const [payData, setPayData]       = useState(null);
  const [patients, setPatients]     = useState(null);
  const [clinical, setClinical]     = useState(null);
  const [appointments, setAppts]    = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [clinicalDays, setClinicalDays] = useState(90);
  const [loading, setLoading]       = useState({});
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async (tab) => {
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      switch (tab) {
        case 'overview': {
          const r = await api.get('/analytics/overview');
          setOverview(r.data);
          break;
        }
        case 'revenue': {
          const [rev, pay] = await Promise.all([
            api.get('/analytics/revenue', { params: { year: revenueYear } }),
            api.get('/analytics/payment-methods'),
          ]);
          setRevenue(rev.data);
          setPayData(pay.data);
          break;
        }
        case 'patients': {
          const r = await api.get('/analytics/patients');
          setPatients(r.data);
          break;
        }
        case 'clinical': {
          const r = await api.get('/analytics/clinical', { params: { days: clinicalDays } });
          setClinical(r.data);
          break;
        }
        case 'appointments': {
          const r = await api.get('/analytics/appointments');
          setAppts(r.data);
          break;
        }
        case 'outstanding': {
          const r = await api.get('/analytics/outstanding');
          setOutstanding(r.data);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      showToast(err.response?.data?.error || `Failed to load ${tab} data`);
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  }, [revenueYear, clinicalDays]);

  // Load tab data on switch
  useEffect(() => { load(activeTab); }, [activeTab, load]);

  // Reload revenue when year changes
  useEffect(() => {
    if (activeTab === 'revenue') load('revenue');
  }, [revenueYear, activeTab, load]);

  // Reload clinical when days changes
  useEffect(() => {
    if (activeTab === 'clinical') load('clinical');
  }, [clinicalDays, activeTab, load]);

  const isLoading = loading[activeTab];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .fade-in{animation:fadeIn .35s ease both}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      `}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${toast.type==='error'?'bg-red-500':'bg-teal-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-teal-500" /> Analytics & Reports
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">CliniCore performance overview · Live data</p>
          </div>
          <button onClick={() => load(activeTab)}
            className="fade-in flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                ${activeTab===tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 fade-in">
        {activeTab === 'overview'     && <OverviewTab     data={overview} />}
        {activeTab === 'revenue'      && <RevenueTab      data={revenue} payData={payData} year={revenueYear} setYear={setRevenueYear} />}
        {activeTab === 'patients'     && <PatientsTab     data={patients} />}
        {activeTab === 'clinical'     && <ClinicalTab     data={clinical} days={clinicalDays} setDays={setClinicalDays} />}
        {activeTab === 'appointments' && <AppointmentsTab data={appointments} />}
        {activeTab === 'outstanding'  && <OutstandingTab  data={outstanding} />}
      </div>
    </div>
  );
}