import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const MyApplications = () => {
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userId = user.id;
      console.log("User object:", user);
      console.log("Fetching proposals for user:", userId);
      
      // Use axios to fetch proposals
      const response = await axios.get(
        `https://jxaadf-backend-eb471773f003.herokuapp.com/api/proposal/getalluser?userId=${encodeURIComponent(userId)}`
      );
      
      const data = response.data;
      console.log("Proposals data:", data);
      
      if (Array.isArray(data) && data.length === 0) {
        console.log("No proposals found for this user. This could be because:");
        console.log("1. The user hasn't submitted any proposals yet");
        console.log("2. The authorId parameter might not match what the backend expects");
        console.log("3. There might be an issue with the backend API");
      }
      
      // Transform data for UI
      const formattedApplications = Array.isArray(data) ? data.map(proposal => ({
        id: proposal.proposalId?.toString() || Math.random().toString().slice(2),
        tenderId: proposal.tenderId?.toString() || '',
        tenderTitle: proposal.title || 'Untitled Proposal',
        department: proposal.department || 'Unknown Department',
        submissionDate: proposal.createdDate || new Date().toISOString().split('T')[0],
        status: proposal.status || 'Pending'
      })) : [];
      
      console.log("Formatted applications:", formattedApplications);
      setApplications(formattedApplications);
      
      // If no real applications found, use the fallback data in development only
      if (formattedApplications.length === 0 && process.env.NODE_ENV === 'development') {
        console.log("Using fallback applications data for development");
        const dummyApplications = [
          {
            id: '1',
            tenderId: '101',
            tenderTitle: 'IT Infrastructure Upgrade',
            department: 'Information Technology',
            submissionDate: '2023-10-15',
            status: 'Under Review'
          },
          {
            id: '2',
            tenderId: '102',
            tenderTitle: 'Office Supplies Contract',
            department: 'Facilities',
            submissionDate: '2023-10-10',
            status: 'Shortlisted'
          },
          {
            id: '3',
            tenderId: '103',
            tenderTitle: 'Marketing Campaign Services',
            department: 'Marketing',
            submissionDate: '2023-09-22',
            status: 'Awarded'
          },
          {
            id: '4',
            tenderId: '104',
            tenderTitle: 'Financial Audit Services',
            department: 'Finance',
            submissionDate: '2023-09-05',
            status: 'Rejected'
          }
        ];
        setApplications(dummyApplications);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load applications. Please try again later.");
      
      // Fallback to dummy data for development if API fails
      if (process.env.NODE_ENV === 'development') {
        const dummyApplications = [
          {
            id: '1',
            tenderId: '101',
            tenderTitle: 'IT Infrastructure Upgrade',
            department: 'Information Technology',
            submissionDate: '2023-10-15',
            status: 'Under Review'
          },
          {
            id: '2',
            tenderId: '102',
            tenderTitle: 'Office Supplies Contract',
            department: 'Facilities',
            submissionDate: '2023-10-10',
            status: 'Shortlisted'
          },
          {
            id: '3',
            tenderId: '103',
            tenderTitle: 'Marketing Campaign Services',
            department: 'Marketing',
            submissionDate: '2023-09-22',
            status: 'Awarded'
          },
          {
            id: '4',
            tenderId: '104',
            tenderTitle: 'Financial Audit Services',
            department: 'Finance',
            submissionDate: '2023-09-05',
            status: 'Rejected'
          }
        ];
        setApplications(dummyApplications);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [isSignedIn, user]);

  // Get filtered applications based on status
  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status.toLowerCase().includes(filter.toLowerCase()));

  // Get status badge color
  const getStatusBadge = (status) => {
    let statusClass = '';
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('shortlist')) {
      statusClass = 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    } else if (normalizedStatus.includes('review') || normalizedStatus.includes('pending')) {
      statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    } else if (normalizedStatus.includes('award') || normalizedStatus.includes('accept')) {
      statusClass = 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    } else if (normalizedStatus.includes('reject')) {
      statusClass = 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    } else {
      statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <svg className="mx-auto h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Applications</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">My Applications</h2>
        
        {/* Filter buttons - mobile scrollable */}
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="flex space-x-2 sm:flex-wrap">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm flex-shrink-0 ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm flex-shrink-0 ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Pending/Review
            </button>
            <button 
              onClick={() => setFilter('shortlist')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm flex-shrink-0 ${
                filter === 'shortlist' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Shortlisted
            </button>
            <button 
              onClick={() => setFilter('accept')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm flex-shrink-0 ${
                filter === 'accept' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Accepted
            </button>
            <button 
              onClick={() => setFilter('reject')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm flex-shrink-0 ${
                filter === 'reject' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 text-center transition-colors duration-200">
          <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No applications match the selected filter.</p>
          <Link
            to="/supplier/tenders"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
          >
            Apply for Tenders
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile view - cards */}
          <div className="block sm:hidden space-y-3">
            {filteredApplications.map((application) => (
              <div 
                key={application.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{application.tenderTitle}</h3>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="space-y-2 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Department:</span>
                    <span className="text-gray-900 dark:text-white">{application.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                    <span className="text-gray-900 dark:text-white">{application.submissionDate}</span>
                  </div>
                </div>
                
                <Link 
                  to={`/supplier/applications/${application.id}?tenderId=${application.tenderId}`} 
                  className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
          
          {/* Desktop view - table */}
          <div className="hidden sm:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{application.tenderTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{application.submissionDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/supplier/applications/${application.id}?tenderId=${application.tenderId}`} 
                          className="text-primary hover:text-secondary"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredApplications.length} of {applications.length} applications
      </div>
    </div>
  );
};

export default MyApplications; 