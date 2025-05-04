import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Layouts
import DashboardLayout from './components/staff/DashboardLayout';
import AdminDashboardLayout from './components/admin/DashboardLayout';
import SupplierDashboardLayout from './components/supplier/SupplierDashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/staff/Dashboard';
import LandingPage from './LandingPage';

// Staff components
import DashboardHome from './components/staff/DashboardHome';
import TendersOverview from './components/staff/TendersOverview';
import TenderDetail from './components/staff/TenderDetail';
import TenderProposals from './components/staff/TenderProposals';
import TenderWizard from './components/staff/TenderWizard';

// Admin components
import ProposalsReview from './components/admin/ProposalsReview';
import ProposalDetail from './components/admin/ProposalDetail';

// Services
import { getUserRole } from './services/staffService';

// Auth guard with role checking
const PrivateRoute = ({ element, requiredRole }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Get user role using staffService
          const role = await getUserRole(user.primaryEmailAddress.emailAddress);
          console.log("User role detected:", role);
          setUserRole(role);
          setIsLoading(false);
        } catch (error) {
          console.error('Error checking user role:', error);
          // Default to supplier if role check fails
          setUserRole('supplier');
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsLoading(false);
      }
    };
    
    checkUserRole();
  }, [isLoaded, isSignedIn, user]);
  
  if (!isLoaded || isLoading) {
    // Show loading state while checking user role
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }
  
  // If requiredRole is specified and doesn't match user's role, redirect
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to the appropriate dashboard based on user role
    if (userRole === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userRole === 'staff') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/supplier/dashboard" />;
    }
  }
  
  return element;
};

// Portal redirect component
const PortalRedirect = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const redirectUser = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          const role = await getUserRole(user.primaryEmailAddress.emailAddress);
          console.log("Redirecting based on role:", role);
          
          if (role === 'admin') {
            navigate('/dashboard');
          } else if (role === 'staff') {
            navigate('/dashboard');
          } else {
            navigate('/supplier/dashboard');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // Default to supplier if role check fails
          navigate('/supplier/dashboard');
        } finally {
          setIsLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        navigate('/login');
        setIsLoading(false);
      }
    };
    
    redirectUser();
  }, [isLoaded, isSignedIn, user, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return null;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        
        {/* Staff Dashboard routes */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={<DashboardLayout />} requiredRole="staff" />}
        >
          <Route index element={<DashboardHome />} />
          <Route path="tenders" element={<TendersOverview />} />
          <Route path="tenders/proposals/:id" element={<TenderProposals />} />
          <Route path="tenders/:id" element={<TenderDetail />} />
          <Route path="tender-wizard" element={<TenderWizard />} />
          <Route path="tender-wizard/edit/:id" element={<TenderWizard />} />
          {/* Add other dashboard routes as needed */}
        </Route>

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={<PrivateRoute element={<AdminDashboardLayout />} requiredRole="admin" />}
        >
          <Route index element={<DashboardHome adminView={true} />} />
          <Route path="proposals" element={<ProposalsReview />} />
          <Route path="proposals/:id" element={<ProposalDetail />} />
          <Route path="tenders" element={<TendersOverview adminView={true} />} />
          <Route path="tenders/:id" element={<TenderDetail adminView={true} />} />
          <Route path="tenders/proposals/:id" element={<TenderProposals adminView={true} />} />
        </Route>
        
        {/* Supplier routes */}
        <Route
          path="/supplier"
          element={<PrivateRoute element={<SupplierDashboardLayout />} requiredRole="supplier" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          {/* Add supplier-specific routes here */}
        </Route>
        
        {/* Portal redirect route */}
        <Route path="/portal" element={<PortalRedirect />} />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 