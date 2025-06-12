import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaKeyboard, FaHome } from 'react-icons/fa';
import { AppContext } from '../App';
import { authApi, checkServerAvailability, localAuth, handleAuthError } from '../services/api';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVybQVU1MaAPl5KCSfYEXA0YdY2k4BeZE",
  authDomain: "typomaster-48d98.firebaseapp.com",
  projectId: "typomaster-48d98",
  storageBucket: "typomaster-48d98.firebasestorage.app",
  messagingSenderId: "390794193660",
  appId: "1:390794193660:web:c96ac17cbdcc3e2a444579",
  measurementId: "G-XGJGJ0EJ9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Login = ({ setUser: setUserProp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser: contextSetUser, user: contextUser } = useContext(AppContext) || {};
  
  // Choose appropriate setUser function (prop or context)
  const setUser = setUserProp || contextSetUser;
  
  // Redirect if already logged in
  useEffect(() => {
    if (contextUser) {
      navigate('/dashboard');
    }
  }, [contextUser, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Check if server is available
      const serverIsAvailable = await checkServerAvailability();
      console.log("Server availability:", serverIsAvailable);
      
      // Sign in with Firebase Google Auth
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      if (serverIsAvailable) {
        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Send token to your backend
          const data = await authApi.loginWithFirebase(idToken);
          
          // Store the JWT token if one was provided
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          
          // Create a user object to store in our app state
          const userData = {
            ...data.user,
            provider: 'google'
          };
          
          console.log('Login successful:', userData);
          
          if (setUser) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          // If this is a guest user (from fallback mode), go to test page
          if (data.user.isGuestMode) {
            navigate('/test');
          } else {
            navigate('/dashboard');
          }
        } catch (serverError) {
          console.error('Server authentication error:', serverError);
          
          // Use guest mode
          setError('Authentication failed. Continuing in guest mode.');
          const guestAuthResult = handleAuthError(serverError, firebaseUser);
          
          if (setUser) {
            setUser(guestAuthResult.user);
            localStorage.setItem('user', JSON.stringify(guestAuthResult.user));
          }
          
          navigate('/test');
        }
      } else {
        // Server is not available, use guest mode automatically
        console.log('Server unavailable. Using guest mode.');
        setError('Server is unavailable. Continuing in guest mode.');
        
        const guestAuthResult = handleAuthError(new Error("Server unavailable"), firebaseUser);
        
        if (setUser) {
          setUser(guestAuthResult.user);
          localStorage.setItem('user', JSON.stringify(guestAuthResult.user));
        }
        
        navigate('/test');
      }
    } catch (error) {
      console.error('Firebase auth error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(`Authentication failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // You could track anonymous sessions if desired
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="inline-block">
            <FaKeyboard className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to TypoMaster
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Practice typing, track progress, compete with others
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors relative"
            >
              <span className="absolute left-4 inset-y-0 flex items-center">
                <FaGoogle className="h-5 w-5 text-red-600" />
              </span>
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in with Google'
              )}
            </button>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue as guest
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleGuestAccess}
                  className="w-full flex justify-center py-3 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors"
                >
                  Try Typing Test Without Account
                </button>
              </div>
            </div>
            
            <div className="text-sm text-center mt-6">
              <Link to="/" className="inline-flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                <FaHome className="mr-1" /> 
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;