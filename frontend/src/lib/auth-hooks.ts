'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

// API client with auth header
const getAuthApiClient = () => {
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return apiClient;
};

/**
 * Hook for email/password login
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/email/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    },
    onSuccess: (response) => {
      const { token, user } = response;
      Cookies.set('auth_token', token, { expires: 1 });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(`/dashboards/${user.role?.toLowerCase() || 'guest'}`);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    await loginMutation.mutateAsync({ email, password });
  }, [loginMutation]);

  return {
    login,
    isLoading: loginMutation.isPending,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for email/password registration
 */
export function useSignup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/email/register`,
        { email, password, name },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    },
    onSuccess: (response) => {
      const { token, user } = response;
      Cookies.set('auth_token', token, { expires: 1 });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(`/dashboards/${user.role?.toLowerCase() || 'guest'}`);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    await signupMutation.mutateAsync({ email, password, name });
  }, [signupMutation]);

  return {
    signup,
    isLoading: signupMutation.isPending,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for Google OAuth login
 */
export function useGoogleLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const googleLoginMutation = useMutation({
    mutationFn: async (credential: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`,
        { credential },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    },
    onSuccess: (response) => {
      const { token, user } = response;
      Cookies.set('auth_token', token, { expires: 1 });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(`/dashboards/${user.role?.toLowerCase() || 'guest'}`);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Google login failed.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    },
  });

  const googleLogin = useCallback(async (credential: string) => {
    setError(null);
    await googleLoginMutation.mutateAsync(credential);
  }, [googleLoginMutation]);

  return {
    googleLogin,
    isLoading: googleLoginMutation.isPending,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      const apiClient = getAuthApiClient();
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
      queryClient.clear();
      router.push('/login');
    }
  }, [queryClient, router]);

  return { logout };
}

/**
 * Hook to get current user profile
 */
export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiClient = getAuthApiClient();
      const response = await apiClient.get('/auth/profile');
      setUser(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
}

/**
 * Hook to check authentication status
 */
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  return { isAuthenticated, loading };
}

