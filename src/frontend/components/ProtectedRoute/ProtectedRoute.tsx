// frontend/src/frontend/components/ProtectedRoute/ProtectedRoute.tsx
// Оборачивай любой роут которий требует авторизации

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../../../api/auth';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;