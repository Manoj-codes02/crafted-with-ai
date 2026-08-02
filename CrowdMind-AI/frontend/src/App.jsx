import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OptimizationPage from './pages/OptimizationPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SocialFeedPage from './pages/SocialFeedPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

// Auth Route Protection Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-textMuted">Authenticating Terminal Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Operation Center Console Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'RescueTeam', 'Volunteer', 'Viewer']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/optimization" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'RescueTeam', 'Volunteer']}>
                <OptimizationPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'RescueTeam', 'Volunteer', 'Viewer']}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/social-feed" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'RescueTeam', 'Volunteer']}>
                <SocialFeedPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
