import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

const ProposalsReview = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenderFilter, setTenderFilter] = useState('all');
  const navigate = useNavigate();
  
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';

  // Function to fetch active tenders
  const fetchTenders = async () => {
    try {
      const response = await axios.get(`${API_URL}/tender/getall`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tenders:', error);
      return [];
    }
  };

  // Function to fetch all proposals
  const fetchAllProposals = async () => {
    try {
      // The API doesn't have a single endpoint to get all proposals
      // We need to fetch all tenders first and then get proposals for each tender
      const tendersData = await fetchTenders();
      
      if (!Array.isArray(tendersData) || tendersData.length === 0) {
        console.warn('No tenders found to fetch proposals from');
        return [];
      }
      
      // For each tender, fetch its proposals and combine them
      const proposalsPromises = tendersData.map(tender => 
        fetchProposalsByTender(tender.tenderId || tender.id)
      );
      
      const proposalsArrays = await Promise.all(proposalsPromises);
      
      // Flatten the array of arrays into a single array of proposals
      const allProposals = proposalsArrays.flat();
      
      console.log(`Successfully fetched ${allProposals.length} proposals across all tenders`);
      return allProposals;
    } catch (error) {
      console.error('Error fetching all proposals:', error);
      // In development, return dummy data
      if (process.env.NODE_ENV === 'development') {
        return getDummyProposals();
      }
      return [];
    }
  };

  // Function to fetch proposals by tender ID
  const fetchProposalsByTender = async (tenderId) => {
    try {
      const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tenderId}`);
      console.log(`Successfully fetched proposals for tender ${tenderId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching proposals for tender ${tenderId}:`, error);
      return [];
    }
  };

  // Function to fetch proposal by ID
  const fetchProposalById = async (proposalId) => {
    try {
      const response = await axios.get(`${API_URL}/proposal/getbyid?proposalId=${proposalId}`);
      console.log(`Successfully fetched proposal ${proposalId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching proposal ${proposalId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all tenders
        const tendersData = await fetchTenders();
        setTenders(tendersData || []);
        
        // Fetch all proposals
        const allProposals = await fetchAllProposals();
        console.log('Fetched all proposals:', allProposals);
        
        // Enhance proposals with tender info
        if (Array.isArray(allProposals) && allProposals.length > 0) {
          const enhancedProposals = await Promise.all(
            allProposals.map(async (proposal) => {
              // Find matching tender
              const matchingTender = tendersData.find(
                t => t.tenderId == proposal.tenderId || t.id == proposal.tenderId
              );
              
              return {
                ...proposal,
                tenderTitle: matchingTender?.title || 'Unknown Tender',
                tenderDeadline: matchingTender?.deadline || 'Unknown',
                tenderDepartment: matchingTender?.department || 'Unknown Department'
              };
            })
          );
          
          setProposals(enhancedProposals);
        } else {
          // If no real proposals, use dummy data in development
          if (process.env.NODE_ENV === 'development') {
            setProposals(getDummyProposals());
          } else {
            setProposals([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to dummy data in development
        if (process.env.NODE_ENV === 'development') {
          setProposals(getDummyProposals());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get dummy proposals for development
  const getDummyProposals = () => {
    return [
      {
        proposalId: 1,
        title: 'IT Infrastructure Upgrade Proposal',
        description: 'Comprehensive IT infrastructure upgrade with new servers and workstations',
        tenderId: 1,
        tenderTitle: 'IT Infrastructure Upgrade',
        tenderDepartment: 'IT',
        authorId: 'user_123',
        price: 75000,
        status: 'Pending',
        createdDate: '2023-11-01',
        documentLinks: ['https://example.com/doc1.pdf']
      },
      {
        proposalId: 2,
        title: 'Cloud Migration Services',
        description: 'Full-service cloud migration with minimal downtime',
        tenderId: 1,
        tenderTitle: 'IT Infrastructure Upgrade',
        tenderDepartment: 'IT',
        authorId: 'user_456',
        price: 82000,
        status: 'Under Review',
        createdDate: '2023-11-02',
        documentLinks: ['https://example.com/doc2.pdf']
      },
      {
        proposalId: 3,
        title: 'Office Supplies Contract',
        description: 'Complete office supplies service with monthly delivery',
        tenderId: 2,
        tenderTitle: 'Office Supplies',
        tenderDepartment: 'Admin',
        authorId: 'user_789',
        price: 24000,
        status: 'Accepted',
        createdDate: '2023-10-28',
        documentLinks: ['https://example.com/doc3.pdf']
      },
      {
        proposalId: 4,
        title: 'Catering Services for Events',
        description: 'Premium catering services for corporate events',
        tenderId: 3,
        tenderTitle: 'Corporate Event Services',
        tenderDepartment: 'HR',
        authorId: 'user_101',
        price: 15000,
        status: 'Rejected',
        createdDate: '2023-10-25',
        documentLinks: ['https://example.com/doc4.pdf']
      }
    ];
  };

  // Filter proposals based on search term, status filter, and tender filter
  const filteredProposals = proposals
    .filter(proposal => 
      (proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(proposal => statusFilter === 'all' || proposal.status?.toLowerCase() === statusFilter.toLowerCase())
    .filter(proposal => tenderFilter === 'all' || proposal.tenderId?.toString() === tenderFilter);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle tender filter change
  const handleTenderFilterChange = (e) => {
    setTenderFilter(e.target.value);
  };

  // Handle filtering by tender
  const handleTenderSelect = async (tenderId) => {
    setLoading(true);
    try {
      if (tenderId === 'all') {
        // Fetch all proposals across all tenders
        const allProposals = await fetchAllProposals();
        const enhancedProposals = await Promise.all(
          allProposals.map(async (proposal) => {
            // Find matching tender
            const matchingTender = tenders.find(
              t => t.tenderId == proposal.tenderId || t.id == proposal.tenderId
            );
            
            return {
              ...proposal,
              tenderTitle: matchingTender?.title || 'Unknown Tender',
              tenderDeadline: matchingTender?.deadline || 'Unknown',
              tenderDepartment: matchingTender?.department || 'Unknown Department'
            };
          })
        );
        setProposals(enhancedProposals);
      } else {
        // Fetch proposals for selected tender
        const tenderProposals = await fetchProposalsByTender(tenderId);
        // Find the tender to get its details
        const selectedTender = tenders.find(
          t => (t.tenderId || t.id).toString() === tenderId.toString()
        );
        
        // Add tender details to proposals
        const enhancedProposals = tenderProposals.map(proposal => ({
          ...proposal,
          tenderTitle: selectedTender?.title || 'Unknown Tender',
          tenderDeadline: selectedTender?.deadline || 'Unknown',
          tenderDepartment: selectedTender?.department || 'Unknown Department'
        }));
        
        setProposals(enhancedProposals);
      }
    } catch (error) {
      console.error('Error handling tender selection:', error);
    } finally {
      setLoading(false);
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

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    switch(status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'under review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Function to update proposal status
  const updateProposalStatus = async (proposalId, newStatus) => {
    try {
      // First fetch the proposal
      const proposal = await fetchProposalById(proposalId);
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      // Update the status
      const response = await axios.put(`${API_URL}/proposal/update`, {
        ...proposal,
        status: newStatus
      });
      
      console.log(`Successfully updated proposal ${proposalId} status to ${newStatus}`);
      
      // Refresh proposals list
      const updatedProposals = proposals.map(p => 
        p.proposalId === proposalId ? { ...p, status: newStatus } : p
      );
      setProposals(updatedProposals);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating proposal ${proposalId} status:`, error);
      throw error;
    }
  };

  // Function to delete proposal
  const deleteProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_URL}/proposal/delete?proposalId=${proposalId}`);
      console.log(`Successfully deleted proposal ${proposalId}`);
      
      // Remove proposal from list
      const updatedProposals = proposals.filter(p => p.proposalId !== proposalId);
      setProposals(updatedProposals);
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting proposal ${proposalId}:`, error);
      alert(`Failed to delete proposal: ${error.message}`);
      throw error;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceDeletedInfo />
      
      <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
          All Proposals
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review and manage all proposals submitted across all tenders.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div>
            <label htmlFor="tender" className="sr-only">Tender</label>
            <select
              id="tender"
              name="tender"
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              value={tenderFilter}
              onChange={(e) => {
                const value = e.target.value;
                setTenderFilter(value);
                handleTenderSelect(value);
              }}
            >
              <option value="all">All Tenders</option>
              {tenders.map(tender => (
                <option key={tender.tenderId || tender.id} value={(tender.tenderId || tender.id).toString()}>
                  {tender.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              name="status"
              className="focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProposals.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                No proposals found matching your criteria.
              </div>
            </li>
          ) : (
            filteredProposals.map((proposal) => (
              <li 
                key={proposal.proposalId} 
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/admin/proposals/${proposal.proposalId}`)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex text-sm">
                      <p className="font-medium text-primary truncate">{proposal.title}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                        for <span className="text-secondary">{proposal.tenderTitle}</span>
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {proposal.description}
                    </div>
                    <div className="mt-2 sm:mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {proposal.tenderDepartment}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        ${Number(proposal.price).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {formatDate(proposal.createdDate)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0 space-x-2">
                    <div className="rounded-md shadow-sm">
                      <Link 
                        to={`/admin/proposals/${proposal.proposalId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        View Details
                      </Link>
                    </div>
                    
                    <div className="relative">
                      <select
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        value={proposal.status || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateProposalStatus(proposal.proposalId, e.target.value);
                        }}
                      >
                        <option disabled value="">Change Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteProposal(proposal.proposalId);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProposalsReview;