import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './authCheck';

const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
