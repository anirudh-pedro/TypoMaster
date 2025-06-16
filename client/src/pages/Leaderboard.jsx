import React, { useState, useEffect } from 'react';
import { useAppContext } from "../App"; // Replace useAuth import with useAppContext
import { leaderboardService } from "../services/leaderboardService";

const Leaderboard = ({ user, globalStats }) => {
  // Access user from props or from context
  const { user: contextUser } = useAppContext();
  const currentUser = user || contextUser; // Use the provided user or get from context
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    timeframe: 'all',
    page: 1,
    limit: 20,
    sort: 'wpm'
  });
  const [userRank, setUserRank] = useState(null);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await leaderboardService.getLeaderboard(filters);
        if (response.success) {
          setLeaderboardData(response.data);
          setError(null);
        } else {
          setError(response.message || 'Failed to load leaderboard data');
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filters]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    // Only subscribe when viewing the most recent results
    if (filters.timeframe === 'day' && filters.sort === 'date' && filters.page === 1) {
      const unsubscribe = leaderboardService.subscribeToRealTimeUpdates(
        // Update handler - add new results to the top
        (newResults) => {
          setLeaderboardData(prev => {
            // If it's an array of results
            if (Array.isArray(newResults)) {
              return [...newResults, ...prev].slice(0, filters.limit);
            }
            // If it's a single result
            return [newResults, ...prev].slice(0, filters.limit);
          });
        },
        // Initial data handler
        (initialData) => {
          setLeaderboardData(initialData);
          setLoading(false);
        },
        // Error handler
        (errorMsg) => {
          console.error('Leaderboard stream error:', errorMsg);
          // Don't set error state to avoid disrupting the UI
        }
      );
      
      return unsubscribe;
    }
  }, [filters]);
  
  // Fetch user ranking if logged in
  useEffect(() => {
    async function fetchUserRanking() {
      if (!currentUser) return;
      
      try {
        const response = await leaderboardService.getUserRanking(currentUser.uid);
        if (response.success) {
          setUserRank(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user ranking:', err);
      }
    }
    
    fetchUserRanking();
  }, [currentUser]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when changing filters
      page: key !== 'page' ? 1 : value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Leaderboard</h1>
      
      {/* User ranking section */}
      {userRank && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Your Ranking</h2>
              <p className="text-3xl font-bold">{userRank.ranking}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Best Performance</p>
              <p className="text-xl font-bold">{userRank.bestWpm} WPM</p>
              <p className="text-sm">{userRank.bestAccuracy}% accuracy</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Period</label>
          <select
            value={filters.timeframe}
            onChange={(e) => handleFilterChange('timeframe', e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="day">Last 24 Hours</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="wpm">Speed (WPM)</option>
            <option value="accuracy">Accuracy</option>
            <option value="date">Most Recent</option>
          </select>
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
          <p>{error}</p>
          <button 
            onClick={() => handleFilterChange('page', 1)} // Retry by resetting to page 1
            className="mt-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {/* Leaderboard Table */}
      {!loading && leaderboardData.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">WPM</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboardData.map((entry, index) => (
                  <tr key={entry._id} className={currentUser && entry.userInfo.firebaseUid === currentUser.uid ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {(filters.page - 1) * filters.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {entry.userInfo.picture ? (
                          <img 
                            src={entry.userInfo.picture} 
                            alt={entry.userInfo.name} 
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-medium">
                              {entry.userInfo.name[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.userInfo.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {entry.wpm}
                      </span> WPM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {entry.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {filters.page}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={leaderboardData.length < filters.limit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Empty State */}
      {!loading && leaderboardData.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No typing test results match your current filters.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setFilters({
                  timeframe: 'all',
                  sort: 'wpm',
                  page: 1,
                  limit: 20
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;