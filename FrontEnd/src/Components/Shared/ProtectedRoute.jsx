import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // 1. If not authenticated -> redirect to home (/) for login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // 2. If role is specified and current user's role is not allowed -> redirect to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'hr') {
      return <Navigate to="/employees/all" replace />;
    } else if (user.role === 'employee' || user.role === 'department supervisor') {
      return <Navigate to="/portal/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. If authenticated and role matches -> render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
