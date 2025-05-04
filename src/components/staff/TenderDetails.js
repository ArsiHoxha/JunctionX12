import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const TenderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tender, setTender] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Simulate API call to fetch tender data
    setTimeout(() => {
      setTender({
        id: id,
        title: 'IT Infrastructure Upgrade',
        description: 'Comprehensive upgrade of our IT infrastructure including servers, networking equipment, and workstations. This project aims to enhance our organizational efficiency and digital capabilities.',
        department: 'Information Technology',
        budget: 150000,
        deadline: '2023-11-30',
        status: 'Open',
        contactEmail: 'it@example.com',
        contactPhone: '123-456-7890',
        publishedDate: '2023-08-15',
        evaluationCriteria: [
          { criterion: 'Price', weight: 30 },
          { criterion: 'Technical Capability', weight: 30 },
          { criterion: 'Experience', weight: 20 },
          { criterion: 'Support Services', weight: 20 }
        ],
        documents: [
          { name: 'IT Infrastructure Requirements.pdf', size: '1.2 MB' },
          { name: 'Technical Specifications.xlsx', size: '0.8 MB' }
        ]
      });

      // Simulate API call to fetch applications
      setApplications([
        {
          id: '1',
          companyName: 'Tech Solutions Inc.',
          contactPerson: 'Jane Smith',
          submissionDate: '2023-09-01',
          status: 'Under Review',
          proposedBudget: 145000
        },
        {
          id: '2',
          companyName: 'Global IT Services',
          contactPerson: 'John Doe',
          submissionDate: '2023-09-05',
          status: 'Under Review',
          proposedBudget: 152000
        },
        {
          id: '3',
          companyName: 'Network Pros LLC',
          contactPerson: 'Robert Johnson',
          submissionDate: '2023-09-10',
          status: 'Under Review',
          proposedBudget: 148500
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusBadge = (status) => {
    let statusClass = '';
    
    switch (status) {
      case 'Open':
        statusClass = 'bg-green-100 text-green-800';
        break;
      case 'Closed':
        statusClass = 'bg-red-100 text-red-800';
        break;
      case 'Draft':
        statusClass = 'bg-gray-100 text-gray-800';
        break;
      default:
        statusClass = 'bg-blue-100 text-blue-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  const getApplicationStatusBadge = (status) => {
    let statusClass = '';
    
    switch (status) {
      case 'Approved':
        statusClass = 'bg-green-100 text-green-800';
        break;
      case 'Rejected':
        statusClass = 'bg-red-100 text-red-800';
        break;
      case 'Under Review':
        statusClass = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tender Not Found</h2>
        <p className="text-gray-600 mb-4">The tender you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{tender.title}</h2>
            <div className="mt-2 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Department: <span className="text-gray-700">{tender.department}</span>
              </div>
              <div className="text-sm text-gray-500">
                Published: <span className="text-gray-700">{formatDate(tender.publishedDate)}</span>
              </div>
              <div className="text-sm text-gray-500">
                Budget: <span className="text-gray-700">{formatCurrency(tender.budget)}</span>
              </div>
              <div className="text-sm text-gray-500">
                Status: {getStatusBadge(tender.status)}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/tender/edit/${tender.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button 
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary"
            >
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tender Details
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`ml-8 px-4 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'applications'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications ({applications.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' ? (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700">{tender.description}</p>
            </div>

            {/* Deadline */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Deadline</h3>
              <p className="text-gray-700">{formatDate(tender.deadline)}</p>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">{tender.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-700">{tender.contactPhone}</p>
                </div>
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Evaluation Criteria</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criterion
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tender.evaluationCriteria.map((criterion, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {criterion.criterion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                          {criterion.weight}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Documents */}
            {tender.documents && tender.documents.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Documents</h3>
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  {tender.documents.map((doc, index) => (
                    <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-700">{doc.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{doc.size}</span>
                      </div>
                      <button
                        className="text-primary hover:text-secondary"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Applications</h3>
              <div className="text-sm text-gray-500">
                Total Applications: <span className="font-medium">{applications.length}</span>
              </div>
            </div>
            
            {applications.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted On
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proposed Budget
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {application.companyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {application.contactPerson}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(application.submissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(application.proposedBudget)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getApplicationStatusBadge(application.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-secondary">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 border border-gray-200 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">No applications have been submitted for this tender.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails; 