import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  StepButton,
  Container
} from '@mui/material';
import {
  Person as PersonIcon,
  ContactPhone as ContactPhoneIcon,
  AccountBalance as AccountBalanceIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { onboardingService } from '../../services/onboardingService.js';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';

// Helper component for required field labels
const RequiredLabel = ({ children, required = false }) => (
  <Box component="span">
    {children}
    {required && <Box component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Box>}
  </Box>
);

// Validation schemas for each step
const personalInfoSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  address: yup.object({
    street: yup.string().required('Street address is required'),
    city: yup.string().required('City is required'),
    county: yup.string().required('County is required'),
    postcode: yup.string().required('Postcode is required'),
    country: yup.string().required('Country is required')
  })
});

const emergencyContactSchema = yup.object({
  name: yup.string().required('Emergency contact name is required'),
  relationship: yup.string().required('Relationship is required'),
  phoneNumber: yup.string().required('Emergency contact phone is required')
});

const bankDetailsSchema = yup.object({
  accountName: yup.string().required('Account name is required'),
  iban: yup.string().required('IBAN is required'),
  bic: yup.string().required('BIC is required')
});

const steps = [
  { label: 'Personal Information', icon: PersonIcon },
  { label: 'Emergency Contact', icon: ContactPhoneIcon },
  { label: 'Bank Details', icon: AccountBalanceIcon }
];

export default function PersonalProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Form instances for each step
  const personalInfoForm = useForm({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dateOfBirth: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        county: '',
        postcode: '',
        country: 'Ireland'
      }
    }
  });

  const emergencyContactForm = useForm({
    resolver: yupResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      relationship: '',
      phoneNumber: ''
    }
  });

  const bankDetailsForm = useForm({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: {
      accountName: '',
      iban: '',
      bic: ''
    }
  });

  const getCurrentForm = () => {
    switch (activeStep) {
      case 0: return personalInfoForm;
      case 1: return emergencyContactForm;
      case 2: return bankDetailsForm;
      default: return personalInfoForm;
    }
  };

  const handleStepClick = (stepIndex) => {
    // Allow navigation to completed steps or current step
    if (completedSteps.has(stepIndex) || stepIndex <= Math.max(...completedSteps, activeStep)) {
      setActiveStep(stepIndex);
    }
  };

  const handleNext = async (data) => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...prev, activeStep]));
    
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      // Final submission
      await handleSubmitAll();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmitAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const allData = {
        personalInfo: personalInfoForm.getValues(),
        emergencyContact: emergencyContactForm.getValues(),
        bankDetails: bankDetailsForm.getValues()
      };

      await onboardingService.submitPersonalProfile(user.id, allData);
      setSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <Box component="form" onSubmit={personalInfoForm.handleSubmit(handleNext)}>
      {/* Personal Information Section */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#1f2937'
        }}
      >
        Personal Information
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>FIRST NAME</RequiredLabel>
          </Typography>
          <Controller
            name="firstName"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your first name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>LAST NAME</RequiredLabel>
          </Typography>
          <Controller
            name="lastName"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your last name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>DATE OF BIRTH</RequiredLabel>
          </Typography>
          <Controller
            name="dateOfBirth"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>PHONE NUMBER</RequiredLabel>
          </Typography>
          <Controller
            name="phoneNumber"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="+353 87 123 4567"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
      </Grid>
      
      {/* Address Section */}
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 4, 
          mt: 5,
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#1f2937'
        }}
      >
        Address
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>STREET ADDRESS</RequiredLabel>
          </Typography>
          <Controller
            name="address.street"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="123 Main Street"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>CITY</RequiredLabel>
          </Typography>
          <Controller
            name="address.city"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Dublin"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>COUNTY</RequiredLabel>
          </Typography>
          <Controller
            name="address.county"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Dublin"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>POSTCODE</RequiredLabel>
          </Typography>
          <Controller
            name="address.postcode"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="D01 ABC1"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>COUNTRY</RequiredLabel>
          </Typography>
          <Controller
            name="address.country"
            control={personalInfoForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Ireland"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderEmergencyContactStep = () => (
    <Box component="form" onSubmit={emergencyContactForm.handleSubmit(handleNext)}>
      <Alert 
        severity="info" 
        sx={{ 
          mb: 5,
          fontSize: '0.95rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #3b82f6',
          borderRadius: 2,
          '& .MuiAlert-icon': { color: '#3b82f6' },
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        Please provide details for someone we can contact in case of emergency.
      </Alert>
      
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#1f2937'
        }}
      >
        Emergency Contact
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>FULL NAME</RequiredLabel>
          </Typography>
          <Controller
            name="name"
            control={emergencyContactForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter full name"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>RELATIONSHIP</RequiredLabel>
          </Typography>
          <Controller
            name="relationship"
            control={emergencyContactForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="e.g., Mother, Father, Spouse, Friend"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>PHONE NUMBER</RequiredLabel>
          </Typography>
          <Controller
            name="phoneNumber"
            control={emergencyContactForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="+353 87 123 4567"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderBankDetailsStep = () => (
    <Box component="form" onSubmit={bankDetailsForm.handleSubmit(handleNext)}>
      <Alert 
        severity="warning" 
        sx={{ 
          mb: 5,
          fontSize: '0.95rem',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 2,
          '& .MuiAlert-icon': { color: '#f59e0b' },
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          <strong>Security Notice:</strong> Your banking information is encrypted and stored securely. 
          This information is required for payroll processing.
        </Typography>
      </Alert>
      
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#1f2937'
        }}
      >
        Bank Details
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>ACCOUNT HOLDER NAME</RequiredLabel>
          </Typography>
          <Controller
            name="accountName"
            control={bankDetailsForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Must match the name on your bank account"
                helperText={fieldState.error?.message || "Must match the name on your bank account"}
                error={!!fieldState.error}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>IBAN (INTERNATIONAL BANK ACCOUNT NUMBER)</RequiredLabel>
          </Typography>
          <Controller
            name="iban"
            control={bankDetailsForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="IE29 AIBK 9311 5212 3456 78"
                helperText={fieldState.error?.message || "22-character IBAN starting with IE"}
                error={!!fieldState.error}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
            <RequiredLabel required>BIC/SWIFT CODE</RequiredLabel>
          </Typography>
          <Controller
            name="bic"
            control={bankDetailsForm.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="AIBKIE2D"
                helperText={fieldState.error?.message || "8-11 character BIC code"}
                error={!!fieldState.error}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
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
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderPersonalInfoStep();
      case 1: return renderEmergencyContactStep();
      case 2: return renderBankDetailsStep();
      default: return null;
    }
  };

  if (success) {
    return (
      <MainLayout>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          minHeight: 'calc(100vh - 56px)',
          py: 6, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container maxWidth="md">
            <Card sx={{ borderRadius: 3, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1f2937' }}>
                  Profile Updated Successfully! ✅
                </Typography>
                <Typography variant="body1" color="#6b7280" sx={{ fontSize: '1.1rem' }}>
                  Your personal information has been saved. Redirecting to dashboard...
                </Typography>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        minHeight: 'calc(100vh - 56px)',
        width: '100%' 
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    mr: 3,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#6b7280',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }}
                >
                  Back to Dashboard
                </Button>
              </Box>
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                  color: '#1f2937'
                }}
              >
                Complete Your Personal Profile
              </Typography>
              <Typography 
                variant="body1" 
                color="#6b7280"
                sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.6
                }}
              >
                Please provide your personal information, emergency contact, and banking details for payroll.
              </Typography>
            </CardContent>
          </Card>

          {/* Stepper */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white'
          }}>
            <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step, index) => (
                  <Step key={step.label} completed={completedSteps.has(index)}>
                    <StepButton
                      color="inherit"
                      onClick={() => handleStepClick(index)}
                      disabled={!completedSteps.has(index) && index > Math.max(...completedSteps, activeStep)}
                      sx={{
                        cursor: completedSteps.has(index) || index <= Math.max(...completedSteps, activeStep) ? 'pointer' : 'default',
                        '& .MuiStepLabel-root': {
                          '& .MuiStepLabel-label': {
                            fontSize: '0.95rem',
                            fontWeight: activeStep === index ? 600 : 400,
                            color: activeStep === index ? '#3b82f6' : '#6b7280'
                          }
                        }
                      }}
                    >
                      <StepLabel icon={React.createElement(step.icon, { 
                        sx: { 
                          color: activeStep === index ? '#3b82f6' : 
                                 completedSteps.has(index) ? '#10b981' : '#9ca3af'
                        }
                      })}>
                        {step.label}
                      </StepLabel>
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 4, borderRadius: 2, fontSize: '1rem' }} 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Form Content */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white'
          }}>
            <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
              {renderStepContent()}

              <Divider sx={{ my: 6 }} />

              {/* Navigation Buttons */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                gap: 3,
                flexDirection: { xs: 'column-reverse', sm: 'row' }
              }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    borderColor: '#d1d5db',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    },
                    '&:disabled': {
                      borderColor: '#e5e7eb',
                      color: '#9ca3af'
                    }
                  }}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={activeStep === steps.length - 1 ? <SaveIcon /> : null}
                  onClick={getCurrentForm().handleSubmit(handleNext)}
                  disabled={loading}
                  size="large"
                  sx={{ 
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 1.5,
                    px: 5,
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    }
                  }}
                >
                  {loading ? 'Saving...' : activeStep === steps.length - 1 ? 'Save & Complete' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayout>
  );
} 