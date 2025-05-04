import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const ProposalDetail = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState(null);
  const [tender, setTender] = useState(null);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      if (!isSignedIn || !user) {
        navigate('/sign-in');
        return;
      }

      setLoading(true);
      try {
        // Check if this proposal is a winner from localStorage
        const savedWinners = localStorage.getItem('proposalWinners');
        if (savedWinners) {
          const winners = JSON.parse(savedWinners);
          const isWinningProposal = Object.values(winners).some(
            winner => winner.proposalId.toString() === proposalId
          );
          setIsWinner(isWinningProposal);
        }

        // Fetch proposal details from the API
        const response = await fetch(`${API_URL}/proposal/getbyid?proposalId=${proposalId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch proposal: ${response.status} ${response.statusText}`);
        }

        const proposalData = await response.json();
        setProposal(proposalData);
        
        // For now, we'll use mock tender data since the API doesn't provide tender details directly
        // In a real app, you would fetch the tender details using the tenderId from the proposal
        setTender({
          id: proposalData.tenderId,
          title: 'Tender for ' + proposalData.title,
          description: 'Detailed description of the tender would go here.',
          department: 'Related Department',
          budget: parseInt(proposalData.price) * 1.2, // Just for display purposes
          deadline: new Date(new Date(proposalData.createdDate).getTime() + 30*24*60*60*1000).toISOString().slice(0, 10),
          requirements: [
            'Requirement details would be fetched from the tender API',
            'Quality standards and specifications',
            'Delivery timeline expectations',
            'Technical capabilities required'
          ]
        });
      } catch (error) {
        console.error('Error fetching proposal:', error);
        setError('Unable to load proposal details. Please try again later.');
        
        // Fallback mock data for development
        setProposal({
          proposalId: proposalId,
          tenderId: 101,
          authorId: user.id,
          title: 'Sample Proposal',
          description: 'This is a sample proposal description since we encountered an error fetching the real data.',
          price: '25000',
          status: 'Pending',
          createdDate: new Date().toISOString().slice(0, 10)
        });
        
        setTender({
          id: 101,
          title: 'Sample Tender',
          description: 'This is a sample tender description.',
          department: 'IT Department',
          budget: 30000,
          deadline: new Date(new Date().getTime() + 30*24*60*60*1000).toISOString().slice(0, 10),
          requirements: [
            'Sample requirement 1',
            'Sample requirement 2',
            'Sample requirement 3'
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposalDetails();
  }, [proposalId, isSignedIn, user, navigate]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`Attempting to delete proposal with ID: ${proposalId}`);
      
      // First attempt with query parameter
      try {
        const response = await fetch(`https://jxaadf-backend-eb471773f003.herokuapp.com/api/proposal/delete?proposalId=${proposalId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          console.log("Proposal successfully deleted with query parameter");
          navigate('/supplier/applications', { 
            state: { message: 'Proposal successfully deleted.' } 
          });
          return;
        } else {
          const errorText = await response.text();
          console.error("First delete attempt failed:", errorText);
          // Continue to next attempt
        }
      } catch (error) {
        console.error("Error on first delete attempt:", error);
        // Continue to next attempt
      }
      
      // Second attempt - try with a JSON body
      try {
        const response = await fetch(`https://jxaadf-backend-eb471773f003.herokuapp.com/api/proposal/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proposalId: parseInt(proposalId, 10) })
        });

        if (response.ok) {
          console.log("Proposal successfully deleted with JSON body");
          navigate('/supplier/applications', { 
            state: { message: 'Proposal successfully deleted.' } 
          });
          return;
        } else {
          const errorText = await response.text();
          console.error("Second delete attempt failed:", errorText);
          throw new Error(`Failed to delete proposal: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } catch (error) {
        console.error("Error on second delete attempt:", error);
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
      setError('Failed to delete proposal. Please try again.');
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // API call to save the updated proposal
      const response = await fetch(`${API_URL}/proposal/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposal)
      });

      if (!response.ok) {
        throw new Error('Failed to update proposal');
      }

      setIsEditing(false);
      alert('Proposal updated successfully');
    } catch (error) {
      console.error('Error updating proposal:', error);
      alert('Failed to update proposal. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    let statusClass = '';
    const normalizedStatus = String(status).toLowerCase();
    
    if (normalizedStatus.includes('shortlist')) {
      statusClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (normalizedStatus.includes('review') || normalizedStatus.includes('pending')) {
      statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    } else if (normalizedStatus.includes('award') || normalizedStatus.includes('accept')) {
      statusClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    } else if (normalizedStatus.includes('reject')) {
      statusClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
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

  if (error && !proposal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Error</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{error}</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/supplier/applications')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/supplier/applications"
            className="inline-flex items-center text-sm text-primary hover:text-secondary"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Applications
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {proposal.title}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(proposal.status)}
          {isWinner && (
            <span className="px-3 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
              Winner
            </span>
          )}
          {isWinner && !isEditing ? (
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded transition"
            >
              Edit Proposal
            </button>
          ) : isWinner && isEditing ? (
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-green-500 text-white hover:bg-green-600 rounded transition"
            >
              Save Changes
            </button>
          ) : null}
          {!isWinner && ( // Only show delete button if not a winner
            !deleteConfirm ? (
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-xs border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded transition"
              >
                Delete
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-3 py-1 text-xs bg-red-500 text-white rounded flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
              >
                {isDeleting && (
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Confirm Delete
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proposal Details</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={proposal.description}
                onChange={(e) => setProposal({...proposal, description: e.target.value})}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                rows="4"
              />
            ) : (
              <p className="text-gray-900 dark:text-white whitespace-pre-line">
                {proposal.description}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Price</h3>
              {isEditing ? (
                <input
                  type="number"
                  value={proposal.price}
                  onChange={(e) => setProposal({...proposal, price: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatCurrency(proposal.price)}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Submission Date</h3>
              <p className="text-gray-900 dark:text-white">
                {formatDate(proposal.createdDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tender Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Title</h3>
              <p className="text-gray-900 dark:text-white">{tender.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</h3>
              <p className="text-gray-900 dark:text-white">{tender.department}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Budget</h3>
              <p className="text-gray-900 dark:text-white">{formatCurrency(tender.budget)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Deadline</h3>
              <p className="text-gray-900 dark:text-white">{formatDate(tender.deadline)}</p>
            </div>
            
            <div className="pt-2 border-t dark:border-gray-700">
              <Link
                to={`/supplier/tenders/${tender.id}`}
                className="inline-flex items-center text-sm text-primary hover:text-secondary"
              >
                View Tender Details
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tender Requirements</h2>
        
        <ul className="space-y-2">
          {tender.requirements.map((req, index) => (
            <li key={index} className="flex">
              <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{req}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProposalDetail;