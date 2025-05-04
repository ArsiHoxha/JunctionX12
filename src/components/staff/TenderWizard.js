import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

const TenderWizard = () => {
  const navigate = useNavigate();
  const { id, mode } = useParams();
  const isEditMode = mode === 'edit';
  const { userId } = useAuth();
  
  const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com/api';
  
  // State for loading indicators
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  
  // Simplified form data with only required fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: ''
  });

  // Load tender data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchTenderData = async () => {
        try {
          // Try multiple parameter formats
          let tenderData;
          let tenderFetched = false;
          
          // First try with tenderId parameter
          try {
            console.log(`Trying to fetch tender with tenderId=${id}`);
            const response = await axios.get(`${API_URL}/tender/getbyid`, { 
              params: { tenderId: id } 
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
                params: { id: id } 
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
                  params: { tender_id: id } 
                });
                tenderData = response.data;
                tenderFetched = true;
                console.log('Fetched tender with tender_id parameter:', tenderData);
              } catch (error3) {
                console.log('Failed to fetch tender with tender_id parameter:', error3.message);
                
                // If all direct fetches fail, try getting all tenders and find the matching one
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
          
          if (tenderFetched && tenderData) {
            // Update form data with fetched tender - only the required fields
            setFormData({
              title: tenderData.title || '',
              description: tenderData.description || '',
              budget: tenderData.budget ? tenderData.budget.toString() : '',
              deadline: tenderData.deadline ? new Date(tenderData.deadline).toISOString().split('T')[0] : ''
            });
          } else {
            throw new Error(`No tender data found for ID ${id}`);
          }
        } catch (error) {
          console.error("Error fetching tender data:", error);
          alert("Failed to load tender data. Using sample data instead.");
          // Fallback to mock data in case of error
          setFormData({
            title: 'IT Infrastructure Upgrade',
            description: 'We are seeking a vendor to upgrade our IT infrastructure including servers, networking equipment, and workstations. The project includes procurement, installation, configuration, and knowledge transfer to our IT staff.',
            budget: '75000',
            deadline: '2023-12-15'
          });
        }
      };
      
      fetchTenderData();
    }
  }, [isEditMode, id]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
        ? 'https://jxaadf-backend-eb471773f003.herokuapp.com/api/tender/update'
        : 'https://jxaadf-backend-eb471773f003.herokuapp.com/api/tender/create';
      
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
      
      // Navigate to tender detail or list after successful submission
      setTimeout(() => {
        setSubmitting(false);
        navigate('/dashboard/tenders');
      }, 1000);
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
      const response = await fetch('https://jxaadf-backend-eb471773f003.herokuapp.com/api/tender/create', {
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
      
      // Navigate to tender list
      setTimeout(() => {
        setSavingDraft(false);
        navigate('/dashboard/tenders');
      }, 1000);
    } catch (error) {
      console.error("Error saving draft:", error);
      setSavingDraft(false);
      alert("There was an error saving the draft. Please try again.");
    }
  };

  return (
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
          
          {/* Submit button */}
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
  );
};

export default TenderWizard; 