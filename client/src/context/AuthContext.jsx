import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const data = await api.getMe();
        if (mounted && data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not authenticated, user remains null
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await api.login(credentials);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Failed to login');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await api.register(userData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Failed to register account');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
