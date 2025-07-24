import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component will check the user's role and redirect to the appropriate dashboard.
// We will use this as the main landing page for logged-in users.
const RoleBasedWrapper = () => {
    const { user } = useAuth();

    if (!user) {
        // This should ideally not happen if protected by ProtectedRoute, but as a fallback
        return <Navigate to="/login" />;
    }

    switch (user.role) {
        case 'STUDENT':
            return <Navigate to="/student/dashboard" />;
        case 'WARDEN':
            return <Navigate to="/warden/dashboard" />;
        case 'CLEANER':
        case 'ELECTRICIAN':
            return <Navigate to="/employee/dashboard" />;
        case 'ADMIN':
             return <Navigate to="/admin/dashboard" />; // Assuming an admin dashboard
        default:
            return <Navigate to="/login" />; // Fallback
    }
};

export default RoleBasedWrapper;