import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

const StandaloneTenderWizard = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const isEditMode = mode === 'edit';
  const { userId } = useAuth();
  
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';
  
  // State for loading indicators
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTenderId, setCreatedTenderId] = useState(null);
  
  // Simplified form data with only required fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  // Fetch tender details if in edit mode
  useEffect(() => {
    const fetchTenderDetails = async () => {
      if (isEditMode && id) {
        try {
          const response = await fetch(`${API_URL}/tender/getbyid?tenderId=${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch tender: ${response.status}`);
          }
          
          const tenderData = await response.json();
          setFormData({
            title: tenderData.title || '',
            description: tenderData.description || '',
            budget: tenderData.budget ? tenderData.budget.toString() : '',
            deadline: tenderData.deadline ? tenderData.deadline.split('T')[0] : ''
          });
        } catch (error) {
          console.error('Error fetching tender details:', error);
        }
      }
    };

    fetchTenderDetails();
  }, [id, isEditMode, API_URL]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.budget || 
        !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Show submitting state
    setSubmitting(true);
    
    try {
      // Get current date in string format
      const createdDate = new Date().toISOString();
      
      // Prepare tender data for submission - only required fields
      const tenderData = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        status: "Active", // Set status to Active as per the model comment
        authorId: userId,
        createdDate: createdDate
      };
      
      // If editing, add the tender ID
      if (isEditMode && id) {
        tenderData.tenderId = parseInt(id);
      }
      
      console.log(`${isEditMode ? 'Updating' : 'Creating'} tender data:`, tenderData);
      
      // Determine API endpoint based on mode
      const apiUrl = isEditMode 
        ? `${API_URL}/tender/update`
        : `${API_URL}/tender/create`;
      
      // Submit to backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenderData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${errorText}`);
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} tender: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.text();
      console.log(`Tender ${isEditMode ? 'updated' : 'created'} successfully:`, responseData);
      
      // Show success screen instead of navigating away immediately
      setSubmitting(false);
      setSuccess(true);
      
      // Try to parse the ID from the response
      try {
        // The response might be just a number or it might be JSON
        const parsedResponse = !isNaN(responseData) ? parseInt(responseData) : JSON.parse(responseData);
        const tenderId = typeof parsedResponse === 'number' ? parsedResponse : parsedResponse.tenderId;
        if (tenderId) {
          setCreatedTenderId(tenderId);
        }
      } catch (e) {
        console.log("Could not parse tender ID from response");
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} tender:`, error);
      setSubmitting(false);
      alert(`There was an error ${isEditMode ? 'updating' : 'creating'} the tender. Please try again.`);
    }
  };

  // Submit as draft
  const saveAsDraft = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Show saving state
    setSavingDraft(true);
    
    try {
      // Get current date in string format
      const createdDate = new Date().toISOString();
      
      // Prepare tender data with draft status - only required fields
      const tenderData = {
        title: formData.title || "Untitled Draft",
        description: formData.description || "",
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        status: "Draft", // Set status as Draft
        authorId: userId,
        createdDate: createdDate
      };
      
      console.log('Saving tender draft to backend:', tenderData);
      
      // Submit to backend API
      const response = await fetch(`${API_URL}/tender/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenderData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${errorText}`);
        throw new Error(`Failed to save draft: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.text();
      console.log("Draft saved successfully:", responseData);
      
      // Show success screen
      setSavingDraft(false);
      setSuccess(true);
      
      // Try to parse the ID from the response
      try {
        // The response might be just a number or it might be JSON
        const parsedResponse = !isNaN(responseData) ? parseInt(responseData) : JSON.parse(responseData);
        const tenderId = typeof parsedResponse === 'number' ? parsedResponse : parsedResponse.tenderId;
        if (tenderId) {
          setCreatedTenderId(tenderId);
        }
      } catch (e) {
        console.log("Could not parse tender ID from response");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      setSavingDraft(false);
      alert("There was an error saving the draft. Please try again.");
    }
  };

  const handleCreateAnother = () => {
    // Reset form and state to create another tender
    setFormData({
      title: '',
      description: '',
      budget: '',
      deadline: ''
    });
    setSuccess(false);
    setCreatedTenderId(null);
  };

  // Render success screen
  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <svg className="h-10 w-10 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tender {isEditMode ? 'Updated' : 'Created'} Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your tender has been {isEditMode ? 'updated' : 'created'} and is now 
              {isEditMode ? ' available with the changes you made' : ' available for suppliers to submit proposals'}.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {createdTenderId && (
                <Link 
                  to={`/dashboard/tenders/${createdTenderId}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View Tender Details
                </Link>
              )}
              
              <Link 
                to="/dashboard/tenders"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                View All Tenders
              </Link>
              
              {!isEditMode && (
                <button 
                  onClick={handleCreateAnother}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create Another Tender
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/tenders"
        className="inline-flex items-center text-sm text-primary hover:text-secondary mb-6"
      >
        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tenders
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
              {isEditMode ? 'Edit Tender' : 'Create New Tender'}
            </h2>
            <div className="flex space-x-3">
              <button 
                onClick={saveAsDraft}
                disabled={savingDraft || submitting}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingDraft ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save as Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 sm:p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter tender title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 sm:p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Describe the tender requirements and objectives"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (USD)*</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 sm:p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter budget amount"
                  required
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline*</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 sm:p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting || savingDraft}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Publishing...'}
                  </span>
                ) : (
                  isEditMode ? 'Update Tender' : 'Publish Tender'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StandaloneTenderWizard; 