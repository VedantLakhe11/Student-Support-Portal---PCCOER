import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is cached in local storage on boot
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('[Auth Cache Error]:', err.message);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.cleanMessage || 'Login failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler with extended profile fields
  const register = async (fields) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', fields);
      const userData = response.data.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.cleanMessage || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const requestForgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message, code: response.data.resetCode };
    } catch (error) {
      return {
        success: false,
        message: error.cleanMessage || 'Failed to submit reset request.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const requestResetPassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', { email, code, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.cleanMessage || 'Failed to reset password.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (fields) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', fields);
      const userData = response.data.data;

      // Update cached and state credentials
      const mergedUser = { ...user, ...userData };
      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      return { success: true, user: mergedUser };
    } catch (error) {
      return {
        success: false,
        message: error.cleanMessage || 'Failed to update profile details.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        requestForgotPassword,
        requestResetPassword,
        updateProfile,
        isAuthenticated: !!user,
        isStudent: user && user.role === 'student',
        isFaculty: user && user.role === 'faculty',
        isAlumni: user && user.role === 'alumni',
        isAdmin: user && user.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
