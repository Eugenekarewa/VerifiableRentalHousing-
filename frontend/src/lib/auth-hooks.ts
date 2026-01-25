'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Role, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/email/login`,
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

      const { token, user } = data;

      // Store token in cookies
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('vrp_user', JSON.stringify(user));

      // Redirect based on user role
      const redirectPath = user.role === 'ADMIN'
        ? '/dashboards/admin'
        : user.role === 'HOST'
        ? '/dashboards/host'
        : '/dashboards/guest';

      router.push(redirectPath);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  return { login, isLoading, error, clearError };
};

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/email/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const { token, user } = data;

      // Store token in cookies
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('vrp_user', JSON.stringify(user));

      // Auto-login: redirect based on user role
      const redirectPath = user.role === 'ADMIN'
        ? '/dashboards/admin'
        : user.role === 'HOST'
        ? '/dashboards/host'
        : '/dashboards/guest';

      router.push(redirectPath);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  return { signup, isLoading, error, clearError };
};

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google OAuth is configured
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error('Google OAuth is not configured');
      }

      // In a real implementation, this would initiate Google OAuth flow
      // For now, we'll show a placeholder for the OAuth flow
      // The typical flow would be:
      // 1. Redirect to Google OAuth consent screen
      // 2. Handle callback with auth code
      // 3. Exchange code for tokens

      // Placeholder: Open Google OAuth in a popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        `${API_URL}/api/auth/google/init`,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // For now, throw an error indicating OAuth is not fully implemented
      throw new Error('Google OAuth flow requires backend implementation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { googleLogin, isLoading, error };
};

export const useLogout = () => {
  const router = useRouter();

  const logout = useCallback(async () => {
    const token = Cookies.get('auth_token');

    try {
      if (token) {
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Clear all auth data
      Cookies.remove('auth_token');
      localStorage.removeItem('vrp_user');
      localStorage.removeItem('vrp_session');

      // Redirect to login
      router.push('/login');
    }
  }, [router]);

  return { logout };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('auth_token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userData: User = {
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
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading, fetchUser };
};
