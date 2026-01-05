import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaUsers, FaChartBar, FaTools, FaShip, FaUserPlus, FaEye, FaEdit, FaTrash, FaDownload, FaUser, FaServer, FaArrowUp, FaList, FaWrench, FaDollarSign, FaBox, FaShoppingCart, FaFileAlt, FaCogs } from 'react-icons/fa';

const AdminDashboard = ({ firstName }) => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    totalRides: 0,
    totalRepairs: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalSalesVisits: 0,
    totalSparePartSales: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching dashboard stats with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 Stats response status:', response.status);
      const data = await response.json();
      console.log('📡 Stats response data:', data);
      
      if (data.success) {
        console.log('✅ Setting dashboard stats:', data.data);
        setDashboardStats(data.data);
      } else {
        console.error('❌ Stats API returned error:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    }
  };

  const systemManagementFeatures = [
    {
      name: 'Create Employee',
      icon: <FaUserPlus />,
      description: 'Add new employee accounts with detailed information',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      route: '/admin/create-employee?from=/dashboard',
      metric: `${dashboardStats.totalEmployees} Active`
    },
    {
      name: 'View All Users',
      icon: <FaUsers />,
      description: 'Browse and manage all customer and employee accounts',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      route: '/admin/users',
      metric: `${dashboardStats.totalUsers} Total`
    },
    {
      name: 'Fleet Management',
      icon: <FaShip />,
      description: 'Manage boat catalog, categories, and specifications',
      color: 'bg-gradient-to-br from-indigo-600 to-purple-600',
      route: '/admin/boat-management',
      status: 'monitoring'
    },
    {
      name: 'Content Management',
      icon: <FaFileAlt />,
      description: 'Manage About page content, team members, and testimonials',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      route: '/admin/content-management',
      status: 'active'
    },
    {
      name: 'Review Management',
      icon: <FaEye />,
      description: 'Customer feedback analytics, review management, and insights',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      route: '/admin/feedback',
      metric: 'Review Analytics'
    }
  ];

  const accountManagementFeatures = [
    {
      name: 'My Profile',
      icon: <FaUser />,
      description: 'View and edit your administrator profile',
      color: 'bg-gradient-to-br from-purple-600 to-indigo-600',
      route: '/admin/profile'
    }
  ];


  const analyticsFeatures = [
    {
      name: 'User Analytics',
      icon: <FaUsers />,
      description: 'User registration trends, distribution, and geographic insights',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      route: '/admin/user-analytics',
      metric: `${dashboardStats.totalUsers || 0} Total Users`
    },
    {
      name: 'Repair Analytics',
      icon: <FaTools />,
      description: 'Service request types, monthly volume, and repair insights',
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      route: '/admin/repair-analytics',
      metric: `${dashboardStats.totalRepairs || 0} Total Repairs`
    },
    {
      name: 'Boat Rides Analytics',
      icon: <FaShip />,
      description: 'Ride bookings, popular routes, and customer preferences',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      route: '/admin/boat-rides-analytics',
      metric: `${dashboardStats.totalRides || 0} Total Rides`
    },
    {
      name: 'Sales Visit Analytics',
      icon: <FaShip />,
      description: 'Visit bookings, popular boat categories, and customer insights',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      route: '/admin/sales-visit-analytics',
      metric: `${dashboardStats.totalSalesVisits || 0} Total Visits`
    },
    {
      name: 'Inventory Analytics',
      icon: <FaWrench />,
      description: 'Inventory management, stock levels, and supplier performance',
      color: 'bg-gradient-to-br from-orange-500 to-yellow-500',
      route: '/admin/inventory-analytics',
      metric: `${dashboardStats.totalProducts || 0} Total Products`
    },
    {
      name: 'Spare Parts Sales Analytics',
      icon: <FaShoppingCart />,
      description: 'Sales performance, top products, and revenue trends',
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      route: '/admin/spare-parts-sales-analytics',
      metric: `${dashboardStats.totalSparePartSales || 0} Total Sales`
    },
    {
      name: 'Financial Analytics',
      icon: <FaChartBar />,
      description: 'Revenue trends, payment insights, and financial performance',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      route: '/admin/financial-analytics',
      metric: `LKR ${(dashboardStats.totalRevenue || 0).toLocaleString()} Revenue`
    },
    {
      name: 'Customer Analytics',
      icon: <FaUsers />,
      description: 'Customer behavior, value, and retention analysis',
      color: 'bg-gradient-to-br from-indigo-500 to-blue-500',
      route: '/admin/customer-analytics',
      metric: `${dashboardStats.totalCustomers || 0} Customers`
    },
    {
      name: 'Operational Analytics',
      icon: <FaCogs />,
      description: 'Operations, efficiency, and cross-service usage',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      route: '/admin/operational-analytics',
      metric: 'Operational Insights'
    }
  ];

  const quickStats = [
    { label: 'Total Customers', value: (dashboardStats.totalCustomers || 0).toString(), color: 'text-purple-600', bgColor: 'bg-purple-100', icon: <FaUsers /> },
    { label: 'Total Employees', value: (dashboardStats.totalEmployees || 0).toString(), color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: <FaUserPlus /> },
    { label: 'Total Repairs', value: (dashboardStats.totalRepairs || 0).toString(), color: 'text-violet-600', bgColor: 'bg-violet-100', icon: <FaTools /> },
    { label: 'Total Rides', value: (dashboardStats.totalRides || 0).toString(), color: 'text-green-600', bgColor: 'bg-green-100', icon: <FaShip /> },
    { label: 'Total Sales Visits', value: (dashboardStats.totalSalesVisits || 0).toString(), color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <FaShip /> },
    { label: 'Total Spare Part Sales', value: (dashboardStats.totalSparePartSales || 0).toString(), color: 'text-orange-600', bgColor: 'bg-orange-100', icon: <FaShoppingCart /> }
  ];



  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'monitoring': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFeatureClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-4xl text-purple-600 bg-white p-3 rounded-full shadow-lg border-2 border-purple-200">
              <FaUser />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {firstName}!
              </h1>
              <p className="text-gray-600 mt-1">Manage the entire boat service system</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                  <FaUser className="mr-2" />
                  Admin Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-400 hover:shadow-xl transition-shadow duration-300">
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


        {/* System Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaCog className="mr-2 text-indigo-500" />
            System Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemManagementFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.route)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-purple-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.metric ? 'text-purple-600 bg-purple-100' : getStatusColor(feature.status)
                    }`}>
                      {feature.metric || feature.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaChartBar className="mr-2 text-violet-500" />
            Analytics & Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.route)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-purple-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${feature.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      {feature.metric}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Account Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaUser className="mr-2 text-purple-500" />
            Account Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accountManagementFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.route)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 border border-purple-100"
              >
                <div className="p-6">
                  <div className={`${feature.color} text-white p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
