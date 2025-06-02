import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProgramsPage from './pages/ProgramsPage';
import EnrollmentFlowPage from './pages/enrollment/EnrollmentFlowPage';
import ManageEnrollmentsPage from './pages/ManageEnrollmentsPage';
import EnrollmentDetailsPage from './pages/EnrollmentDetailsPage';
import AgencyProfilePage from './pages/AgencyProfilePage';
import DocumentsPage from './pages/DocumentsPage';

// Services
import { authService } from './services/campService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await authService.checkAuth();
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          {!isAuthenticated ? (
            <>
              <Route 
                path="/login" 
                element={
                  <AuthLayout>
                    <LoginPage onLogin={handleLogin} />
                  </AuthLayout>
                } 
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            /* Protected routes */
            <>
              <Route 
                path="/" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <DashboardPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <DashboardPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/programs" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <ProgramsPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/enroll" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <EnrollmentFlowPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/enrollments" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <ManageEnrollmentsPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/enrollments/:id" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <EnrollmentDetailsPage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <AgencyProfilePage />
                  </Layout>
                } 
              />
              
              <Route 
                path="/documents" 
                element={
                  <Layout user={user} onLogout={handleLogout}>
                    <DocumentsPage />
                  </Layout>
                } 
              />
              
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
