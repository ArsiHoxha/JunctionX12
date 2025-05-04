import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

const TenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [tender, setTender] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';
  
  // Check if we're in supplier view or staff view
  const isSupplierView = location.pathname.startsWith('/view/');
  
  // Make sure we have a valid ID
  const urlParams = new URLSearchParams(location.search);
  const idFromQuery = urlParams.get('id');
  const localStorageId = localStorage.getItem('currentTenderId');
  const actualId = id || localStorageId || idFromQuery || '5'; // Local storage is now second priority
  
  // Log the ID for debugging
  console.log('TenderDetail component: ID sources:', {
    id: id,
    localStorageId: localStorageId,
    idFromQuery: idFromQuery,
    actualId: actualId,
    fullUrl: location.pathname + location.search,
    params: useParams(),
    urlSearchParams: Object.fromEntries(urlParams.entries())
  });

  // Load tender data
  useEffect(() => {
    // Clear any redirection flags to ensure we stay on this page
    sessionStorage.removeItem('adminRedirected');
    localStorage.setItem('lastVisitedTenderDetail', actualId);
    
    const fetchTenderDetail = async () => {
      setLoading(true);
      try {
        console.log('Fetching tender with ID:', actualId);
        
        // Try multiple parameter formats
        let tenderData;
        let tenderFetched = false;
        
        // First try with tenderId parameter
        try {
          console.log(`Trying to fetch tender with tenderId=${actualId}`);
          const response = await axios.get(`${API_URL}/tender/getbyid`, { 
            params: { tenderId: actualId } 
          });
          tenderData = response.data;
          tenderFetched = true;
          console.log('Fetched tender with tenderId parameter:', tenderData);
        } catch (error1) {
          console.log('Failed to fetch tender with tenderId parameter:', error1.message);
          
          // Try with id parameter
          try {
            console.log(`Trying to fetch tender with id=${actualId}`);
            const response = await axios.get(`${API_URL}/tender/getbyid`, { 
              params: { id: actualId } 
            });
            tenderData = response.data;
            tenderFetched = true;
            console.log('Fetched tender with id parameter:', tenderData);
          } catch (error2) {
            console.log('Failed to fetch tender with id parameter:', error2.message);
            
            // Try with tender_id parameter
            try {
              console.log(`Trying to fetch tender with tender_id=${actualId}`);
              const response = await axios.get(`${API_URL}/tender/getbyid`, { 
                params: { tender_id: actualId } 
              });
              tenderData = response.data;
              tenderFetched = true;
              console.log('Fetched tender with tender_id parameter:', tenderData);
            } catch (error3) {
              console.log('Failed to fetch tender with tender_id parameter:', error3.message);
              
              // If all direct fetches fail, try getting all tenders and find the matching one
              try {
                console.log('Trying to fetch all tenders and find the matching one');
                const response = await axios.get(`${API_URL}/tender/getall`);
                const allTenders = response.data || [];
                
                const matchingTender = allTenders.find(t => 
                  t.tenderId == actualId || t.id == actualId || t.tender_id == actualId
                );
                
                if (matchingTender) {
                  tenderData = matchingTender;
                  tenderFetched = true;
                  console.log('Found matching tender in all tenders:', tenderData);
                } else {
                  throw new Error(`No tender found with ID ${actualId}`);
                }
              } catch (error4) {
                console.log('Failed to find tender in all tenders:', error4.message);
                throw new Error(`Unable to fetch tender: ${error4.message}`);
              }
            }
          }
        }
        
        if (tenderFetched && tenderData) {
          setTender(tenderData);
          setError(null);
        } else {
          setError('Tender not found with ID: ' + actualId);
          
          // Fallback to mock data if API doesn't return a tender
          const mockTender = {
            id: parseInt(actualId) || 0,
            tenderId: parseInt(actualId) || 0,
            title: 'IT Infrastructure Upgrade',
            description: 'We are seeking a vendor to upgrade our IT infrastructure including servers, networking equipment, and workstations. The project includes procurement, installation, configuration, and knowledge transfer to our IT staff.',
            department: 'IT',
            budget: 75000,
            deadline: '2023-12-15',
            status: 'open',
            author: 'John Doe',
            createdAt: '2023-10-01',
            proposalCount: 3,
            viewCount: 42,
            requirements: [
              'Minimum 5 years experience with enterprise IT infrastructure',
              'Certified partners for major hardware vendors',
              'Proven track record of similar projects',
              '24/7 support capability',
              'Ability to provide knowledge transfer to internal IT staff'
            ],
            attachments: [
              { id: 1, name: 'Detailed Requirements.pdf', size: '2.4 MB', date: '2023-10-01' },
              { id: 2, name: 'Network Diagram.png', size: '1.1 MB', date: '2023-10-01' },
              { id: 3, name: 'Current Inventory.xlsx', size: '0.8 MB', date: '2023-10-01' }
            ]
          };
          
          setTender(mockTender);
        }
      } catch (err) {
        console.error('Error fetching tender details:', err);
        setError('Failed to fetch tender details. Please try again later.');
        
        // Fallback to mock data if API fails
        const mockTender = {
          id: parseInt(actualId) || 0,
          tenderId: parseInt(actualId) || 0,
          title: 'IT Infrastructure Upgrade (Mock)',
          description: 'We are seeking a vendor to upgrade our IT infrastructure including servers, networking equipment, and workstations. The project includes procurement, installation, configuration, and knowledge transfer to our IT staff.',
          department: 'IT',
          budget: 75000,
          deadline: '2023-12-15',
          status: 'open',
          author: 'John Doe',
          createdAt: '2023-10-01',
          proposalCount: 3,
          viewCount: 42,
          requirements: [
            'Minimum 5 years experience with enterprise IT infrastructure',
            'Certified partners for major hardware vendors',
            'Proven track record of similar projects',
            '24/7 support capability',
            'Ability to provide knowledge transfer to internal IT staff'
          ],
          attachments: [
            { id: 1, name: 'Detailed Requirements.pdf', size: '2.4 MB', date: '2023-10-01' },
            { id: 2, name: 'Network Diagram.png', size: '1.1 MB', date: '2023-10-01' },
            { id: 3, name: 'Current Inventory.xlsx', size: '0.8 MB', date: '2023-10-01' }
          ]
        };
        
        setTender(mockTender);
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetail();
  }, [actualId]);

  // Handle delete confirmation
  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  // Process delete 
  const deleteTender = () => {
    console.log('Deleting tender:', actualId);
    // In a real app, send a DELETE request to your backend
    const basePath = getBasePath();
    navigate(`${basePath}`);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get applicant status color
  const getApplicantStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine the correct base path for navigation
  const getBasePath = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin/')) {
      return '/admin/tenders';
    } else if (currentPath.includes('/staff/')) {
      return '/staff/tenders';
    } else {
      return '/dashboard/tenders';
    }
  };

  // Navigate back safely using browser history
  const handleGoBack = (e) => {
    e.preventDefault();
    localStorage.removeItem('currentTenderId');
    
    // Check if we came from proposals page
    const lastVisitedProposals = localStorage.getItem('lastVisitedTenderProposals');
    
    if (lastVisitedProposals) {
      // If we came from a proposals page, go back to it
      const basePath = getBasePath();
      navigate(`${basePath}/proposals/${lastVisitedProposals}`);
      localStorage.removeItem('lastVisitedTenderProposals');
    } else {
      // Otherwise use history back
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="p-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Tender not found</h2>
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
        >
          Back to Tenders
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
      <ServiceDeletedInfo />
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <a 
              href="#"
              onClick={handleGoBack}
              className="text-primary hover:text-secondary dark:hover:text-primary/80 mb-2 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Tenders
            </a>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {tender.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {tender.department} Department | Budget: €{typeof tender.budget === 'number' ? tender.budget.toLocaleString() : tender.budget}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isSupplierView && (
              <Link 
                to={location.pathname.includes('/admin/') 
                  ? `/admin/tenders/proposals/${tender.tenderId || tender.id}`
                  : (location.pathname.includes('/staff/') 
                    ? `/staff/tenders/proposals/${tender.tenderId || tender.id}`
                    : `/dashboard/tenders/proposals/${tender.tenderId || tender.id}`)
                }
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
              >
                View Proposals ({tender.proposalCount || 0})
              </Link>
            )}
            {isSupplierView && (
              <Link
                to={actualId ? `/view/tender-application/${actualId}` : `/view/tender-application?id=${actualId || 5}`}
                onClick={() => localStorage.setItem('currentTenderId', actualId || 5)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Apply for this Tender
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tender details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Tender Description</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {tender.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Requirements</h3>
            {tender.requirements && tender.requirements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                {tender.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">No specific requirements listed for this tender.</p>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Attachments</h3>
            {tender.attachments && tender.attachments.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tender.attachments.map((attachment) => (
                  <li key={attachment.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{attachment.name}</span>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({attachment.size})</span>
                    </div>
                    <button className="text-primary hover:text-secondary dark:hover:text-primary/80 text-sm">
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No attachments available for this tender.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tender status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Tender Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status:</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${(tender.status || '').toLowerCase() === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    (tender.status || '').toLowerCase() === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {(tender.status || 'Unknown').charAt(0).toUpperCase() + (tender.status || 'Unknown').slice(1).toLowerCase()}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deadline:</p>
                <p className="text-gray-900 dark:text-white font-medium">{tender.deadline || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created:</p>
                <p className="text-gray-900 dark:text-white">{tender.createdAt || tender.createdDate || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department:</p>
                <p className="text-gray-900 dark:text-white">{tender.department || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Budget:</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  €{typeof tender.budget === 'number' ? tender.budget.toLocaleString() : tender.budget || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Posted by:</p>
                <p className="text-gray-900 dark:text-white">{tender.author || tender.authorName || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{tender.proposalCount || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Proposals</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{tender.viewCount || 0}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Actions</h3>
            <div className="space-y-3">
              {isSupplierView ? (
                <Link
                  to={actualId ? `/view/tender-application/${actualId}` : `/view/tender-application?id=${actualId || 5}`}
                  onClick={() => localStorage.setItem('currentTenderId', actualId || 5)}
                  className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Apply for this Tender
                </Link>
              ) : (
                <>
                  <Link
                    to={location.pathname.includes('/admin/')
                      ? `/admin/tenders/proposals/${tender.tenderId || tender.id}`
                      : (location.pathname.includes('/staff/') 
                        ? `/staff/tenders/proposals/${tender.tenderId || tender.id}` 
                        : `/dashboard/tenders/proposals/${tender.tenderId || tender.id}`)
                    }
                    className="w-full block text-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                  >
                    View Proposals
                  </Link>
                  <Link
                    to={`/dashboard/tender-application/${tender.tenderId || tender.id}`}
                    className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Apply for this Tender
                  </Link>
                  {tender.status === 'open' && (
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Close Tender
                    </button>
                  )}
                  {tender.status === 'draft' && (
                    <Link
                      to={`/dashboard/tender-wizard/${tender.tenderId || tender.id}/edit`}
                      className="w-full block text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Edit Tender
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Tender</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this tender? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteTender}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderDetail; 