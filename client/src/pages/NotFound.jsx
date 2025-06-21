import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaKeyboard, FaHome, FaArrowLeft } from 'react-icons/fa';
import Nav from '../components/Nav';
import { AppContext } from '../App';

const NotFound = () => {
  const { user } = useContext(AppContext) || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav user={user} />
      
      <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-4 py-12">
        <div className="text-center">
          <FaKeyboard className="mx-auto h-16 w-16 text-indigo-600 dark:text-indigo-400" />
          <h1 className="mt-4 text-8xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tighter">
            404
          </h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Oops! It seems you've typed your way to a page that doesn't exist.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-w-lg w-full">
          <div className="grid grid-cols-12 gap-1 text-center">
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'].map((key) => (
              <div key={key} className="col-span-1 bg-gray-200 dark:bg-gray-700 rounded p-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {key}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-11 gap-1 text-center mt-1 ml-2">
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"].map((key) => (
              <div key={key} className="col-span-1 bg-gray-200 dark:bg-gray-700 rounded p-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {key}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-1 text-center mt-1 ml-4">
            {['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'].map((key) => (
              <div key={key} className="col-span-1 bg-gray-200 dark:bg-gray-700 rounded p-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {key}
              </div>
            ))}
          </div>
          <div className="mt-1">
            <div className="bg-indigo-600 dark:bg-indigo-500 rounded-md p-2 text-white text-center text-sm">
              404 ERROR - PAGE NOT FOUND
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            to="/"
            className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <FaHome className="mr-2" />
            Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-5 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-transparent hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;