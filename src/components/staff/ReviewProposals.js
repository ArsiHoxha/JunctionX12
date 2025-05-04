import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import ServiceDeletedInfo from '../alerts/ServiceDeletedInfo';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI with API key
// Note: In production, use environment variables for API keys
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBDNBXFBh0pUP70oFIt-yjW8WHIRNXEWGc');

// API URL
const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';

// Function to get all active tenders
const getAllActiveTenders = async () => {
  try {
    const response = await axios.get(`${API_URL}/tender/getall`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching tenders:', error);
    return [];
  }
};

// Function to get proposals for a tender
const getProposalsForTender = async (tenderId) => {
  try {
    const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tenderId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching proposals for tender ${tenderId}:`, error);
    return [];
  }
};

// Function to create a new proposal review
const createProposalReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/proposalreview/create`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating proposal review:', error);
    throw error;
  }
};

// Function to update an existing proposal review
const updateProposalReview = async (reviewData) => {
  try {
    const response = await axios.put(`${API_URL}/proposalreview/update`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating proposal review:', error);
    throw error;
  }
};

// Function to delete a proposal review
const deleteProposalReview = async (proposalReviewId) => {
  try {
    const response = await axios.delete(`${API_URL}/proposalreview/delete?proposalReviewId=${proposalReviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting proposal review ${proposalReviewId}:`, error);
    throw error;
  }
};

// Function to get a specific review by ID
const getProposalReviewById = async (proposalReviewId) => {
  try {
    const response = await axios.get(`${API_URL}/proposalreview/getreview?proposalReviewId=${proposalReviewId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposal review ${proposalReviewId}:`, error);
    return null;
  }
};

// Function to get all reviews for a specific proposal
const getReviewsByProposalId = async (proposalId) => {
  try {
    const response = await axios.get(`${API_URL}/proposalreview/getbyproposalid?proposalId=${proposalId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching reviews for proposal ${proposalId}:`, error);
    return [];
  }
};

// Function to get all reviews by a specific user
const getReviewsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/proposalreview/getbyuserid?userId=${userId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching reviews for user ${userId}:`, error);
    return [];
  }
};

// Function to update a proposal review's human score
const updateProposalReviewHumanScore = async (proposalReviewId, humanScore) => {
  try {
    const response = await axios.put(`${API_URL}/proposalreview/addhumanscore?proposalReviewId=${proposalReviewId}&humanScore=${humanScore}`);
    return response.data;
  } catch (error) {
    console.error('Error updating proposal review human score:', error);
    throw error;
  }
};

// Function to get a specific proposal by ID
const getProposalById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/proposal/getbyid?proposalId=${id}`);
    console.log('Proposal data:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching proposal ${id}:`, error);
    return null;
  }
};

// Function to analyze proposal with Google Gemini AI
const analyzeProposalWithAI = async (proposal) => {
  try {
    // Get the Gemini model (Gemini 1.5)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Prepare the data for analysis
    const proposalData = `
      Title: ${proposal.title}
      Description: ${proposal.description || 'No description'}
      Price: ${proposal.price || 'Not specified'}
      Status: ${proposal.status || 'Pending'}
      Tender: ${proposal.tenderTitle || 'Unknown'}
      Submission Date: ${proposal.createdDate ? new Date(proposal.createdDate).toLocaleDateString() : 'Unknown'}
    `;
    
    // Prompt for the AI
    const prompt = `
      Analyze this tender proposal and provide:
      1. A score from 0-100 based on clarity, completeness, and value proposition
      2. Key strengths of the proposal (3 bullet points)
      3. Areas for improvement (3 bullet points)
      4. A brief recommendation (2-3 sentences)
      
      For the score, provide a numeric value between 0 and 100, where 0 is extremely poor and 100 is exceptional.
      Format your response with the score on the first line as "SCORE: X" where X is the numeric value.
      Then provide the rest of your analysis.
      
      Here's the proposal information:
      ${proposalData}
    `;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract score from the response
    let aiScore = 0;
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    if (scoreMatch && scoreMatch[1]) {
      aiScore = parseInt(scoreMatch[1], 10);
      // Ensure the score is within the valid range
      aiScore = Math.min(100, Math.max(0, aiScore));
    }
    
    return {
      analysis: text,
      aiScore: aiScore,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing proposal with AI:', error);
    return {
      analysis: "Unable to analyze the proposal at this time. Please try again later.",
      aiScore: 0,
      error: true,
      timestamp: new Date().toISOString()
    };
  }
};

const ReviewProposals = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tenderFilter, setTenderFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposalReviews, setProposalReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [humanScore, setHumanScore] = useState(0);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [updatingScore, setUpdatingScore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [winners, setWinners] = useState({});

  useEffect(() => {
    const savedWinners = localStorage.getItem('proposalWinners');
    if (savedWinners) {
      setWinners(JSON.parse(savedWinners));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all active tenders
        const tendersData = await getAllActiveTenders();
        setTenders(tendersData || []);
        
        // Fetch proposals for each tender
        const allProposals = [];
        for (const tender of tendersData || []) {
          const tenderProposals = await getProposalsForTender(tender.tenderId);
          if (tenderProposals && tenderProposals.length > 0) {
            // Add tender info to each proposal
            const enhancedProposals = tenderProposals.map(proposal => ({
              ...proposal,
              tenderTitle: tender.title,
              tenderDeadline: tender.deadline,
            }));
            allProposals.push(...enhancedProposals);
          }
        }
        
        setProposals(allProposals);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to analyze the current proposal
  const handleAnalyzeProposal = async () => {
    if (!selectedProposal) return;
    
    try {
      setAnalyzeLoading(true);
      const analysis = await analyzeProposalWithAI(selectedProposal);
      setAiAnalysis(analysis);
      
      // Automatically create or update a review with the AI score
      if (user && selectedProposal) {
        try {
          // Check if there's an existing review by this user
          const existingReview = proposalReviews.find(
            review => review.reviewerId === user.id
          );
          
          if (existingReview) {
            // Update existing review with AI score
            await updateProposalReview({
              ...existingReview,
              aiScore: analysis.aiScore,
              lastUpdatedDate: new Date().toISOString()
            });
            setSelectedReviewId(existingReview.proposalReviewId);
          } else {
            // Create new review with AI score
            const newReview = await createProposalReview({
              proposalId: selectedProposal.proposalId,
              reviewerId: user.id,
              reviewerName: user.fullName || `${user.firstName} ${user.lastName}`,
              comment: "AI-generated review",
              aiScore: analysis.aiScore,
              createdDate: new Date().toISOString()
            });
            setSelectedReviewId(newReview.proposalReviewId);
          }
          
          // Refresh reviews for this proposal
          const updatedReviews = await getReviewsByProposalId(selectedProposal.proposalId);
          setProposalReviews(updatedReviews);
        } catch (error) {
          console.error('Error saving AI score:', error);
        }
      }
    } catch (error) {
      console.error('Error analyzing proposal:', error);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  // Function to handle human score update
  const handleHumanScoreUpdate = async () => {
    if (!selectedReviewId || humanScore < 0 || humanScore > 100) return;
    
    try {
      setUpdatingScore(true);
      await updateProposalReviewHumanScore(selectedReviewId, humanScore);
      
      // Refresh reviews for this proposal
      const updatedReviews = await getReviewsByProposalId(selectedProposal.proposalId);
      setProposalReviews(updatedReviews);
      
      // Success message or notification could be added here
    } catch (error) {
      console.error('Error updating human score:', error);
      // Error message or notification could be added here
    } finally {
      setUpdatingScore(false);
    }
  };

  // Handle proposal selection
  const handleProposalClick = async (e, proposal) => {
    e.preventDefault(); // Prevent navigation
    try {
      // Fetch fresh proposal data
      const freshProposalData = await getProposalById(proposal.proposalId);
      
      // Create an enhanced proposal object with all required fields
      const enhancedProposal = {
        ...freshProposalData || proposal,
        proposalId: freshProposalData?.proposalId || proposal.proposalId,
        tenderId: freshProposalData?.tenderId || proposal.tenderId,
        authorId: freshProposalData?.authorId || proposal.authorId,
        title: freshProposalData?.title || proposal.title,
        description: freshProposalData?.description || proposal.description,
        status: freshProposalData?.status || proposal.status || 'Pending',
        price: freshProposalData?.price || proposal.price,
        createdDate: freshProposalData?.createdDate || proposal.createdDate,
        documentLinks: freshProposalData?.documentLinks || proposal.documentLinks || [],
        aiScore: freshProposalData?.aiScore || proposal.aiScore || 0
      };
      
      setSelectedProposal(enhancedProposal);
      setAiAnalysis({
        aiScore: enhancedProposal.aiScore,
        analysis: enhancedProposal.description,
        timestamp: new Date().toISOString()
      }); 
      setHumanScore(0); // Reset human score
      setSelectedReviewId(null); // Reset selected review ID
      
      // Fetch reviews for this proposal
      const reviews = await getReviewsByProposalId(proposal.proposalId);
      setProposalReviews(reviews);
      
      // Check if there's a review by the current user
      if (user) {
        const userReview = reviews.find(review => review.reviewerId === user.id);
        if (userReview) {
          setSelectedReviewId(userReview.proposalReviewId);
          setHumanScore(userReview.humanScore || 0);
        }
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error handling proposal click:', error);
      alert('Error loading proposal details. Please try again.');
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProposal(null);
    setProposalReviews([]);
    setAiAnalysis(null);
  };

  // Handle selecting a winner
  const handleSelectWinner = async (proposal) => {
    try {
      const updatedWinners = {
        ...winners,
        [proposal.tenderId]: {
          proposalId: proposal.proposalId,
          title: proposal.title,
          authorId: proposal.authorId,
          selectedDate: new Date().toISOString()
        }
      };
      
      // Save to localStorage
      localStorage.setItem('proposalWinners', JSON.stringify(updatedWinners));
      setWinners(updatedWinners);

      // Send email notification to winner
      try {
        await axios.post(`${API_URL}/notification/send`, {
          recipientId: proposal.authorId,
          subject: 'Congratulations! Your Proposal Has Been Selected',
          message: `
            Dear Supplier,

            Congratulations! Your proposal "${proposal.title}" has been selected as the winning bid.

            Details:
            - Proposal ID: ${proposal.proposalId}
            - Title: ${proposal.title}
            - Submitted Date: ${new Date(proposal.createdDate).toLocaleDateString()}
            - AI Score: ${proposal.aiScore}

            Please log in to your supplier portal for more details and next steps.

            Best regards,
            AADF Procurement Team
          `
        });
      } catch (emailError) {
        console.error('Error sending winner notification email:', emailError);
        // Don't throw error here - we still want to complete the winner selection
        // even if email notification fails
      }
      
      // Close the modal
      closeModal();
      
      // Show success message
      alert(`${proposal.title} has been selected as the winner! A notification email has been sent to the supplier.`);
    } catch (error) {
      console.error('Error selecting winner:', error);
      alert('Error selecting winner. Please try again.');
    }
  };

  // Filter proposals based on search term, status filter, and tender filter
  const filteredProposals = proposals
    .filter(proposal => 
      proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(proposal => statusFilter === 'all' || proposal.status?.toLowerCase() === statusFilter.toLowerCase())
    .filter(proposal => tenderFilter === 'all' || proposal.tenderId?.toString() === tenderFilter);

  // Filter high scoring proposals
  const highScoringProposals = proposals.filter(proposal => proposal.aiScore > 50);

  // Get proposals based on active tab
  const getDisplayedProposals = () => {
    const filtered = filteredProposals;
    if (activeTab === 'highScoring') {
      return filtered.filter(p => p.aiScore > 50);
    }
    return filtered;
  };

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

  // Render proposal card
  const renderProposalCard = (proposal) => {
    const isWinner = winners[proposal.tenderId]?.proposalId === proposal.proposalId;
    
    return (
      <li key={proposal.proposalId} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
        <a href="#" className="block" onClick={(e) => handleProposalClick(e, proposal)}>
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="flex text-sm items-center">
                <p className="font-medium text-primary truncate">{proposal.title}</p>
                <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                  for <span className="text-secondary">{proposal.tenderTitle}</span>
                </p>
                {isWinner && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Winner
                  </span>
                )}
                {proposal.aiScore > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    proposal.aiScore > 75 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : proposal.aiScore > 50
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}>
                    AI Score: {proposal.aiScore}
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {proposal.description}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Submitted: {new Date(proposal.createdDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Tender Deadline: {new Date(proposal.tenderDeadline).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Price: {proposal.price}
                </div>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0 flex flex-col items-end">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${proposal.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                  proposal.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                {proposal.status}
              </span>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {proposal.documentLinks?.length || 0} documents
              </div>
            </div>
          </div>
        </a>
      </li>
    );
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
          Review Proposals
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review and manage proposals submitted by suppliers.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-3 text-sm font-medium border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Proposals
            </button>
            <button
              onClick={() => setActiveTab('highScoring')}
              className={`py-4 px-3 text-sm font-medium border-b-2 flex items-center ${
                activeTab === 'highScoring'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              High Scoring Proposals
              {highScoringProposals.length > 0 && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {highScoringProposals.length}
                </span>
              )}
            </button>
          </nav>
        </div>
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
              onChange={handleTenderFilterChange}
            >
              <option value="all">All Tenders</option>
              {tenders.map(tender => (
                <option key={tender.tenderId} value={tender.tenderId.toString()}>
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
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {getDisplayedProposals().length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                {activeTab === 'highScoring' 
                  ? 'No proposals with score over 50 found matching your criteria.'
                  : 'No proposals found matching your criteria.'}
              </div>
            </li>
          ) : (
            getDisplayedProposals().map(renderProposalCard)
          )}
        </ul>
      </div>

      {/* Proposal Details Modal */}
      {showModal && selectedProposal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Proposal Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-6">
              {/* Proposal Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProposal.title}</h2>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full 
                    ${selectedProposal.status === 'Accepted' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                      selectedProposal.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                    {selectedProposal.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  for <span className="font-medium text-secondary">{selectedProposal.tenderTitle}</span>
                </p>
              </div>

              {/* Proposal Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedProposal.submittedBy || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedProposal.createdDate ? new Date(selectedProposal.createdDate).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h4>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedProposal.price || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tender Deadline</h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedProposal.tenderDeadline ? new Date(selectedProposal.tenderDeadline).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
                    {selectedProposal.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Documents */}
              {selectedProposal.documentLinks && selectedProposal.documentLinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
                  <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedProposal.documentLinks.map((docUrl, index) => (
                      <li key={index} className="py-2">
                        <a 
                          href={docUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:text-primary-dark break-all"
                        >
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          {docUrl}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Analysis Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    AI Analysis
                  </h3>
                  <button
                    onClick={handleAnalyzeProposal}
                    disabled={analyzeLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {analyzeLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Refresh Analysis
                      </>
                    )}
                  </button>
                </div>
                
                {aiAnalysis ? (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Generated on {new Date(aiAnalysis.timestamp).toLocaleString()}
                      </div>
                      {aiAnalysis.aiScore > 0 && (
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2.5 py-0.5 rounded-full text-sm font-medium">
                          AI Score: {aiAnalysis.aiScore}/100
                        </div>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100 whitespace-pre-line">
                      {aiAnalysis.analysis}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    AI analysis is automatically generated when you open a proposal.
                  </div>
                )}
                
                {/* Human Score Input */}
                {selectedReviewId && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <label htmlFor="humanScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                        Your Score (0-100):
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          id="humanScore"
                          name="humanScore"
                          min="0"
                          max="100"
                          value={humanScore}
                          onChange={(e) => setHumanScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="shadow-sm focus:ring-primary focus:border-primary block w-20 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        />
                        <button
                          onClick={handleHumanScoreUpdate}
                          disabled={updatingScore}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                          {updatingScore ? "Saving..." : "Save Score"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reviews</h3>
                {proposalReviews.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                ) : (
                  <ul className="mt-2 space-y-4">
                    {proposalReviews.map((review) => (
                      <li key={review.proposalReviewId} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewerName || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {review.createdDate ? new Date(review.createdDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{review.comment}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {review.aiScore !== undefined && review.aiScore !== null && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              AI Score: {review.aiScore}/100
                            </span>
                          )}
                          {review.humanScore !== undefined && review.humanScore !== null && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Human Score: {review.humanScore}/100
                            </span>
                          )}
                        </div>
                        {review.rating && (
                          <div className="mt-1 flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Close
                </button>
                {!winners[selectedProposal.tenderId] && (
                  <button
                    onClick={() => handleSelectWinner(selectedProposal)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Select as Winner
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewProposals;