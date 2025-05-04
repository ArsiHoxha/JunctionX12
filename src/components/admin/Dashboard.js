import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

// Main Dashboard component to serve as the entry point for admin
const Dashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard; 