/**
 * Format a date string into a more readable format
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  
  // Default formatting options
  const defaultOptions = {
    short: false,
    includeTime: false,
    ...options
  };
  
  // Date formatting options for toLocaleDateString
  const dateFormatOptions = defaultOptions.short 
    ? { month: 'short', day: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' };
    
  // Format the date part
  let formattedDate = date.toLocaleDateString('en-US', dateFormatOptions);
  
  // Add time if requested
  if (defaultOptions.includeTime) {
    const timeString = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    formattedDate += ` at ${timeString}`;
  }
  
  return formattedDate;
};

/**
 * Format seconds into a human-readable time format (HH:MM:SS or MM:SS)
 * @param {number} seconds - Time in seconds
 * @param {boolean} showHours - Whether to include hours in the output
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds, showHours = false) => {
  if (!seconds && seconds !== 0) return '--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Format with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
  
  if (showHours || hours > 0) {
    const formattedHours = hours.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Format a number with a plus sign if positive
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number with sign
 */
export const formatWithSign = (value, decimals = 1) => {
  if (!value && value !== 0) return '--';
  
  const fixedValue = parseFloat(value).toFixed(decimals);
  return value > 0 ? `+${fixedValue}` : `${fixedValue}`;
};

/**
 * Truncate text to a specific length and add ellipsis if needed
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length of the text
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Add these helper functions for color coding WPM and accuracy values
export const getWpmColor = (wpm) => {
  if (wpm >= 80) return 'text-green-600 dark:text-green-400';
  if (wpm >= 60) return 'text-blue-600 dark:text-blue-400';
  if (wpm >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getAccuracyColor = (accuracy) => {
  if (accuracy >= 98) return 'text-green-600 dark:text-green-400';
  if (accuracy >= 95) return 'text-blue-600 dark:text-blue-400';
  if (accuracy >= 90) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};