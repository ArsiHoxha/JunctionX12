import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SupplierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableTenders: 0,
    submittedApplications: 0,
    shortlisted: 0,
    awarded: 0
  });
  
  // Mock data for recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Simulate API call to get dashboard data
    setTimeout(() => {
      setStats({
        availableTenders: 18,
        submittedApplications: 7,
        shortlisted: 3,
        awarded: 1
      });
      
      setRecentActivity([
        { id: 1, type: 'application', title: 'IT Infrastructure Upgrade', date: '2023-10-15', status: 'Under Review' },
        { id: 2, type: 'shortlist', title: 'Office Supplies Contract', date: '2023-10-10', status: 'Shortlisted' },
        { id: 3, type: 'award', title: 'Marketing Campaign Services', date: '2023-09-22', status: 'Awarded' },
        { id: 4, type: 'new_tender', title: 'Financial Audit Services', date: '2023-10-18', status: 'New' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Get status badge color
  const getStatusBadge = (status) => {
    let statusClass = '';
    
    switch (status) {
      case 'New':
        statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        break;
      case 'Under Review':
        statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        break;
      case 'Shortlisted':
        statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        break;
      case 'Awarded':
        statusClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return (
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-full p-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'shortlist':
        return (
          <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-full p-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'award':
        return (
          <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-full p-2">
            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'new_tender':
        return (
          <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/20 rounded-full p-2">
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Welcome to your Supplier Dashboard</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Access available tenders and manage your applications</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-0">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/40 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary bg-opacity-10 dark:bg-primary/5 rounded-full p-2 sm:p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Available Tenders</p>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{stats.availableTenders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/40 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/20 rounded-full p-2 sm:p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Submitted Applications</p>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{stats.submittedApplications}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/40 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/20 rounded-full p-2 sm:p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Shortlisted</p>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{stats.shortlisted}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/40 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 rounded-full p-2 sm:p-3">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-5">
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Awarded Contracts</p>
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{stats.awarded}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link 
            to="/supplier/tenders" 
            className="flex items-center px-3 sm:px-4 py-2 text-sm border border-primary/20 dark:border-primary/30 rounded-lg text-primary dark:text-primary/80 hover:bg-primary/10 dark:hover:bg-primary/5 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Browse Tenders
          </Link>
          <Link 
            to="/supplier/applications" 
            className="flex items-center px-3 sm:px-4 py-2 text-sm border border-blue-500/20 dark:border-blue-500/30 rounded-lg text-blue-500 dark:text-blue-400 hover:bg-blue-500/10 dark:hover:bg-blue-500/5 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View My Applications
          </Link>
          <Link 
            to="/supplier/profile" 
            className="flex items-center px-3 sm:px-4 py-2 text-sm border border-emerald-500/20 dark:border-emerald-500/30 rounded-lg text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Update Profile
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== recentActivity.length - 1 ? (
                      <span className="absolute top-5 left-4 sm:left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex items-start space-x-2 sm:space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <a href="#" className="font-medium text-gray-900 dark:text-white">{activity.title}</a>
                          </div>
                          <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {activity.date}
                          </p>
                        </div>
                        <div className="mt-1.5">
                          <div className="flex items-center text-xs sm:text-sm">
                            {getStatusBadge(activity.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard; 