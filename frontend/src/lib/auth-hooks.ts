'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/email/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { token, user } = response.data;

      Cookies.set('auth_token', token, { expires: 1 });
      localStorage.setItem('vrp_user', JSON.stringify(user));

      const redirectPath = user.role === 'ADMIN' 
        ? '/dashboards/admin'
        : user.role === 'HOST'
        ? '/dashboards/host'
        : '/dashboards/guest';

      router.push(redirectPath);

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { login, isLoading, error, clearError };
};

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/email/register`,
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { token, user } = response.data;

      Cookies.set('auth_token', token, { expires: 1 });
      localStorage.setItem('vrp_user', JSON.stringify(user));

      router.push('/login');

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { signup, isLoading, error, clearError };
};

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setError('Google OAuth not yet implemented');
    } catch (err: any) {
      setError('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { googleLogin, isLoading, error };
};

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      const token = Cookies.get('auth_token');
      
      if (token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      Cookies.remove('auth_token');
      localStorage.removeItem('vrp_user');
      localStorage.removeItem('vrp_session');
      
      router.push('/login');
    }
  };

  return { logout };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    const token = Cookies.get('auth_token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get<{ success: boolean; user: User }>(
        `${API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      localStorage.setItem('vrp_user', JSON.stringify(response.data.user));
    } catch (err) {
      console.error('Failed to fetch user:', err);
      Cookies.remove('auth_token');
      localStorage.removeItem('vrp_user');
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, fetchUser };
};