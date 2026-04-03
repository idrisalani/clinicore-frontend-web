import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Edit2, Trash2, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const STATUS = {
  Scheduled:   { badge: 'bg-blue-100 text-blue-700',   icon: <Clock       className="w-3.5 h-3.5" /> },
  Completed:   { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  Cancelled:   { badge: 'bg-red-100 text-red-700',     icon: <XCircle     className="w-3.5 h-3.5" /> },
  'No-Show':   { badge: 'bg-orange-100 text-orange-700', icon: <XCircle   className="w-3.5 h-3.5" /> },
  Rescheduled: { badge: 'bg-purple-100 text-purple-700', icon: <Clock     className="w-3.5 h-3.5" /> },
};

const AppointmentTable = ({
  appointments = [], isLoading = false,
  onEdit = null, onCancel = null,
  onSort = null, sortBy = 'appointment_date', sortOrder = 'asc',
}) => {
  const [hovered, setHovered] = useState(null);

  const sort = (f) => { if (onSort) onSort(f, sortBy === f && sortOrder === 'asc' ? 'desc' : 'asc'); };

  const SortBtn = ({ field, children }) => (
    <button onClick={() => sort(field)} className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-teal-600 transition-colors">
      {children}
      {sortBy === field ? (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 text-slate-300" />}
    </button>
  );

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—';

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3,borderStyle:'solid'}} />
    </div>
  );

  if (!appointments.length) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-500 font-semibold">No appointments found</p>
      <p className="text-slate-400 text-sm mt-1">Schedule your first appointment</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-4 text-left"><SortBtn field="appointment_date">Date & Time</SortBtn></th>
            <th className="px-5 py-4 text-left"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</span></th>
            <th className="px-5 py-4 text-left"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</span></th>
            <th className="px-5 py-4 text-left"><SortBtn field="status">Status</SortBtn></th>
            <th className="px-5 py-4 text-left"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</span></th>
            <th className="px-5 py-4 text-right"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt, idx) => {
            const s = STATUS[apt.status] || STATUS.Scheduled;
            return (
              <tr key={apt.appointment_id}
                className={`border-b border-slate-50 transition-all duration-150 ${hovered === apt.appointment_id ? 'bg-teal-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                onMouseEnter={() => setHovered(apt.appointment_id)}
                onMouseLeave={() => setHovered(null)}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800 text-sm">{fmtDate(apt.appointment_date)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{apt.appointment_time || '—'}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800 text-sm">{apt.first_name} {apt.last_name}</p>
                  <p className="text-xs text-slate-400">{apt.phone}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate">{apt.reason_for_visit}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
                    {s.icon} {apt.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">{apt.duration_minutes || 30} min</td>
                <td className="px-5 py-4">
                  <div className={`flex justify-end gap-1 transition-opacity duration-150 ${hovered === apt.appointment_id ? 'opacity-100' : 'opacity-0'}`}>
                    {onEdit && apt.status !== 'Completed' && (
                      <button onClick={() => onEdit(apt.appointment_id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onCancel && apt.status !== 'Cancelled' && (
                      <button onClick={() => onCancel(apt.appointment_id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;