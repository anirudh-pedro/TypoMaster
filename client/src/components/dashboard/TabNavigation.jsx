import React, { useRef, useEffect, useState } from 'react';
import { FaChartLine, FaHistory, FaTrophy, FaChartBar } from 'react-icons/fa';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  // Reference for scrolling container
  const scrollContainerRef = useRef(null);
  
  // State to track if scrolling is possible
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Define tabs for reuse
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine className="w-4 h-4" /> },
    { id: 'history', label: 'Test History', icon: <FaHistory className="w-4 h-4" /> }, 
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <FaTrophy className="w-4 h-4" /> }
  ];

  // Check if scrolling is possible and update scroll indicators
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTabElement = document.getElementById(`${activeTab}-tab-button`);
      if (activeTabElement) {
        // Calculate position to center the active tab
        const scrollContainer = scrollContainerRef.current;
        const containerWidth = scrollContainer.offsetWidth;
        const activeTabPosition = activeTabElement.offsetLeft;
        const activeTabWidth = activeTabElement.offsetWidth;
        
        // Center the active tab in the container with smooth scrolling
        scrollContainer.scrollTo({
          left: activeTabPosition - (containerWidth / 2) + (activeTabWidth / 2),
          behavior: 'smooth'
        });
        
        // Check scroll position after animation
        setTimeout(checkScroll, 300);
      }
    }
  }, [activeTab]);
  
  // Set up scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Check initial scroll state
      checkScroll();
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
      };
    }
  }, []);
  
  // Re-check scroll when window resizes
  useEffect(() => {
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className="relative border-b border-gray-200 dark:border-gray-700 mb-8">
      {/* Left scroll indicator */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Scrollable Navigation */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide pb-1"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch' // For smoother scrolling on iOS
        }}
        onScroll={checkScroll}
      >
        <div className="flex whitespace-nowrap px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`${tab.id}-tab-button`}
              className={`pb-3 px-4 flex-shrink-0 flex items-center transition-colors duration-200 ${
                activeTab === tab.id 
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Right scroll indicator */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Add style to hide scrollbar */}
      <style jsx="true">{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TabNavigation;