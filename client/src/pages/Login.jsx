import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaKeyboard, FaHome } from "react-icons/fa";
import { useAppContext } from "../App"; // Import the custom hook
import { authApi, checkServerAvailability } from "../services/api";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  // Use the custom hook to get context
  const { updateUser } = useAppContext();

  // Firebase configuration
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  // Debug: Check if environment variables are loaded
  useEffect(() => {
    console.log('Firebase Config Check:');
    console.log('API Key:', firebaseConfig.apiKey ? 'Loaded' : 'Missing');
    console.log('Auth Domain:', firebaseConfig.authDomain ? 'Loaded' : 'Missing');
    console.log('Project ID:', firebaseConfig.projectId ? 'Loaded' : 'Missing');
    console.log('updateUser function:', typeof updateUser);
  }, [updateUser]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Add scopes to get profile information
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Google login...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Firebase user object:', user);
      console.log('User photoURL:', user.photoURL);
      console.log('User displayName:', user.displayName);
      console.log('User email:', user.email);
      
      // Create user object with all image properties
      const userObject = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        displayName: user.displayName,
        picture: user.photoURL,
        photoURL: user.photoURL,
        avatar: user.photoURL,
        profilePicture: user.photoURL
      };
      
      console.log('Created user object:', userObject);
      
      const idToken = await user.getIdToken();
      
      const serverAvailable = await checkServerAvailability();
      console.log("Server availability:", serverAvailable);

      if (serverAvailable) {
        try {
          const response = await authApi.loginWithFirebase(idToken);
          if (response.success) {
            // Ensure the profile image is preserved
            const mergedUser = {
              ...response.user,
              picture: response.user.picture || userObject.picture,
              photoURL: response.user.photoURL || userObject.photoURL,
              avatar: response.user.avatar || userObject.avatar
            };
            console.log('Server auth successful, merged user:', mergedUser);
            updateUser(mergedUser);
            navigate('/dashboard');
            return;
          }
        } catch (serverError) {
          console.log('Server auth failed, using local mode:', serverError);
          // Use the userObject directly to preserve the image
          updateUser(userObject);
          navigate('/dashboard');
          return;
        }
      }
      
      // Fallback to local auth - use userObject directly
      console.log('Using local auth fallback');
      updateUser(userObject);
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === 'auth/invalid-api-key') {
        setError('Invalid Firebase API key. Please check your configuration.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Firebase authentication.');
      } else {
        setError(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      uid: `guest_${Date.now()}`,
      email: 'guest@typomaster.com',
      name: 'Guest User',
      displayName: 'Guest User',
      picture: null,
      photoURL: null,
      isGuestMode: true,
      provider: 'guest'
    };
    
    updateUser(guestUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <FaKeyboard className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to TypoMaster
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Test and improve your typing skills
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <FaGoogle className="mr-2" />
                Sign in with Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Continue as Guest
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
            >
              <FaHome className="mr-1" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;