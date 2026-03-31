import { Navigate } from 'react-router-dom';
import { tokenManager } from '../../utils/tokenManager.js';

export const PrivateRoute = ({ children }) => {
  if (!tokenManager.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};