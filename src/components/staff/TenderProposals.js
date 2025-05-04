import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';
import AIProposalAnalysis from './AIProposalAnalysis';
import { GoogleGenerativeAI } from "@google/generative-ai";

const TenderProposals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for tender and proposals
  const [tender, setTender] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [bestProposalId, setBestProposalId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'highScoring'
  const [highScoringProposals, setHighScoringProposals] = useState([]);
  const [proposalScores, setProposalScores] = useState({});
  const [autoScoringComplete, setAutoScoringComplete] = useState(false);

  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';
  
  // Initialize Google Generative AI
  const GEMINI_API_KEY = 'AIzaSyBDNBXFBh0pUP70oFIt-yjW8WHIRNXEWGc';
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Load tender and proposals
  useEffect(() => {
    // Clear any redirection flags to ensure we stay on this page
    sessionStorage.removeItem('adminRedirected');
    localStorage.setItem('lastVisitedTenderProposals', id);
    
    const fetchTenderAndProposals = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch tender details - try multiple parameter formats
        let tenderData;
        let tenderFetched = false;
        
        // First try with tenderId parameter
        try {
          console.log(`Trying to fetch tender with tenderId=${id}`);
          const response = await axios.get(`${API_URL}/tender/getbyid`, { 
            headers: { tenderId: id } 
          });
          tenderData = response.data;
          tenderFetched = true;
          console.log('Fetched tender with tenderId parameter:', tenderData);
        } catch (error1) {
          console.log('Failed to fetch tender with tenderId parameter:', error1.message);
          
          // Try with id parameter
          try {
            console.log(`Trying to fetch tender with id=${id}`);
            const response = await axios.get(`${API_URL}/tender/getbyid`, { 
              headers: { id: id } 
            });
            tenderData = response.data;
            tenderFetched = true;
            console.log('Fetched tender with id parameter:', tenderData);
          } catch (error2) {
            console.log('Failed to fetch tender with id parameter:', error2.message);
            
            // Try with tender_id parameter
            try {
              console.log(`Trying to fetch tender with tender_id=${id}`);
              const response = await axios.get(`${API_URL}/tender/getbyid`, { 
                headers: { tender_id: id } 
              });
              tenderData = response.data;
              tenderFetched = true;
              console.log('Fetched tender with tender_id parameter:', tenderData);
            } catch (error3) {
              console.log('Failed to fetch tender with tender_id parameter:', error3.message);
              
              // If all direct approaches fail, try getting all tenders and find the matching one
              try {
                console.log('Trying to fetch all tenders and find the matching one');
                const response = await axios.get(`${API_URL}/tender/getall`);
                const allTenders = response.data || [];
                
                const matchingTender = allTenders.find(t => 
                  t.tenderId == id || t.id == id || t.tender_id == id
                );
                
                if (matchingTender) {
                  tenderData = matchingTender;
                  tenderFetched = true;
                  console.log('Found matching tender in all tenders:', tenderData);
                } else {
                  throw new Error(`No tender found with ID ${id}`);
                }
              } catch (error4) {
                console.log('Failed to find tender in all tenders:', error4.message);
                throw new Error(`Unable to fetch tender: ${error4.message}`);
              }
            }
          }
        }
        
        if (!tenderFetched || !tenderData) {
          throw new Error(`No tender found with ID ${id}`);
        }
        
        setTender(tenderData);
        
        // Fetch all proposals using axios with the correct endpoint
        try {
          console.log(`Fetching proposals for tender ID: ${id}`);
          const proposalsResponse = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${id}`);
          const tenderProposals = proposalsResponse.data || [];
          console.log('Fetched proposals for tender:', tenderProposals);
          setProposals(tenderProposals);
          
          // Auto-score the proposals if we have tender and proposals data
          if (tenderData && tenderProposals && tenderProposals.length > 0) {
            setTimeout(() => {
              autoScoreProposals(tenderData, tenderProposals);
            }, 500); // Small delay to let the UI render first
          }
        } catch (proposalError) {
          console.error('Error fetching proposals:', proposalError);
          
          if (proposalError.message === 'Network Error') {
            console.log('CORS or network error detected. Using empty array for proposals.');
          } else if (proposalError.response) {
            console.log('Server returned error:', proposalError.response.status, proposalError.response.data);
          }
          
          // Continue with empty proposals
          setProposals([]);
          // Don't throw error here, this way we still show the tender details even if proposals can't be fetched
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        
        // Provide more specific error messages
        if (err.message === 'Network Error') {
          setError('Network connection error. Please check your internet connection and ensure the backend server is running.');
        } else if (err.response && err.response.status === 404) {
          setError(`Resource not found: ${err.response.config.url}`);
        } else {
        setError(err.message);
        }
        
        // Create dummy data in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Using dummy data in development mode');
          
          // Create a dummy tender
          const dummyTender = {
            tenderId: parseInt(id) || 1,
            title: `Tender ${id} - IT Infrastructure Upgrade`,
            description: 'We are seeking proposals for a complete upgrade of our IT infrastructure including servers, workstations, and networking equipment.',
            department: 'IT Department',
            budget: 150000,
            deadline: '2023-12-31',
            status: 'open',
            createdDate: '2023-10-01',
            requirements: [
              'Modern server architecture with redundancy',
              'Workstation upgrades for 50 employees',
              'Network infrastructure improvements',
              'Installation and migration services'
            ]
          };
          
          // Create dummy proposals
          const dummyProposals = [
            {
              proposalId: 101,
              title: 'Enterprise IT Solutions Proposal',
              description: 'Complete IT infrastructure upgrade with enterprise-grade hardware and software.',
              tenderId: parseInt(id) || 1,
              authorId: 'user_123',
              supplier: 'TechPro Solutions',
              price: 145000,
              status: 'Pending',
              createdDate: '2023-10-15',
              solution: 'Our solution includes Dell PowerEdge servers, HP workstations, and Cisco networking.',
              experience: '15 years of experience in enterprise IT deployments',
              timeline: '12 weeks from contract signing',
              documentLinks: ['https://example.com/proposal1.pdf']
            },
            {
              proposalId: 102,
              title: 'Affordable IT Modernization Plan',
              description: 'Cost-effective IT upgrade with balanced performance and reliability.',
              tenderId: parseInt(id) || 1,
              authorId: 'user_456',
              supplier: 'ValueTech Systems',
              price: 128000,
              status: 'Pending',
              createdDate: '2023-10-17',
              solution: 'Our solution utilizes Lenovo servers, Dell workstations, and Ubiquiti networking.',
              experience: '8 years specializing in mid-market IT deployments',
              timeline: '10 weeks from contract signing',
              documentLinks: ['https://example.com/proposal2.pdf']
            },
            {
              proposalId: 103,
              title: 'Comprehensive IT Transformation',
              description: 'End-to-end IT infrastructure overhaul with premium components and support.',
              tenderId: parseInt(id) || 1,
              authorId: 'user_789',
              supplier: 'Elite Enterprise Solutions',
              price: 165000,
              status: 'Pending',
              createdDate: '2023-10-18',
              solution: 'Premium solution with HPE servers, Lenovo ThinkPad workstations, and Meraki networking.',
              experience: '20+ years delivering enterprise IT solutions to Fortune 500 companies',
              timeline: '14 weeks including extended testing phase',
              documentLinks: ['https://example.com/proposal3.pdf']
            }
          ];
          
          setTender(dummyTender);
          setProposals(dummyProposals);
          setError(null); // Clear error since we're providing fallback data
        } else {
          // Only in production mode set empty data
          setTender(null);
          setProposals([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenderAndProposals();
  }, [id, API_URL]);

  // Load saved high-scoring proposals from localStorage on component mount
  useEffect(() => {
    try {
      const savedHighScoringProposals = localStorage.getItem('highScoringProposals');
      if (savedHighScoringProposals) {
        const parsed = JSON.parse(savedHighScoringProposals);
        
        // Filter to only include proposals for the current tender
        const filteredProposals = parsed.filter(p => p.tenderId === id);
        
        if (filteredProposals.length > 0) {
          setHighScoringProposals(filteredProposals);
          console.log('Loaded high scoring proposals from localStorage:', filteredProposals);
          
          // Also create the scores object
          const scores = {};
          filteredProposals.forEach(p => {
            if (p.aiScore) {
              scores[p.proposalId] = p.aiScore;
            }
          });
          
          if (Object.keys(scores).length > 0) {
            setProposalScores(scores);
            setAutoScoringComplete(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading high scoring proposals from localStorage:', error);
    }
  }, [id]);

  // Auto-score proposals with Gemini AI
  const autoScoreProposals = async (tenderData, tenderProposals) => {
    if (!tenderData || !tenderProposals || tenderProposals.length === 0) {
      return;
    }
    
    try {
      setAiReviewLoading(true);
      console.log('Auto-scoring proposals...', tenderProposals);
      
      // Analyze all proposals to get scores
      const result = await analyzeProposalsWithGemini(tenderData, tenderProposals);
      console.log('Analysis result:', result);
      
      if (result && result.analysis && Array.isArray(result.analysis)) {
        // Extract scores and filter high-scoring proposals (>50%)
        const scores = {};
        const highScoring = [];
        
        result.analysis.forEach(item => {
          if (item.proposalId && item.score) {
            // Convert score to number - remove any non-numeric characters and parse
            const scoreNum = parseInt(item.score.toString().replace(/\D/g, ''));
            
            if (!isNaN(scoreNum)) {
              scores[item.proposalId] = scoreNum;
              
              // Find the corresponding proposal - try both string and number matching
              let matchedProposal = null;
              
              // First try direct matching
              matchedProposal = tenderProposals.find(p => p.proposalId === item.proposalId);
              
              // If not found, try converting both to strings and matching
              if (!matchedProposal) {
                matchedProposal = tenderProposals.find(p => p.proposalId.toString() === item.proposalId.toString());
              }
              
              // If still not found, try converting proposal ID to number and matching
              if (!matchedProposal) {
                matchedProposal = tenderProposals.find(p => p.proposalId === parseInt(item.proposalId));
              }
              
              // If still not found, try string includes as a last resort
              if (!matchedProposal) {
                matchedProposal = tenderProposals.find(p => 
                  p.proposalId.toString().includes(item.proposalId) || 
                  item.proposalId.toString().includes(p.proposalId)
                );
              }
              
              // Check scores against all proposals
              console.log(`Proposal ID ${item.proposalId} got score ${scoreNum}, matched: ${matchedProposal ? 'yes' : 'no'}`);
              
              // If score is >50, add to high scoring (if we found a matching proposal)
              if (scoreNum > 50) {
                if (matchedProposal) {
                  highScoring.push({
                    ...matchedProposal,
                    aiScore: scoreNum,
                    strengths: item.strengths || [],
                    weaknesses: item.weaknesses || []
                  });
                } else {
                  // If we couldn't find a matching proposal, create a basic one using the analysis data
                  console.log(`Creating synthetic proposal for ID ${item.proposalId} with score ${scoreNum}`);
                  highScoring.push({
                    proposalId: item.proposalId,
                    title: item.title || `Proposal ${item.proposalId}`,
                    aiScore: scoreNum,
                    tenderId: tenderData.tenderId,
                    createdDate: new Date().toISOString(),
                    strengths: item.strengths || [],
                    weaknesses: item.weaknesses || [],
                    status: 'Pending',
                    synthesized: true // Mark as synthesized so we know it's not a real proposal
                  });
                }
              }
            }
          }
        });
        
        // Fallback: If no high scoring proposals were found but we have scores over 50,
        // manually create high scoring proposals from all proposals with scores > 50
        if (highScoring.length === 0 && Object.keys(scores).length > 0) {
          console.log('No high scoring proposals matched. Creating from scores:', scores);
          
          Object.entries(scores).forEach(([propId, score]) => {
            if (score > 50) {
              // Try to find the proposal
              const proposal = tenderProposals.find(p => 
                p.proposalId === propId || 
                p.proposalId === parseInt(propId) ||
                p.proposalId.toString() === propId.toString()
              );
              
              if (proposal) {
                console.log(`Adding proposal ${propId} with score ${score} to high scoring`);
                highScoring.push({
                  ...proposal,
                  aiScore: score
                });
              }
            }
          });
          
          // If we still have no high scoring proposals but have proposals with scores,
          // add the proposals with highest scores
          if (highScoring.length === 0 && tenderProposals.length > 0) {
            console.log('Still no high scoring proposals. Using highest scores for all proposals.');
            
            // Create a mapping of proposal objects to their scores
            const proposalScores = tenderProposals.map(proposal => {
              // Try to find a score for this proposal
              let score = 0;
              
              // Check all score entries
              Object.entries(scores).forEach(([scoreId, scoreValue]) => {
                if (
                  proposal.proposalId === scoreId ||
                  proposal.proposalId === parseInt(scoreId) ||
                  proposal.proposalId.toString() === scoreId.toString()
                ) {
                  score = scoreValue;
                }
              });
              
              return { proposal, score };
            });
            
            // Sort by score (highest first) and take all with score > 50
            proposalScores
              .filter(item => item.score > 50)
              .forEach(item => {
                console.log(`Adding proposal ${item.proposal.proposalId} with score ${item.score} to high scoring`);
                highScoring.push({
                  ...item.proposal,
                  aiScore: item.score
                });
              });
          }
        }
        
        console.log('Final high scoring proposals:', highScoring);
        
        // Save high-scoring proposals and scores
        setProposalScores(scores);
        setHighScoringProposals(highScoring);
        
        // Get all existing high scoring proposals from localStorage
        let allHighScoringProposals = [];
        try {
          const saved = localStorage.getItem('highScoringProposals');
          if (saved) {
            // Parse existing proposals
            const parsed = JSON.parse(saved);
            // Filter out any proposals from this tender (we'll replace them)
            allHighScoringProposals = parsed.filter(p => p.tenderId !== tenderData.tenderId);
          }
        } catch (error) {
          console.error('Error reading existing high scoring proposals:', error);
        }
        
        // Add new high scoring proposals
        const updatedHighScoringProposals = [...allHighScoringProposals, ...highScoring];
        
        // Save high-scoring proposals to localStorage
        localStorage.setItem('highScoringProposals', JSON.stringify(updatedHighScoringProposals));
        
        console.log('Auto-scoring complete', { 
          scores, 
          highScoring,
          savedToLocalStorage: updatedHighScoringProposals.length
        });
      }
      
      setAutoScoringComplete(true);
    } catch (error) {
      console.error('Error auto-scoring proposals:', error);
    } finally {
      setAiReviewLoading(false);
    }
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
  
  // Handler for analyzing proposals with AI
  const handleAIAnalysis = async () => {
    if (!tender || proposals.length === 0) {
      alert('No proposals available to analyze');
      return;
    }
    
    try {
      setAiReviewLoading(true);
      
      // Analyze proposals directly with Gemini
      const result = await analyzeProposalsWithGemini(tender, proposals);
      setAnalysisResult(result);
      
      // Set best proposal ID if available
      if (result && result.recommendation && result.recommendation.proposalId) {
        setBestProposalId(result.recommendation.proposalId);
      }
      
      setShowAIAnalysis(true);
    } catch (error) {
      console.error('Error analyzing proposals with AI:', error);
      alert('Error analyzing proposals: ' + error.message);
    } finally {
      setAiReviewLoading(false);
    }
  };
  
  // Handle setting best proposal ID after analysis
  const handleAnalysisComplete = (result) => {
    if (result && result.recommendation && result.recommendation.proposalId) {
      setBestProposalId(result.recommendation.proposalId);
    }
  };
  
  // Close AI analysis modal
  const handleCloseAnalysis = () => {
    setShowAIAnalysis(false);
    setAnalysisResult(null);
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
    return `$${parseFloat(price).toLocaleString()}`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    const statusClasses = {
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      winner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      under_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };

    const displayStatus = {
      accepted: 'Accepted',
      pending: 'Pending',
      rejected: 'Rejected',
      winner: 'Winner',
      under_review: 'Under Review'
    };

    const statusClass = statusClasses[statusLower] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    const displayText = displayStatus[statusLower] || status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {displayText}
      </span>
    );
  };

  // Handle select winner
  const handleSelectWinner = async (proposalId) => {
    if (!window.confirm('Are you sure you want to select this proposal as the winner?')) {
      return;
    }
    
    try {
      console.log(`Selecting proposal ${proposalId} as winner for tender ${id}`);
      
      // Show the user that we're attempting to communicate with the server
      setLoading(true);
      
      // Client-side mock implementation
      // Update the UI to reflect the change
      const updatedProposals = proposals.map(p => ({
        ...p,
        status: p.proposalId === proposalId ? 'Accepted' : 'Rejected'
      }));
      
      setProposals(updatedProposals);
      
      // If a proposal is selected, update its status
      if (selectedProposal && selectedProposal.proposalId === proposalId) {
        setSelectedProposal({
          ...selectedProposal,
          status: 'Accepted'
        });
      }
      
      // Also update the tender status if available
      if (tender) {
        setTender({
          ...tender,
          status: 'Completed',
          winningProposalId: proposalId
        });
      }
      
      // Show success message
      alert(`Proposal #${proposalId} has been selected as the winner for this tender. (This is a client-side simulation - changes are not saved to the server.)`);
      
    } catch (err) {
      console.error('Error selecting winner:', err);
      alert(`Error selecting winner: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render proposals table with scores if available
  const renderProposalsTable = (proposalsToRender) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted On
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              {autoScoringComplete && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  AI Score
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {proposalsToRender.map((proposal) => (
              <tr key={proposal.proposalId} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                proposalScores[proposal.proposalId] && proposalScores[proposal.proposalId] > 75 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : proposalScores[proposal.proposalId] && proposalScores[proposal.proposalId] > 50
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{proposal.title || 'Untitled Proposal'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{proposal.authorId || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(proposal.price)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(proposal.createdDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={proposal.status || 'Pending'} />
                </td>
                {autoScoringComplete && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {proposalScores[proposal.proposalId] ? (
                      <div className={`text-sm font-medium px-2 py-1 rounded-full w-fit
                        ${proposalScores[proposal.proposalId] > 75 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : proposalScores[proposal.proposalId] > 50
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {proposalScores[proposal.proposalId]}/100
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not scored</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="text-primary hover:text-secondary transition-colors"
                    >
                      View Details
                    </button>
                    {proposal.status !== 'Accepted' && (
                      <button
                        onClick={() => handleSelectWinner(proposal.proposalId)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      >
                        Select Winner
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Handle safe navigation back that doesn't redirect
  const handleTendersNavigation = (e) => {
    e.preventDefault();
    
    // Determine the correct path based on current URL
    const basePath = window.location.pathname.includes('/admin/') 
      ? '/admin/tenders' 
      : '/dashboard/tenders';
    
    // Navigate directly to the tenders page without going back in history
    navigate(basePath);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
        </div>
        <p className="text-center mt-4 text-gray-500 dark:text-gray-400">Loading proposals...</p>
      </div>
    );
  }

  // Error state
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
    <div className="space-y-6">
      <ServiceDeletedInfo />
      
      {/* Tender details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {tender ? tender.title : 'Tender Details'}
            </h2>
            <a
              href="#"
              onClick={handleTendersNavigation}
              className="text-primary hover:text-secondary transition-colors text-sm flex items-center"
            >
              <span className="mr-1">←</span> Back to Tenders
            </a>
          </div>
        </div>
        
        {tender && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overview</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{tender.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(tender.budget)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <span className="ml-2"><StatusBadge status={tender.status || 'Draft'} /></span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{formatDate(tender.deadline)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{formatDate(tender.createdDate)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{tender.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proposals list with tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Proposals ({proposals.length})
            </h2>
            {proposals.length > 0 && (
              <button
                onClick={handleAIAnalysis}
                disabled={aiReviewLoading}
                className={`inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ${
                  aiReviewLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                {aiReviewLoading ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            )}
          </div>
        </div>
        
        {proposals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No proposals have been submitted for this tender yet.</p>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-sm max-w-xl mx-auto">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">API Information</h4>
              <p className="text-blue-700 dark:text-blue-400 mb-2">
                Make sure the backend API supports these endpoints:
              </p>
              <ul className="list-disc pl-5 text-left text-blue-700 dark:text-blue-400 space-y-1">
                <li><code>/api/proposal/getalltender</code> - Gets all proposals for a specific tender (requires <code>tenderId</code>)</li>
                <li><code>/api/proposal/getalluser</code> - Gets all proposals for a specific user (requires <code>userId</code>)</li>
                <li><code>/api/proposal/getbyid</code> - Gets a specific proposal (requires <code>proposalId</code>)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex">
                        <button
                  onClick={() => setActiveTab('all')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-primary text-primary dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  All Proposals
                        </button>
                          <button
                  onClick={() => setActiveTab('highScoring')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'highScoring'
                      ? 'border-primary text-primary dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  High Scoring Proposals
                  {highScoringProposals.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 py-1 px-2 rounded-full text-xs">
                      {highScoringProposals.length}
                    </span>
                  )}
                          </button>
              </nav>
            </div>
            
            {/* Tab content */}
            {activeTab === 'all' && renderProposalsTable(proposals)}
            
            {activeTab === 'highScoring' && (
              highScoringProposals.length > 0 ? (
                renderProposalsTable(highScoringProposals)
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {autoScoringComplete 
                      ? 'No proposals scored above 50%. Adjust your proposal criteria or analyze again.'
                      : 'Automatic scoring is in progress. Please wait...'}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Proposal Details
              </h3>
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setAiReview(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proposal Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedProposal.title || 'Untitled Proposal'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedProposal.authorId || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatCurrency(selectedProposal.price)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted On:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatDate(selectedProposal.createdDate)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                      <span className="ml-2"><StatusBadge status={selectedProposal.status || 'Pending'} /></span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {selectedProposal.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                {selectedProposal.status !== 'Accepted' && (
                  <button
                    onClick={() => handleSelectWinner(selectedProposal.proposalId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Select as Winner
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedProposal(null);
                    setAiReview(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAIAnalysis && tender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="w-full max-w-6xl">
            <AIProposalAnalysis 
              tender={tender} 
              proposals={proposals} 
              onClose={handleCloseAnalysis}
              onAnalysisComplete={handleAnalysisComplete}
              analysisResult={analysisResult}
            />
          </div>
        </div>
      )}

      {/* Loading indicator for AI analysis */}
      {aiReviewLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
              <p className="text-gray-600 dark:text-gray-300">Analyzing proposals with AI...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderProposals; 