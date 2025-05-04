import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AIProposalAnalysis from './AIProposalAnalysis';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

const TendersOverview = () => {
  // State for filters, search, and tenders
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tenders, setTenders] = useState([]);
  const [proposalCounts, setProposalCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for AI analysis
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [tenderProposals, setTenderProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [allProposals, setAllProposals] = useState([]);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [bestProposalId, setBestProposalId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // State for staff email assignment
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffEmails, setStaffEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loadingStaffEmails, setLoadingStaffEmails] = useState(false);
  const [staffAssignTenderId, setStaffAssignTenderId] = useState(null);
  const [assigningStaff, setAssigningStaff] = useState(false);

  // API URL
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';
  
  // Initialize Google Generative AI
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Fetch tenders from API
  useEffect(() => {
    const fetchTenders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/tender/getall`);
        setTenders(response.data || []);
        setError(null);

        // After fetching tenders, get proposal counts for each tender
        fetchProposalCounts(response.data || []);
        
        // Also fetch all proposals
        fetchAllProposals();
      } catch (err) {
        console.error('Error fetching tenders:', err);
        setError('Failed to fetch tenders. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTenders();
  }, []);

  // Fetch all proposals
  const fetchAllProposals = async () => {
    try {
      // This endpoint requires a tenderId parameter, we need to first get all tenders and then fetch proposals for each
      const allProposals = [];
      
      // If we have tenders in state, use them; otherwise fetch them first
      const tenderList = tenders.length > 0 ? tenders : await (async () => {
        const response = await axios.get(`${API_URL}/tender/getall`);
        return response.data || [];
      })();
      
      // Fetch proposals for each tender
      for (const tender of tenderList) {
        try {
          const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tender.tenderId}`);
          if (response.data && response.data.length > 0) {
            allProposals.push(...response.data);
          }
        } catch (err) {
          console.error(`Error fetching proposals for tender ${tender.tenderId}:`, err);
        }
      }
      
      setAllProposals(allProposals);
    } catch (err) {
      console.error('Error fetching all proposals:', err);
    }
  };

  // Fetch proposal counts for each tender
  const fetchProposalCounts = async (tenderData) => {
    try {
      const counts = {};
      
      // Process each tender to get its proposal count
      for (const tender of tenderData) {
        try {
          const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tender.tenderId}`);
          if (response.data) {
            counts[tender.tenderId] = response.data.length;
          }
        } catch (err) {
          console.error(`Error fetching proposals for tender ${tender.tenderId}:`, err);
          counts[tender.tenderId] = 0;
        }
      }
      
      console.log('Proposal counts by tender:', counts);
      setProposalCounts(counts);
    } catch (err) {
      console.error('Error fetching proposal counts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get proposal count for a tender
  const getProposalCount = (tenderId) => {
    return proposalCounts[tenderId] || 0;
  };

  // Function to analyze proposals using Gemini AI directly
  const analyzeProposalsWithGemini = async (tender, proposals) => {
    if (!GEMINI_API_KEY) {
      return {
        error: "Google Gemini API key is not configured. Please set REACT_APP_GEMINI_API_KEY in your environment variables."
      };
    }

    try {
      // Get Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Create prompt for AI
      const prompt = `
      I need you to analyze the following tender and its proposals to determine which proposal best matches the tender requirements.
      
      TENDER INFORMATION:
      Title: ${tender.title || 'Untitled Tender'}
      Department: ${tender.department || 'N/A'}
      Budget: ${tender.budget || 'Not specified'}
      Description: ${tender.description || 'No description provided'}
      Requirements: ${tender.requirements || 'No specific requirements listed'}
      
      PROPOSALS TO ANALYZE (${proposals.length}):
      ${proposals.map((proposal, index) => `
      PROPOSAL ${index + 1}:
      ID: ${proposal.proposalId}
      Title: ${proposal.title || 'Untitled Proposal'}
      Supplier: ${proposal.supplier || 'Unknown Supplier'}
      Price: ${proposal.price || 'Not specified'}
      Description: ${proposal.description || 'No description provided'}
      Solution: ${proposal.solution || 'No solution details provided'}
      Experience: ${proposal.experience || 'No experience details provided'}
      Timeline: ${proposal.timeline || 'No timeline specified'}
      `).join('\n')}
      
      Please analyze each proposal and provide your evaluation in the following JSON format:
      {
        "recommendation": {
          "proposalId": "ID of the best proposal",
          "title": "Title of the best proposal",
          "reasons": ["Reason 1 for recommendation", "Reason 2", "Reason 3"]
        },
        "summary": "A brief summary of your overall analysis and recommendation",
        "analysis": [
          {
            "proposalId": "ID of proposal 1",
            "title": "Title of proposal 1",
            "score": "Overall score out of 100",
            "strengths": ["Strength 1", "Strength 2"],
            "weaknesses": ["Weakness 1", "Weakness 2"],
            "valueForMoney": "Score out of 10 for value for money"
          },
          {
            Repeat for each proposal...
          }
        ]
      }
      
      Evaluation factors to consider:
      1. Price competitiveness relative to the tender budget
      2. Technical compliance with requirements
      3. Supplier experience and credibility
      4. Quality and completeness of the proposal
      5. Value for money (balance of quality and price)
      
      Return ONLY the JSON with no additional text before or after.`;

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Try to parse JSON response
      try {
        // Some Gemini responses might include markdown code blocks, so try to extract JSON
        let jsonString = responseText;
        
        // Check if response contains a JSON code block
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        }
        
        const parsedResponse = JSON.parse(jsonString);
        return parsedResponse;
      } catch (jsonError) {
        console.error("Error parsing Gemini JSON response:", jsonError);
        return {
          error: "Failed to parse AI response",
          rawResponse: responseText
        };
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return {
        error: "Failed to analyze proposals with AI: " + error.message
      };
    }
  };

  // Handler for analyzing all proposals for best matches across tenders
  const handleAnalyzeAllProposals = async () => {
    try {
      setLoadingProposals(true);
      setAnalyzingAll(true);
      
      // Get the tender with the most proposals
      const topTenderEntry = Object.entries(proposalCounts)
        .sort((a, b) => b[1] - a[1])
        .find(entry => entry[1] > 0);
      
      if (!topTenderEntry) {
        alert('No proposals found to analyze');
        setLoadingProposals(false);
        return;
      }
      
      const topTenderId = topTenderEntry[0];
      const topTender = tenders.find(t => t.tenderId === topTenderId);
      
      if (!topTender) {
        alert('Could not find tender with proposals');
        setLoadingProposals(false);
        return;
      }
      
      // Fetch proposals for the top tender
      const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${topTenderId}`);
      if (response.data && response.data.length > 0) {
        setSelectedTender(topTender);
        setTenderProposals(response.data);
        
        // Analyze proposals directly with Gemini
        const result = await analyzeProposalsWithGemini(topTender, response.data);
        setAnalysisResult(result);
        
        // Set best proposal ID if available
        if (result && result.recommendation && result.recommendation.proposalId) {
          setBestProposalId(result.recommendation.proposalId);
        }
        
        setShowAIAnalysis(true);
      } else {
        alert('No proposals found for the top tender');
      }
    } catch (error) {
      console.error('Error analyzing all proposals:', error);
      alert('Error analyzing proposals: ' + error.message);
    } finally {
      setLoadingProposals(false);
    }
  };

  // Handler for selecting a tender for AI analysis
  const handleAnalyzeTender = async (tender) => {
    try {
      setLoadingProposals(true);
      setSelectedTender(tender);
      setAnalyzingAll(false);
      
      // Fetch proposals for the selected tender
      try {
        const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tender.tenderId}`);
        setTenderProposals(response.data || []);
        
        // Analyze proposals directly with Gemini
        if (response.data && response.data.length > 0) {
          const result = await analyzeProposalsWithGemini(tender, response.data);
          setAnalysisResult(result);
          
          // Set best proposal ID if available
          if (result && result.recommendation && result.recommendation.proposalId) {
            setBestProposalId(result.recommendation.proposalId);
          }
        }
      } catch (error) {
        console.error('Error fetching proposals for tender:', error);
        setTenderProposals([]);
      }
      
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('Error preparing AI analysis:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  // Close AI analysis modal
  const handleCloseAnalysis = () => {
    setShowAIAnalysis(false);
    setSelectedTender(null);
    setTenderProposals([]);
    setAnalyzingAll(false);
    setAnalysisResult(null);
  };

  // Handle setting best proposal ID after analysis
  const handleAnalysisComplete = (result) => {
    if (result && result.recommendation && result.recommendation.proposalId) {
      setBestProposalId(result.recommendation.proposalId);
    }
  };

  // Handle showing the staff assignment modal
  const handleShowStaffModal = async (tenderId) => {
    setStaffAssignTenderId(tenderId);
    setLoadingStaffEmails(true);
    setShowStaffModal(true);
    
    try {
      const response = await axios.get(`${API_URL}/staff/getallstaffemails`);
      if (response.data) {
        setStaffEmails(response.data);
        if (response.data.length > 0) {
          setSelectedEmail(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching staff emails:', error);
      alert('Failed to load staff emails. Please try again.');
    } finally {
      setLoadingStaffEmails(false);
    }
  };
  
  // Handle closing the staff modal
  const handleCloseStaffModal = () => {
    setShowStaffModal(false);
    setSelectedEmail('');
    setStaffAssignTenderId(null);
  };
  
  // Handle assigning a staff email to tender
  const handleAssignStaff = async () => {
    if (!selectedEmail || !staffAssignTenderId) return;
    
    setAssigningStaff(true);
    try {
      await axios.put(`${API_URL}/tender/addstaffemail?tenderId=${staffAssignTenderId}&email=${selectedEmail}`);
      alert(`Staff with email ${selectedEmail} has been assigned to this tender`);
      handleCloseStaffModal();
    } catch (error) {
      console.error('Error assigning staff to tender:', error);
      alert('Failed to assign staff. Please try again.');
    } finally {
      setAssigningStaff(false);
    }
  };

  // Filter and sort tenders
  const filteredTenders = tenders
    .filter(tender => 
      (statusFilter === 'all' || tender.status?.toLowerCase() === statusFilter) &&
      (tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (tender.author && tender.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (tender.department && tender.department.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title?.localeCompare(b.title || '') || 0;
          break;
        case 'deadline':
          const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
          comparison = dateA - dateB;
          break;
        case 'budget':
          comparison = (a.budget || 0) - (b.budget || 0);
          break;
        case 'proposals':
          comparison = getProposalCount(a.tenderId) - getProposalCount(b.tenderId);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handler for sort toggle
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? (
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
      </span>
    );
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
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    const statusClasses = {
      open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };

    const statusClass = statusClasses[statusLower] || statusClasses.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
        </div>
        <p className="text-center mt-4 text-gray-500 dark:text-gray-400">Loading tenders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-8">
        <div className="text-center text-red-500 dark:text-red-400">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Tenders Overview</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleAnalyzeAllProposals}
              disabled={Object.values(proposalCounts).every(count => count === 0)}
              className={`inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm sm:text-base ${
                Object.values(proposalCounts).every(count => count === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Analyze All Proposals with AI
            </button>
            <Link 
              to="/dashboard/tender-wizard" 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Tender (Dashboard)
            </Link>
            <Link 
              to="/create-tender" 
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Create Tender (Standalone)
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and search - mobile optimized */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary text-sm"
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                id="status"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="accepted">Accepted</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                id="sortBy"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary text-sm"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setSortOrder('asc');
                }}
              >
                <option value="deadline">Deadline</option>
                <option value="title">Title</option>
                <option value="budget">Budget</option>
                <option value="proposals">Proposals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view - cards for small screens */}
      <div className="block sm:hidden">
        {filteredTenders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tenders found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTenders.map((tender) => (
              <div 
                key={tender.tenderId} 
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  analyzingAll && bestProposalId && 
                  allProposals.some(p => p.proposalId === bestProposalId && p.tenderId === tender.tenderId)
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                    : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {tender.title || 'Untitled Tender'}
                  </h3>
                  <StatusBadge status={tender.status || 'Draft'} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Department:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{tender.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{formatCurrency(tender.budget)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{formatDate(tender.deadline)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Proposals:</span>
                    <span className="ml-1 text-gray-900 dark:text-white">{getProposalCount(tender.tenderId)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link to={`/dashboard/tenders/${tender.tenderId}`} className="text-primary hover:text-secondary transition-colors">
                    View Details
                  </Link>
                  <button 
                    onClick={() => handleShowStaffModal(tender.tenderId)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Add Staff
                  </button>
                  {getProposalCount(tender.tenderId) > 0 && (
                    <button 
                      onClick={() => handleAnalyzeTender(tender)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    >
                      Analyze with AI
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop view - table for larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                Title {renderSortIcon('title')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('deadline')}
              >
                Deadline {renderSortIcon('deadline')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('budget')}
              >
                Budget {renderSortIcon('budget')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('proposals')}
              >
                Proposals {renderSortIcon('proposals')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTenders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No tenders found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredTenders.map((tender) => (
                <tr 
                  key={tender.tenderId} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    analyzingAll && bestProposalId && 
                    allProposals.some(p => p.proposalId === bestProposalId && p.tenderId === tender.tenderId)
                      ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tender.title || 'Untitled Tender'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{tender.department || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(tender.deadline)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={tender.status || 'Draft'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(tender.budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 py-1 px-2 rounded-full text-xs font-medium">
                        {getProposalCount(tender.tenderId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <Link to={`/dashboard/tenders/${tender.tenderId}`} className="text-primary hover:text-secondary transition-colors">
                        View
                      </Link>
                      <button 
                        onClick={() => handleShowStaffModal(tender.tenderId)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Add Staff
                      </button>
                      {getProposalCount(tender.tenderId) > 0 && (
                        <button 
                          onClick={() => handleAnalyzeTender(tender)}
                          className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                        >
                          Analyze with AI
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AI Analysis Modal */}
      {showAIAnalysis && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="w-full max-w-6xl">
            <AIProposalAnalysis 
              tender={selectedTender} 
              proposals={tenderProposals} 
              onClose={handleCloseAnalysis}
              onAnalysisComplete={handleAnalysisComplete}
              analysisResult={analysisResult}
            />
          </div>
        </div>
      )}

      {/* Loading indicator for proposals */}
      {loadingProposals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading proposals for analysis...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Staff Assignment Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assign Staff to Tender</h3>
              
              {loadingStaffEmails ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : staffEmails.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No staff emails available.</p>
              ) : (
                <div className="mb-4">
                  <label htmlFor="staffEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Staff Email
                  </label>
                  <select
                    id="staffEmail"
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                  >
                    {staffEmails.map((email) => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseStaffModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedEmail || loadingStaffEmails || assigningStaff}
                  className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors ${
                    (!selectedEmail || loadingStaffEmails || assigningStaff) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {assigningStaff ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full mr-2"></div>
                      Assigning...
                    </div>
                  ) : 'Assign Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TendersOverview; 