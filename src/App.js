import React, { useState } from 'react';
import { useClerk, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import ProtectedPage from './ProtectedPage';
import LandingPage from './LandingPage';
import UserOnboarding from './components/auth/UserOnboarding';

// Admin components (previously Staff)
import AdminDashboard from './components/admin/Dashboard';
import AdminDashboardLayout from './components/admin/DashboardLayout';
import AdminDashboardHome from './components/admin/DashboardHome';
import TenderWizard from './components/staff/TenderWizard';
import TendersOverview from './components/staff/TendersOverview';
import TenderDetail from './components/staff/TenderDetail';
import ApplicantDetail from './components/staff/ApplicantDetail';
import TenderProposals from './components/staff/TenderProposals';
import ProposalsReview from './components/admin/ProposalsReview';
import ProposalDetail from './components/admin/ProposalDetail';

// Staff components (new role)
import StaffDashboard from './components/staff/Dashboard';
import StaffDashboardLayout from './components/staff/DashboardLayout';
import StaffDashboardHome from './components/staff/StaffDashboardHome';
import DashboardLayout from './components/staff/DashboardLayout'; // Original dashboard layout
import DashboardHome from './components/staff/DashboardHome'; // Original dashboard home
import ReviewTenders from './components/staff/ReviewTenders';
import ReviewProposals from './components/staff/ReviewProposals';

// Supplier components
import TenderList from './components/supplier/TenderList';
import SupplierDashboardLayout from './components/supplier/SupplierDashboardLayout';
import SupplierDashboard from './components/supplier/SupplierDashboard';
import TenderApplication from './components/supplier/TenderApplication';
import ApplicationSuccess from './components/supplier/ApplicationSuccess';
import MyApplications from './components/supplier/MyApplications';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './ThemeContext';

// New component
import StandaloneTenderWizard from './components/staff/StandaloneTenderWizard';

// Main App component with routing
function App() {
  const { openSignIn } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 overflow-x-hidden">
          {/* Navigation with logo, menu items and login controls */}
          <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50 shadow-md transition-colors duration-200 w-full">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 sm:h-20">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                    <div className="text-primary mr-2 sm:mr-3 animate-pulse-slow">
                      <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent truncate">
                      AADF <span className="font-light">Portal</span>
                    </h1>
                  </Link>
                </div>
                
                {/* Mobile menu button */}
                <div className="sm:hidden flex items-center">
                  <button 
                    type="button" 
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white focus:outline-none"
                    onClick={toggleMobileMenu}
                  >
                    <span className="sr-only">Open main menu</span>
                    {mobileMenuOpen ? (
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                  <ThemeToggle />
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
                
                {/* Desktop menu */}
                <div className="hidden sm:flex items-center space-x-4 sm:space-x-6">
                  <Link to="/" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors">Home</Link>
                  <a href="/#features" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors">Features</a>
                  <a href="/#portals" className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium transition-colors">Portals</a>
                  
                  <SignedIn>
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <ThemeToggle />
                    <SignInButton mode="modal" redirectUrl="/onboarding">
                      <button 
                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg transition-all shadow-md hover:shadow-primary/20 transform hover:-translate-y-0.5"
                      >
                        Login
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
            
            {/* Mobile menu, show/hide based on menu state */}
            {mobileMenuOpen && (
              <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link 
                    to="/" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <a 
                    href="/#features" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMobileMenu}
                  >
                    Features
                  </a>
                  <a 
                    href="/#portals" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMobileMenu}
                  >
                    Portals
                  </a>
                  
                  <SignedOut>
                    <div className="px-3 py-2">
                      <SignInButton mode="modal" redirectUrl="/onboarding">
                        <button 
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg transition-all"
                          onClick={closeMobileMenu}
                        >
                          Login
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            )}
          </nav>

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<UserOnboarding />} />
            
            {/* Standalone Tender Creation Routes */}
            <Route path="/create-tender" element={
              <ProtectedPage>
                <StandaloneTenderWizard />
              </ProtectedPage>
            } />
            <Route path="/edit-tender/:id" element={
              <ProtectedPage>
                <StandaloneTenderWizard />
              </ProtectedPage>
            } />
            
            {/* Specific route for tender proposals to prevent navigation issues */}
            <Route path="/dashboard/tenders/proposals/:id" element={
              <ProtectedPage>
                <DashboardLayout>
                  <TenderProposals />
                </DashboardLayout>
              </ProtectedPage>
            } />
            
            <Route path="/dashboard/tender-wizard" element={
              <ProtectedPage>
                <DashboardLayout>
                  <TenderWizard />
                </DashboardLayout>
              </ProtectedPage>
            } />
            <Route path="/dashboard/tender-wizard/edit/:id" element={
              <ProtectedPage>
                <DashboardLayout>
                  <TenderWizard />
                </DashboardLayout>
              </ProtectedPage>
            } />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedPage>
                  <AdminDashboardLayout />
                </ProtectedPage>
              }
            >
              <Route index element={<AdminDashboardHome />} />
              <Route path="proposals" element={<ProposalsReview />} />
              <Route path="proposals/:id" element={<ProposalDetail />} />
              <Route path="tenders" element={<TendersOverview />} />
              <Route path="tenders/:id" element={<TenderDetail />} />
            </Route>
            
            {/* Specific route for admin tender proposals to prevent navigation issues */}
            <Route path="/admin/tenders/proposals/:id" element={
              <ProtectedPage>
                <AdminDashboardLayout>
                  <TenderProposals />
                </AdminDashboardLayout>
              </ProtectedPage>
            } />
            
            {/* Staff Routes */}
            <Route 
              path="/staff" 
              element={
                <ProtectedPage>
                  <StaffDashboardLayout />
                </ProtectedPage>
              }
            >
              <Route index element={<StaffDashboardHome />} />
              <Route path="tenders/:id" element={<TenderDetail />} />
              <Route path="proposals" element={<ReviewProposals />} />
              <Route path="proposals/:id" element={<ProposalDetail />} />
            </Route>
            
            {/* Specific route for staff tender proposals to prevent navigation issues */}
            <Route path="/staff/tenders/proposals/:id" element={
              <ProtectedPage>
                <StaffDashboardLayout>
                  <TenderProposals />
                </StaffDashboardLayout>
              </ProtectedPage>
            } />
            
            {/* Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedPage>
                  <DashboardLayout />
                </ProtectedPage>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="tenders" element={<ReviewTenders />} />
              <Route path="tenders/new" element={<TenderWizard />} />
              <Route path="tenders/:id" element={<TenderDetail />} />
              <Route path="tenders/:id/applicants/:applicantId" element={<ApplicantDetail />} />
              <Route path="tenders-overview" element={<TendersOverview />} />
              <Route path="proposals" element={<ReviewProposals />} />
            </Route>
            
            {/* View Tender Route - publicly accessible route */}
            <Route path="/view/tender/:id" element={<TenderDetail />} />
            
            {/* Direct access to tender details for staff without going through dashboard */}
            <Route path="/staff/tenders/:id" element={<TenderDetail />} />
            
            {/* Direct access to tender proposals without going through dashboard redirect */}
            <Route path="/dashboard/tenders/proposals/:id" element={<TenderProposals />} />
            
            {/* View Tender Application Route - publicly accessible */}
            <Route path="/view/tender-application/:id" element={<TenderApplication />} />
            
            {/* View Application Details Route - for application submissions */}
            <Route path="/view/application/:id" element={<TenderApplication />} />
            
            {/* Supplier Routes */}
            <Route 
              path="/supplier" 
              element={
                <ProtectedPage>
                  <SupplierDashboardLayout />
                </ProtectedPage>
              }
            >
              <Route index element={<SupplierDashboard />} />
              <Route path="dashboard" element={<SupplierDashboard />} />
              <Route path="tenders" element={<TenderList />} />
              <Route path="tenders/:id" element={<TenderApplication />} />
              <Route path="tender/:id" element={<TenderApplication />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="applications/:id" element={<TenderApplication />} />
              <Route path="success" element={<ApplicationSuccess />} />
              <Route path="application-success" element={<ApplicationSuccess />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
