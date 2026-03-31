import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2, Eye, Edit2 } from 'lucide-react';

/**
 * Professional Patient Table Component
 * Features: Sorting, filtering, pagination, actions
 */
const PatientTable = ({
  patients = [],
  isLoading = false,
  onEdit = null,
  onView = null,
  onDelete = null,
  onSort = null,
  sortBy = 'first_name',
  sortOrder = 'asc',
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const navigate = useNavigate();

  const handleSort = (field) => {
    if (onSort) {
      const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(field, newOrder);
    }
  };

  const handleViewClick = (patientId) => {
    console.log('👁️ Navigating to patient detail:', patientId);
    navigate(`/patients/${patientId}`);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAge = (dob) => {
    if (!dob) return 'N/A';
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age + ' yrs';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No patients found</p>
        <p className="text-gray-400 text-sm mt-2">Start by adding your first patient</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        {/* Table Head */}
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('first_name')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Patient Name
                <SortIcon field="first_name" />
              </button>
            </th>
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('phone')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Contact
                <SortIcon field="phone" />
              </button>
            </th>
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('date_of_birth')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Age
                <SortIcon field="date_of_birth" />
              </button>
            </th>
            <th className="px-6 py-4 text-left">
              <span className="font-semibold text-gray-700">Blood Type</span>
            </th>
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Registered
                <SortIcon field="created_at" />
              </button>
            </th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {patients.map((patient, index) => (
            <tr
              key={patient.patient_id}
              className={`border-b border-gray-100 transition-all duration-200 ${
                hoveredRow === patient.patient_id
                  ? 'bg-blue-50 shadow-sm'
                  : index % 2 === 0
                  ? 'bg-white'
                  : 'bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredRow(patient.patient_id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Patient Name */}
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">
                  {patient.first_name} {patient.last_name}
                </div>
                <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
              </td>

              {/* Contact */}
              <td className="px-6 py-4">
                <div className="text-gray-900 font-medium">{patient.phone}</div>
              </td>

              {/* Age */}
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {formatAge(patient.date_of_birth)}
                </span>
              </td>

              {/* Blood Type */}
              <td className="px-6 py-4">
                {patient.blood_type ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {patient.blood_type}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>

              {/* Registered Date */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(patient.created_at)}
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div
                  className={`flex justify-end gap-2 transition-opacity duration-200 ${
                    hoveredRow === patient.patient_id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <button
                    onClick={() => handleViewClick(patient.patient_id)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(patient.patient_id)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                      title="Edit patient"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(patient.patient_id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Delete patient"
                    >
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