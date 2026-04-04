import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, DollarSign, AlertCircle, CreditCard,
  BarChart3, RefreshCw, Calendar, Users,
  ArrowUpRight, ArrowDownRight, Clock,
} from 'lucide-react';
import AccessDenied from '../components/AccessDenied';
import { useRole } from '../hooks/useRole';
import { useToast } from '../hooks/useToast';
import {
  getFinancialSummary, getRevenueReport,
  getRevenueByService, getOutstandingReport,
} from '../services/financialReportService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
const pct = (a, b) => b ? (((a - b) / b) * 100).toFixed(1) : 0;

// ── Sub-components ────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-10 h-10 rounded-full animate-spin" style={{border:'3px solid #e2e8f0', borderTopColor:'#0d9488'}} />
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, sub, bg, iconColor, trend, trendLabel }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${Number(trend) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {Number(trend) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {Math.abs(trend)}% {trendLabel}
      </div>
    )}
  </div>
);

const MiniBar = ({ label, value, max, color = 'bg-teal-500' }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-500">{fmt(value)}</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{width: max ? `${Math.min(100,(value/max)*100)}%` : '0%'}} />
    </div>
  </div>
);

const Badge = ({ text, color }) => (
  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>{text}</span>
);

// ── Simple bar chart using divs ───────────────────────────────────────────────
const BarChart = ({ data }) => {
  if (!data?.length) return <p className="text-slate-400 text-sm text-center py-8">No revenue data for this period</p>;
  const max = Math.max(...data.map(d => d.revenue || 0));
  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative flex-1 flex items-end w-full">
            <div
              className="w-full bg-teal-500 hover:bg-teal-600 rounded-t-md transition-all cursor-default"
              style={{height: max ? `${Math.max(4,(d.revenue/max)*100)}%` : '4px', minHeight:4}}
              title={`${d.label}: ${fmt(d.revenue)}`}
            />
          </div>
          <p className="text-[9px] text-slate-400 truncate w-full text-center">{d.label?.split(' ')[0]}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PERIODS = [{ label: 'Monthly', value: 'monthly' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }];
const YEARS   = [2026, 2025, 2024].map(y => ({ label: String(y), value: y }));

const FinancialReportsPage = () => {
  const { permissions } = useRole();
  const p = permissions.billing;
  const { showToast, Toast } = useToast();

  const [summary,     setSummary]     = useState(null);
  const [revenue,     setRevenue]     = useState(null);
  const [byService,   setByService]   = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [period,      setPeriod]      = useState('monthly');
  const [year,        setYear]        = useState(new Date().getFullYear());
  const [activeTab,   setActiveTab]   = useState('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, b, o] = await Promise.all([
        getFinancialSummary(),
        getRevenueReport({ period, year }),
        getRevenueByService(),
        getOutstandingReport(),
      ]);
      setSummary(s);
      setRevenue(r);
      setByService(b);
      setOutstanding(o);
    } catch { showToast('Failed to load financial data', 'error'); }
    finally { setLoading(false); }
  }, [period, year, showToast]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (p.isBlocked) return <AccessDenied message="You do not have access to financial reports." />;

  // Month-on-month trend
  const months = byService?.monthComparison || [];
  const currentM  = months.find(m => m.month === new Date().toISOString().slice(0,7));
  const previousM = months.find(m => m.month !== new Date().toISOString().slice(0,7));
  const momTrend  = pct(currentM?.revenue, previousM?.revenue);

  const maxMethodVal = Math.max(...(byService?.byMethod || []).map(m => m.total || 0));
  const TABS = ['overview', 'revenue', 'outstanding', 'payments'];

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`.fade-in{animation:fadeIn .4s ease both}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="fade-in">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Reports</h1>
            <p className="text-slate-400 text-sm mt-0.5">Revenue analytics · Outstanding · Payment methods</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400 cursor-pointer">
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400 cursor-pointer">
              {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
            <button onClick={fetchAll}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
          <SummaryCard icon={DollarSign} label="Today's Revenue"
            value={fmt(summary?.today?.revenue)}
            sub={`${summary?.today?.payments || 0} payments`}
            bg="bg-teal-50" iconColor="text-teal-500" />
          <SummaryCard icon={TrendingUp} label="This Month"
            value={fmt(summary?.this_month?.revenue)}
            sub={`${summary?.this_month?.payments || 0} payments`}
            bg="bg-blue-50" iconColor="text-blue-500"
            trend={momTrend} trendLabel="vs last month" />
          <SummaryCard icon={BarChart3} label="This Year"
            value={fmt(summary?.this_year?.revenue)}
            sub={`${summary?.this_year?.payments || 0} payments`}
            bg="bg-violet-50" iconColor="text-violet-500" />
          <SummaryCard icon={AlertCircle} label="Outstanding"
            value={fmt(summary?.outstanding?.amount)}
            sub={`${summary?.outstanding?.invoices || 0} invoices unpaid`}
            bg="bg-red-50" iconColor="text-red-500" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === t ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}>
              {t === 'overview' ? 'Overview' : t === 'revenue' ? 'Revenue Trend' :
               t === 'outstanding' ? 'Outstanding' : 'Payment Methods'}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : (

          <>
            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">

                {/* Revenue chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Revenue — {period.charAt(0).toUpperCase()+period.slice(1)}</h3>
                    <span className="text-xs text-slate-400">{year}</span>
                  </div>
                  <BarChart data={revenue?.revenue} />
                  <div className="flex justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
                    <span>Total: <b className="text-slate-700">{fmt(revenue?.summary?.total_revenue)}</b></span>
                    <span>Avg: <b className="text-slate-700">{fmt(revenue?.summary?.avg_payment)}</b></span>
                    <span>Payments: <b className="text-slate-700">{revenue?.summary?.total_payments || 0}</b></span>
                  </div>
                </div>

                {/* Invoice status breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Invoice Status Breakdown</h3>
                  {byService?.byStatus?.length ? (
                    <div className="space-y-3">
                      {byService.byStatus.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge text={s.status}
                              color={
                                s.status === 'Paid'          ? 'bg-emerald-100 text-emerald-700' :
                                s.status === 'Partially Paid'? 'bg-amber-100 text-amber-700'     :
                                s.status === 'Overdue'       ? 'bg-red-100 text-red-700'          :
                                s.status === 'Draft'         ? 'bg-slate-100 text-slate-600'      :
                                'bg-blue-100 text-blue-700'
                              } />
                            <span className="text-xs text-slate-400">{s.count} invoices</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{fmt(s.total_amount)}</p>
                            {s.amount_outstanding > 0 && (
                              <p className="text-xs text-red-400">{fmt(s.amount_outstanding)} outstanding</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 text-sm text-center py-8">No invoice data available</p>}
                </div>

                {/* Top patients */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-500" /> Top Paying Patients
                  </h3>
                  {byService?.topPatients?.length ? (
                    <div className="space-y-3">
                      {byService.topPatients.slice(0,8).map((pt, i) => (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {i+1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{pt.patient_name}</p>
                            <p className="text-xs text-slate-400">{pt.phone} · {pt.invoice_count} invoice{pt.invoice_count!==1?'s':''}</p>
                          </div>
                          <p className="text-sm font-bold text-teal-700 flex-shrink-0">{fmt(pt.total_paid)}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 text-sm text-center py-8">No patient payment data available</p>}
                </div>

                {/* Month comparison */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Month-on-Month
                  </h3>
                  <div className="space-y-4">
                    {months.length ? months.map((m, i) => (
                      <div key={i} className={`rounded-xl p-4 ${i===0 ? 'bg-teal-50 border border-teal-100':'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-slate-700">{m.month}</p>
                          <p className={`text-lg font-black ${i===0?'text-teal-700':'text-slate-600'}`}>{fmt(m.revenue)}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{m.payments} payments</p>
                      </div>
                    )) : <p className="text-slate-400 text-sm text-center py-8">No comparison data available</p>}
                    {months.length === 2 && (
                      <div className={`flex items-center gap-2 text-sm font-bold mt-2 ${Number(momTrend)>=0?'text-emerald-600':'text-red-500'}`}>
                        {Number(momTrend)>=0?<ArrowUpRight className="w-4 h-4"/>:<ArrowDownRight className="w-4 h-4"/>}
                        {Math.abs(momTrend)}% vs previous month
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── REVENUE TREND ── */}
            {activeTab === 'revenue' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">Revenue Trend — {period} · {year}</h3>
                  <div className="flex gap-4 text-sm">
                    <div><span className="text-slate-400">Total: </span><span className="font-black text-teal-700">{fmt(revenue?.summary?.total_revenue)}</span></div>
                    <div><span className="text-slate-400">Avg: </span><span className="font-bold text-slate-700">{fmt(revenue?.summary?.avg_payment)}</span></div>
                  </div>
                </div>
                <BarChart data={revenue?.revenue} />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                        <th className="text-right py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
                        <th className="text-right py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Payments</th>
                        <th className="text-right py-2 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(revenue?.revenue || []).map((r, i) => (
                        <tr key={i} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/50'} hover:bg-teal-50/40 transition-colors`}>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{r.label}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-teal-700">{fmt(r.revenue)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{r.payment_count}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">{fmt(r.avg_payment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── OUTSTANDING ── */}
            {activeTab === 'outstanding' && (
              <div className="space-y-5 fade-in">
                {/* Aging buckets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key:'current_30', label:'0 – 30 days', color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-100' },
                    { key:'days_31_60', label:'31 – 60 days', color:'text-amber-600',  bg:'bg-amber-50 border-amber-100'    },
                    { key:'days_61_90', label:'61 – 90 days', color:'text-orange-600', bg:'bg-orange-50 border-orange-100'  },
                    { key:'over_90',    label:'Over 90 days', color:'text-red-600',    bg:'bg-red-50 border-red-100'        },
                  ].map(b => (
                    <div key={b.key} className={`rounded-2xl border p-4 ${b.bg}`}>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{b.label}</p>
                      <p className={`text-xl font-black mt-1 ${b.color}`}>{fmt(outstanding?.aging?.[b.key])}</p>
                    </div>
                  ))}
                </div>

                {/* Outstanding table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Unpaid Invoices</h3>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                      {outstanding?.outstanding?.length || 0} invoices · {fmt(outstanding?.aging?.total_outstanding)} total
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {['Patient','Phone','Invoice Date','Due Date','Amount Due','Status','Days Overdue'].map(h => (
                            <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {outstanding?.outstanding?.length ? outstanding.outstanding.map((inv, i) => (
                          <tr key={i} className={`border-b border-slate-50 ${i%2===0?'bg-white':'bg-slate-50/40'} hover:bg-teal-50/30 transition-colors`}>
                            <td className="py-3 px-4 font-semibold text-slate-800">{inv.first_name} {inv.last_name}</td>
                            <td className="py-3 px-4 text-slate-500">{inv.phone}</td>
                            <td className="py-3 px-4 text-slate-500">{inv.invoice_date?.slice(0,10)}</td>
                            <td className="py-3 px-4 text-slate-500">{inv.due_date?.slice(0,10) || '—'}</td>
                            <td className="py-3 px-4 font-bold text-red-600">{fmt(inv.amount_due)}</td>
                            <td className="py-3 px-4">
                              <Badge text={inv.aging_status}
                                color={inv.aging_status==='Overdue'?'bg-red-100 text-red-700':inv.aging_status==='Partial'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'} />
                            </td>
                            <td className="py-3 px-4">
                              {inv.days_overdue > 0
                                ? <span className="font-bold text-red-500">{inv.days_overdue}d overdue</span>
                                : <span className="text-slate-400">—</span>}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={7} className="py-12 text-center text-slate-400">No outstanding invoices 🎉</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── PAYMENT METHODS ── */}
            {activeTab === 'payments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                {/* Method bars */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-teal-500" /> Revenue by Payment Method
                  </h3>
                  {byService?.byMethod?.length ? (
                    <div className="space-y-4">
                      {byService.byMethod.map((m, i) => (
                        <div key={i}>
                          <MiniBar
                            label={`${m.payment_method} (${m.percentage}%)`}
                            value={m.total}
                            max={maxMethodVal}
                            color={['bg-teal-500','bg-blue-500','bg-violet-500','bg-amber-500','bg-emerald-500','bg-rose-500'][i % 6]}
                          />
                          <p className="text-xs text-slate-400 mt-0.5 pl-0.5">{m.count} transactions</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-400 text-sm text-center py-8">No payment data available</p>}
                </div>

                {/* This month summary card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> This Month's Summary
                  </h3>
                  <div className="space-y-4">
                    {(summary?.payment_methods || []).map((m, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm font-medium text-slate-600">{m.payment_method}</span>
                        <span className="text-sm font-bold text-teal-700">{fmt(m.total)}</span>
                      </div>
                    ))}
                    {!summary?.payment_methods?.length && (
                      <p className="text-slate-400 text-sm text-center py-8">No payments recorded this month</p>
                    )}
                  </div>
                  {summary?.this_month?.revenue > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                      <span className="text-sm font-semibold text-slate-600">Month Total</span>
                      <span className="text-lg font-black text-teal-700">{fmt(summary?.this_month?.revenue)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Toast />
    </div>
  );
};

export default FinancialReportsPage;