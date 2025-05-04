import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TenderList = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    // Clean up any stored tender ID when viewing the tenders list
    localStorage.removeItem('currentTenderId');
    
    const fetchTenders = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://jxaadf-backend-eb471773f003.herokuapp.com/api/tender/getall');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched tenders:', data);
        setTenders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tenders:', err);
        setError('Failed to fetch tenders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  // Apply filters to the tenders list
  const filteredTenders = tenders.filter(tender => {
    // Filter by status
    if (filters.status !== 'all' && tender.status?.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }

    // Filter by department
    if (filters.department !== 'all' && tender.department !== filters.department) {
      return false;
    }

    // Filter by search query
    if (filters.searchQuery && 
        !(tender.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        tender.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()))) {
      return false;
    }

    return true;
  });

  // Get unique departments for the filter dropdown
  const departments = ['all', ...new Set(tenders.filter(t => t.department).map(tender => tender.department))];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Update filter values
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
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
        statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        displayStatus = statusLower === 'open' ? 'Open' : 'Accepted';
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="text-center text-red-500 dark:text-red-400 p-8">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Available Tenders</h2>
      
      {/* Filters - Mobile Responsive */}
      <div className="mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="w-full">
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="searchQuery"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search title or description..."
                className="pl-10 shadow-sm focus:ring-primary focus:border-primary block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              >
                <option value="all">All Departments</option>
                {departments.filter(dep => dep !== 'all').map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="accepted">Accepted</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
        Showing {filteredTenders.length} {filteredTenders.length === 1 ? 'tender' : 'tenders'}
      </p>

      {/* Tenders list - Mobile cards */}
      {filteredTenders.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredTenders.map((tender) => (
            <div key={tender.tenderId} className="border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-700/50 transition-shadow duration-200">
              <div className="p-3 sm:p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-1">{tender.title || 'Untitled Tender'}</h3>
                  {getStatusBadge(tender.status)}
                </div>
                <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span className="mr-2">{tender.department || 'No Department'}</span>
                  <span className="mr-2">•</span>
                  <span>Created: {formatDate(tender.createdDate)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{tender.description || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{formatCurrency(tender.budget)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Deadline:</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">{formatDate(tender.deadline)}</span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link
                    to={tender.tenderId ? `/view/tender/${tender.tenderId}` : `/view/tender?id=${tender.tenderId || 5}`}
                    onClick={() => localStorage.setItem('currentTenderId', tender.tenderId || 5)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    View Details
                  </Link>
                  <Link
                    to={tender.tenderId ? `/view/tender-application/${tender.tenderId}` : `/view/tender-application?id=${tender.tenderId || 5}`}
                    onClick={() => localStorage.setItem('currentTenderId', tender.tenderId || 5)}
                    className="inline-flex items-center px-3 py-1.5 border border-primary text-xs sm:text-sm font-medium rounded-md text-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-lg font-medium">No tenders found</p>
          <p className="mt-1">Try changing your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default TenderList; 