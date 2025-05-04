import React, { useState } from 'react';

const ServiceDeletedInfo = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Service layer files have been removed and all API calls now use axios directly for improved reliability and simplified debugging.
          </p>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="ml-3 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDeletedInfo; 