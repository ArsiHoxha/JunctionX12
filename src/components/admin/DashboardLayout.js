import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// Admin Dashboard Layout
const DashboardLayout = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('DashboardLayout mounted');
    console.log('Current location:', location.pathname);
    console.log('Menu items:', menuItems.map(item => item.path));
  }, [location]);
  
  // Toggle sidebar for mobile view
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Close sidebar
  const closeSidebar = () => setSidebarOpen(false);
  
  // Check if a route is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Menu items
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Review Tenders', path: '/admin/tenders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Review Proposals', path: '/admin/proposals', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar for mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 lg:hidden`} role="dialog" aria-modal="true">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={closeSidebar}></div>
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={closeSidebar}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-bold text-primary">Admin Portal</h1>
          </div>
          
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gray-100 text-primary dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  onClick={closeSidebar}
                >
                  <svg
                    className={`${
                      isActive(item.path) ? 'text-primary dark:text-white' : 'text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-white'
                    } mr-4 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary dark:bg-gray-900">
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      isActive(item.path)
                        ? 'bg-gray-100 text-primary dark:bg-gray-700 dark:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <svg
                      className={`${
                        isActive(item.path) ? 'text-primary dark:text-white' : 'text-gray-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-white'
                      } mr-3 h-6 w-6`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-900 shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white self-center">
                Welcome, Staff Member
              </h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-sm text-gray-500 dark:text-gray-300 hidden md:block mr-2">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 