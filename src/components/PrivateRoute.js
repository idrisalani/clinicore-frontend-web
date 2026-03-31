import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}