
// Helper to safely access environment variables without crashing in browser environments
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    // In some Vite setups, import.meta.env might be used, but standardizing on safe process check here.
  } catch (e) {
    // Ignore ReferenceErrors
  }
  return undefined;
};

// Change this to your deployed backend URL in production
// For local development, it usually defaults to http://localhost:5000/api
export const API_URL = getEnv('REACT_APP_API_URL') || 'http://localhost:5000/api';

// Timeout for API requests in milliseconds before falling back to demo mode
export const API_TIMEOUT = 2000;
