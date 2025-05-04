import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TenderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    budget: '',
    deadline: '',
    status: 'Draft',
    contactEmail: '',
    contactPhone: '',
    evaluationCriteria: [
      { criterion: 'Price', weight: 30 },
      { criterion: 'Quality', weight: 30 },
      { criterion: 'Experience', weight: 20 },
      { criterion: 'Delivery Time', weight: 20 }
    ],
    documents: []
  });

  // Load tender data for edit mode
  useEffect(() => {
    if (isEditMode) {
      // Simulate API call to get tender data
      setTimeout(() => {
        setFormData({
          title: 'IT Infrastructure Upgrade',
          description: 'Comprehensive upgrade of our IT infrastructure including servers, networking equipment, and workstations.',
          department: 'Information Technology',
          budget: '150000',
          deadline: '2023-11-30',
          status: 'Open',
          contactEmail: 'it@example.com',
          contactPhone: '123-456-7890',
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
        setLoading(false);
      }, 800);
    }
  }, [id, isEditMode]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle criteria changes
  const handleCriteriaChange = (index, field, value) => {
    const updatedCriteria = [...formData.evaluationCriteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: field === 'weight' ? parseInt(value, 10) || 0 : value
    };
    
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: updatedCriteria
    }));
  };

  // Add new criterion
  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: [
        ...prev.evaluationCriteria,
        { criterion: '', weight: 0 }
      ]
    }));
  };

  // Remove criterion
  const removeCriterion = (index) => {
    const updatedCriteria = [...formData.evaluationCriteria];
    updatedCriteria.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: updatedCriteria
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      // In a real app, you would upload the file to a server here
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  // Remove document
  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Validate total weight is 100
    const totalWeight = formData.evaluationCriteria.reduce((sum, { weight }) => sum + weight, 0);
    if (totalWeight !== 100) {
      alert('Evaluation criteria weights must sum to 100%');
      setSubmitting(false);
      return;
    }
    
    // Simulate API call to save the tender
    setTimeout(() => {
      setSubmitting(false);
      // Navigate back to dashboard after save
      navigate('/dashboard');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Tender' : 'Create New Tender'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tender Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department*
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Budget (USD)*
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline*
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status*
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          ></textarea>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Contact Email*
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
              Contact Phone*
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        {/* Evaluation Criteria */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Evaluation Criteria* (Total weight must be 100%)
            </label>
            <button
              type="button"
              onClick={addCriterion}
              className="text-primary hover:text-secondary text-sm"
            >
              + Add Criterion
            </button>
          </div>
          
          {formData.evaluationCriteria.map((criteria, index) => (
            <div key={index} className="flex space-x-3 mb-3">
              <input
                type="text"
                value={criteria.criterion}
                onChange={(e) => handleCriteriaChange(index, 'criterion', e.target.value)}
                placeholder="Criterion"
                required
                className="flex-grow border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <div className="w-24 flex items-center">
                <input
                  type="number"
                  value={criteria.weight}
                  onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                  min="0"
                  max="100"
                  required
                  className="w-16 border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <span className="ml-1">%</span>
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(index)}
                disabled={formData.evaluationCriteria.length <= 1}
                className={`text-red-500 ${formData.evaluationCriteria.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          <div className="text-sm text-gray-500 mt-1">
            Total Weight: {formData.evaluationCriteria.reduce((sum, { weight }) => sum + weight, 0)}%
          </div>
        </div>
        
        {/* Documents */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Documents
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-1 text-sm text-gray-500">
              Drag and drop files here, or click to select files
            </p>
            <input
              id="fileUpload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('fileUpload').click()}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Select Files
            </button>
          </div>
          
          {formData.documents.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
              <ul className="divide-y divide-gray-200">
                {formData.documents.map((doc, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">{doc.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{doc.size}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Create Tender'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TenderForm; 