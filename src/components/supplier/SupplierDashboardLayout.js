import React, { useState, useEffect } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import AIAssistant from '../common/AIAssistant';

const SupplierDashboardLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // State for tender data to pass to AI Assistant
  const [tenderData, setTenderData] = useState(null);

  // Check if we're on mobile and update sidebar state
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkIfMobile();
    
    // Set up event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Auto-close sidebar on mobile when component mounts or when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Auto-close sidebar when location changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Extract tender information from URL if viewing a tender detail
  useEffect(() => {
    // Extract the current tender ID from the URL
    const tenderId = location.pathname.match(/\/supplier\/tenders\/(\d+)/)?.[1];
    
    if (tenderId) {
      // In a real app, you would fetch the tender data from an API
      // For now, we'll use mock data based on the tender ID
      setTenderData({
        id: parseInt(tenderId),
        title: getTenderTitle(parseInt(tenderId)),
        description: "This tender requires suppliers to provide competitive offers that meet our specifications and quality standards.",
        budget: getTenderBudget(parseInt(tenderId)),
        deadline: "2023-12-15",
        department: getTenderDepartment(parseInt(tenderId)),
        status: "open",
        requirements: [
          "Previous experience in similar projects",
          "Financial stability",
          "Ability to meet delivery timelines",
          "Compliance with industry standards"
        ],
        evaluation: {
          technical: 60,
          financial: 40,
          minimumScore: 70
        }
      });
    } else {
      setTenderData(null);
    }
  }, [location]);

  // Helper functions to get mock data based on tender ID
  const getTenderTitle = (id) => {
    const titles = {
      1: "IT Infrastructure Upgrade",
      2: "Office Furniture Procurement",
      3: "Software Development Services",
      4: "Marketing Campaign Management"
    };
    return titles[id] || `Tender #${id}`;
  };

  const getTenderBudget = (id) => {
    const budgets = {
      1: 75000,
      2: 25000,
      3: 120000,
      4: 50000
    };
    return budgets[id] || 50000;
  };

  const getTenderDepartment = (id) => {
    const departments = {
      1: "IT",
      2: "Facilities",
      3: "IT",
      4: "Marketing"
    };
    return departments[id] || "General";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar - with overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <div 
        className={`fixed md:static z-30 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 md:w-20 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 h-16">
          <div className={`flex items-center ${isSidebarOpen ? '' : 'hidden md:flex md:justify-center md:w-full'}`}>
            <div className="text-primary mr-2 flex-shrink-0">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            {isSidebarOpen && (
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent truncate">
                AADF Supplier
              </h1>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className={`text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary p-1 rounded-full ${
              isSidebarOpen ? '' : 'hidden md:block'
            }`}
          >
            {isSidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-6 h-[calc(100%-4rem)] overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link
                to="/supplier/dashboard"
                className={`flex items-center px-4 py-3 ${
                  isLinkActive('/supplier/dashboard') && !isLinkActive('/supplier/applications') 
                    ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={handleLinkClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/supplier/tenders"
                className={`flex items-center px-4 py-3 ${
                  isLinkActive('/supplier/tenders') 
                    ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={handleLinkClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isSidebarOpen && <span className="ml-3">Available Tenders</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/supplier/applications"
                className={`flex items-center px-4 py-3 ${
                  isLinkActive('/supplier/applications') 
                    ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={handleLinkClick}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isSidebarOpen && <span className="ml-3">My Applications</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              {!isSidebarOpen && (
                <button 
                  onClick={toggleSidebar}
                  className="mr-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 dark:text-white truncate">AADF Supplier Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="relative">
                <button className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant */}
      <AIAssistant 
        tenderData={tenderData} 
        initialPrompt={tenderData ? "What are the key requirements for this tender?" : null}
      />
    </div>
  );
};

export default SupplierDashboardLayout; 