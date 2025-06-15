import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => {
  if (!stats || !stats.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No statistics available yet. Complete some typing tests to see your stats.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
};

export default StatsGrid;