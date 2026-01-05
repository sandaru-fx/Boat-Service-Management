import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const firstName = user?.name?.split(' ')[0] || 'User';

  switch (user.role) {
    case 'customer':
      return <CustomerDashboard firstName={firstName} />;
    case 'employee':
      return <EmployeeDashboard firstName={firstName} />;
    case 'admin':
      return <AdminDashboard firstName={firstName} />;
    default:
      return <CustomerDashboard firstName={firstName} />;
  }
};

export default Dashboard;
