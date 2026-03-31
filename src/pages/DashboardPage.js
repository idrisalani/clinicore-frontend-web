import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);

        const permData = await userService.getPermissions();
        setPermissions(permData.permissions);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error:', err);
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-semibold">{error}</p>
          <p className="text-red-600 text-sm mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">CliniCore</h1>
            <p className="text-gray-600 text-sm">Healthcare Management System</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {user?.full_name}! 👋
          </h2>
          <p className="text-gray-600">Here's your account overview</p>
        </div>

        {/* User Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User ID Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-1">USER ID</p>
            <p className="text-2xl font-bold text-blue-600">{user?.user_id}</p>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-1">EMAIL</p>
            <p className="text-lg font-bold text-gray-800">{user?.email}</p>
          </div>

          {/* Role Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-1">ROLE</p>
            <p className="text-lg font-bold text-green-600 uppercase">{user?.role}</p>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-1">PHONE</p>
            <p className="text-lg font-bold text-gray-800">{user?.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Your Permissions ({permissions.length})
          </h3>
          
          {permissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((perm, idx) => (
                <div key={idx} className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="font-semibold text-blue-700">{perm.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Action: <span className="font-mono">{perm.action}</span>
                  </p>
                  {perm.resource && (
                    <p className="text-sm text-gray-600 mt-1">
                      Resource: <span className="font-mono">{perm.resource}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No permissions assigned</p>
          )}
        </div>

        {/* User Profile Section */}
        {user?.department && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Department Information</h3>
            <p className="text-gray-700">
              <span className="font-semibold">Department:</span> {user.department}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}