const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers dynamically
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      'Something went wrong. Please check your network connection.';

    // If token has expired or is unauthorized, log out the user automatically
    if (error.response && error.response.status === 401) {
      console.warn('[Session Expired]: Token is invalid or expired. Removing cached user.');
      localStorage.removeItem('user');
      // Redirect to login page if we are in the browser
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
    }

    // Attach cleaner message directly to error for easier usage in components
    error.cleanMessage = message;
    return Promise.reject(error);
  }
);

export default api;
