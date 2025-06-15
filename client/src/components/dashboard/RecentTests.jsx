import React from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RecentTests = ({ tests }) => {
  if (!tests || tests.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Recent Tests
        </h2>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No typing tests completed yet.</p>
          <Link 
            to="/test" 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaKeyboard className="mr-2" /> Take a Typing Test
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Recent Tests
      </h2>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tests.map((test) => (
            <div key={test.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900 mr-3">
                    <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{test.text}</p>
                    <p className="text-xs text-gray-500">{test.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">{test.wpm}</p>
                  <p className="text-xs text-gray-500">WPM</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-indigo-600">{test.accuracy}</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <Link
          to="/test"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FaKeyboard className="mr-2" /> Take Another Test
        </Link>
        
        <button
          onClick={() => document.getElementById('history-tab-button')?.click()}
          className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          View All Tests
        </button>
      </div>
    </div>
  );
};

export default RecentTests;