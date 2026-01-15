"use client";

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authAPI, walletAPI, propertiesAPI, bookingsAPI } from './api';

// Types for auth
interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

interface LoginParams {
  email: string;
  password: string;
}

// Authentication hook
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      Cookies.remove('auth_token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = useMutation({
    mutationFn: (credential: string) => authAPI.loginWithGoogle(credential),
    onSuccess: (response) => {
      const { token, user: userData } = response.data;
      Cookies.set('auth_token', token, { expires: 1 }); // 1 day
      setUser(userData);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Register with email
  const register = useMutation({
    mutationFn: (params: RegisterParams) => authAPI.register(params.email, params.password, params.name),
    onSuccess: (response) => {
      const { token, user: userData } = response.data;
      Cookies.set('auth_token', token, { expires: 1 });
      setUser(userData);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Login with email
  const login = useMutation({
    mutationFn: (params: LoginParams) => authAPI.login(params.email, params.password),
    onSuccess: (response) => {
      const { token, user: userData } = response.data;
      Cookies.set('auth_token', token, { expires: 1 });
      setUser(userData);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear(); // Clear all cached data
    }
  }, [queryClient]);

  return {
    user,
    isAuthenticated,
    loading,
    loginWithGoogle: loginWithGoogle.mutate,
    loginWithGoogleLoading: loginWithGoogle.isPending,
    register: register.mutate,
    registerLoading: register.isPending,
    login: login.mutate,
    loginLoading: login.isPending,
    logout,
    checkAuth,
  };
}

// Properties hook (replaces blockchain property hooks)
export function useProperties(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertiesAPI.getProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Single property hook
export function useProperty(id: string | number | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesAPI.getProperty(id as string),
    enabled: !!id,
  });
}

// Search suggestions hook
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => propertiesAPI.getSearchSuggestions(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Property availability hook
export function usePropertyAvailability(propertyId: string | number | undefined, checkInDate: string | undefined, checkOutDate: string | undefined) {
  return useQuery({
    queryKey: ['property-availability', propertyId, checkInDate, checkOutDate],
    queryFn: () => propertiesAPI.checkAvailability(propertyId as string, checkInDate as string, checkOutDate as string),
    enabled: !!(propertyId && checkInDate && checkOutDate),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Bookings hooks
export function useBookings() {
  const { user } = useAuth() as { user: { id?: string } | null };
  
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: bookingsAPI.getUserBookings,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBooking(bookingId: string | number | undefined) {
  const { user } = useAuth() as { user: { id?: string } | null };
  
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsAPI.getBooking(bookingId as string),
    enabled: !!(bookingId && user),
  });
}

// Create booking hook
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth() as { user: { id?: string } | null };
  
  return useMutation({
    mutationFn: bookingsAPI.createBooking,
    onSuccess: () => {
      // Invalidate bookings to refresh the list
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    },
  });
}

// Cancel booking hook
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth() as { user: { id?: string } | null };
  
  return useMutation({
    mutationFn: ({ bookingId }: { bookingId: string }) => bookingsAPI.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}

// Wallet hooks (invisible to users)
export function useWallet() {
  const { user } = useAuth() as { user: { id?: string } | null };
  
  const createWallet = useMutation({
    mutationFn: walletAPI.createWallet,
    onSuccess: (response) => {
      // Wallet created successfully
      console.log('Wallet created:', response.data);
    },
  });
  
  const getWalletAddress = useQuery({
    queryKey: ['wallet-address', user?.id],
    queryFn: walletAPI.getWalletAddress,
    enabled: !!user,
    retry: false, // Don't retry if wallet doesn't exist
  });
  
  return {
    createWallet: createWallet.mutate,
    createWalletLoading: createWallet.isPending,
    walletAddress: getWalletAddress.data?.data?.address,
    walletLoading: getWalletAddress.isLoading,
    walletError: getWalletAddress.error,
  };
}

// Mock properties data (for demo purposes - will be replaced by API)
export const mockProperties = [
  {
    id: 1,
    name: "Luxury Downtown Apartment",
    description: "Modern 2-bedroom apartment in the heart of the city",
    price: 200,
    location: "Downtown, City Center",
    image: "/api/placeholder/400/300",
    available: true,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4
  },
  {
    id: 2,
    name: "Cozy Studio Near Park",
    description: "Perfect studio apartment with park views",
    price: 120,
    location: "Central Park Area",
    image: "/api/placeholder/400/300",
    available: true,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2
  },
  {
    id: 3,
    name: "Modern Loft",
    description: "Spacious loft with high ceilings and natural light",
    price: 300,
    location: "Arts District",
    image: "/api/placeholder/400/300",
    available: false,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2
  },
  {
    id: 4,
    name: "Garden View House",
    description: "Charming house with beautiful garden views",
    price: 250,
    location: "Suburban Area",
    image: "/api/placeholder/400/300",
    available: true,
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6
  },
  {
    id: 5,
    name: "Beachfront Condo",
    description: "Stunning ocean views from this modern condo",
    price: 400,
    location: "Beachfront",
    image: "/api/placeholder/400/300",
    available: true,
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4
  },
  {
    id: 6,
    name: "Mountain Cabin",
    description: "Rustic cabin with modern amenities",
    price: 180,
    location: "Mountain Range",
    image: "/api/placeholder/400/300",
    available: true,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4
  }
];

