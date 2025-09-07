import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  PersonAdd,
  Business,
  AdminPanelSettings,
  Group,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Security,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useRegisterMutation, useGetDepartmentsQuery } from '../../store/api/authApi';
import { setCredentials, setError } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';

// Validation schemas for each step
const stepValidationSchemas = {
  1: yup.object({
    name: yup
      .string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: yup
      .string()
      .email('Please enter a valid email address')
      .required('Email is required'),
  }),
  2: yup.object({
    role: yup
      .string()
      .oneOf(['admin', 'department', 'user'], 'Please select a valid role')
      .required('Role is required'),
    department: yup
      .string()
      .when('role', {
        is: 'department',
        then: (schema) => schema.required('Department is required for department users'),
        otherwise: (schema) => schema.notRequired(),
      }),
  }),
  3: yup.object({
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  }),
};

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'department' | 'user';
  department?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, error } = useAppSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();
  const { data: departmentsData } = useGetDepartmentsQuery();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(stepValidationSchemas[currentStep as keyof typeof stepValidationSchemas]),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      department: '',
    },
    mode: 'onChange',
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const result = await trigger(fieldsToValidate);
    
    if (currentStep === 3 && !agreedToTerms) {
      dispatch(addNotification({
        type: 'error',
        title: 'Terms Required',
        message: 'Please agree to the terms and conditions',
      }));
      return false;
    }
    
    return result;
  };

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 1:
        return ['name', 'email'];
      case 2:
        return selectedRole === 'department' ? ['role', 'department'] : ['role'];
      case 3:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        await onSubmit(watch());
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      dispatch(setError(null));
      
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.department && { department: data.department }),
      };

      const result = await register(registerData).unwrap();
      
      if (result.success) {
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
          refreshToken: result.data.refreshToken,
        }));
        
        dispatch(addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: `Welcome to CivicConnect, ${result.data.user.name}!`,
        }));
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Registration failed. Please try again.';
      dispatch(setError(errorMessage));
      dispatch(addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'department':
        return <Business />;
      case 'user':
        return <Group />;
      default:
        return <Person />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access and management capabilities';
      case 'department':
        return 'Department-specific access and management tools';
      case 'user':
        return 'Standard user access and basic features';
      default:
        return '';
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Personal Information';
      case 2:
        return 'Role & Department';
      case 3:
        return 'Security Setup';
      default:
        return 'Registration';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 1,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          }
        }}
      >
        {/* Header */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 80,
              height: 80,
              mb: 2,
              boxShadow: '0 8px 32px rgba(103, 126, 234, 0.4)',
              fontSize: 42,
              position: 'relative',
              '&::after': {
                content: `"${currentStep}"`,
                position: 'absolute',
                top: -8,
                right: -8,
                width: 28,
                height: 28,
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
                border: '3px solid white',
              }
            }}
          >
            <PersonAdd sx={{ fontSize: 42 }} />
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ 
              mb: 1,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Join CivicConnect
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {getStepTitle()}
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={(currentStep / 3) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(103, 126, 234, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              {[1, 2, 3].map((step) => (
                <Typography
                  key={step}
                  variant="caption"
                  color={step <= currentStep ? 'primary' : 'text.secondary'}
                  fontWeight={step <= currentStep ? 'bold' : 'normal'}
                >
                  Step {step}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        '& fieldset': {
                          borderRadius: 3,
                        }
                      }
                    }}
                    autoComplete="name"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        '& fieldset': {
                          borderRadius: 3,
                        }
                      }
                    }}
                    autoComplete="email"
                  />
                )}
              />
            </Box>
          )}

          {/* Step 2: Role Selection */}
          {currentStep === 2 && (
            <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                Choose your role in the organization
              </Typography>
              
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 3 }}>
                    {['user', 'department', 'admin'].map((role) => (
                      <Card
                        key={role}
                        sx={{
                          mb: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: field.value === role ? '2px solid' : '1px solid',
                          borderColor: field.value === role ? 'primary.main' : 'divider',
                          background: field.value === role 
                            ? 'linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' 
                            : 'transparent',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                          }
                        }}
                        onClick={() => field.onChange(role)}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: field.value === role ? 'primary.main' : 'grey.300',
                              mr: 2,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {getRoleIcon(role)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                              {role}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getRoleDescription(role)}
                            </Typography>
                          </Box>
                          {field.value === role && (
                            <CheckCircle color="primary" sx={{ ml: 2 }} />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {errors.role && (
                      <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                        {errors.role.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              {selectedRole === 'department' && (
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="normal" error={!!errors.department}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        {...field}
                        label="Department"
                        startAdornment={
                          <InputAdornment position="start">
                            <Business color="primary" />
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: 3,
                          '& fieldset': {
                            borderRadius: 3,
                          }
                        }}
                      >
                        {departmentsData?.data?.map((dept: any) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.department.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              )}
            </Box>
          )}

          {/* Step 3: Security Setup */}
          {currentStep === 3 && (
            <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        '& fieldset': {
                          borderRadius: 3,
                        }
                      }
                    }}
                    autoComplete="new-password"
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 3,
                        '& fieldset': {
                          borderRadius: 3,
                        }
                      }
                    }}
                    autoComplete="new-password"
                  />
                )}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" color="primary" underline="hover">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="#" color="primary" underline="hover">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2, alignItems: 'flex-start' }}
              />
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box display="flex" gap={2} mt={4}>
            {currentStep > 1 && (
              <Button
                variant="outlined"
                onClick={handlePrevious}
                startIcon={<ArrowBack />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Previous
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isLoading}
              endIcon={isLoading ? <CircularProgress size={20} /> : <ArrowForward />}
              sx={{
                flex: currentStep === 1 ? 1 : 2,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(103, 126, 234, 0.4)',
                }
              }}
            >
              {isLoading 
                ? 'Creating account...' 
                : currentStep === 3 
                  ? 'Create Account' 
                  : 'Next'
              }
            </Button>
          </Box>

          {/* Sign In Link */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                variant="body2" 
                fontWeight="bold"
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Trust Indicators */}
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          gap={3} 
          mt={3}
          sx={{ opacity: 0.7 }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <Security fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              256-bit SSL
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Lock fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Data Protected
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CheckCircle fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Free to Join
            </Typography>
          </Box>
        </Box>
      </Paper>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default RegisterPage;