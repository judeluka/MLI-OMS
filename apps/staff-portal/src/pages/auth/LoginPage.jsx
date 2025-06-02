import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const resetSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
});

export default function LoginPage() {
  const { login, requestPasswordReset, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts or form switches
  useEffect(() => {
    clearError();
  }, [showResetForm, clearError]);

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Reset form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm
  } = useForm({
    resolver: yupResolver(resetSchema),
    defaultValues: {
      email: ''
    }
  });

  const onLoginSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      // Navigation handled by useEffect above
    } catch (error) {
      // Error handled by context
      console.error('Login failed:', error);
    }
  };

  const onResetSubmit = async (data) => {
    try {
      await requestPasswordReset(data.email);
      setResetSuccess(true);
      resetForm();
    } catch (error) {
      // Error handled by context
      console.error('Password reset failed:', error);
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetSuccess(false);
    clearError();
  };

  if (isLoading && isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', // Deep professional blue
        display: 'flex'
      }}
    >
      <Grid container sx={{ width: '100%', height: '100%', margin: 0 }}>
        {/* Left Side - Branding (Hidden on mobile) */}
        <Grid 
          item 
          xs={12} 
          md={7} 
          lg={8}
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            padding: { md: 6, lg: 8 },
            minHeight: '100vh'
          }}
        >
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: { md: 600, lg: 700 },
              color: 'white'
            }}
          >
            {/* Logo/Brand Section */}
            <Box sx={{ mb: 6 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '2rem'
                  }}
                >
                  SA
                </Typography>
              </Box>
              
              <Typography
                variant="h2"
                component="h1"
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { md: '2.8rem', lg: '3.2rem' },
                  lineHeight: 1.1
                }}
              >
                StaffPortal
              </Typography>
              
              <Typography
                variant="h5"
                sx={{ 
                  fontWeight: 300,
                  opacity: 0.9,
                  fontSize: { md: '1.3rem', lg: '1.5rem' },
                  mb: 6
                }}
              >
                Your gateway to exceptional international education
              </Typography>
            </Box>

            {/* Features List */}
            <Box sx={{ space: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: 24, 
                    mr: 3, 
                    mt: 0.5,
                    color: '#10b981'
                  }} 
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Streamlined Onboarding
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    Complete your profile, contracts, and documentation in a guided, intuitive workflow.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                <SecurityIcon 
                  sx={{ 
                    fontSize: 24, 
                    mr: 3, 
                    mt: 0.5,
                    color: '#10b981'
                  }} 
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Secure & Compliant
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    Your personal and banking information is encrypted and stored securely with enterprise-grade protection.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
                <SupportIcon 
                  sx={{ 
                    fontSize: 24, 
                    mr: 3, 
                    mt: 0.5,
                    color: '#10b981'
                  }} 
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Comprehensive Support
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                    Access to resources, team communications, and dedicated support for seamless operations.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Trusted by 300+ education agencies worldwide
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid 
          item 
          xs={12} 
          md={5} 
          lg={4}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: { xs: 3, md: 4, lg: 5 }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: { xs: 420, md: 480, lg: 520 },
              p: { xs: 4, sm: 5, md: 6 },
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Mobile Header (Only shown on mobile) */}
            <Box 
              textAlign="center" 
              mb={4}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '15px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mx: 'auto'
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: '1.5rem'
                  }}
                >
                  SA
                </Typography>
              </Box>
              
              <Typography
                variant="h4"
                component="h1"
                sx={{ 
                  fontWeight: 700, 
                  color: '#1f2937',
                  mb: 1
                }}
              >
                StaffPortal
              </Typography>
              <Typography
                variant="body1"
                sx={{ 
                  color: '#6b7280'
                }}
              >
                MLI International Schools
              </Typography>
            </Box>

            {/* Form Header */}
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                component="h2"
                sx={{ 
                  fontWeight: 700, 
                  color: '#1f2937', 
                  mb: 2,
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Welcome back
              </Typography>
              <Typography 
                variant="body1" 
                color="#6b7280"
                sx={{ 
                  fontSize: '1rem',
                  lineHeight: 1.5
                }}
              >
                {showResetForm ? 'Reset your password' : 'Sign in to your staff portal'}
              </Typography>
            </Box>

            {/* Demo Credentials Box */}
            <Paper
              sx={{
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                p: 3,
                borderRadius: 2,
                mb: 4
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: '#1e40af',
                  fontSize: '0.9rem'
                }}
              >
                🔑 Demo Credentials
              </Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e40af' }}>
                <Typography component="div" sx={{ mb: 1 }}>
                  <strong>Email:</strong> sarah.johnson@mli.ie
                </Typography>
                <Typography component="div">
                  <strong>Password:</strong> welcome123
                </Typography>
              </Box>
            </Paper>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }} 
                onClose={clearError}
              >
                {error}
              </Alert>
            )}

            {/* Success Alert for Password Reset */}
            {resetSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                Password reset instructions have been sent to your email address.
              </Alert>
            )}

            {/* Login Form */}
            {!showResetForm && (
              <Box component="form" onSubmit={handleLoginSubmit(onLoginSubmit)}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
                  EMAIL ADDRESS
                </Typography>
                <TextField
                  {...registerLogin('email')}
                  fullWidth
                  placeholder="john@mli.ie"
                  error={!!loginErrors.email}
                  helperText={loginErrors.email?.message}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      '& fieldset': {
                        border: '1px solid #e5e7eb',
                      },
                      '&:hover fieldset': {
                        border: '1px solid #3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #3b82f6',
                      }
                    }
                  }}
                  autoComplete="email"
                  autoFocus
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
                  PASSWORD
                </Typography>
                <TextField
                  {...registerLogin('password')}
                  fullWidth
                  type="password"
                  placeholder="••••••••"
                  error={!!loginErrors.password}
                  helperText={loginErrors.password?.message}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      '& fieldset': {
                        border: '1px solid #e5e7eb',
                      },
                      '&:hover fieldset': {
                        border: '1px solid #3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #3b82f6',
                      }
                    }
                  }}
                  autoComplete="current-password"
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setShowResetForm(true)}
                    sx={{ 
                      textDecoration: 'none',
                      color: '#3b82f6',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  sx={{ 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    }
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign in to StaffPortal'}
                </Button>
              </Box>
            )}

            {/* Password Reset Form */}
            {showResetForm && !resetSuccess && (
              <Box component="form" onSubmit={handleResetSubmit(onResetSubmit)}>
                <Typography 
                  variant="body2" 
                  color="#6b7280" 
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  Enter your email address and we'll send you instructions to reset your password.
                </Typography>

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
                  EMAIL ADDRESS
                </Typography>
                <TextField
                  {...registerReset('email')}
                  fullWidth
                  placeholder="john@mli.ie"
                  error={!!resetErrors.email}
                  helperText={resetErrors.email?.message}
                  sx={{ 
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9fafb',
                      border: 'none',
                      '& fieldset': {
                        border: '1px solid #e5e7eb',
                      },
                      '&:hover fieldset': {
                        border: '1px solid #3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #3b82f6',
                      }
                    }
                  }}
                  autoComplete="email"
                  autoFocus
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                  sx={{ 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    }
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>

                <Box textAlign="center">
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleBackToLogin}
                    sx={{ 
                      textDecoration: 'none',
                      color: '#6b7280',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#3b82f6',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    ← Back to Sign In
                  </Link>
                </Box>
              </Box>
            )}

            {/* Success state for password reset */}
            {resetSuccess && (
              <Box textAlign="center">
                <Button
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{ 
                    mt: 2,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#3b82f6',
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  ← Back to Sign In
                </Button>
              </Box>
            )}

            {/* Footer */}
            <Box textAlign="center" sx={{ mt: 4, pt: 4, borderTop: '1px solid #f3f4f6' }}>
              <Typography variant="body2" color="#9ca3af">
                Don't have a staff account?{' '}
                <Link href="#" sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                  Contact our HR team
                </Link>
              </Typography>
              <Typography variant="body2" color="#9ca3af" sx={{ mt: 2 }}>
                Need help? Contact our support team at{' '}
                <Link href="mailto:support@mli.ie" sx={{ color: '#3b82f6', textDecoration: 'none' }}>
                  support@mli.ie
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 