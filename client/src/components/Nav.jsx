import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaKeyboard, FaUser, FaChartLine, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useAppContext } from "../App";
import LoginModal from './LoginModal';

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAppContext();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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

  const handleTestClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };
  
  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    navigate('/test');
  };

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
    <>
      <nav className="fixed w-full z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <FaKeyboard className="h-6 w-6 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                TypoMaster
              </span>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link 
                  to="/" 
                  className={location.pathname === '/' 
                    ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700" 
                    : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"}
                >
                  Home
                </Link>
                <Link 
                  to="/test" 
                  className={location.pathname === '/test' 
                    ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700" 
                    : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"}
                  onClick={handleTestClick} 
                >
                  Typing Test
                </Link>
                <Link 
                  to="/leaderboard" 
                  className={location.pathname === '/leaderboard' 
                    ? "px-3 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700" 
                    : "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"}
                >
                  Leaderboard
                </Link>
                
              </div>
            </div>
            
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    id="profile-avatar-button"
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none cursor-pointer"
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium border border-indigo-200">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || "User"}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.log('Nav: Failed to load image from:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = getUserInitials();
                          }}
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div 
                      id="profile-dropdown"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FaChartLine className="inline-block mr-2" />
                        Dashboard
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <FaUser className="mr-1.5" />
                  Sign In
                </Link>
              )}
              
              <div className="sm:hidden ml-3">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700"
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

        {isOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={location.pathname === '/' 
                  ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/test"
                className={location.pathname === '/test' 
                  ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"}
                onClick={(e) => {
                  setIsOpen(false);
                  handleTestClick(e);
                }}
              >
                Typing Test
              </Link>
              <Link
                to="/leaderboard"
                className={location.pathname === '/leaderboard' 
                  ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700" 
                  : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"}
                onClick={() => setIsOpen(false)}
              >
                Leaderboard
              </Link>
              
              {user && (
                <Link
                  to="/dashboard"
                  className={location.pathname === '/dashboard' 
                    ? "block px-3 py-2 rounded-md text-base font-medium bg-indigo-100 text-indigo-700" 
                    : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </>
  );
};

export const getNavProfileImage = (user) => {
  if (!user) return null;
  
  const imageUrl = user.picture || user.photoURL || user.avatar || user.profilePicture || user.image || null;
  
  if (!imageUrl) return null;
  
  if (imageUrl.includes('googleusercontent.com')) {
    let cleanUrl = imageUrl.split('=')[0];
    return `${cleanUrl}=s96-c`;
  }
  
  return imageUrl;
};

export default Nav;