'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('auth_token');
      
      if (token) {
        try {
          const response = await authAPI.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            Cookies.remove('auth_token');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          Cookies.remove('auth_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('auth_token', token, { expires: 7 }); // 7 days
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
