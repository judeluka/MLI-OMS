import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import PersonalProfilePage from './pages/onboarding/PersonalProfilePage.jsx';
import ContractReviewPage from './pages/onboarding/ContractReviewPage.jsx';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          zIndex: 9999
        }}
      >
        <CircularProgress sx={{ color: 'white', mb: 2 }} />
        <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          zIndex: 9999
        }}
      >
        <CircularProgress sx={{ color: 'white', mb: 2 }} />
        <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/onboarding/personal-profile" 
        element={
          <ProtectedRoute>
            <PersonalProfilePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/onboarding/contract-review" 
        element={
          <ProtectedRoute>
            <ContractReviewPage />
          </ProtectedRoute>
        } 
      />

      {/* Placeholder routes for remaining onboarding steps */}
      <Route 
        path="/onboarding/document-upload" 
        element={
          <ProtectedRoute>
            <div>Document Upload Page - Coming Soon</div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/onboarding/policies-review" 
        element={
          <ProtectedRoute>
            <div>Policies Review Page - Coming Soon</div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/onboarding/role-information" 
        element={
          <ProtectedRoute>
            <div>Role Information Page - Coming Soon</div>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <div>Profile Page - Coming Soon</div>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/resources" 
        element={
          <ProtectedRoute>
            <div>Resources Page - Coming Soon</div>
          </ProtectedRoute>
        } 
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
