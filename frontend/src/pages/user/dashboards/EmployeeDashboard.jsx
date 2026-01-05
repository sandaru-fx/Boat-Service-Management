import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import { 
  FaTools, 
  FaShip, 
  FaCar, 
  FaShoppingCart, 
  FaUser, 
  FaComments,
  FaBell,
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTasks
} from 'react-icons/fa';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    pendingOrders: 0,
    pendingRepairs: 0,
    activeRides: 0,
    purchaseVisits: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Employee';

  // Initialize socket and load notifications
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001');
      setSocket(newSocket);

      // Request notifications for admin
      newSocket.emit('request-notifications', 'admin');

      // Listen for notification updates
      newSocket.on('notifications-update', (data) => {
        if (data.userId === 'admin') {
          setUnreadCount(data.unreadCount);
        }
      });

      // Load initial notification count and dashboard stats
      loadNotificationCount();
      loadDashboardStats();

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const loadNotificationCount = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/notifications/admin`);
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Fetch all stats in parallel
      const [
        ordersRes,
        repairsRes,
        ridesRes,
        appointmentsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/api/orders/employee/stats`, { headers }),
        fetch(`${baseUrl}/api/boat-repairs/stats`, { headers }),
        fetch(`${baseUrl}/api/boat-rides/stats`, { headers }),
        fetch(`${baseUrl}/api/appointments/stats`, { headers })
      ]);

      const [
        ordersData,
        repairsData,
        ridesData,
        appointmentsData
      ] = await Promise.all([
        ordersRes.json(),
        repairsRes.json(),
        ridesRes.json(),
        appointmentsRes.json()
      ]);


      // Extract counts from statusCounts arrays
      const pendingOrdersCount = ordersData.success && ordersData.data.statusCounts 
        ? ordersData.data.statusCounts.find(item => item._id === 'confirmed')?.count || 0
        : 0;

      const pendingRepairsCount = repairsData.success && repairsData.data.byStatus
        ? repairsData.data.byStatus.find(item => item._id === 'assigned')?.count || 0
        : 0;

      const activeRidesCount = ridesData.success && ridesData.data.byStatus
        ? ridesData.data.byStatus.filter(item => ['pending', 'confirmed', 'in-progress'].includes(item._id))
            .reduce((sum, item) => sum + item.count, 0)
        : 0;

      const pendingVisitsCount = appointmentsData.success && appointmentsData.data.byStatus
        ? appointmentsData.data.byStatus.filter(item => ['Pending', 'Confirmed'].includes(item._id))
            .reduce((sum, item) => sum + item.count, 0)
        : 0;

      setDashboardStats({
        pendingOrders: pendingOrdersCount,
        pendingRepairs: pendingRepairsCount,
        activeRides: activeRidesCount,
        purchaseVisits: pendingVisitsCount
      });

    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const mainFunctions = [
    { 
      name: 'Order Management', 
      icon: <FaShoppingCart />, 
      description: 'Manage and track spare parts orders, update order status', 
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      route: '/employee/orders',
      status: 'active',
      count: 0
    },
    { 
      name: 'Repair Management', 
      icon: <FaTools />, 
      description: 'Manage repair requests, assign technicians, and update status', 
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      route: '/employee/repair-management',
      status: 'urgent',
      count: 12
    },
    { 
      name: 'Ride Management', 
      icon: <FaShip />, 
      description: 'Manage boat ride bookings, assign captains, and track schedules', 
      color: 'bg-gradient-to-br from-amber-500 to-orange-500',
      route: '/employee/bookings',
      status: 'active',
      count: 8
    },
    { 
      name: 'Boat Purchase Management', 
      icon: <FaCar />, 
      description: 'Manage customer service appointments and boat bookings', 
      color: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      route: '/admin/appointment-management',
      status: 'pending',
      count: 5
    },
    { 
      name: 'Spare Parts (Inventory) Management',
      icon: <FaShoppingCart />, 
      description: 'Manage spare parts inventory, add products, and update stock', 
      color: 'bg-gradient-to-br from-orange-600 to-red-600',
      route: '/inventory',
      status: 'processing',
      count: 7
    },
    { 
      name: 'Customer Chat Support', 
      icon: <FaComments />, 
      description: 'Live chat with customers to resolve their problems', 
      color: 'bg-gradient-to-br from-blue-600 to-cyan-600',
      route: '/employee/chat-dashboard',
      status: 'active',
      count: unreadCount
    },
    { 
      name: 'Package Management', 
      icon: <FaShip />, 
      description: 'Create and manage boat service packages', 
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      route: '/employee/packages',
      status: 'active',
      count: 0
    }
  ];

  const employeeAccountFunctions = [
    { 
      name: 'My Profile', 
      icon: <FaUser />, 
      description: 'View and update your employee profile information', 
      color: 'bg-gradient-to-br from-orange-500 to-amber-500',
      route: '/employee/profile'
    }
  ];

  const quickStats = [
    { label: 'Confirmed Orders', value: loadingStats ? '...' : dashboardStats.pendingOrders.toString(), color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaShoppingCart /> },
    { label: 'Assigned Repairs', value: loadingStats ? '...' : dashboardStats.pendingRepairs.toString(), color: 'text-orange-600', bgColor: 'bg-orange-100', icon: <FaExclamationTriangle /> },
    { label: 'Active Rides', value: loadingStats ? '...' : dashboardStats.activeRides.toString(), color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <FaShip /> },
    { label: 'Pending Visits', value: loadingStats ? '...' : dashboardStats.purchaseVisits.toString(), color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: <FaCar /> }
  ];


  const getStatusColor = (status) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFunctionClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl text-orange-600 bg-orange-100 p-3 rounded-full">
                <FaUser />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {firstName}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Employee Dashboard - Manage your tasks and serve customers
                </p>
              </div>
            </div>
            
            {/* Quick Chat Access Button */}
            <button 
              onClick={() => navigate('/employee/chat-dashboard')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 relative flex items-center space-x-2"
            >
              <FaComments className="text-lg" />
              <span className="font-semibold">Chat Support</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200">
              <FaTasks className="mr-2" />
              Employee Account
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-400 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`mt-1 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`text-4xl ${stat.bgColor} p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Functions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaTasks className="mr-2 text-orange-500" />
            Main Functions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFunctions.map((func, index) => (
              <div
                key={index}
                onClick={() => handleFunctionClick(func.route)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-orange-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${func.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {func.icon}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(func.status)}`}>
                        {func.status}
                      </span>
                      <span className="text-2xl font-bold text-orange-600 mt-1">{func.count}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {func.name}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed px-6 pb-6">
                  {func.description}
                </p>
              </div>
            ))}
          </div>
        </div>


        {/* Employee Account Functions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaUser className="mr-2 text-orange-500" />
            Account Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeeAccountFunctions.map((func, index) => (
              <div
                key={index}
                onClick={() => handleFunctionClick(func.route)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-orange-100"
              >
                <div className="p-6">
                  <div className={`${func.color} text-white p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {func.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {func.name}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed px-6 pb-6">
                  {func.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
