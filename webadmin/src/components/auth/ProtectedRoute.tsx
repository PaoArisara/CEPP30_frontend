// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import MainLayout from '../layout/MainLayout';


const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Render the protected content
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

export default ProtectedRoute;