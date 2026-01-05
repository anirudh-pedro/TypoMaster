import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import { FaKeyboard, FaClock, FaChartLine, FaInfoCircle, FaListAlt } from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const AnalyticsTab = ({ userId }) => {
  const [period, setPeriod] = useState('month'); // Changed back to 'month' for production compatibility
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('wpm'); 

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) {
        setError('User ID not available');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching analytics for userId:', userId);
        console.log('Period:', period);
        
        let response = await dashboardService.getAnalytics(userId, period);
        console.log('Analytics response:', response);
        
        // If 'all' period fails or returns empty data, try other periods
        if (period === 'all' && response && response.success && 
            (!response.data.chartData || response.data.chartData.length === 0)) {
          console.log('No data for "all" period, trying "year"...');
          response = await dashboardService.getAnalytics(userId, 'year');
          
          if (!response.data.chartData || response.data.chartData.length === 0) {
            console.log('No data for "year" period, trying "month"...');
            response = await dashboardService.getAnalytics(userId, 'month');
          }
        }
        
        if (response && response.success) {
          setAnalytics(response.data);
          setError(null);
          console.log('Analytics data set:', response.data);
        } else {
          console.error('Analytics failed:', response);
          setError(response?.message || 'Failed to load analytics data');
        }
      } catch (err) {
        console.error('Analytics data error:', err);
        if (err.response?.status === 404) {
          setError('User not found. Please make sure you are logged in properly.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError('Error loading analytics data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, period]);

  const formatChartData = (data) => {
    if (!data || !data.length) return [];
    
    return data.map(item => ({
      date: item.date,
      wpm: parseFloat(item.wpm),
      accuracy: parseFloat(item.accuracy),
      tests: parseInt(item.tests, 10)
    }));
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <FaInfoCircle className="text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Unable to Load Analytics</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-600">
            <p><strong>Possible solutions:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Make sure you are logged in properly</li>
              <li>Try refreshing the page</li>
              <li>Check your internet connection</li>
              <li>Take some typing tests to generate data</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.chartData || analytics.chartData.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="text-center py-8">
          <FaChartLine className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">Take a typing test to see your analytics.</p>
          {period !== 'all' && (
            <button
              onClick={() => setPeriod('all')}
              className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm underline"
            >
              View All Time Data
            </button>
          )}
        </div>
      </div>
    );
  }

  const { chartData, improvement, periodStats, timeStats } = analytics;
  
  const totalTests = periodStats.totalTests || 0;

  const formattedChartData = formatChartData(chartData);

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
          
          <div className="mt-3 md:mt-0 inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setPeriod('all')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                period === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                period === 'week'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                period === 'month'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                period === 'year'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setActiveChart('wpm')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'wpm' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            WPM
          </button>
          <button 
            onClick={() => setActiveChart('accuracy')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'accuracy' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Accuracy
          </button>
          <button 
            onClick={() => setActiveChart('tests')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'tests' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tests Completed
          </button>
          <button 
            onClick={() => setActiveChart('combined')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'combined' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Combined
          </button>
        </div>
        
        <div className="h-80 bg-white rounded-lg">
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
                <p className="mt-2 text-sm text-gray-500">
                  No data available for this period. Complete some typing tests to see your progress.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {activeChart === 'wpm' 
            ? 'Chart shows your typing speed (WPM) over time' 
            : activeChart === 'accuracy' 
              ? 'Chart shows your typing accuracy percentage over time'
              : activeChart === 'tests'
                ? 'Chart shows the number of tests you completed over time'
                : 'Chart compares your speed and accuracy trends over time'}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <FaKeyboard className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg WPM</p>
                <p className="text-xl font-bold text-gray-900">{periodStats.avgWpm}</p>
                <p className="text-xs text-gray-500">
                  {improvement.startsWith('-') ? 'Decreased by' : 'Improved by'} {improvement.replace('-', '')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <FaChartLine className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-xl font-bold text-gray-900">{periodStats.avgAccuracy}%</p>
                <p className="text-xs text-gray-500">
                  From {totalTests} tests
                </p>
              </div>
            </div>
          </div>
          
         
        </div>
        
        {formattedChartData.length > 0 && (
          <div className="mt-6 bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaListAlt className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-sm font-medium text-amber-800">Tests Frequency</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium text-gray-500">Most Active Day</p>
                <p className="text-xl font-bold text-gray-900">
                  {formattedChartData.reduce((prev, current) => (prev.tests > current.tests) ? prev : current).date}
                </p>
                <p className="text-xs text-gray-500">
                  {formattedChartData.reduce((prev, current) => (prev.tests > current.tests) ? prev : current).tests} tests
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm font-medium text-gray-500">Consistency</p>
                <p className="text-xl font-bold text-gray-900">
                  {Math.round((formattedChartData.filter(d => d.tests > 0).length / formattedChartData.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500">of days with tests</p>
              </div>
            </div>
          </div>
        )}
        
        {formattedChartData.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 flex items-center">
              <FaInfoCircle className="mr-2" /> 
              Performance Insight
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {improvement.startsWith('-') 
                ? `Your typing speed has decreased by ${improvement.replace('-', '')} compared to the previous ${period}. Consider practicing more regularly to improve.` 
                : `Great progress! Your typing speed has improved by ${improvement} over the ${period}. Keep up the good work!`}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        
        {chartData && chartData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tests</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.slice(0, 10).map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{day.wpm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{day.accuracy}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No trend data available for this period.</p>
        )}
        
        {chartData && chartData.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 10 of {chartData.length} data points
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
