import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  if (!user && !token) return <Navigate to="/client/login" />;
  return children;
};


export default PrivateRoute;