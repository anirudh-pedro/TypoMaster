import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContext } from "../App";

import ProfileSection from '../components/dashboard/ProfileSection';
import TabNavigation from '../components/dashboard/TabNavigation';
import OverviewTab from '../components/dashboard/OverviewTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import AchievementsTab from '../components/dashboard/AchievementsTab';

import { dashboardService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout } = useContext(AppContext) || {};
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [achievementRefreshTrigger, setAchievementRefreshTrigger] = useState(0);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.uid) return;
      
      setLoading(true);
      try {
        const response = await dashboardService.getStats(user.uid);
        if (response.success) {
          setDashboardData(response.data);
          setError(null);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data error:', err);
        setError('Error loading dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const refresh = searchParams.get('refresh');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    if (refresh === 'true') {
      setAchievementRefreshTrigger(prev => prev + 1);
      navigate(location.pathname + (tab ? `?tab=${tab}` : ''), { replace: true });
    }
  }, [location, navigate]);

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      // case 'overview':
      //   return <OverviewTab data={dashboardData} />;
      case 'history':
        return <HistoryTab userId={user.uid} />;
      case 'analytics':
        return <AnalyticsTab userId={user.uid} />;
      // case 'achievements':
      //   return <AchievementsTab userId={user.uid} refreshTrigger={achievementRefreshTrigger} />;
      default:
        return <AnalyticsTab userId={user.uid} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <ProfileSection user={user} logout={logout} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderTabContent()}
    </div>
  );
};

export default Dashboard;