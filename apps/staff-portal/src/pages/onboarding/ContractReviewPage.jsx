import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  Done as DoneIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { onboardingService } from '../../services/onboardingService.js';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';

// Validation schema
const signatureSchema = yup.object({
  digitalSignature: yup.string().required('Digital signature is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
  confirmName: yup.boolean().oneOf([true], 'You must confirm that you are authorized to sign this contract')
});

export default function ContractReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(signatureSchema),
    defaultValues: {
      digitalSignature: '',
      agreeToTerms: false,
      confirmName: false
    }
  });

  const digitalSignature = watch('digitalSignature');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const contractData = await onboardingService.getContractContent(user.id);
        setContract(contractData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchContract();
    }
  }, [user?.id]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);

      const signatureData = {
        digitalSignature: data.digitalSignature,
        signatureDate: new Date().toISOString(),
        agreeToTerms: data.agreeToTerms,
        confirmName: data.confirmName,
        contractId: contract.id,
        contractVersion: contract.version
      };

      await onboardingService.submitContractSignature(user.id, signatureData);
      setSuccess(true);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading your employment contract...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  if (success) {
    return (
      <MainLayout>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="h6">Contract Signed Successfully! ✅</Typography>
            <Typography variant="body2">
              Your contract has been digitally signed and saved. Redirecting to dashboard...
            </Typography>
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ py: 2 }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Review & Sign Your Contract
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please review your employment contract carefully and provide your digital signature below.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Contract Display */}
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {contract?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Version {contract?.version}
              </Typography>
            </Box>
            
            <Paper 
              sx={{ 
                p: 4, 
                backgroundColor: '#fafafa',
                border: '1px solid #e0e0e0',
                maxHeight: '500px',
                overflow: 'auto'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {contract?.content}
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        {/* Digital Signature Form */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Digital Signature
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              By providing your digital signature below, you confirm that you have read, understood, 
              and agree to all terms and conditions outlined in this employment contract.
            </Alert>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Confirmation Checkboxes */}
              <Box sx={{ mb: 3 }}>
                <Controller
                  name="agreeToTerms"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label="I have read and agree to all terms and conditions in this employment contract"
                      sx={{ 
                        mb: 2,
                        '& .MuiFormControlLabel-label': {
                          color: fieldState.error ? 'error.main' : 'inherit'
                        }
                      }}
                    />
                  )}
                />
                {errors.agreeToTerms && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>
                    {errors.agreeToTerms.message}
                  </Typography>
                )}

                <Controller
                  name="confirmName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label={`I confirm that I am ${user?.firstName} ${user?.lastName} and I am authorized to sign this contract`}
                      sx={{ 
                        '& .MuiFormControlLabel-label': {
                          color: fieldState.error ? 'error.main' : 'inherit'
                        }
                      }}
                    />
                  )}
                />
                {errors.confirmName && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4 }}>
                    {errors.confirmName.message}
                  </Typography>
                )}
              </Box>

              {/* Digital Signature Field */}
              <Controller
                name="digitalSignature"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Digital Signature"
                    placeholder={`Type your full name: ${user?.firstName} ${user?.lastName}`}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message || "Type your full name as it appears on your identification documents"}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <EditIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                )}
              />

              {/* Signature Preview */}
              {digitalSignature && (
                <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', border: '1px dashed #ccc' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Signature Preview:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'cursive',
                      color: 'primary.main',
                      fontStyle: 'italic'
                    }}
                  >
                    {digitalSignature}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Date: {new Date().toLocaleDateString()}
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ my: 4 }} />

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  By clicking "Sign Contract", you are providing a legally binding digital signature.
                </Typography>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <DoneIcon />}
                  disabled={submitting}
                  sx={{ minWidth: 160 }}
                >
                  {submitting ? 'Signing...' : 'Sign Contract'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
} 