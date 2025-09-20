import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/apiService';

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
      
      console.log('🔄 Attempting login...');
      const response = await authAPI.login({ email, password });
      console.log('✅ Login response:', response);
      
      if (response.status === 'success' && response.data) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        return { user: userData, token: userToken };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.message || 'Invalid credentials';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      setLoading(true);
      
      console.log('🔄 Attempting registration...');
      console.log('📤 Sending data:', { name, email, password: '***' });
      console.log('📡 API endpoint:', 'http://127.0.0.1:8000/api/register');
      
      const response = await authAPI.register({ name, email, password });
      console.log('✅ Registration response:', response);
      
      if (response.status === 'success') {
        console.log('✅ Registration successful, data saved to database');
        return { success: true, message: response.message || 'Registration successful' };
      } else {
        console.log('❌ Registration failed - server response:', response);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration failed with error:', error);
      
      // Handle different error types
      let errorMessage = 'Registration failed';
      
      if (error.response && error.response.data) {
        // Axios error structure
        const responseData = error.response.data;
        if (responseData.message) {
          if (typeof responseData.message === 'object') {
            // Validation errors object
            const errors = Object.values(responseData.message).flat();
            errorMessage = errors.join(', ');
          } else {
            errorMessage = responseData.message;
          }
        }
      } else if (error.message) {
        // Direct error message
        if (typeof error.message === 'object') {
          const errors = Object.values(error.message).flat();
          errorMessage = errors.join(', ');
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
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
