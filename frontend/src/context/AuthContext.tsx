"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, User } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: (data.role as Role) || 'GUEST',
          isVerified: data.isVerified || false,
          walletAddress: data.walletAddress,
        };
        setUser(userData);
        localStorage.setItem('vrp_user', JSON.stringify(userData));
      } else {
        // Token is invalid or expired
        Cookies.remove('auth_token');
        localStorage.removeItem('vrp_user');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    const token = Cookies.get('auth_token');
    const storedUser = localStorage.getItem('vrp_user');

    if (token) {
      // If we have a token, verify it
      // Optimize: use stored user for immediate display while verifying
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      refreshUser();
    } else {
      // No token, ensure state is clear
      localStorage.removeItem('vrp_user');
      setUser(null);
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/email/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token in cookies
    Cookies.set('auth_token', data.token, { expires: 1 });

    // Store user data
    const userData = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: (data.user.role as Role) || 'GUEST',
      isVerified: data.user.isVerified || false,
      walletAddress: data.user.walletAddress,
    };

    setUser(userData);
    localStorage.setItem('vrp_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    const token = Cookies.get('auth_token');

    // Call logout API if we have a token
    if (token) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(console.error);
    }

    // Clear all auth data
    Cookies.remove('auth_token');
    localStorage.removeItem('vrp_user');
    localStorage.removeItem('vrp_session');
    setUser(null);

    // Redirect to login
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
