import React from 'react';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role: 'hr' | 'applicant';
  name: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('hr' | 'applicant')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userString = localStorage.getItem('user');
  
  if (!userString) {
    // No user found, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user: User = JSON.parse(userString);
    
    // If specific roles are required, check if user has permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have required role, redirect to appropriate page
      if (user.role === 'hr') {
        return <Navigate to="/hr" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
    
    // User is authenticated and has required role
    return <>{children}</>;
  } catch (error) {
    // Invalid user data in localStorage, clear it and redirect to login
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
