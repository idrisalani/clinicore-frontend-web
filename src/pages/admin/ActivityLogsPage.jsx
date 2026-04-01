// ============================================
// ActivityLogsPage Component - Activity Logs
// File: frontend-web/src/pages/admin/ActivityLogsPage.jsx
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Trash2, Eye, X } from 'lucide-react';

export default function ActivityLogsPage() {
  const pageSize = 50;  // ✅ Define pageSize constant
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [daysToDelete, setDaysToDelete] = useState(90);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { activityLogs, loading, fetchActivityLogs, getActivityLogById, clearOldActivityLogs } = useAdmin();

  const loadLogs = useCallback(async () => {
    try {
      const pageSize = 50;
      await fetchActivityLogs(pageSize, currentPage * pageSize);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }, [currentPage, fetchActivityLogs]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleViewDetails = async (log) => {
    try {
      const details = await getActivityLogById(log.log_id);
      setSelectedLog(details);
      setShowDetails(true);
    } catch (err) {
      alert('Failed to load log details: ' + err.message);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearOldActivityLogs(daysToDelete);
      alert('Old logs cleared successfully');
      await loadLogs();
      setShowDeleteDialog(false);
    } catch (err) {
      alert('Failed to clear logs: ' + err.message);
    }
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-800',
      'UPDATE': 'bg-blue-100 text-blue-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-gray-100 text-gray-800',
      'LIST': 'bg-purple-100 text-purple-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Activity Logs</h2>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Trash2 size={20} />
          Clear Old Logs
        </button>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Clear Old Activity Logs</h3>
            <p className="text-gray-600 mb-4">
              This will delete all activity logs older than the specified number of days.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days old
              </label>
              <input
                type="number"
                value={daysToDelete}
                onChange={(e) => setDaysToDelete(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                min="1"
                max="365"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Log Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Log ID</p>
                  <p className="font-semibold">{selectedLog.log_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-semibold">{selectedLog.username || 'System'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Action</p>
                  <p className="font-semibold">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource</p>
                  <p className="font-semibold">{selectedLog.resource_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="font-semibold">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-semibold">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedLog.resource_id && (
                <div>
                  <p className="text-sm text-gray-600">Resource ID</p>
                  <p className="font-semibold">{selectedLog.resource_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">IP Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activityLogs?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No activity logs yet
                    </td>
                  </tr>
                ) : (
                  activityLogs?.map(log => (
                    <tr key={log.log_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {log.username || 'System'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{log.resource_type}</td>
                      <td className="px-6 py-4 text-sm font-mono text-xs text-gray-600">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing page {currentPage + 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!activityLogs || activityLogs.length < pageSize}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}