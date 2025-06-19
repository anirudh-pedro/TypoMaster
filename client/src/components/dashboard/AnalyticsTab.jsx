import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { FaKeyboard, FaClock, FaChartLine, FaInfoCircle, FaListAlt } from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const AnalyticsTab = ({ userId }) => {
  const [period, setPeriod] = useState('month');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('wpm'); // 'wpm', 'accuracy', 'tests', or 'combined'

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await dashboardService.getAnalytics(userId, period);
        if (response.success) {
          setAnalytics(response.data);
          setError(null);
        } else {
          setError('Failed to load analytics data');
        }
      } catch (err) {
        console.error('Analytics data error:', err);
        setError('Error loading analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, period]);

  // Format data for charts
  const formatChartData = (data) => {
    if (!data || !data.length) return [];
    
    // Convert string values to numbers for charts
    return data.map(item => ({
      date: item.date,
      wpm: parseFloat(item.wpm),
      accuracy: parseFloat(item.accuracy),
      tests: parseInt(item.tests, 10)
    }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No analytics data available yet.</p>
      </div>
    );
  }

  const { chartData, improvement, periodStats, timeStats } = analytics;
  
  // Define totalTests from periodStats
  const totalTests = periodStats.totalTests || 0;

  // Format data for charts
  const formattedChartData = formatChartData(chartData);

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h2>
          
          <div className="mt-3 md:mt-0 inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                period === 'week'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                period === 'month'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                period === 'year'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        {/* Chart type selector */}
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setActiveChart('wpm')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'wpm' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            WPM
          </button>
          <button 
            onClick={() => setActiveChart('accuracy')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'accuracy' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Accuracy
          </button>
          <button 
            onClick={() => setActiveChart('tests')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'tests' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tests Completed
          </button>
          <button 
            onClick={() => setActiveChart('combined')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'combined' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Combined
          </button>
        </div>
        
        {/* Dynamic Charts */}
        <div className="h-80 bg-white dark:bg-gray-800 rounded-lg">
          {formattedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'wpm' && (
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      color: '#f3f4f6'
                    }}
                    itemStyle={{ color: '#f3f4f6' }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#4f46e5" 
                    fillOpacity={1} 
                    fill="url(#colorWpm)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Words Per Minute"
                  />
                </AreaChart>
              )}
              
              {activeChart === 'accuracy' && (
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    domain={[0, 100]}
                    tickMargin={10}
                    label={{ 
                      value: '%', 
                      position: 'insideTopLeft', 
                      offset: 0,
                      fill: '#6b7280',
                      dy: -10
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      color: '#f3f4f6'
                    }}
                    itemStyle={{ color: '#f3f4f6' }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorAccuracy)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Accuracy"
                  />
                </AreaChart>
              )}
              
              {/* NEW CHART: Tests Completed */}
              {activeChart === 'tests' && (
                <BarChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      color: '#f3f4f6'
                    }}
                    itemStyle={{ color: '#f3f4f6' }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                    formatter={(value) => [value, 'Tests Completed']}
                  />
                  <Bar 
                    dataKey="tests" 
                    fill="url(#colorTests)"
                    radius={[4, 4, 0, 0]}
                    name="Tests Completed"
                    barSize={30}
                  />
                </BarChart>
              )}
              
              {activeChart === 'combined' && (
                <LineChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#4f46e5"
                    tick={{ fill: '#4f46e5' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    domain={[0, 100]}
                    tick={{ fill: '#10b981' }}
                    tickMargin={10}
                    label={{ 
                      value: '%', 
                      position: 'insideTopRight', 
                      offset: 0,
                      fill: '#10b981',
                      dy: -10
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      color: '#f3f4f6'
                    }}
                    itemStyle={{ color: '#f3f4f6' }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                    formatter={(value, name) => [
                      name === 'WPM' ? value.toFixed(1) : name === 'Accuracy' ? `${value.toFixed(1)}%` : value, 
                      name
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="WPM"
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Accuracy"
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FaInfoCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No data available for this period. Complete some typing tests to see your progress.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {activeChart === 'wpm' 
            ? 'Chart shows your typing speed (WPM) over time' 
            : activeChart === 'accuracy' 
              ? 'Chart shows your typing accuracy percentage over time'
              : activeChart === 'tests'
                ? 'Chart shows the number of tests you completed over time'
                : 'Chart compares your speed and accuracy trends over time'}
        </div>
        
        {/* Summary stats for the period */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-4">
                <FaKeyboard className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg WPM</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{periodStats.avgWpm}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {improvement.startsWith('-') ? 'Decreased by' : 'Improved by'} {improvement.replace('-', '')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                <FaChartLine className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{periodStats.avgAccuracy}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  From {totalTests} tests
                </p>
              </div>
            </div>
          </div>
          
          {/* <div className="bg-purple-50 dark:bg-purple-900/50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                <FaClock className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Practice Time</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{timeStats.totalTime} hrs</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Avg {timeStats.avgTimePerTest}s per test
                </p>
              </div>
            </div>
          </div> */}
        </div>
        
        {/* NEW: Tests frequency card */}
        {formattedChartData.length > 0 && (
          <div className="mt-6 bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaListAlt className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Tests Frequency</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {(totalTests / (period === 'week' ? 7 : period === 'month' ? 30 : 365)).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">tests per day</p>
              </div> */}
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Active Day</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formattedChartData.reduce((prev, current) => (prev.tests > current.tests) ? prev : current).date}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedChartData.reduce((prev, current) => (prev.tests > current.tests) ? prev : current).tests} tests
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Consistency</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round((formattedChartData.filter(d => d.tests > 0).length / formattedChartData.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">of days with tests</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Chart insight */}
        {formattedChartData.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
              <FaInfoCircle className="mr-2" /> 
              Performance Insight
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              {improvement.startsWith('-') 
                ? `Your typing speed has decreased by ${improvement.replace('-', '')} compared to the previous ${period}. Consider practicing more regularly to improve.` 
                : `Great progress! Your typing speed has improved by ${improvement} over the ${period}. Keep up the good work!`}
            </p>
          </div>
        )}
      </div>
      
      {/* Performance trends table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
        
        {chartData && chartData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">WPM</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {chartData.slice(0, 10).map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{day.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{day.wpm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400">{day.accuracy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{day.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No trend data available for this period.</p>
        )}
        
        {chartData && chartData.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 10 of {chartData.length} data points
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
