import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKeyboard } from 'react-icons/fa';
import { getNavProfileImage } from '../Nav';

const ProfileSection = ({ user, logout }) => {
  const navigate = useNavigate();
  
  // Helper function for user initials (fallback)
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };
  
  // Get the profile image URL using the shared function
  const profileImageUrl = getNavProfileImage(user);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-800">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt={user.name || "User"} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log('Dashboard image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xl font-bold">${getUserInitials()}</div>`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xl font-bold">
                {getUserInitials()}
              </div>
            )}
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your typing progress and statistics</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{user.email}</p>
          
          <div className="mt-4 flex justify-center md:justify-start space-x-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => navigate('/test')}
            >
              <FaKeyboard className="mr-2" /> New Typing Test
            </button>
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;