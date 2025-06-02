import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Container
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Policy as PolicyIcon,
  Groups as GroupsIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { onboardingService } from '../../services/onboardingService.js';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';

const stepIcons = {
  'personal-profile': PersonIcon,
  'contract-review': DescriptionIcon,
  'document-upload': CloudUploadIcon,
  'policies-review': PolicyIcon,
  'role-information': GroupsIcon
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        setLoading(true);
        const data = await onboardingService.getOnboardingStatus(user.id);
        setOnboardingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOnboardingStatus();
    }
  }, [user?.id]);

  const handleStepClick = (stepId, canAccess) => {
    if (!canAccess) return;
    navigate(`/onboarding/${stepId}`);
  };

  const getStepStatusIcon = (step) => {
    if (step.completed) {
      return <CheckCircleIcon sx={{ color: '#10b981', fontSize: '1.5rem' }} />;
    } else if (step.canAccess) {
      return <PlayArrowIcon sx={{ color: '#3b82f6', fontSize: '1.5rem' }} />;
    } else {
      return <LockIcon sx={{ color: '#9ca3af', fontSize: '1.5rem' }} />;
    }
  };

  const getStepStatusColor = (step) => {
    if (step.completed) return 'success';
    if (step.canAccess) return 'primary';
    return 'default';
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ 
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <LinearProgress 
              sx={{ 
                mb: 4, 
                height: 8, 
                borderRadius: 4, 
                backgroundColor: '#e5e7eb',
                width: 300,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3b82f6'
                }
              }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 500, color: '#4b5563' }}>
              Loading your onboarding progress...
            </Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ 
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: '#f8fafc',
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Alert severity="error" sx={{ fontSize: '1.1rem', p: 3, borderRadius: 3, maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Global styles to prevent white bands */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: inherit;
        }
      `}</style>
      
      <Box sx={{ 
        minHeight: 'calc(100vh - 56px)',
        backgroundColor: '#f8fafc', // Light grey background instead of blue
        width: '100%',
        margin: 0,
        padding: 0
      }}>
        {/* Hero Section with Strategic Blue Usage */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue only for hero section
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle pattern overlay */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)',
            backgroundSize: '50px 50px'
          }} />
          
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', color: 'white', mb: 4 }}>
              {/* Logo/Brand */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  mx: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <StarIcon sx={{ fontSize: '2.5rem', color: 'white' }} />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  mb: 2
                }}
              >
                Welcome, {user?.firstName}!
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 300,
                  opacity: 0.9,
                  fontSize: { xs: '1.2rem', sm: '1.4rem' },
                  mb: 1
                }}
              >
                {user?.role} • {user?.department} Department
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.8,
                  fontSize: '1.1rem',
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Welcome to MLI International Schools! Complete your onboarding journey to unlock all portal features.
              </Typography>
            </Box>

            {/* Progress Card in Hero */}
            {!onboardingData?.isComplete && (
              <Card sx={{ 
                maxWidth: 600,
                mx: 'auto',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                      Onboarding Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                      {onboardingData?.progress?.completed} of {onboardingData?.progress?.total} completed
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={onboardingData?.progress?.percentage || 0}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Completion Alert in Hero */}
            {onboardingData?.isComplete && (
              <Alert 
                severity="success" 
                sx={{ 
                  maxWidth: 600,
                  mx: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid #10b981',
                  borderRadius: 3,
                  '& .MuiAlert-icon': { color: '#10b981' }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#047857' }}>
                  🎉 Onboarding Complete! Welcome to the team.
                </Typography>
              </Alert>
            )}
          </Container>
        </Box>

        {/* Main Content Area - Clean White Background */}
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
          <Grid container spacing={4}>
            {/* Main Content - Onboarding Steps */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ 
                borderRadius: 3, 
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6'
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: { xs: 4, md: 5 }, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        color: '#1f2937',
                        fontSize: { xs: '1.5rem', md: '1.8rem' }
                      }}
                    >
                      Your Onboarding Checklist
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#6b7280',
                        fontSize: '1rem', 
                        lineHeight: 1.6 
                      }}
                    >
                      Complete these essential steps to finalize your onboarding process
                    </Typography>
                  </Box>

                  <List sx={{ p: 0 }}>
                    {onboardingData?.steps?.map((step, index) => {
                      const IconComponent = stepIcons[step.id] || PersonIcon;
                      
                      return (
                        <React.Fragment key={step.id}>
                          <ListItemButton
                            onClick={() => handleStepClick(step.id, step.canAccess)}
                            disabled={!step.canAccess}
                            sx={{
                              py: { xs: 3, md: 4 },
                              px: { xs: 4, md: 5 },
                              '&:hover': {
                                backgroundColor: step.canAccess ? '#f8fafc' : 'transparent'
                              },
                              opacity: step.canAccess ? 1 : 0.6,
                              cursor: step.canAccess ? 'pointer' : 'default'
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: { xs: 70, md: 80 } }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: { xs: 50, md: 56 },
                                  height: { xs: 50, md: 56 },
                                  borderRadius: '16px',
                                  backgroundColor: step.completed ? '#ecfdf5' : 
                                                 step.canAccess ? '#eff6ff' : '#f9fafb',
                                  border: `2px solid ${step.completed ? '#10b981' : 
                                                     step.canAccess ? '#3b82f6' : '#e5e7eb'}`
                                }}
                              >
                                <IconComponent sx={{ 
                                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                                  color: step.completed ? '#10b981' : 
                                         step.canAccess ? '#3b82f6' : '#9ca3af'
                                }} />
                              </Box>
                            </ListItemIcon>
                            
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    sx={{ 
                                      fontWeight: 600,
                                      color: '#1f2937',
                                      fontSize: { xs: '1rem', md: '1.1rem' }
                                    }}
                                  >
                                    {step.title}
                                  </Typography>
                                  <Chip
                                    label={step.completed ? 'Completed' : step.canAccess ? 'Available' : 'Locked'}
                                    size="small"
                                    sx={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      backgroundColor: step.completed ? '#ecfdf5' : 
                                                     step.canAccess ? '#eff6ff' : '#f9fafb',
                                      color: step.completed ? '#047857' : 
                                             step.canAccess ? '#1e40af' : '#6b7280',
                                      border: `1px solid ${step.completed ? '#10b981' : 
                                                          step.canAccess ? '#3b82f6' : '#e5e7eb'}`
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: '#6b7280',
                                      fontSize: '0.95rem',
                                      lineHeight: 1.5,
                                      mb: 1
                                    }}
                                  >
                                    {step.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: '#9ca3af',
                                        fontSize: '0.8rem' 
                                      }}
                                    >
                                      {step.estimatedTime}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                            
                            <Box sx={{ ml: 2 }}>
                              {getStepStatusIcon(step)}
                            </Box>
                          </ListItemButton>
                          
                          {index < onboardingData.steps.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar - Clean White Cards */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Quick Actions */}
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #f3f4f6'
                }}>
                  <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 3,
                        color: '#1f2937',
                        fontSize: '1.25rem'
                      }}
                    >
                      Quick Actions
                    </Typography>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<PersonIcon />}
                      onClick={() => navigate('/profile')}
                      sx={{ 
                        mb: 2,
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: '#3b82f6',
                        borderRadius: 2,
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
                        }
                      }}
                    >
                      View My Profile
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<PolicyIcon />}
                      onClick={() => navigate('/resources')}
                      sx={{ 
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        borderColor: '#d1d5db',
                        color: '#374151',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: '#f8fafc',
                          color: '#3b82f6'
                        }
                      }}
                    >
                      Company Resources
                    </Button>
                  </CardContent>
                </Card>

                {/* Important Information */}
                <Card sx={{ 
                  borderRadius: 3,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #f3f4f6'
                }}>
                  <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 3,
                        color: '#1f2937',
                        fontSize: '1.25rem'
                      }}
                    >
                      Important Information
                    </Typography>
                    
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 3,
                        backgroundColor: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: 2,
                        '& .MuiAlert-icon': { color: '#3b82f6' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af' }}>
                        Start Date: {user?.startDate}
                      </Typography>
                    </Alert>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280',
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      Need assistance with your onboarding? Our HR team is here to help at{' '}
                      <Box component="span" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                        hr@mli.ie
                      </Box>{' '}
                      or call{' '}
                      <Box component="span" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                        +353 1 234 5678
                      </Box>
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280',
                        lineHeight: 1.6 
                      }}
                    >
                      Complete all onboarding steps before your start date to ensure a smooth first day experience.
                    </Typography>
                  </CardContent>
                </Card>

                {/* Next Steps - Only show blue here as accent */}
                {!onboardingData?.isComplete && (
                  <Card sx={{ 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 4px 6px -2px rgba(59, 130, 246, 0.25)'
                  }}>
                    <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 3,
                          fontSize: '1.25rem'
                        }}
                      >
                        What's Next?
                      </Typography>
                      
                      {(() => {
                        const nextStep = onboardingData?.steps?.find(step => !step.completed && step.canAccess);
                        if (nextStep) {
                          return (
                            <Box>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  mb: 3,
                                  opacity: 0.9,
                                  lineHeight: 1.5
                                }}
                              >
                                Continue with: <Box component="span" sx={{ fontWeight: 600 }}>{nextStep.title}</Box>
                              </Typography>
                              <Button
                                variant="contained"
                                size="large"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleStepClick(nextStep.id, true)}
                                sx={{ 
                                  py: 1.5,
                                  px: 3,
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  backgroundColor: 'white',
                                  color: '#3b82f6',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                                  }
                                }}
                              >
                                Continue
                              </Button>
                            </Box>
                          );
                        }
                        return (
                          <Typography 
                            variant="body1"
                            sx={{ opacity: 0.9 }}
                          >
                            All available steps completed! 🎉
                          </Typography>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
} 