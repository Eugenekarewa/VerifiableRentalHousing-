import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from cookies and redirect to login
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Google OAuth login
  loginWithGoogle: (credential) => 
    apiClient.post('/auth/google', { credential }),
  
  // Email/password registration
  register: (email, password, name) =>
    apiClient.post('/auth/email/register', { email, password, name }),
  
  // Email/password login
  login: (email, password) =>
    apiClient.post('/auth/email/login', { email, password }),
  
  // Logout
  logout: () => 
    apiClient.post('/auth/logout'),
  
  // Get user profile
  getProfile: () => 
    apiClient.get('/auth/profile'),
};

// Properties API
export const propertiesAPI = {
  // Get all properties with filters
  getProperties: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/properties?${params.toString()}`);
  },
  
  // Get specific property
  getProperty: (id) => 
    apiClient.get(`/properties/${id}`),
  
  // Search suggestions
  getSearchSuggestions: (query) => 
    apiClient.get(`/properties/search/suggestions?q=${encodeURIComponent(query)}`),
  
  // Check availability
  checkAvailability: (propertyId, checkInDate, checkOutDate) =>
    apiClient.post(`/properties/${propertyId}/availability`, {
      checkInDate,
      checkOutDate
    }),
};

// Bookings API
export const bookingsAPI = {
  // Create new booking
  createBooking: (bookingData) => 
    apiClient.post('/bookings/create', bookingData),
  
  // Get user bookings
  getUserBookings: () => 
    apiClient.get('/bookings/user'),
  
  // Get specific booking
  getBooking: (id) => 
    apiClient.get(`/bookings/${id}`),
  
  // Cancel booking
  cancelBooking: (id) => 
    apiClient.post(`/bookings/${id}/cancel`),
};

// Wallet API
export const walletAPI = {
  // Create wallet
  createWallet: () => 
    apiClient.post('/wallet/create'),
  
  // Get wallet address
  getWalletAddress: () => 
    apiClient.get('/wallet/address'),
  
  // Sign transaction (for backend use)
  signTransaction: (transaction) => 
    apiClient.post('/wallet/sign', transaction),
  
  // Get balance
  getBalance: () => 
    apiClient.get('/wallet/balance'),
  
  // Estimate gas
  estimateGas: (operation) => 
    apiClient.post('/wallet/gas-estimate', { operation }),
};

// KRNL API
export const krnlAPI = {
  // Verify identity
  verifyIdentity: (tenantData) => 
    apiClient.post('/krnl/verify/identity', { tenantData }),
  
  // Check availability
  checkAvailability: (propertyId, dates) => 
    apiClient.post('/krnl/check/availability', { propertyId, ...dates }),
  
  // Authorize escrow
  authorizeEscrow: (bookingId, depositAmount) => 
    apiClient.post('/krnl/authorize/escrow', { bookingId, depositAmount }),
  
  // Resolve dispute
  resolveDispute: (disputeData) => 
    apiClient.post('/krnl/resolve/dispute', disputeData),
  
  // Verify proof
  verifyProof: (proofHash) => 
    apiClient.get(`/krnl/proofs/${proofHash}`),
  
  // Get KRNL status
  getStatus: () => 
    apiClient.get('/krnl/status'),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/health`),
};

export default apiClient;
