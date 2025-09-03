
import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { FaTrophy, FaMedal, FaAward, FaSpinner, FaChartLine } from 'react-icons/fa';
import { leaderboardService } from '../services/leaderboardService';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [category, setCategory] = useState('wpm');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard({
        timeframe,
        sort: category,
        limit: 50
      });
      setLeaderboardData(data.data || []);
    } catch (err) {
      setError('Failed to load leaderboard data');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-500 text-xl" />;
      case 2:
        return <FaMedal className="text-gray-400 text-xl" />;
      case 3:
        return <FaAward className="text-amber-600 text-xl" />;
      default:
        return <span className="text-gray-600 font-bold text-lg">#{rank}</span>;
    }
  };

  const getTimeframeLabel = (tf) => {
    switch (tf) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'wpm': return 'Average Speed Leaders';
      case 'best-wpm': return 'Best Speed Leaders';
      case 'accuracy': return 'Average Accuracy Masters';
      case 'best-accuracy': return 'Best Accuracy Masters';
      case 'tests': return 'Most Active Typists';
      default: return 'Average Speed Leaders';
    }
  };

  const getDisplayValue = (entry, cat) => {
    switch (cat) {
      case 'wpm': return `${entry.avgWpm} WPM`;
      case 'best-wpm': return `${entry.bestWpm} WPM`;
      case 'accuracy': return `${entry.avgAccuracy}%`;
      case 'best-accuracy': return `${entry.bestAccuracy}%`;
      case 'tests': return `${entry.testsCompleted} tests`;
      default: return `${entry.avgWpm} WPM`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <FaTrophy className="inline-block mr-3 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-lg text-gray-600">
            Overall performance rankings - each user appears once with their complete statistics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Timeframe Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="wpm">Average Speed (WPM)</option>
                <option value="best-wpm">Best Speed (WPM)</option>
                <option value="accuracy">Average Accuracy (%)</option>
                <option value="best-accuracy">Best Accuracy (%)</option>
                <option value="tests">Tests Completed</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {getTimeframeLabel(timeframe)} - {getCategoryLabel(category)}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing overall averages across all tests for each user
            </p>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaChartLine className="mx-auto text-4xl mb-4" />
              <p>No data available for the selected timeframe.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Primary Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tests Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.map((entry, index) => (
                    <tr key={entry._id} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full mr-3 bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm overflow-hidden">
                            {entry.userInfo?.picture ? (
                              <img
                                className="h-full w-full object-cover"
                                src={entry.userInfo.picture}
                                alt={entry.userInfo.name || 'User'}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const fallback = document.createElement('span');
                                  fallback.textContent = (entry.userInfo?.name || 'Anonymous').charAt(0).toUpperCase();
                                  fallback.className = 'text-indigo-600 font-medium text-sm';
                                  e.target.parentElement.appendChild(fallback);
                                }}
                              />
                            ) : (
                              <span className="text-indigo-600 font-medium text-sm">
                                {(entry.userInfo?.name || 'Anonymous').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.userInfo?.name || 'Anonymous'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-600">
                          {getDisplayValue(entry, category)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {entry.avgWpm} WPM ({entry.avgAccuracy}%)
                        </div>
                        <div className="text-xs text-gray-500">
                          Best: {entry.bestWpm} WPM ({entry.bestAccuracy}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.testsCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.lastTestDate || entry.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p><strong>Overall Performance Leaderboard:</strong> Each user appears once with their complete statistics</p>
          <p className="mt-1">
            Rankings based on {category === 'wpm' ? 'average typing speed' : category === 'best-wpm' ? 'best typing speed' : category === 'accuracy' ? 'average accuracy' : category === 'best-accuracy' ? 'best accuracy' : 'number of tests completed'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;