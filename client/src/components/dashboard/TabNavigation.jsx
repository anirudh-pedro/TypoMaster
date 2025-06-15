import React from 'react';
import { FaChartLine, FaHistory, FaTrophy } from 'react-icons/fa';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <nav className="-mb-px flex space-x-8">
        <button
          className={`pb-4 px-1 ${activeTab === 'overview' 
            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('overview')}
        >
          <div className="flex items-center">
            <FaChartLine className="mr-2" />
            <span>Overview</span>
          </div>
        </button>
        
        <button
          className={`pb-4 px-1 ${activeTab === 'history' 
            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('history')}
        >
          <div className="flex items-center">
            <FaHistory className="mr-2" />
            <span>Test History</span>
          </div>
        </button>
        
        <button
          className={`pb-4 px-1 ${activeTab === 'analytics' 
            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <div className="flex items-center">
            <FaChartLine className="mr-2" />
            <span>Analytics</span>
          </div>
        </button>
        
        <button
          className={`pb-4 px-1 ${activeTab === 'achievements' 
            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
            : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('achievements')}
        >
          <div className="flex items-center">
            <FaTrophy className="mr-2" />
            <span>Achievements</span>
          </div>
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;