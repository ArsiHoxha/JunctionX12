import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import ServiceDeletedInfo from './ServiceDeletedInfo';

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

// Function to get all staff members
const getAllStaffMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/staff/getall`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return [];
  }
};

// Function to create a new staff member
const createStaffMember = async (email) => {
  try {
    await axios.post(`${API_URL}/staff/createstaff?email=${email}`);
    return true;
  } catch (error) {
    console.error('Error creating staff member:', error);
    return false;
  }
};

// Function to remove a staff member
const removeStaffMember = async (email) => {
  try {
    await axios.delete(`${API_URL}/staff/removestaff?email=${email}`);
    return true;
  } catch (error) {
    console.error('Error removing staff member:', error);
    return false;
  }
};

// Function to delete a user
const deleteUser = async (email) => {
  try {
    await axios.delete(`${API_URL}/staff/removestaff?email=${email}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

const DashboardHome = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [deleteUserEmail, setDeleteUserEmail] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isRemovingStaff, setIsRemovingStaff] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [staffError, setStaffError] = useState(null);
  const [staffSuccess, setStaffSuccess] = useState(null);
  const [stats, setStats] = useState({
    activeTenders: 0,
    pendingProposals: 0,
    reviewedProposals: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get tenders data from API
        const tendersData = await getAllActiveTenders();
        
        // Ensure we have an array
        const validTenders = Array.isArray(tendersData) ? tendersData : [];
        setTenders(validTenders);
        
        // Get staff members
        const staffData = await getAllStaffMembers();
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
        
        // Fetch proposals for each tender to calculate counts
        let pendingCount = 0;
        let reviewedCount = 0;
        
        if (validTenders.length > 0) {
          for (const tender of validTenders) {
            try {
              const tenderId = tender.tenderId || tender.id;
              if (tenderId) {
                const response = await axios.get(`${API_URL}/proposal/getalltender?tenderId=${tenderId}`);
                const proposals = response.data || [];
                
                // Count pending and reviewed proposals
                if (Array.isArray(proposals)) {
                  pendingCount += proposals.filter(
                    p => p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'under review'
                  ).length;
                  
                  reviewedCount += proposals.filter(
                    p => p.status?.toLowerCase() === 'accepted' || p.status?.toLowerCase() === 'rejected'
                  ).length;
                }
              }
            } catch (err) {
              console.error(`Error fetching proposals for tender ${tender.tenderId || tender.id}:`, err);
            }
          }
        }
        
        // Set stats with actual counts
        setStats({
          activeTenders: validTenders.length || 0,
          pendingProposals: pendingCount,
          reviewedProposals: reviewedCount,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Set empty data on error
        setTenders([]);
        setStaffMembers([]);
        setStats({
          activeTenders: 0,
          pendingProposals: 0,
          reviewedProposals: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffEmail) return;
    
    setIsAddingStaff(true);
    setStaffError(null);
    setStaffSuccess(null);
    
    try {
      const success = await createStaffMember(newStaffEmail);
      if (success) {
        setStaffSuccess(`Successfully added ${newStaffEmail} as staff`);
        setNewStaffEmail('');
        // Refresh staff list
        const staffData = await getAllStaffMembers();
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
      } else {
        setStaffError('Failed to add staff member. Please try again.');
      }
    } catch (error) {
      setStaffError('An error occurred while adding staff member.');
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleRemoveStaff = async (email) => {
    if (!email) return;
    
    setIsRemovingStaff(email);
    setStaffError(null);
    setStaffSuccess(null);
    
    try {
      const success = await removeStaffMember(email);
      if (success) {
        setStaffSuccess(`Successfully removed ${email} from staff`);
        // Refresh staff list
        const staffData = await getAllStaffMembers();
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
      } else {
        setStaffError('Failed to remove staff member. Please try again.');
      }
    } catch (error) {
      setStaffError('An error occurred while removing staff member.');
    } finally {
      setIsRemovingStaff(null);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!email) return;
    
    if (!window.confirm(`Are you sure you want to delete the user ${email}? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeletingUser(email);
    setStaffError(null);
    setStaffSuccess(null);
    
    try {
      const success = await deleteUser(email);
      if (success) {
        setStaffSuccess(`Successfully deleted user ${email}`);
        // Clear the input field if it matches the deleted email
        if (deleteUserEmail === email) {
          setDeleteUserEmail('');
        }
        // Refresh staff list
        const staffData = await getAllStaffMembers();
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
      } else {
        setStaffError('Failed to delete user. Please try again.');
      }
    } catch (error) {
      setStaffError('An error occurred while deleting user.');
    } finally {
      setIsDeletingUser(null);
    }
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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:text-white dark:bg-red-800 dark:hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ServiceDeletedInfo />
      
      <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Welcome {user?.firstName}, monitor all system activities and manage staff.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Tenders
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.activeTenders}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/tenders" className="font-medium text-primary hover:text-primary-dark">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Pending Proposals
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.pendingProposals}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/proposals" className="font-medium text-primary hover:text-primary-dark">
                Review proposals
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7v2m0 4h.01" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Reviewed Proposals
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.reviewedProposals}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
            <div className="text-sm">
              <Link to="/admin/proposals" className="font-medium text-primary hover:text-primary-dark">
                View all reviewed
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Section */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Delete User
          </h3>
        </div>
        
        {/* Delete User Form */}
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={(e) => { e.preventDefault(); handleDeleteUser(deleteUserEmail); }} className="sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="deleteEmail" className="sr-only">Email to Delete</label>
              <input
                type="email"
                name="deleteEmail"
                id="deleteEmail"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Email address to delete"
                value={deleteUserEmail}
                onChange={(e) => setDeleteUserEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              disabled={isDeletingUser === deleteUserEmail}
            >
              {isDeletingUser === deleteUserEmail ? 'Deleting...' : 'Delete User'}
            </button>
          </form>
          
          {/* Error/Success messages shared with staff section */}
          {staffError && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {staffError}
            </div>
          )}
          {staffSuccess && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {staffSuccess}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <p className="font-medium text-gray-500 dark:text-gray-400">
              This action permanently deletes a user and cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Recent tenders */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Active Tenders
          </h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tenders.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                No active tenders found.
              </div>
            </li>
          ) : (
            tenders.slice(0, 5).map((tender) => (
              <li key={tender.tenderId} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Link to={`/admin/tenders/${tender.tenderId}`} className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-primary truncate">{tender.title}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                        in {tender.category}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Deadline: {new Date(tender.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      {tender.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link to="/admin/tenders" className="font-medium text-primary hover:text-primary-dark">
              View all tenders
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Staff Members */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Staff Members
          </h3>
        </div>
        
        {/* Add Staff Form */}
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAddStaff} className="sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Email address"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              disabled={isAddingStaff}
            >
              {isAddingStaff ? 'Adding...' : 'Add Staff Member'}
            </button>
          </form>
          
          {/* Error/Success messages */}
          {staffError && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {staffError}
            </div>
          )}
          {staffSuccess && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              {staffSuccess}
            </div>
          )}
        </div>
        
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {staffMembers.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                No staff members found.
              </div>
            </li>
          ) : (
            staffMembers.map((staff) => (
              <li key={staff.email} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-primary truncate">{staff.name || 'No Name'}</p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                        Staff
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {staff.email}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleRemoveStaff(staff.email)}
                      disabled={isRemovingStaff === staff.email}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                    >
                      {isRemovingStaff === staff.email ? 'Removing...' : 'Remove'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(staff.email)}
                      disabled={isDeletingUser === staff.email}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
                    >
                      {isDeletingUser === staff.email ? 'Deleting...' : 'Delete User'}
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link to="/admin/staff" className="font-medium text-primary hover:text-primary-dark">
              Manage staff members
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 