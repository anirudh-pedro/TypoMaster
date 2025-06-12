import axios from 'axios';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Check if server is available
export const checkServerAvailability = async () => {
  try {
    const response = await api.get('/api/health');
    return response.status === 200;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// Auth API functions
export const authApi = {
  loginWithFirebase: async (idToken) => {
    try {
      const response = await api.post('/api/auth/firebase', { idToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Local auth fallback functions
export const localAuth = {
  createGuestUser: (firebaseUser) => {
    return {
      uid: firebaseUser?.uid || `guest_${Date.now()}`,
      email: firebaseUser?.email || 'guest@typomaster.com',
      name: firebaseUser?.displayName || 'Guest User',
      picture: firebaseUser?.photoURL || null,
      isGuestMode: true,
      provider: 'guest',
      createdAt: new Date().toISOString()
    };
  }
};

// Error handling function
export const handleAuthError = (error, firebaseUser = null) => {
  console.error('Authentication error:', error);
  
  // Create guest user as fallback
  const guestUser = localAuth.createGuestUser(firebaseUser);
  
  return {
    success: false,
    error: error.message || 'Authentication failed',
    user: guestUser,
    fallbackMode: true
  };
};

// Dashboard API functions
export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveTestResult: async (testData) => {
    try {
      const response = await api.post('/api/dashboard/test-result', testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Leaderboard API functions
export const leaderboardApi = {
  getLeaderboard: async (timeframe = 'all') => {
    try {
      const response = await api.get(`/api/leaderboard?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api;