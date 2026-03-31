import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit2, CheckCircle, Clock, XCircle } from 'lucide-react';

/**
 * Professional Appointment Table Component
 */
const AppointmentTable = ({
  appointments = [],
  isLoading = false,
  onEdit = null,
  onCancel = null,
  onSort = null,
  sortBy = 'appointment_date',
  sortOrder = 'asc',
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (field) => {
    if (onSort) {
      const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(field, newOrder);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled':
      case 'No-Show':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No-Show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No appointments found</p>
        <p className="text-gray-400 text-sm mt-2">Schedule your first appointment</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('appointment_date')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Date & Time
                <SortIcon field="appointment_date" />
              </button>
            </th>
            <th className="px-6 py-4 text-left">
              <span className="font-semibold text-gray-700">Patient</span>
            </th>
            <th className="px-6 py-4 text-left">
              <span className="font-semibold text-gray-700">Reason</span>
            </th>
            <th className="px-6 py-4 text-left">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Status
                <SortIcon field="status" />
              </button>
            </th>
            <th className="px-6 py-4 text-left">Duration</th>
            <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((apt, index) => (
            <tr
              key={apt.appointment_id}
              className={`border-b border-gray-100 transition-all duration-200 ${
                hoveredRow === apt.appointment_id
                  ? 'bg-blue-50 shadow-sm'
                  : index % 2 === 0
                  ? 'bg-white'
                  : 'bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredRow(apt.appointment_id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Date & Time */}
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">
                  {formatDate(apt.appointment_date)}
                </div>
                <div className="text-sm text-gray-600">{apt.appointment_time}</div>
              </td>

              {/* Patient */}
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">
                  {apt.first_name} {apt.last_name}
                </div>
                <div className="text-sm text-gray-600">{apt.phone}</div>
              </td>

              {/* Reason */}
              <td className="px-6 py-4">
                <div className="text-gray-900">{apt.reason_for_visit}</div>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(apt.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </td>

              {/* Duration */}
              <td className="px-6 py-4 text-sm text-gray-600">
                {apt.duration_minutes || 30} min
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div
                  className={`flex justify-end gap-2 transition-opacity duration-200 ${
                    hoveredRow === apt.appointment_id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {onEdit && apt.status !== 'Completed' && (
                    <button
                      onClick={() => onEdit(apt.appointment_id)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                      title="Edit appointment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onCancel && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => onCancel(apt.appointment_id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Cancel appointment"
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

export default AppointmentTable;