import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { 
  FaKeyboard, FaTrophy, FaChartLine, FaCalendarAlt, 
  FaFire, FaArrowUp, FaArrowDown, FaInfoCircle, 
  FaHistory, FaChartBar, FaUserAlt, FaRegLightbulb,
  FaSignOutAlt, FaCog
} from 'react-icons/fa';
import { AppContext } from '../App';

// Chart components - you'll need to install: npm install recharts
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = ({ user: propUser, logout: propLogout }) => {
  const navigate = useNavigate();
  
  // Use context if available
  const context = useContext(AppContext) || {};
  const contextUser = context.user;
  const contextLogout = context.logout;
  
  // Use props if provided, otherwise use context
  const user = propUser || contextUser;
  const logout = propLogout || contextLogout;
  
  // Define activeTab state first
  const [activeTab, setActiveTab] = useState('overview');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Sample data for charts and stats
  const [stats, setStats] = useState({
    testsCompleted: 52,
    avgWpm: 72,
    avgAccuracy: 94.2,
    bestWpm: 89,
    bestAccuracy: 98.5,
    topWpm: 95,
    wpmChange: 4.2,
    accuracyChange: 1.5,
    practiceTime: 4320, // in minutes
    recentTests: [
      { date: '2023-06-01', wpm: 65, accuracy: 92.3 },
      { date: '2023-06-03', wpm: 69, accuracy: 93.8 },
      { date: '2023-06-05', wpm: 72, accuracy: 91.5 },
      { date: '2023-06-07', wpm: 68, accuracy: 94.0 },
      { date: '2023-06-10', wpm: 75, accuracy: 95.2 },
      { date: '2023-06-12', wpm: 73, accuracy: 93.7 },
      { date: '2023-06-15', wpm: 79, accuracy: 96.1 }
    ],
    wpmDistribution: [
      { range: '0-20', count: 1 },
      { range: '21-40', count: 3 },
      { range: '41-60', count: 10 },
      { range: '61-80', count: 28 },
      { range: '81-100', count: 9 },
      { range: '100+', count: 1 }
    ],
    commonErrors: [
      { key: 'the', count: 15 },
      { key: 'and', count: 12 },
      { key: 'that', count: 9 },
      { key: 'with', count: 7 },
      { key: 'for', count: 6 }
    ],
    weeklyProgress: {
      wpm: [68, 70, 69, 72, 73, 75, 76],
      accuracy: [92.1, 93.5, 92.8, 94.2, 93.9, 95.1, 94.8]
    },
    rank: 157,
    percentile: 87
  });
  
  // For pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6B6B'];
  
  // Sample recent tests data
  const recentTests = [
    { id: 1, date: '2023-06-15', text: 'The quick brown fox jumps over the lazy dog', wpm: 79, accuracy: 96.1 },
    { id: 2, date: '2023-06-12', text: 'She sells seashells by the seashore', wpm: 73, accuracy: 93.7 },
    { id: 3, date: '2023-06-10', text: 'How much wood would a woodchuck chuck', wpm: 75, accuracy: 95.2 },
    { id: 4, date: '2023-06-07', text: 'Peter Piper picked a peck of pickled peppers', wpm: 68, accuracy: 94.0 },
    { id: 5, date: '2023-06-05', text: 'To be or not to be, that is the question', wpm: 72, accuracy: 91.5 }
  ];
  
  // Sample historical data for charts
  const historicalData = [
    { date: 'Jun 1', wpm: 65, accuracy: 92.3 },
    { date: 'Jun 3', wpm: 69, accuracy: 93.8 },
    { date: 'Jun 5', wpm: 72, accuracy: 91.5 },
    { date: 'Jun 7', wpm: 68, accuracy: 94.0 },
    { date: 'Jun 10', wpm: 75, accuracy: 95.2 },
    { date: 'Jun 12', wpm: 73, accuracy: 93.7 },
    { date: 'Jun 15', wpm: 79, accuracy: 96.1 }
  ];
  
  // Sample strengths and weaknesses data
  const strengthsWeaknesses = {
    strengths: ['Common English words', 'Home row keys', 'Right hand accuracy'],
    weaknesses: ['Numbers and symbols', 'Left pinky accuracy', 'Maintaining rhythm'],
    commonErrors: [
      { character: 'z', frequency: 12 },
      { character: 'q', frequency: 10 },
      { character: 'x', frequency: 8 },
      { character: 'p', frequency: 7 },
      { character: 'b', frequency: 6 }
    ],
    keyData: [
      { key: 'a', accuracy: 98 },
      { key: 'e', accuracy: 97 },
      { key: 'i', accuracy: 95 },
      { key: 'o', accuracy: 93 },
      { key: 'u', accuracy: 91 },
      { key: 't', accuracy: 89 },
      { key: 'z', accuracy: 75 }
    ]
  };
  
  // Sample achievements data
  const achievements = [
    { 
      id: 1, 
      name: 'Speed Demon', 
      description: 'Reach 80 WPM in a test', 
      completed: true, 
      date: '2023-06-15',
      progress: 1,
      total: 1
    },
    { 
      id: 2, 
      name: 'Accuracy Master', 
      description: 'Complete 5 tests with 95% or higher accuracy', 
      completed: false,
      progress: 3,
      total: 5
    },
    { 
      id: 3, 
      name: 'Consistent Typist', 
      description: 'Complete tests on 7 consecutive days', 
      completed: false,
      progress: 4,
      total: 7
    },
    { 
      id: 4, 
      name: 'Word Warrior', 
      description: 'Type 10,000 words in total', 
      completed: false,
      progress: 6850,
      total: 10000
    }
  ];
  
  // Get recent WPM trend (up/down)
  const getWpmTrend = () => {
    const recent = stats.recentTests;
    if (recent.length < 2) return { direction: 'up', value: 0 };
    
    const lastWpm = recent[recent.length - 1].wpm;
    const prevWpm = recent[recent.length - 2].wpm;
    const diff = lastWpm - prevWpm;
    
    return {
      direction: diff >= 0 ? 'up' : 'down',
      value: Math.abs(diff)
    };
  };
  
  const wpmTrend = getWpmTrend();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format time in minutes to hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
    }
  };
  
  // Get color class based on WPM
  const getWpmColor = (wpm) => {
    if (wpm >= 80) return 'text-indigo-600 dark:text-indigo-400';
    if (wpm >= 60) return 'text-green-600 dark:text-green-400';
    if (wpm >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  // Get color class based on accuracy
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 98) return 'text-indigo-600 dark:text-indigo-400';
    if (accuracy >= 95) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  // Add this helper function to the Dashboard component
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.name) {
      // Split name by spaces and get first letter of each part
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        // Return first letter of first name and first letter of last name
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      // Return first letter of name
      return user.name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav user={user} logout={logout} />
      
      <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.picture ? (
                  <img 
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800" 
                    src={user.picture} 
                    alt={user.name || 'User profile'} 
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.style.display = 'none'; // Hide the img element
                      e.target.nextSibling.style.display = 'flex'; // Show the fallback
                    }}
                  />
                ) : null}
                <div 
                  className={`h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400 font-bold ${user.picture ? 'hidden' : 'flex'}`}
                >
                  {getUserInitials()}
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user.name || user.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your typing progress and statistics
                </p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/test"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaKeyboard className="mr-2" />
                New Typing Test
              </Link>
              
              <div className="relative inline-block text-left">
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <FaChartLine className="mr-2" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <FaHistory className="mr-2" />
                Test History
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <FaChartBar className="mr-2" />
                Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center">
                <FaTrophy className="mr-2" />
                Achievements
              </div>
            </button>
          </nav>
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* WPM Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-md p-3">
                      <FaKeyboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Average WPM
                        </dt>
                        <dd>
                          <div className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stats.avgWpm}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stats.wpmChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {stats.wpmChange >= 0 ? (
                                <FaArrowUp className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                              ) : (
                                <FaArrowDown className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                              )}
                              <span>{Math.abs(stats.wpmChange)}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Top: {stats.topWpm} WPM
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accuracy Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                      <FaChartLine className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Average Accuracy
                        </dt>
                        <dd>
                          <div className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stats.avgAccuracy}%
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stats.accuracyChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {stats.accuracyChange >= 0 ? (
                                <FaArrowUp className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                              ) : (
                                <FaArrowDown className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                              )}
                              <span>{Math.abs(stats.accuracyChange)}%</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last 10 tests
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-md p-3">
                      <FaCalendarAlt className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Tests Completed
                        </dt>
                        <dd>
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stats.testsCompleted}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(stats.practiceTime)} practice time
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rank Card */}
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-md p-3">
                      <FaTrophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Global Rank
                        </dt>
                        <dd>
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            #{stats.rank}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Top {stats.percentile}% of all users
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tests */}
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FaHistory className="mr-2" />
                Recent Tests
              </h3>
              <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentTests.map((test) => (
                    <li key={test.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-10 w-10 flex items-center justify-center">
                            <FaKeyboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {test.text.substring(0, 40)}...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(test.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-6">
                          <div className="text-center">
                            <p className={`text-lg font-bold ${getWpmColor(test.wpm)}`}>
                              {test.wpm}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">WPM</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-lg font-bold ${getAccuracyColor(test.accuracy)}`}>
                              {test.accuracy}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 text-center">
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300"
                  >
                    View all test history
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Graph */}
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FaChartLine className="mr-2" />
                Progress Over Time
              </h3>
              <div className="mt-4 bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={historicalData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280" 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#6B7280" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderColor: '#E5E7EB', 
                          borderRadius: '0.375rem' 
                        }} 
                      />
                      <Legend align="right" verticalAlign="top" height={36} />
                      <Line 
                        type="monotone" 
                        dataKey="wpm" 
                        name="WPM" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        name="Accuracy %" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tips and Recommendations */}
            <div className="mt-8 mb-12">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                <FaRegLightbulb className="mr-2" />
                Improvement Tips
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-white dark:bg-gray-800 p-5 shadow rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Strengthen Your Weaknesses</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Focus on practicing {strengthsWeaknesses.weaknesses.join(', ')}. These are areas where you can improve the most.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 shadow rounded-lg border-l-4 border-green-500 dark:border-green-400">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Consistency Is Key</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Practice regularly, even if just for 10 minutes a day. Consistent practice leads to faster improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Test History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Your Typing Tests
            </h3>
            
            {/* Filter controls would go here */}
            
            {/* Test history table */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Passage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      WPM
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Characters
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* In a real application, you would map through actual test history data */}
                  {Array.from({ length: 10 }).map((_, index) => {
                    const test = {
                      id: index,
                      date: new Date(2023, 5, 10 - index).toISOString(),
                      text: 'The quick brown fox jumps over the lazy dog...',
                      wpm: Math.floor(70 + Math.random() * 20),
                      accuracy: (90 + Math.random() * 8).toFixed(1),
                      characters: 250 + Math.floor(Math.random() * 100),
                    };
                    
                    return (
                      <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(test.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="truncate max-w-xs">
                            {test.text}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={getWpmColor(test.wpm)}>{test.wpm}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={getAccuracyColor(test.accuracy)}>{test.accuracy}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {test.characters}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination would go here */}
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    Previous
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                      <span className="font-medium">48</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/30 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        2
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        3
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        4
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        5
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Detailed Performance Analytics
            </h3>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Strengths and Weaknesses */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Strengths & Weaknesses
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-base font-medium text-green-600 dark:text-green-400 flex items-center">
                        <FaArrowUp className="mr-2" />
                        Strengths
                      </h4>
                      <ul className="mt-3 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {strengthsWeaknesses.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-red-600 dark:text-red-400 flex items-center">
                        <FaArrowDown className="mr-2" />
                        Areas to Improve
                      </h4>
                      <ul className="mt-3 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {strengthsWeaknesses.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Common Errors */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Most Common Errors
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={strengthsWeaknesses.commonErrors}
                        margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis 
                          dataKey="character" 
                          stroke="#6B7280" 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6B7280" 
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Bar dataKey="frequency" name="Error Frequency" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Key Accuracy */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Key Accuracy Breakdown
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={strengthsWeaknesses.keyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          stroke="#6B7280" 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          dataKey="key" 
                          type="category"
                          stroke="#6B7280" 
                          tickLine={false}
                          axisLine={false}
                          width={30}
                        />
                        <Tooltip />
                        <Bar 
                          dataKey="accuracy" 
                          name="Accuracy %" 
                          fill="#6366F1" 
                          radius={[0, 4, 4, 0]} 
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Speed Distribution */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Speed Distribution
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '60-70 WPM', value: 8 },
                            { name: '70-80 WPM', value: 25 },
                            { name: '80-90 WPM', value: 12 },
                            { name: '90+ WPM', value: 3 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {
                            [
                              { name: '60-70 WPM', value: 8 },
                              { name: '70-80 WPM', value: 25 },
                              { name: '80-90 WPM', value: 12 },
                              { name: '90+ WPM', value: 3 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                          }
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Your Achievements
            </h3>
            
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {achievements.map((achievement) => (
                  <li key={achievement.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                          achievement.completed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}>
                          <FaTrophy className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h4 className={`text-lg font-medium ${
                            achievement.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {achievement.name}
                            {achievement.completed && (
                              <span className="ml-2 text-xs inline-block py-1 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-green-500 dark:bg-green-600 text-white rounded">
                                Completed
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {achievement.completed ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Achieved on {formatDate(achievement.date)}
                          </p>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Progress: {achievement.progress}/{achievement.total}
                            </p>
                            <div className="mt-1 w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" 
                                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Next achievements to work towards */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6">
              <h4 className="text-lg font-medium text-indigo-800 dark:text-indigo-300 flex items-center">
                <FaInfoCircle className="mr-2" />
                Next Goal
              </h4>
              <p className="mt-2 text-indigo-700 dark:text-indigo-300">
                Complete 2 more tests with 95% accuracy to earn the "Accuracy Master" achievement!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;