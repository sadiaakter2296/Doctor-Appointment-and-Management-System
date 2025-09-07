import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/apiService';
import MockAuthService from '../services/MockAuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    else localStorage.removeItem('auth_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token && !user) {
      checkAuthStatus();
    }
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUser();
      if (response.status === 'success') {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token - don't throw error to prevent app crashes
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      
      // Try backend first, fallback to mock service
      let response;
      try {
        console.log('🔄 Attempting backend login...');
        response = await authAPI.login({ email, password });
        console.log('✅ Backend login response:', response);
      } catch (backendError) {
        console.log('❌ Backend login failed, using mock service:', backendError.message);
        response = await MockAuthService.login({ email, password });
        console.log('✅ Mock service login response:', response);
      }
      
      // Handle both success formats (status: 'success' and success: true)
      if (response.status === 'success' || response.success === true) {
        // Check if response has the expected data structure
        if (response.data && response.data.user && response.data.token) {
          const { user: userData, token: userToken } = response.data;
          setUser(userData);
          setToken(userToken);
          return { user: userData, token: userToken };
        } else {
          console.log('❌ Invalid response data structure:', response.data);
          throw new Error('Invalid response format from server');
        }
      } else {
        console.log('❌ Login validation failed - response:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Provide user-friendly error messages
      const errorMessage = error.message || 'Invalid credentials';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      setLoading(true);
      
      // Try backend first, fallback to mock service
      let response;
      try {
        console.log('🔄 Attempting backend registration...');
        response = await authAPI.register({ name, email, password });
        console.log('✅ Backend registration response:', response);
      } catch (backendError) {
        console.log('❌ Backend registration failed, using mock service:', backendError.message);
        response = await MockAuthService.register({ name, email, password });
        console.log('✅ Mock service registration response:', response);
      }
      
      // Handle both success formats (status: 'success' and success: true)
      if (response.status === 'success' || response.success === true) {
        return { success: true, message: response.message || 'Registration successful' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle validation errors
      if (error.message && typeof error.message === 'object') {
        const errors = Object.values(error.message).flat();
        throw new Error(errors.join(', '));
      }
      
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading,
      login, 
      register, 
      logout,
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
