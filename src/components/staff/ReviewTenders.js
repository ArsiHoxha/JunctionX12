import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

const ReviewTenders = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [processingAction, setProcessingAction] = useState({ id: null, action: null });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form states
  const [selectedTender, setSelectedTender] = useState(null);
  const [newTender, setNewTender] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    status: 'Active'
  });
  const [staffId, setStaffId] = useState('');
  const [tenderLink, setTenderLink] = useState('');
  const [proposalId, setProposalId] = useState('');
  
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';

  // Fetch tenders on component mount and when activeOnly changes
  useEffect(() => {
    if (user) {
      fetchTendersByStaff();
    }
  }, [user, activeOnly]);

  const fetchTendersByStaff = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/tender/getbystaff?staffId=${user.id}`);
      console.log('Fetched staff tenders:', response.data);
      setTenders(response.data || []);
    } catch (error) {
      console.error('Error fetching staff tenders:', error);
      setError('Failed to load staff tenders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenderById = async (tenderId) => {
    try {
      const response = await axios.get(`${API_URL}/tender/getbyid`, {
        headers: { tenderId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tender details:', error);
      throw new Error('Failed to load tender details');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchTendersByStaff();
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tender/search`, {
        headers: { searchTerm: searchTerm }
      });
      setTenders(response.data || []);
    } catch (error) {
      console.error('Error searching tenders:', error);
      setError('Failed to search tenders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTender = async (tenderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to end this tender?')) {
      return;
    }
    
    try {
      setProcessingAction({ id: tenderId, action: 'ending' });
      await axios.put(`${API_URL}/tender/end`, {}, {
        headers: { tenderId: tenderId }
      });
      
      fetchTendersByStaff();
    } catch (error) {
      console.error('Error ending tender:', error);
      alert('Failed to end tender. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  const handleDeleteTender = async (tenderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this tender? This action cannot be undone.')) {
      return;
    }
    
    try {
      setProcessingAction({ id: tenderId, action: 'deleting' });
      await axios.delete(`${API_URL}/tender/delete`, {
        headers: { tenderId: tenderId }
      });
      
      fetchTendersByStaff();
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Failed to delete tender. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  const createNewTender = () => {
    navigate('/staff/tenders/create');
  };

  // Filter tenders based on search term and status filter when not using API search
  const filteredTenders = tenders
    .filter(tender => statusFilter === 'all' || (tender.status?.toLowerCase() || '') === statusFilter.toLowerCase());

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Toggle active-only filter
  const toggleActiveOnly = () => {
    setActiveOnly(!activeOnly);
  };

  // Create tender handler
  const handleCreateTender = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingAction({ id: 'new', action: 'creating' });
      const response = await axios.post(`${API_URL}/tender/create`, newTender);
      console.log('Created tender:', response.data);
      fetchTendersByStaff();
      setShowCreateModal(false);
      setNewTender({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        category: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error creating tender:', error);
      alert('Failed to create tender. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  // Update tender handler
  const handleUpdateTender = async (e) => {
    e.preventDefault();
    
    if (!selectedTender) return;
    
    try {
      setProcessingAction({ id: selectedTender.tenderId || selectedTender.id, action: 'updating' });
      await axios.put(`${API_URL}/tender/update`, selectedTender);
      fetchTendersByStaff();
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating tender:', error);
      alert('Failed to update tender. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  // Add link handler
  const handleAddLink = async (e) => {
    e.preventDefault();
    
    if (!selectedTender || !tenderLink.trim()) return;
    
    try {
      setProcessingAction({ id: selectedTender.tenderId || selectedTender.id, action: 'adding_link' });
      await axios.put(`${API_URL}/tender/addlink`, tenderLink, {
        headers: { tenderId: selectedTender.tenderId || selectedTender.id }
      });
      fetchTendersByStaff();
      setShowLinkModal(false);
      setTenderLink('');
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  // Add staff handler
  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    if (!selectedTender || !staffId.trim()) return;
    
    try {
      setProcessingAction({ id: selectedTender.tenderId || selectedTender.id, action: 'adding_staff' });
      await axios.put(`${API_URL}/tender/addstaff`, {}, {
        headers: { 
          tenderId: selectedTender.tenderId || selectedTender.id,
          staffId: staffId 
        }
      });
      fetchTendersByStaff();
      setShowStaffModal(false);
      setStaffId('');
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  // Remove staff handler
  const handleRemoveStaff = async (staffIdToRemove) => {
    if (!selectedTender) return;
    
    try {
      setProcessingAction({ id: selectedTender.tenderId || selectedTender.id, action: 'removing_staff' });
      await axios.put(`${API_URL}/tender/removestaff`, {}, {
        headers: { 
          tenderId: selectedTender.tenderId || selectedTender.id,
          staffId: staffIdToRemove 
        }
      });
      fetchTendersByStaff();
      // Refresh the selected tender
      const updated = await fetchTenderById(selectedTender.tenderId || selectedTender.id);
      setSelectedTender(updated);
    } catch (error) {
      console.error('Error removing staff:', error);
      alert('Failed to remove staff. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  // Make winner handler
  const handleMakeWinner = async (e) => {
    e.preventDefault();
    
    if (!selectedTender || !proposalId) return;
    
    try {
      setProcessingAction({ id: selectedTender.tenderId || selectedTender.id, action: 'making_winner' });
      await axios.put(`${API_URL}/tender/makewinner`, {}, {
        headers: { 
          tenderId: selectedTender.tenderId || selectedTender.id,
          proposalId: proposalId 
        }
      });
      fetchTendersByStaff();
      setShowWinnerModal(false);
      setProposalId('');
    } catch (error) {
      console.error('Error setting winner:', error);
      alert('Failed to set winner. Please try again.');
    } finally {
      setProcessingAction({ id: null, action: null });
    }
  };

  const openEditModal = async (tender, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const tenderDetails = await fetchTenderById(tender.tenderId || tender.id);
      setSelectedTender(tenderDetails);
      setShowUpdateModal(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const openLinkModal = (tender, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTender(tender);
    setTenderLink('');
    setShowLinkModal(true);
  };

  const openStaffModal = async (tender, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const tenderDetails = await fetchTenderById(tender.tenderId || tender.id);
      setSelectedTender(tenderDetails);
      setStaffId('');
      setShowStaffModal(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const openWinnerModal = async (tender, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const tenderDetails = await fetchTenderById(tender.tenderId || tender.id);
      setSelectedTender(tenderDetails);
      setProposalId('');
      setShowWinnerModal(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const openViewModal = async (tender, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const tenderDetails = await fetchTenderById(tender.tenderId || tender.id);
      
      // Fetch proposals for this tender
      const proposalsResponse = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tender.tenderId || tender.id}`);
      tenderDetails.proposals = proposalsResponse.data || [];
      
      setSelectedTender(tenderDetails);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching tender details:', error);
      alert('Failed to load tender details and proposals');
    }
  };

  // Form handlers
  const handleNewTenderChange = (e) => {
    const { name, value } = e.target;
    setNewTender(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectedTenderChange = (e) => {
    const { name, value } = e.target;
    setSelectedTender(prev => ({ ...prev, [name]: value }));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Tenders</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={fetchTendersByStaff} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceDeletedInfo />
      
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-5">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            My Assigned Tenders
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review and manage tenders assigned to you.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          {/* Search Section */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Tenders
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">
                <svg className="h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-11 pr-12 py-3 text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all"
                placeholder="Search by title, category, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 ease-in-out"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row gap-4 lg:items-end lg:w-auto">
            <div className="min-w-[160px]">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full py-3 pl-3 pr-10 text-sm border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={toggleActiveOnly}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-150 ease-in-out ${
                  activeOnly 
                    ? 'bg-primary text-white shadow-md hover:bg-primary/90' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
              >
                <div className="flex items-center space-x-2">
                  <svg 
                    className={`w-4 h-4 ${activeOnly ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Active Only</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Tags - Only show if filters are applied */}
        {(statusFilter !== 'all' || activeOnly || searchTerm) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                Search: {searchTerm}
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ml-2 inline-flex text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  <span className="sr-only">Remove search filter</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 inline-flex text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                >
                  <span className="sr-only">Remove status filter</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {activeOnly && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                Active Only
                <button
                  type="button"
                  onClick={() => setActiveOnly(false)}
                  className="ml-2 inline-flex text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                >
                  <span className="sr-only">Remove active only filter</span>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {/* Clear all filters button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setActiveOnly(false);
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Tenders List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTenders.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                No tenders found matching your criteria.
              </div>
            </li>
          ) : (
            filteredTenders.map((tender) => (
              <li key={tender.tenderId || tender.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="block">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-primary truncate">{tender.title || 'Untitled Tender'}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                          in {tender.category || tender.department || 'General'}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {tender.description || 'No description available'}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Created: {new Date(tender.createdDate || tender.publishedDate || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Deadline: {new Date(tender.deadline || Date.now() + 86400000).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Budget: {tender.budget ? `$${tender.budget}` : 'Not specified'}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${(tender.status === 'Active' || tender.status === 'Open') ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {tender.status || 'Draft'}
                      </span>
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {tender.proposalsCount || 0} proposals
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={(e) => openViewModal(tender, e)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => openEditModal(tender, e)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                        {(tender.status === 'Active' || tender.status === 'Open') && (
                          <>
                            <button
                              onClick={(e) => handleEndTender(tender.tenderId || tender.id, e)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                              disabled={processingAction.id === (tender.tenderId || tender.id)}
                            >
                              {processingAction.id === (tender.tenderId || tender.id) && processingAction.action === 'ending' ? 
                                'Ending...' : 'End'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => handleDeleteTender(tender.tenderId || tender.id, e)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          disabled={processingAction.id === (tender.tenderId || tender.id)}
                        >
                          {processingAction.id === (tender.tenderId || tender.id) && processingAction.action === 'deleting' ? 
                            'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Create Tender Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Create New Tender
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleCreateTender} className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={newTender.title}
                            onChange={handleNewTenderChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows="3"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={newTender.description}
                            onChange={handleNewTenderChange}
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Budget
                            </label>
                            <input
                              type="number"
                              name="budget"
                              id="budget"
                              min="0"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              value={newTender.budget}
                              onChange={handleNewTenderChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Deadline
                            </label>
                            <input
                              type="date"
                              name="deadline"
                              id="deadline"
                              required
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              value={newTender.deadline}
                              onChange={handleNewTenderChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <input
                            type="text"
                            name="category"
                            id="category"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={newTender.category}
                            onChange={handleNewTenderChange}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateTender}
                  disabled={processingAction.id === 'new'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processingAction.id === 'new' ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Tender Modal */}
      {showUpdateModal && selectedTender && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Update Tender
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleUpdateTender} className="space-y-4">
                        <div>
                          <label htmlFor="update-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="update-title"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={selectedTender.title || ''}
                            onChange={handleSelectedTenderChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="update-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <textarea
                            id="update-description"
                            name="description"
                            rows="3"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={selectedTender.description || ''}
                            onChange={handleSelectedTenderChange}
                          ></textarea>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="update-budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Budget
                            </label>
                            <input
                              type="number"
                              name="budget"
                              id="update-budget"
                              min="0"
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              value={selectedTender.budget || ''}
                              onChange={handleSelectedTenderChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="update-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Deadline
                            </label>
                            <input
                              type="date"
                              name="deadline"
                              id="update-deadline"
                              required
                              className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                              value={selectedTender.deadline ? new Date(selectedTender.deadline).toISOString().split('T')[0] : ''}
                              onChange={handleSelectedTenderChange}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="update-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <input
                            type="text"
                            name="category"
                            id="update-category"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={selectedTender.category || ''}
                            onChange={handleSelectedTenderChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="update-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <select
                            id="update-status"
                            name="status"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={selectedTender.status || 'Active'}
                            onChange={handleSelectedTenderChange}
                          >
                            <option value="Active">Active</option>
                            <option value="Ended">Ended</option>
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateTender}
                  disabled={processingAction.id === selectedTender.tenderId || selectedTender.id}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processingAction.id === (selectedTender.tenderId || selectedTender.id) ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Make Winner Modal */}
      {showWinnerModal && selectedTender && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Set Winner for "{selectedTender.title}"
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleMakeWinner} className="space-y-4">
                        <div>
                          <label htmlFor="proposalId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Proposal ID
                          </label>
                          <input
                            type="text"
                            name="proposalId"
                            id="proposalId"
                            required
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={proposalId}
                            onChange={(e) => setProposalId(e.target.value)}
                          />
                        </div>
                        {selectedTender.proposals && selectedTender.proposals.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Proposals:</h4>
                            <ul className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 max-h-40 overflow-y-auto">
                              {selectedTender.proposals.map(proposal => (
                                <li 
                                  key={proposal.proposalId || proposal.id} 
                                  className="py-1 px-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                  onClick={() => setProposalId(proposal.proposalId || proposal.id)}
                                >
                                  ID: {proposal.proposalId || proposal.id} - {proposal.title || 'Unnamed Proposal'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(!selectedTender.proposals || selectedTender.proposals.length === 0) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            No proposals found for this tender.
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleMakeWinner}
                  disabled={processingAction.id === (selectedTender.tenderId || selectedTender.id) || !proposalId}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processingAction.id === (selectedTender.tenderId || selectedTender.id) ? 'Setting Winner...' : 'Set Winner'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showLinkModal && selectedTender && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Add Link to "{selectedTender.title}"
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddLink} className="space-y-4">
                        <div>
                          <label htmlFor="tenderLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            URL
                          </label>
                          <input
                            type="url"
                            name="tenderLink"
                            id="tenderLink"
                            required
                            placeholder="https://example.com"
                            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            value={tenderLink}
                            onChange={(e) => setTenderLink(e.target.value)}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={processingAction.id === (selectedTender.tenderId || selectedTender.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processingAction.id === (selectedTender.tenderId || selectedTender.id) ? 'Adding Link...' : 'Add Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Modal */}
      {showStaffModal && selectedTender && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Manage Staff for "{selectedTender.title}"
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddStaff} className="space-y-4">
                        <div>
                          <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Add Staff Member ID
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="text"
                              name="staffId"
                              id="staffId"
                              required
                              className="focus:ring-primary focus:border-primary flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              value={staffId}
                              onChange={(e) => setStaffId(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleAddStaff}
                              disabled={processingAction.id === (selectedTender.tenderId || selectedTender.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </form>

                      {selectedTender.assignedStaff && selectedTender.assignedStaff.length > 0 ? (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Staff Members:</h4>
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md">
                            {selectedTender.assignedStaff.map(staff => (
                              <li key={staff.id || staff.staffId} className="px-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                  <span className="ml-2 flex-1 w-0 truncate">
                                    {staff.name || staff.id || staff.staffId}
                                  </span>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStaff(staff.id || staff.staffId)}
                                    className="font-medium text-red-600 hover:text-red-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                          No staff members assigned to this tender.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Tender Modal */}
      {showViewModal && selectedTender && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                        {selectedTender.title}
                      </h3>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${(selectedTender.status === 'Active' || selectedTender.status === 'Open') ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {selectedTender.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 gap-6">
                      <div>
                        {selectedTender.description && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                              {selectedTender.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
                            {selectedTender.category && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTender.category}</dd>
                              </div>
                            )}
                            {selectedTender.department && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTender.department}</dd>
                              </div>
                            )}
                            {selectedTender.budget && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">${selectedTender.budget}</dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                {new Date(selectedTender.createdDate || selectedTender.publishedDate || Date.now()).toLocaleDateString()}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                {new Date(selectedTender.deadline).toLocaleDateString()}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender ID</dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{selectedTender.tenderId || selectedTender.id}</dd>
                            </div>
                          </dl>
                        </div>

                        {selectedTender.assignedStaff && selectedTender.assignedStaff.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Assigned Staff</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {selectedTender.assignedStaff.map(staff => (
                                <div key={staff.id || staff.staffId} className="flex items-center bg-white dark:bg-gray-600 rounded-lg p-3">
                                  <div className="flex-shrink-0 h-8 w-8 bg-gray-200 dark:bg-gray-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    {staff.name && <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>}
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{staff.id || staff.staffId}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedTender.links && selectedTender.links.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Linked Resources</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedTender.links.map((link, index) => (
                                <a 
                                  key={index}
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-secondary truncate bg-white dark:bg-gray-600 p-2 rounded"
                                >
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Proposals</h4>
                          {selectedTender.proposals && selectedTender.proposals.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                  <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                  {selectedTender.proposals.map(proposal => (
                                    <tr key={proposal.proposalId || proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{proposal.proposalId || proposal.id}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{proposal.title}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                          ${proposal.isWinner ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                          {proposal.isWinner ? 'Winner' : 'Submitted'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                        {!proposal.isWinner && selectedTender.status === 'Active' && (
                                          <button
                                            onClick={() => {
                                              setProposalId(proposal.proposalId || proposal.id);
                                              handleMakeWinner(new Event('click'));
                                            }}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                          >
                                            Select as Winner
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No proposals submitted yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTenders;