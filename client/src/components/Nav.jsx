import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaKeyboard, FaUser, FaMoon, FaSun, FaChartLine, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { AppContext } from "../App";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useContext(AppContext) || {};
  
  // Dark mode setup
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode');
    setIsDarkMode(darkModePreference === 'enabled');
    
    if (darkModePreference === 'enabled') {
      document.documentElement.classList.add('dark');
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
    }
  };
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout();
      }
      setProfileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('profile-dropdown');
      const avatar = document.getElementById('profile-avatar-button');
      
      if (
        profileMenuOpen && 
        dropdown && 
        avatar && 
        !dropdown.contains(event.target) && 
        !avatar.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  // Get user initials for avatar fallback - same as Dashboard
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

  return (
    <nav className="fixed w-full z-10 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <FaKeyboard className="h-6 w-6 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              TypoMaster
            </span>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link 
                to="/" 
                className={location.pathname === '/' 
                  ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                  : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              >
                Home
              </Link>
              <Link 
                to="/test" 
                className={location.pathname === '/test' 
                  ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                  : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              >
                Typing Test
              </Link>
              <Link 
                to="/leaderboard" 
                className={location.pathname === '/leaderboard' 
                  ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                  : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              >
                Leaderboard
              </Link>
            </div>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>
            
            {/* Profile/Login based on auth state */}
            {user ? (
              <div className="ml-3 relative">
                <button
                  id="profile-avatar-button"
                  onClick={toggleProfileMenu}
                  className="flex text-sm rounded-full focus:outline-none"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={profileMenuOpen}
                >
                  {/* Added referrerPolicy and crossOrigin attributes to help with CORS issues */}
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-800">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "User"}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.log('Nav: Attempting with direct URL');
                          // Try again with a slightly different URL format
                          const imgElement = e.target;
                          if (imgElement.src.includes('googleusercontent.com')) {
                            // If this is the first attempt, try with a different URL format
                            if (!imgElement.dataset.tried) {
                              imgElement.dataset.tried = 'true';
                              // Remove size parameter if present
                              let baseUrl = imgElement.src.split('=')[0];
                              imgElement.src = `${baseUrl}=s96-c`;
                              return; // Give it another chance
                            }
                          }
                          
                          // If we reach here, both attempts failed
                          console.log('Nav: Both image attempts failed');
                          imgElement.style.display = 'none';
                          imgElement.parentElement.textContent = getUserInitials();
                        }}
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                </button>

                {/* Profile dropdown menu */}
                {profileMenuOpen && (
                  <div 
                    id="profile-dropdown"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || ''}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FaChartLine className="inline-block mr-2" />
                      Dashboard
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaSignOutAlt className="inline-block mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaUser className="mr-1.5" />
                Sign In
              </Link>
            )}
            
            {/* Mobile menu button */}
            <div className="sm:hidden ml-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={location.pathname === '/' 
                ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/test"
              className={location.pathname === '/test' 
                ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              onClick={() => setIsOpen(false)}
            >
              Typing Test
            </Link>
            <Link
              to="/leaderboard"
              className={location.pathname === '/leaderboard' 
                ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={location.pathname === '/dashboard' 
                  ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const getNavProfileImage = (user) => {
  if (!user) return null;
  
  const imageUrl = user.picture || user.photoURL || user.avatar || user.profilePicture || user.image || null;
  
  if (!imageUrl) return null;
  
  // Enhanced Google image URL handling
  if (imageUrl.includes('googleusercontent.com')) {
    let cleanUrl = imageUrl.split('=')[0];
    return `${cleanUrl}=s300-c`; // Higher resolution for dashboard
  }
  
  return imageUrl;
};

export default Nav;