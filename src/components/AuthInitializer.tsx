import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetProfileQuery } from '../store/api/authApi';
import { initializeAuth, setUser, logout } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');
  
  // Only fetch profile if we have a token
  const { data: profileData, error: profileError, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !token, // Skip the query if no token
  });

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (profileData?.success && profileData.data.user) {
      // Set user data when profile is successfully fetched
      dispatch(setUser(profileData.data.user));
    } else if (profileError && token) {
      // If profile fetch fails and we have a token, logout the user
      console.error('Profile fetch failed:', profileError);
      dispatch(logout());
    }
  }, [profileData, profileError, dispatch, token]);

  // Show loading spinner while checking authentication
  if (token && profileLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
          `,
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
