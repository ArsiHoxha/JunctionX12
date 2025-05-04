import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getUserRole } from './services/staffService';
import axios from 'axios';

const API_URL = 'https://jxaadf-backend-eb471773f003.herokuapp.com';

const ProtectedPage = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const checkUserAndRole = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        // First create the user in the backend if needed
        await createUserInBackend();
        
        // Then determine their role
        await determineUserRole();
      } catch (error) {
        console.error('Error in protected page:', error);
        setError('Failed to set up your account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const createUserInBackend = async () => {
      try {
        // Check if we already registered this user
        const userRegistered = localStorage.getItem(`user_registered_${user.id}`);
        
        if (!userRegistered) {
          // Create AppUser object from Clerk user data
          const appUser = {
            appUserId: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.primaryEmailAddress?.emailAddress || ''
          };

          // Call the backend API to create the user
          const response = await axios.post(`${API_URL}/api/appuser/create`, appUser, {
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.status === 200) {
            // Mark this user as registered in local storage
            localStorage.setItem(`user_registered_${user.id}`, 'true');
            console.log('User registered in backend successfully');
          } else {
            console.error('Failed to register user in backend:', response.data);
          }
        }
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    };

    const determineUserRole = async () => {
      // Check if we have a cached role
      const cachedRole = localStorage.getItem(`user_role_${user.id}`);
      const roleUpdateTime = localStorage.getItem(`user_role_update_time_${user.id}`);
      const now = new Date().getTime();
      
      // Use cached role if it exists and is less than 1 hour old
      if (cachedRole && roleUpdateTime && (now - parseInt(roleUpdateTime)) < 3600000) {
        console.log('Using cached role:', cachedRole);
        checkAccessByRole(cachedRole);
        return;
      }
      
      // Get user's email address
      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      
      if (!userEmail) {
        console.error('User has no email address');
        setError('User email address not found. Please update your Clerk profile.');
        return;
      }
      
      try {
        // Call the staff service to determine the role
        const role = await getUserRole(userEmail);
        
        // Save role and update time to localStorage
        localStorage.setItem(`user_role_${user.id}`, role);
        localStorage.setItem(`user_role_update_time_${user.id}`, now.toString());
        localStorage.setItem(`user_onboarded_${user.id}`, 'true');
        
        // Check access based on role
        checkAccessByRole(role);
      } catch (error) {
        console.error('Error determining user role:', error);
        throw error;
      }
    };

    const checkAccessByRole = (role) => {
      // Debug current path
      console.log("Current path:", currentPath);
      console.log("User role:", role);
      
      // Special paths that are allowed for any authenticated user
      const specialPaths = ['/view/tender', '/view/tender-application', '/onboarding', '/create-tender', '/edit-tender'];
      
      // For admin users, allow access to both admin and dashboard paths
      if (role === 'admin') {
        // Admin can access everything in their own section plus dashboard paths
        if (currentPath.startsWith('/admin') || 
            currentPath.startsWith('/dashboard') || 
            specialPaths.some(path => currentPath.startsWith(path))) {
          return; // Allow admin to access without redirect
        }
      }
      
      // Define allowed paths by role
      const allowedPaths = {
        admin: [
          '/admin', 
          '/admin/dashboard', 
          '/admin/tenders', 
          '/admin/proposals', 
          '/dashboard',
          '/dashboard/tenders', 
          '/dashboard/tender-wizard', 
          '/dashboard/tenders/proposals'
        ],
        staff: [
          '/dashboard', 
          '/dashboard/tenders', 
          '/dashboard/tender-wizard', 
          '/dashboard/tenders/proposals'
        ],
        supplier: [
          '/supplier', 
          '/supplier/dashboard', 
          '/supplier/tenders', 
          '/supplier/proposals'
        ],
      };

      // If user is not admin, check normal permissions
      if (role !== 'admin') {
        // Get allowed paths for user's role
        const userAllowedPaths = allowedPaths[role] || [];
        
        // Check if current path is allowed for user's role
        const isPathAllowed = userAllowedPaths.some(path => 
          currentPath === path || currentPath.startsWith(`${path}/`)
        );
        
        // If path is not allowed and not a special path, redirect to appropriate dashboard
        const isSpecialPath = specialPaths.some(path => currentPath.startsWith(path));
        if (!isPathAllowed && !isSpecialPath) {
          const dashboardPath = role === 'staff' ? '/dashboard' : '/supplier';
          console.log('Redirecting to:', dashboardPath);
          navigate(dashboardPath);
        }
      }
    };

    checkUserAndRole();
  }, [isSignedIn, user, navigate, currentPath]);

  if (!isSignedIn) {
    return <Navigate to="/" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Error</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedPage; 