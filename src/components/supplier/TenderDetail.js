import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenderDetail = async () => {
      setLoading(true);
      try {
        // First fetch all tenders
        const response = await fetch('https://jxaadf-backend-eb471773f003.herokuapp.com/api/tender/getall');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const allTenders = await response.json();
        console.log('Fetched all tenders:', allTenders);
        
        // Find the specific tender by ID
        const foundTender = allTenders.find(t => t.tenderId == id); // Use loose equality for string/number comparison
        console.log('Found tender:', foundTender);
        
        if (foundTender) {
          setTender(foundTender);
          setError(null);
        } else {
          setError('Tender not found with ID: ' + id);
        }
      } catch (err) {
        console.error('Error fetching tender details:', err);
        setError('Failed to fetch tender details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetail();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Status badge display
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let statusClass = '';
    let displayStatus = status;
    
    switch (statusLower) {
      case 'open':
      case 'accepted':
      case 'active':
        statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        displayStatus = statusLower === 'open' ? 'Open' : (statusLower === 'active' ? 'Active' : 'Accepted');
        break;
      case 'closed':
      case 'rejected':
        statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        displayStatus = statusLower === 'closed' ? 'Closed' : 'Rejected';
        break;
      case 'draft':
        statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        displayStatus = 'Draft';
        break;
      case 'pending':
        statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        displayStatus = 'Pending';
        break;
      default:
        statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center text-red-500 dark:text-red-400 p-8">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500 dark:text-gray-400 p-8">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>Tender not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tender header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to="/supplier/tenders" 
                className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tender.title || 'Untitled Tender'}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{tender.department || 'No Department'}</span>
              <span>•</span>
              <span>Created: {formatDate(tender.createdDate)}</span>
              <span>•</span>
              <span>Status: {getStatusBadge(tender.status)}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to={`/supplier/tender-application/${tender.tenderId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Apply for this Tender
            </Link>
          </div>
        </div>

        {/* Tender details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h2>
              <div className="prose dark:prose-invert prose-sm max-w-none bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {tender.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {tender.requirements && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Requirements</h2>
                <div className="prose dark:prose-invert prose-sm max-w-none bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                    {tender.requirements}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tender Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(tender.budget)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(tender.deadline)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(tender.createdDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm">{getStatusBadge(tender.status)}</dd>
                </div>
                {tender.authorId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Published By</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{tender.authorId}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Actions</h2>
              <div className="space-y-3">
                <Link
                  to={`/supplier/tender-application/${tender.tenderId}`}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Apply Now
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back to Tenders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetail; 