import axios from 'axios';

const API_URL = 'https://typomaster-1cvz.onrender.com/api';
// const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const checkServerAvailability = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    console.log('Server unavailable:', error.message);
    return false;
  }
};

export const authApi = {
  loginWithFirebase: async (idToken) => {
    try {
      const response = await api.post('/auth/firebase', { idToken });
      return response.data;
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    }
  }
};

export const dashboardService = {
  getStats: async (uid) => {
    try {
      const response = await api.get(`/dashboard/stats?uid=${uid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  saveTestResult: async (uid, testData) => {
    try {
      const response = await api.post(`/dashboard/test-result?uid=${uid}`, testData);
      return response.data;
    } catch (error) {
      console.error('Error saving test result:', error);
      throw error;
    }
  },

  getHistory: async (uid, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/dashboard/history?uid=${uid}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test history:', error);
      throw error;
    }
  },

  getAnalytics: async (uid, period = 'month') => {
    try {
      const response = await api.get(`/dashboard/analytics?uid=${uid}&period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};

export default api;