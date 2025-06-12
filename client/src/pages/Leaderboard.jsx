import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import { FaTrophy, FaMedal, FaFilter, FaSort, FaRegClock, FaKeyboard, FaChartLine } from 'react-icons/fa';
import { AppContext } from '../App'; // Import the context

const Leaderboard = ({ user, globalStats }) => {
  // Use context if available
  const context = useContext(AppContext) || {};
  const contextUser = context.user;
  const contextGlobalStats = context.globalStats;
  
  // Use props if provided, otherwise use context
  const currentUser = user || contextUser;
  const userGlobalStats = globalStats || contextGlobalStats;
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('all');
  const [sortBy, setSortBy] = useState('wpm');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for demonstration
  const mockLeaderboardData = [
    { id: 1, username: 'speedtyper', wpm: 138, accuracy: 98.2, tests: 146, avgWpm: 125, date: '2023-06-05' },
    { id: 2, username: 'keyboardwarrior', wpm: 126, accuracy: 97.1, tests: 89, avgWpm: 118, date: '2023-06-08' },
    { id: 3, username: 'typingmaster', wpm: 122, accuracy: 99.0, tests: 132, avgWpm: 116, date: '2023-06-02' },
    { id: 4, username: 'fastfingers', wpm: 115, accuracy: 96.8, tests: 76, avgWpm: 109, date: '2023-06-10' },
    { id: 5, username: 'wordsmith', wpm: 110, accuracy: 98.5, tests: 112, avgWpm: 105, date: '2023-06-01' },
    { id: 6, username: 'typoking', wpm: 108, accuracy: 97.2, tests: 95, avgWpm: 103, date: '2023-06-07' },
    { id: 7, username: 'qwertypro', wpm: 105, accuracy: 96.5, tests: 67, avgWpm: 99, date: '2023-06-09' },
    { id: 8, username: 'typewriter', wpm: 102, accuracy: 95.8, tests: 53, avgWpm: 97, date: '2023-06-04' },
    { id: 9, username: 'keystrokes', wpm: 98, accuracy: 96.3, tests: 81, avgWpm: 93, date: '2023-06-03' },
    { id: 10, username: 'lettersprint', wpm: 95, accuracy: 94.9, tests: 45, avgWpm: 90, date: '2023-06-11' },
    { id: 11, username: 'textrunner', wpm: 92, accuracy: 95.2, tests: 62, avgWpm: 88, date: '2023-06-06' },
    { id: 12, username: 'wordzoom', wpm: 90, accuracy: 93.8, tests: 39, avgWpm: 85, date: '2023-06-12' },
    { id: 13, username: 'keypadking', wpm: 87, accuracy: 94.1, tests: 51, avgWpm: 83, date: '2023-06-08' },
    { id: 14, username: 'typealot', wpm: 85, accuracy: 92.7, tests: 37, avgWpm: 81, date: '2023-06-10' },
    { id: 15, username: 'speedwriter', wpm: 83, accuracy: 93.5, tests: 42, avgWpm: 79, date: '2023-06-09' },
    { id: 16, username: 'keystormer', wpm: 81, accuracy: 91.9, tests: 31, avgWpm: 77, date: '2023-06-11' },
    { id: 17, username: 'alphatyper', wpm: 79, accuracy: 92.2, tests: 28, avgWpm: 75, date: '2023-06-07' },
    { id: 18, username: 'wordracer', wpm: 76, accuracy: 90.8, tests: 25, avgWpm: 72, date: '2023-06-12' },
    { id: 19, username: 'charspeed', wpm: 73, accuracy: 91.3, tests: 23, avgWpm: 70, date: '2023-06-05' },
    { id: 20, username: 'typehawk', wpm: 70, accuracy: 90.1, tests: 19, avgWpm: 68, date: '2023-06-06' },
  ];

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from your API
        // const response = await fetch('/api/leaderboard?timeFrame=' + timeFrame);
        // const data = await response.json();
        // setLeaderboardData(data);
        
        // For demonstration, use mock data with timeout to simulate loading
        setTimeout(() => {
          setLeaderboardData(mockLeaderboardData);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load leaderboard. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching leaderboard:', err);
      }
    };
    
    fetchLeaderboard();
  }, [timeFrame]);

  // Filter and sort data
  const filteredAndSortedData = [...leaderboardData]
    .filter(entry => {
      if (timeFrame === 'all') return true;
      
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      if (timeFrame === 'day') {
        return entryDate.toDateString() === today.toDateString();
      } else if (timeFrame === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return entryDate >= weekAgo;
      } else if (timeFrame === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return entryDate >= monthAgo;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'wpm') return b.wpm - a.wpm;
      if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
      if (sortBy === 'tests') return b.tests - a.tests;
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Get medal for top 3 positions
  const getMedal = (index) => {
    switch (index) {
      case 0:
        return <FaTrophy className="text-yellow-500" />;
      case 1:
        return <FaMedal className="text-gray-400" />;
      case 2:
        return <FaMedal className="text-amber-700" />;
      default:
        return null;
    }
  };

  // Find user's rank if they are logged in
  const getUserRank = () => {
    if (!currentUser) return null;
    
    // Handle case where user doesn't have a username property
    const username = currentUser.username || currentUser.name || currentUser.email || '';
    
    const userIndex = filteredAndSortedData.findIndex(entry => 
      entry.username.toLowerCase() === username.toLowerCase()
    );
    
    if (userIndex === -1) return null;
    
    return {
      position: userIndex + 1,
      data: filteredAndSortedData[userIndex]
    };
  };

  // Ensure we're checking currentUser everywhere instead of user
  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav user={currentUser} />
      
      <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <FaTrophy className="inline-block mr-2 text-yellow-500" />
            Global Leaderboard
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            The fastest typists around the world
          </p>
        </div>
        
        {/* User's current rank (if logged in) */}
        {currentUser && userRank && (
          <div className="mb-8">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border-l-4 border-indigo-500">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-indigo-100 dark:bg-indigo-800 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                      {userRank.position}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Your Rank: {userRank.position} 
                      {userRank.position <= 10 && (
                        <span className="ml-2 text-yellow-500">
                          Top {Math.round((userRank.position / filteredAndSortedData.length) * 100)}%
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Keep practicing to move up the leaderboard!
                    </p>
                  </div>
                </div>
                <div className="flex space-x-8">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{userRank.data.wpm}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">WPM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{userRank.data.accuracy}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filter and sort controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaFilter className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Filter:</span>
              </div>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimeFrame('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-md ${
                    timeFrame === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeFrame('month')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    timeFrame === 'month' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeFrame('week')}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    timeFrame === 'week' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeFrame('day')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-md ${
                    timeFrame === 'day' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaSort className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Sort By:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block pl-3 pr-10 py-1.5 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="wpm">WPM (Fastest)</option>
                <option value="accuracy">Accuracy</option>
                <option value="tests">Tests Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Leaderboard table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaKeyboard className="mr-1" />
                          WPM
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaChartLine className="mr-1" />
                          Accuracy
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaRegClock className="mr-1" />
                          Tests
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentItems.map((entry, index) => {
                      const globalIndex = indexOfFirstItem + index;
                      // Fix this line to handle missing username
                      const isCurrentUser = currentUser && 
                        ((currentUser.username && currentUser.username === entry.username) || 
                         (currentUser.name && currentUser.name === entry.username) ||
                         (currentUser.email && currentUser.email === entry.username));
                      
                      return (
                        <tr 
                          key={entry.id}
                          className={`${isCurrentUser ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                                {globalIndex + 1}
                              </span>
                              {globalIndex < 3 && getMedal(globalIndex)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                                  {entry.username.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {entry.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-semibold">{entry.wpm}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Avg: {entry.avgWpm}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold">
                              <span className={`
                                ${entry.accuracy > 97 ? 'text-green-600 dark:text-green-400' : 
                                  entry.accuracy > 94 ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-gray-900 dark:text-white'}
                              `}>
                                {entry.accuracy}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {entry.tests}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredAndSortedData.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredAndSortedData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${
                            currentPage === 1 
                              ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed' 
                              : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {[...Array(totalPages).keys()].map(number => (
                          <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                              currentPage === number + 1
                                ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {number + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${
                            currentPage === totalPages 
                              ? 'text-gray-300 dark:text-gray-500 cursor-not-allowed' 
                              : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Mobile pagination */}
                  <div className="flex w-full sm:hidden justify-between">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                        currentPage === 1 
                          ? 'text-gray-300 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                        currentPage === totalPages 
                          ? 'text-gray-300 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Motivational call-to-action */}
        <div className="mt-8 text-center">
          <Link 
            to="/test" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FaKeyboard className="mr-2" />
            Practice to Improve Your Ranking
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;