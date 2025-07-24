import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedWrapper from './components/RoleBasedWrapper';
import MainLayout from './components/layout/MainLayout';

// Import Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboardPage from './components/student/StudentDashboardPage';
import NewComplaintPage from './components/student/NewComplaintPage';
import WardenDashboardPage from './components/warden/WardenDashboardPage';
import EmployeeDashboardPage from './components/employee/EmployeeDashboardPage';
import ManageUsersPage from './components/admin/ManageUsersPage'; // <-- Import the new page
import AdminDashboard from './components/admin/AdminDashboard';

// --- Placeholder Pages ---
const NotFoundPage = () => <h1 className="text-white text-4xl font-bold">404 - Page Not Found</h1>;


function App() {
  const { user } = useAuth();

  return (
      <Router>
        <Routes>
          {/* Public Route: Login Page */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route path="/register" element={user ? <Navigate to="/" /> : <SignupPage />} />

          {/* Protected Routes: Accessible only to logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleBasedWrapper />} />
            
            {/* All authenticated pages are wrapped in the MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/new-complaint" element={<NewComplaintPage />} />
              <Route path="/warden/dashboard" element={<WardenDashboardPage />} />
              <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsersPage />} /> {/* <-- Use the new page here */}
            </Route>
          </Route>

          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
  );
}

export default App;