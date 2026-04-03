import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const STATUS = {
  Normal:   { bg:'bg-emerald-50 border-emerald-200', badge:'bg-emerald-100 text-emerald-700', icon:<CheckCircle className="w-4 h-4 text-emerald-500" /> },
  Abnormal: { bg:'bg-orange-50 border-orange-200',   badge:'bg-orange-100 text-orange-700',  icon:<AlertCircle className="w-4 h-4 text-orange-500" /> },
  Critical: { bg:'bg-red-50 border-red-200',         badge:'bg-red-100 text-red-700',        icon:<AlertCircle className="w-4 h-4 text-red-500" /> },
  Pending:  { bg:'bg-slate-50 border-slate-200',     badge:'bg-slate-100 text-slate-600',    icon:<Clock className="w-4 h-4 text-slate-400" /> },
};

const LabResults = ({ results = [], isLoading = false }) => {
  if (isLoading) return (
    <div className="flex items-center justify-center h-24">
      <div className="w-8 h-8 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
    </div>
  );

  if (!results?.length) return (
    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p className="text-slate-400 text-sm font-medium">No results available yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {results.map((r) => {
        const s = STATUS[r.result_status] || STATUS.Pending;
        return (
          <div key={r.result_id} className={`rounded-2xl border p-4 ${s.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {s.icon}
                <div>
                  <p className="text-sm font-bold text-slate-800">Lab Result</p>
                  <p className="text-xs text-slate-400">{r.test_date ? new Date(r.test_date).toLocaleDateString('en-NG') : '—'}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>{r.result_status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Result</p><p className="font-black text-slate-800 text-lg mt-0.5">{r.result_value}{r.unit ? ` ${r.unit}` : ''}</p></div>
              {r.reference_range && <div><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Reference</p><p className="font-semibold text-slate-600 mt-0.5">{r.reference_range}</p></div>}
              {r.performed_by && <div><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Performed By</p><p className="font-semibold text-slate-600 mt-0.5">{r.performed_by}</p></div>}
              {r.completion_date && <div><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Completed</p><p className="font-semibold text-slate-600 mt-0.5">{new Date(r.completion_date).toLocaleDateString('en-NG')}</p></div>}
            </div>

            {r.interpretation && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Interpretation</p>
                <p className="text-sm text-slate-700">{r.interpretation}</p>
              </div>
            )}
            {r.notes && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-600">{r.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LabResults;