import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaKeyboard, FaHome } from "react-icons/fa";
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

  useEffect(() => {
    console.log('Firebase Config Check:');
    console.log('API Key:', firebaseConfig.apiKey ? 'Loaded' : 'Missing');
    console.log('Auth Domain:', firebaseConfig.authDomain ? 'Loaded' : 'Missing');
    console.log('Project ID:', firebaseConfig.projectId ? 'Loaded' : 'Missing');
  }, []);

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
            // Redirect to home page instead of dashboard
            navigate('/');
            return;
          }
        } catch (serverError) {
          console.log('Server auth failed, using local mode:', serverError);
          updateUser(userObject);
          // Redirect to home page
          navigate('/');
          return;
        }
      }
      
      // Fallback to local auth
      console.log('Using local auth fallback');
      updateUser(userObject);
      // Redirect to home page
      navigate('/');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FaKeyboard className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to TypoMaster
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to test and improve your typing skills
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
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                {/* New Google logo SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="text-center mt-6">
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