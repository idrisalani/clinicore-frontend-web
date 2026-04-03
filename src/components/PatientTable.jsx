import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Eye, Edit2, Trash2, User } from 'lucide-react';

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" style={{borderWidth:3}} />
  </div>
);

const PatientTable = ({
  patients = [], isLoading = false,
  onEdit = null, onView = null, onDelete = null,
  onSort = null, sortBy = 'first_name', sortOrder = 'asc',
}) => {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const sort = (field) => { if (onSort) onSort(field, sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc'); };

  const SortBtn = ({ field, children }) => (
    <button onClick={() => sort(field)} className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-teal-600 transition-colors group">
      {children}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {sortBy === field ? (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 text-slate-300" />}
      </span>
    </button>
  );

  const age = (dob) => { if (!dob) return '—'; const a = new Date().getFullYear() - new Date(dob).getFullYear(); return `${a}y`; };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : '—';

  const initials = (p) => `${(p.first_name||'')[0]||''}${(p.last_name||'')[0]||''}`.toUpperCase();
  const avatarColor = (id) => {
    const c = ['bg-teal-500','bg-blue-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-emerald-500'];
    return c[(id||0) % c.length];
  };

  if (isLoading) return <Spinner />;

  if (!patients.length) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <User className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-500 font-semibold">No patients found</p>
      <p className="text-slate-400 text-sm mt-1">Add your first patient to get started</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-5 py-4 text-left"><SortBtn field="first_name">Patient</SortBtn></th>
            <th className="px-5 py-4 text-left"><SortBtn field="phone">Contact</SortBtn></th>
            <th className="px-5 py-4 text-left"><SortBtn field="date_of_birth">Age</SortBtn></th>
            <th className="px-5 py-4 text-left"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood</span></th>
            <th className="px-5 py-4 text-left"><SortBtn field="created_at">Registered</SortBtn></th>
            <th className="px-5 py-4 text-right"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((pt, idx) => (
            <tr key={pt.patient_id}
              className={`border-b border-slate-50 transition-all duration-150 ${hovered === pt.patient_id ? 'bg-teal-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
              onMouseEnter={() => setHovered(pt.patient_id)}
              onMouseLeave={() => setHovered(null)}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(pt.patient_id)}`}>
                    {initials(pt)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{pt.first_name} {pt.last_name}</p>
                    <p className="text-xs text-slate-400">{pt.email || 'No email'}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm font-medium text-slate-700">{pt.phone}</td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{age(pt.date_of_birth)}</span>
              </td>
              <td className="px-5 py-4">
                {pt.blood_type
                  ? <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full">{pt.blood_type}</span>
                  : <span className="text-slate-300 text-sm">—</span>}
              </td>
              <td className="px-5 py-4 text-xs text-slate-400">{fmtDate(pt.created_at)}</td>
              <td className="px-5 py-4">
                <div className={`flex justify-end gap-1 transition-opacity duration-150 ${hovered === pt.patient_id ? 'opacity-100' : 'opacity-0'}`}>
                  <button onClick={() => navigate(`/patients/${pt.patient_id}`)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-100 text-teal-600 transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button onClick={() => onEdit(pt.patient_id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(pt.patient_id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;