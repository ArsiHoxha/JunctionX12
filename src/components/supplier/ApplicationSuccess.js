import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenderId, tenderTitle, applicationId } = location.state || {};

  if (!applicationId) {
    // Redirect to tenders page if this page is accessed directly without proper state
    setTimeout(() => {
      navigate('/tenders');
    }, 3000);

    return (
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Invalid Access</h2>
        <p className="text-gray-600 dark:text-gray-300">This page cannot be accessed directly. Redirecting to tenders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <svg className="h-12 w-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Application Submitted Successfully!</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your application for "{tenderTitle}" has been received and is being processed.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Application Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Application ID</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{applicationId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender Title</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{tenderTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submission Date</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-base font-semibold text-green-600 dark:text-green-400">Submitted</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">What happens next?</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ol className="list-decimal list-inside space-y-2">
                <li>Our team will review your application within 3-5 business days.</li>
                <li>You may be contacted for additional information or clarification if needed.</li>
                <li>You will receive an email notification when there is an update on your application status.</li>
                <li>You can also check your application status in the "My Applications" section of your dashboard.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/tenders')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Back to Tenders
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ApplicationSuccess; 