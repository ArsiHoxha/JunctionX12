import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ApplicantDetail = () => {
  const { id, applicantId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [scores, setScores] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  // Load applicant data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApplicant({
        id: applicantId,
        tenderId: id,
        companyName: 'TechSolutions Inc.',
        contactName: 'Jane Smith',
        email: 'jane.smith@techsolutions.com',
        phone: '+358 40 123 4567',
        status: 'Under Review',
        submissionDate: '2023-10-15',
        documents: [
          { id: 1, name: 'Company Profile.pdf', size: '3.2 MB', date: '2023-10-15' },
          { id: 2, name: 'Technical Proposal.pdf', size: '5.4 MB', date: '2023-10-15' },
          { id: 3, name: 'Budget Breakdown.xlsx', size: '1.2 MB', date: '2023-10-15' },
          { id: 4, name: 'Team Qualifications.pdf', size: '2.8 MB', date: '2023-10-15' }
        ],
        proposal: {
          summary: 'TechSolutions offers a comprehensive IT infrastructure upgrade solution that includes hardware procurement, network redesign, and staff training. Our approach focuses on minimal disruption to daily operations while providing a scalable and future-proof solution.',
          timeline: '12 weeks',
          budget: '€72,500',
          team: [
            { name: 'Robert Johnson', role: 'Project Manager', experience: '10 years' },
            { name: 'Maria Garcia', role: 'Network Architect', experience: '8 years' },
            { name: 'David Lim', role: 'Systems Engineer', experience: '6 years' }
          ]
        },
        evaluationCriteria: [
          { id: 1, name: 'Technical expertise', weight: 30, score: null },
          { id: 2, name: 'Project timeline', weight: 20, score: null },
          { id: 3, name: 'Cost', weight: 25, score: null },
          { id: 4, name: 'Previous experience', weight: 15, score: null },
          { id: 5, name: 'Support plan', weight: 10, score: null }
        ]
      });
      setLoading(false);
    }, 800);
  }, [id, applicantId]);

  // Initialize scores state from applicant data
  useEffect(() => {
    if (applicant) {
      const initialScores = {};
      applicant.evaluationCriteria.forEach(criteria => {
        initialScores[criteria.id] = criteria.score || 0;
      });
      setScores(initialScores);
    }
  }, [applicant]);

  // Calculate total score
  const calculateTotalScore = () => {
    if (!applicant) return 0;
    
    let weightedTotal = 0;
    let totalWeight = 0;
    
    applicant.evaluationCriteria.forEach(criteria => {
      const score = scores[criteria.id] || 0;
      weightedTotal += (score * criteria.weight);
      totalWeight += criteria.weight;
    });
    
    return totalWeight > 0 ? (weightedTotal / totalWeight).toFixed(1) : 0;
  };

  // Handle score change
  const handleScoreChange = (criteriaId, value) => {
    setScores({
      ...scores,
      [criteriaId]: value
    });
  };

  // Handle approval confirmation
  const confirmApprove = () => {
    setConfirmAction('approve');
  };

  // Handle rejection confirmation
  const confirmReject = () => {
    setConfirmAction('reject');
  };

  // Process approval
  const approveApplicant = () => {
    console.log('Approving applicant:', applicantId, 'for tender:', id);
    console.log('Evaluation notes:', evaluationNotes);
    console.log('Criteria scores:', scores);
    
    // In a real app, send this data to your backend
    navigate(`/dashboard/tenders/${id}`);
  };

  // Process rejection
  const rejectApplicant = () => {
    console.log('Rejecting applicant:', applicantId, 'for tender:', id);
    console.log('Evaluation notes:', evaluationNotes);
    
    // In a real app, send this data to your backend
    navigate(`/dashboard/tenders/${id}`);
  };

  // Cancel the confirmation modal
  const cancelAction = () => {
    setConfirmAction(null);
  };

  // Get status badge color
  const getStatusColor = (status) => {
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

  // Rating labels
  const ratingLabels = {
    0: 'Not rated',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very good',
    5: 'Excellent'
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Applicant not found</h2>
        <Link 
          to={`/dashboard/tenders/${id}`} 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
        >
          Back to Tender
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="flex items-center mb-2">
              <Link 
                to={`/dashboard/tenders/${id}`}
                className="text-gray-500 hover:text-primary mr-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h2 className="text-2xl font-bold text-gray-800">{applicant.companyName}</h2>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                {applicant.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">Submission Date: {applicant.submissionDate}</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={confirmApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={confirmReject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Company Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{applicant.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{applicant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{applicant.phone}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Proposal Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-4">
                {applicant.proposal.summary}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Proposed Timeline</p>
                  <p className="font-medium">{applicant.proposal.timeline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proposed Budget</p>
                  <p className="font-medium">{applicant.proposal.budget}</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Proposed Team</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicant.proposal.team.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.experience}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-4">Submitted Documents</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {applicant.documents.map((document) => (
                  <li key={document.id} className="px-6 py-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {document.size} • Uploaded on {document.date}
                      </p>
                    </div>
                    <a
                      href="#"
                      className="ml-4 px-3 py-1 text-xs text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Downloading ${document.name}`);
                      }}
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Evaluation Column */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Evaluation</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Total Score</h4>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-primary">
                    {calculateTotalScore()}/5
                  </div>
                  <div className="ml-2 text-sm text-gray-500">weighted average</div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Criteria Ratings</h4>
                
                <div className="space-y-4">
                  {applicant.evaluationCriteria.map((criteria) => (
                    <div key={criteria.id}>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700">
                          {criteria.name} <span className="text-xs text-gray-500">({criteria.weight}%)</span>
                        </label>
                        <span className="text-xs text-gray-500">
                          {ratingLabels[scores[criteria.id]]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={scores[criteria.id] || 0}
                        onChange={(e) => handleScoreChange(criteria.id, parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Evaluation Notes</h4>
                <textarea
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add your notes about this applicant..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmAction === 'approve' ? 'Approve Applicant' : 'Reject Applicant'}
            </h3>
            <p className="text-gray-600 mb-4">
              {confirmAction === 'approve' 
                ? 'Are you sure you want to approve this applicant? This will notify them of your decision.'
                : 'Are you sure you want to reject this applicant? This will notify them of your decision.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelAction}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction === 'approve' ? approveApplicant : rejectApplicant}
                className={`px-4 py-2 text-white rounded-md ${
                  confirmAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetail; 