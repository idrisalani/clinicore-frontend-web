import React from 'react';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';

/**
 * Lab Results Display Component
 * Shows lab test results in professional format
 */
const LabResults = ({ results = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No results available yet</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Abnormal':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'Critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-50 border-green-200';
      case 'Abnormal':
        return 'bg-orange-50 border-orange-200';
      case 'Critical':
        return 'bg-red-50 border-red-200';
      case 'Pending':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Abnormal':
        return 'bg-orange-100 text-orange-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div
          key={result.result_id}
          className={`border rounded-lg p-4 ${getStatusColor(result.result_status)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(result.result_status)}
              <div>
                <h4 className="font-semibold text-gray-900">Lab Result</h4>
                <p className="text-sm text-gray-600">
                  {new Date(result.test_date).toLocaleDateString('en-NG')}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadgeColor(
                result.result_status
              )}`}
            >
              {result.result_status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Result Value:</p>
              <p className="font-semibold text-gray-900">{result.result_value}</p>
            </div>
            {result.unit && (
              <div>
                <p className="text-gray-600">Unit:</p>
                <p className="font-semibold text-gray-900">{result.unit}</p>
              </div>
            )}
            {result.reference_range && (
              <div>
                <p className="text-gray-600">Reference Range:</p>
                <p className="font-semibold text-gray-900">{result.reference_range}</p>
              </div>
            )}
            {result.performed_by && (
              <div>
                <p className="text-gray-600">Performed By:</p>
                <p className="font-semibold text-gray-900">{result.performed_by}</p>
              </div>
            )}
          </div>

          {result.interpretation && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Interpretation:</p>
              <p className="text-sm text-gray-800">{result.interpretation}</p>
            </div>
          )}

          {result.notes && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Notes:</p>
              <p className="text-sm text-gray-800">{result.notes}</p>
            </div>
          )}

          {result.completion_date && (
            <p className="text-xs text-gray-500 mt-3">
              Completed: {new Date(result.completion_date).toLocaleDateString('en-NG')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default LabResults;