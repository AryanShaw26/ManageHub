import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response && response.success) {
        setUser(response.data.user);
        setInstitution(response.data.institution);
        setRole(response.data.role);
      } else {
        setUser(null);
        setInstitution(null);
        setRole(null);
      }
    } catch (err) {
      setUser(null);
      setInstitution(null);
      setRole(null);
      // No localStorage token to clear — auth is cookie-only
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Token is set as an HttpOnly cookie by the server — do NOT store it in localStorage.
    // We only read the user/institution/role from the response body.
    setUser(response.data.user);
    setInstitution(response.data.institution);
    setRole(response.data.role);
    return response.data;
  };

  const registerInstitution = async (payload) => {
    const response = await api.post('/auth/register-institution', payload);
    // Token is set as an HttpOnly cookie by the server — do NOT store it in localStorage.
    setUser(response.data.user);
    setInstitution(response.data.institution);
    setRole(response.data.role);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue even if logout api fails
    } finally {
      setUser(null);
      setInstitution(null);
      setRole(null);
    }
  };

  const value = {
    user,
    institution,
    role,
    isAdmin: role === 'ADMIN',
    isFaculty: role === 'FACULTY',
    isAuthenticated: !!user,
    isLoading,
    login,
    registerInstitution,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
