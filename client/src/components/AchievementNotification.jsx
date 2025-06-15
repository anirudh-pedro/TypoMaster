import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaMedal, FaFire, FaClock, FaBullseye, FaCheckDouble, FaCalendarCheck } from 'react-icons/fa';

const AchievementNotification = ({ achievements, onClose }) => {
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'trophy': return <FaTrophy />;
      case 'medal': return <FaMedal />;
      case 'fire': return <FaFire />;
      case 'clock': return <FaClock />;
      case 'bullseye': return <FaBullseye />;
      case 'check-double': return <FaCheckDouble />;
      case 'calendar-check': return <FaCalendarCheck />;
      default: return <FaTrophy />;
    }
  };

  if (!achievements || achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-20 right-4 z-50 max-w-md"
      >
        <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-3">
              <FaTrophy className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Achievement{achievements.length > 1 ? 's' : ''} Unlocked!</h4>
              <ul className="mt-2">
                {achievements.map((achievement, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <div className="p-2 rounded-full mr-2 bg-white bg-opacity-20">
                      {getIconComponent(achievement.icon || 'trophy')}
                    </div>
                    <div>
                      <p className="font-semibold">{achievement}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementNotification;