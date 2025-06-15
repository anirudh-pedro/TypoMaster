import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignInAlt } from 'react-icons/fa';

const LoginModal = ({ isOpen, onClose, onContinueAsGuest }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:w-full sm:max-w-sm sm:p-6">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
              <FaUser className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Account Required
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign in to track your progress, save your typing stats, and compete on the leaderboard.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6 space-y-2">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => navigate('/login')}
            >
              <FaSignInAlt className="mr-2" /> Sign in
            </button>
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              onClick={onContinueAsGuest}
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;