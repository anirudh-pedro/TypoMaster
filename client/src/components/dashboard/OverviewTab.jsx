import React from 'react';
import { FaKeyboard, FaBullseye, FaCalendarCheck, FaTrophy } from 'react-icons/fa';
import StatsGrid from './StatsGrid';
import RecentTests from './RecentTests';

const OverviewTab = ({ data }) => {
  if (!data) {
    return <div>No data available</div>;
  }

  const { stats, recentTests } = data;

  const statCards = [
    {
      icon: <FaKeyboard className="text-indigo-600 dark:text-indigo-400" />,
      title: "Average WPM",
      value: stats.avgWpm,
      change: stats.wpmChange,
      subtitle: `Top: ${stats.bestWpm} WPM`
    },
    {
      icon: <FaBullseye className="text-green-600 dark:text-green-400" />,
      title: "Average Accuracy",
      value: `${stats.avgAccuracy}%`,
      change: null, // You could add accuracy change if available
      subtitle: "Last 10 tests"
    },
    {
      icon: <FaCalendarCheck className="text-yellow-600 dark:text-yellow-400" />,
      title: "Tests Completed",
      value: stats.testsCompleted,
      subtitle: `${Math.round(stats.testsCompleted / 30)} tests per day`
    },
    {
      icon: <FaTrophy className="text-purple-600 dark:text-purple-400" />,
      title: "Global Rank",
      value: stats.globalRank,
      subtitle: stats.percentile
    }
  ];

  return (
    <div>
      <StatsGrid stats={statCards} />
      <RecentTests tests={recentTests} />
    </div>
  );
};

export default OverviewTab;