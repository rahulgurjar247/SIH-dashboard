
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { store } from '../store';
import { lightTheme, darkTheme } from '../theme';
import { useAppSelector } from '../hooks/redux';
import AuthInitializer from '../components/AuthInitializer';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import IssuesPage from '../pages/issues/IssuesPage';
import IssueDetailPage from '../pages/issues/IssueDetailPage';
import MapPage from '../pages/map/MapPage';
import UsersPage from '../pages/users/UsersPage';
import DepartmentsPage from '../pages/departments/DepartmentsPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string[] }> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// App Router Component
const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state: any) => state.ui);
  
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Router>
            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : (
                <LoginPage />
              )
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : (
                <RegisterPage />
              )
            } />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Issues Routes */}
            <Route path="/issues" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IssuesPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/issues/:id" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <IssueDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Map Route */}
            <Route path="/map" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MapPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/users" element={
              <ProtectedRoute requiredRole={['admin']}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/departments" element={
              <ProtectedRoute requiredRole={['admin']}>
                <DashboardLayout>
                  <DepartmentsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole={['admin', 'department']}>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </LocalizationProvider>
      </Box>
    </ThemeProvider>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </Provider>
  );
};

export default App;

