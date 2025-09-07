// Environment configuration
const getBackendUrl = () => {
  // Check if we're in production
  if (import.meta.env.PROD) {
    // In production, use the environment variable or default to your Vercel URL
    return import.meta.env.VITE_BACKEND_URL || 'https://your-backend-app.vercel.app/api/v1';
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api/v1';
};

export const appConfig = {
  appName: 'SIH App',
  backendUrl: getBackendUrl(),
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};