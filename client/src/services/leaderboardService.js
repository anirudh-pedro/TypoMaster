import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leaderboard';

export const leaderboardService = {

  getLeaderboard: async (params = {}) => {
    const { timeframe = 'all', page = 1, limit = 20, sort = 'wpm' } = params;
    try {
      const response = await axios.get(API_URL, {
        params: { timeframe, page, limit, sort }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },


  getUserRanking: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user ranking:', error);
      throw error;
    }
  },

  /**
   * @param {Function} onUpdate - Callback for new results
   * @param {Function} onInitial - Callback for initial data load
   * @param {Function} onError - Callback for errors
   * @returns {Function} - Unsubscribe function
   */
  subscribeToRealTimeUpdates: (onUpdate, onInitial, onError) => {
    const eventSource = new EventSource(`${API_URL}/realtime`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'initial':
            if (onInitial) onInitial(data.data);
            break;
          case 'new-result':
          case 'new-results':
            if (onUpdate) onUpdate(data.data);
            break;
          case 'error':
            if (onError) onError(data.message);
            break;
          case 'heartbeat':
            break;
          default:
            console.log('Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
        if (onError) onError('Failed to parse server message');
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      if (onError) onError('Connection to leaderboard updates lost');
    };
    
    return () => {
      eventSource.close();
    };
  },

 
  getDailyChallengeLeaderboard: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/daily-challenge`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily challenge leaderboard:', error);
      throw error;
    }
  },
  

  getAllTimeUserRankings: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/all-time-users`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all-time user rankings:', error);
      throw error;
    }
  }
};