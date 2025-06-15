import React from 'react';

const StatCard = ({ icon, title, value, change, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <span className={`ml-2 text-sm font-medium ${change.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                {change.startsWith('-') ? '↓' : '↑'} {change.replace('-', '')}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;