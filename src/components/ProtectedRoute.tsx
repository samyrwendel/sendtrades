import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionData } from '../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = getSessionData();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}