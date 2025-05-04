import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState(null);
  const [tender, setTender] = useState(null);
  const [error, setError] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';

  useEffect(() => {
    const fetchProposalData = async () => {
      setLoading(true);
      try {
        // Try to fetch the proposal by ID using the correct endpoint
        let proposalData = null;
        try {
          const response = await axios.get(`${API_URL}/proposal/getbyid?proposalId=${id}`);
          proposalData = response.data;
          console.log('Fetched proposal by ID:', proposalData);
          
          if (!proposalData) {
            throw new Error(`Proposal with ID ${id} not found`);
          }
          
          setProposal(proposalData);
        } catch (error) {
          console.error('Error fetching proposal by ID:', error);
          
          // In development mode, immediately fall back to dummy data
          if (process.env.NODE_ENV === 'development') {
            console.log('Using dummy proposal data in development mode');
            throw error; // continue to the catch block with dummy data
          } else {
            throw error;
          }
        }
        
        // Now fetch the tender for this proposal
        if (proposalData && proposalData.tenderId) {
          try {
            // Try different parameter formats
            try {
              const tenderResponse = await axios.get(`${API_URL}/tender/getbyid`, {
                headers: { tender_id: proposalData.tenderId }
              });
              setTender(tenderResponse.data);
            } catch (error1) {
              try {
                const tenderResponse = await axios.get(`${API_URL}/tender/getbyid`, {
                  headers: { id: proposalData.tenderId }
                });
                setTender(tenderResponse.data);
              } catch (error2) {
                try {
                  const tenderResponse = await axios.get(`${API_URL}/tender/getbyid`, {
                    headers: { tenderId: proposalData.tenderId }
                  });
                  setTender(tenderResponse.data);
                } catch (error3) {
                  // If all direct fetches fail, try getting all tenders
                  const allTendersResponse = await axios.get(`${API_URL}/tender/getall`);
                  const allTenders = allTendersResponse.data || [];
                  
                  const matchingTender = allTenders.find(t => 
                    t.tenderId == proposalData.tenderId || 
                    t.id == proposalData.tenderId
                  );
                  
                  if (matchingTender) {
                    setTender(matchingTender);
                  } else {
                    console.warn(`No tender found for tenderId ${proposalData.tenderId}`);
                  }
                }
              }
            }
          } catch (tenderError) {
            console.error('Error fetching tender:', tenderError);
          }
        }
        
      } catch (err) {
        console.error('Error loading proposal data:', err);
        setError(err.message || 'Failed to load proposal data');
        
        // Use dummy data in development
        if (process.env.NODE_ENV === 'development') {
          const dummyProposal = {
            proposalId: parseInt(id) || 1,
            title: `Proposal ${id} - IT Infrastructure Upgrade`,
            description: 'Comprehensive IT infrastructure upgrade with new servers and workstations. Our solution includes the latest enterprise-grade hardware, professional installation and configuration, and comprehensive knowledge transfer to your IT staff.',
            tenderId: parseInt(id) || 1,
            authorId: 'user_123',
            price: 75000,
            status: 'Pending',
            createdDate: '2023-11-01',
            documentLinks: [
              'https://example.com/proposal.pdf',
              'https://example.com/specs.pdf'
            ]
          };
          
          const dummyTender = {
            tenderId: parseInt(id) || 1,
            title: `Tender ${id} - IT Infrastructure Upgrade`,
            description: 'We are seeking proposals for a complete upgrade of our IT infrastructure.',
            department: 'IT',
            budget: 100000,
            deadline: '2023-12-15',
            status: 'Active',
            createdDate: '2023-10-01'
          };
          
          setProposal(dummyProposal);
          setTender(dummyTender);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
  }, [id]);

  // Handle proposal action (accept/reject)
  const handleAction = async (action) => {
    try {
      // Update proposal status based on action
      const status = action === 'accept' ? 'Accepted' : 'Rejected';
      
      const response = await axios.put(`${API_URL}/proposal/update`, {
        proposalId: proposal.proposalId,
        status: status
      });
      
      console.log(`Proposal ${action}ed:`, response.data);
      
      // Update local state
      setProposal({
        ...proposal,
        status: status
      });
      
      // Close the modal
      setShowActionModal(false);
      
      // Show success message
      alert(`Proposal has been ${action}ed successfully.`);
      
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
      alert(`Error ${action}ing proposal. Please try again.`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Format currency for display
  const formatCurrency = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return `$${Number(price).toLocaleString()}`;
  };

  // Show action confirmation modal
  const openActionModal = (action) => {
    setActionType(action);
    setShowActionModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error && !proposal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center text-red-500 dark:text-red-400">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-lg font-medium mb-2">Error Loading Proposal</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceDeletedInfo />

      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/proposals"
          className="text-primary hover:text-primary-dark transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to All Proposals
        </Link>
      </div>

      {/* Proposal Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {proposal?.title || 'Proposal Details'}
              </h1>
              {tender && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  For Tender: <Link to={`/admin/tenders/${tender.tenderId || tender.id}`} className="text-primary hover:underline">{tender.title}</Link>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${proposal?.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  proposal?.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
              >
                {proposal?.status || 'Pending'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {formatCurrency(proposal?.price)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {proposal?.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Documents</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  {proposal?.documentLinks && proposal.documentLinks.length > 0 ? (
                    <ul className="space-y-2">
                      {proposal.documentLinks.map((link, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {link.split('/').pop() || `Document ${index + 1}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No documents attached to this proposal.</p>
                  )}
                </div>
              </div>

              {/* Tender Requirements (if available) */}
              {tender?.requirements && tender.requirements.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tender Requirements</h2>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                      {tender.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proposal Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Proposal Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted By:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{proposal?.authorId || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted On:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(proposal?.createdDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Proposal ID:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{proposal?.proposalId || id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(proposal?.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{proposal?.status || 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Tender Info */}
              {tender && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tender Info</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Title:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tender.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tender.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Budget:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(tender.budget)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Deadline:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(tender.deadline)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status:</p>
                      <p className="font-medium text-gray-900 dark:text-white">{tender.status || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Actions</h2>
                <div className="space-y-3">
                  {proposal?.status !== 'Accepted' && (
                    <button
                      onClick={() => openActionModal('accept')}
                      className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Accept Proposal
                    </button>
                  )}
                  {proposal?.status !== 'Rejected' && (
                    <button
                      onClick={() => openActionModal('reject')}
                      className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject Proposal
                    </button>
                  )}
                  <Link
                    to={`/admin/tenders/${tender?.tenderId || tender?.id || proposal?.tenderId}`}
                    className="w-full block text-center py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    View Tender
                  </Link>
                  <Link
                    to="/admin/proposals"
                    className="w-full block text-center py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back to All Proposals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {actionType === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {actionType === 'accept' 
                ? 'Are you sure you want to accept this proposal? This will mark it as the selected proposal for this tender.'
                : 'Are you sure you want to reject this proposal? This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionType)}
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } transition-colors`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalDetail;