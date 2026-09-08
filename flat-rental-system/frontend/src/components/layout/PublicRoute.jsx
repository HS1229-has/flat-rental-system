import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // If already logged in, redirect away from public routes like login/register
  if (user) {
    switch (user.role) {
      case 'TENANT':
        return <Navigate to="/tenant/dashboard" replace />;
      case 'OWNER':
        return <Navigate to="/owner/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
