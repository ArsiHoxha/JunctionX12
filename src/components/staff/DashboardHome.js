import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import StatsCard from '../dashboard/StatsCard';
import TenderStatusChart from '../charts/TenderStatusChart';
import TenderValueChart from '../charts/TenderValueChart';
import ActivityTimeline from '../charts/ActivityTimeline';
import SupplierMap from '../charts/SupplierMap';
import TenderInsights from './TenderInsights';
import ServiceDeletedInfo from '../alerts/ServiceDeletedInfo';

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

const DashboardHome = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenders, setTenders] = useState([]);
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
        
        // Calculate stats
        setStats({
          activeTenders: validTenders.length || 0,
          pendingProposals: validTenders.reduce((acc, tender) => acc + (tender.pendingProposals || 0), 0) || 0,
          reviewedProposals: validTenders.reduce((acc, tender) => acc + (tender.reviewedProposals || 0), 0) || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Set empty data on error
        setTenders([]);
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

  // Mock data for upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: 'IT Infrastructure Upgrade', deadline: '2023-12-15', daysLeft: 5 },
    { id: 2, title: 'Office Supplies Contract', deadline: '2023-12-20', daysLeft: 10 },
    { id: 3, title: 'Training Services', deadline: '2023-12-25', daysLeft: 15 },
  ];

  // Mock data for KPIs
  const kpis = [
    { 
      title: 'Open Tenders', 
      value: 12, 
      change: '+3', 
      color: 'primary',
      icon: (
        <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      title: 'Bids Awaiting Review', 
      value: 8, 
      change: '+2', 
      color: 'warning',
      icon: (
        <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      title: 'Contracts Awarded', 
      value: 23, 
      change: '+5', 
      color: 'success',
      icon: (
        <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      title: 'Total Value', 
      value: 4.5, 
      change: '+0.8', 
      color: 'purple', 
      prefix: '€', 
      suffix: 'M',
      icon: (
        <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  // Sample data for charts
  const statusData = [
    { name: 'Open', value: 12 },
    { name: 'Draft', value: 5 },
    { name: 'Under Review', value: 8 },
    { name: 'Closed', value: 10 }
  ];

  // Mock tenders data for AI insights
  const mockTenders = [
    {
      id: 1,
      title: 'IT Infrastructure Upgrade',
      deadline: '2023-12-15',
      status: 'open',
      applicants: 3,
      budget: 75000,
      author: 'John Doe',
      department: 'IT',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'Office Furniture Procurement',
      deadline: '2023-11-30',
      status: 'open',
      applicants: 2,
      budget: 25000,
      author: 'Jane Smith',
      department: 'Facilities',
      category: 'Office Equipment'
    },
    {
      id: 3,
      title: 'Software Development Services',
      deadline: '2023-10-15',
      status: 'closed',
      applicants: 3,
      budget: 120000,
      author: 'Mike Johnson',
      department: 'IT',
      category: 'Technology'
    },
    {
      id: 4,
      title: 'Marketing Campaign Management',
      deadline: '2023-12-01',
      status: 'open',
      applicants: 2,
      budget: 50000,
      author: 'Sarah Williams',
      department: 'Marketing',
      category: 'Marketing'
    }
  ];

  return (
    <div className="space-y-8">
      <ServiceDeletedInfo />
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to your Staff Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor procurement activities and manage tenders</p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <StatsCard 
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            color={kpi.color}
            icon={kpi.icon}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TenderStatusChart data={statusData} />
        <TenderValueChart />
      </div>

      {/* AI Insights and Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <TenderInsights tenders={mockTenders} />

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link 
                to="/dashboard/tender-wizard"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="bg-primary/10 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Create New Tender (Dashboard)</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start the tender creation process</p>
                </div>
              </Link>
              
              <Link 
                to="/create-tender"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="bg-primary/10 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Create New Tender (Standalone)</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a tender without dashboard</p>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/tenders"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">View All Tenders</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage and review existing tenders</p>
                </div>
              </Link>
              
              <Link 
                to="#"
                className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-md mr-3">
                  <svg className="h-6 w-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Supplier Management</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage registered suppliers</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Activity and Geography Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />
        <SupplierMap />
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Deadlines</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tender</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingDeadlines.map((tender) => (
                <tr key={tender.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tender.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">{tender.deadline}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${tender.daysLeft <= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}
                    >
                      {tender.daysLeft} days left
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/dashboard/tenders/${tender.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 