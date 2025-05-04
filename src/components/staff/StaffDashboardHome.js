import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const StaffDashboardHome = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Any initial data loading could go here
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load data for staff dashboard
        // Future implementation will add real data fetching
      } catch (error) {
        console.error('Error loading staff dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to your Staff Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review tenders and proposals from suppliers</p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Review Tenders</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Review new and ongoing tenders in the system. Provide feedback and approve tenders for publication.
          </p>
          <Link 
            to="/staff/review-tenders"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Tenders
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Review Proposals</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Evaluate and rate supplier proposals for open tenders. Provide feedback to help with decision making.
          </p>
          <Link 
            to="/staff/review-proposals"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            View Proposals
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">IT Infrastructure Tender Published</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">A new tender for IT infrastructure upgrades has been published</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Today at 9:42 AM</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">New Proposal Submitted</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">TechSolutions Inc. submitted a proposal for Office Equipment tender</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yesterday at 3:15 PM</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-md font-medium">Tender Review Completed</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Staff completed the review for Consulting Services tender</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardHome; 