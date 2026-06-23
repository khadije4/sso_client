import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAccessToken } from '../../utils/tokenStorage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user && !getAccessToken()) return <Navigate to="/client/login" />;
  return children;
};


export default PrivateRoute;