import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  FaCogs,
  FaChartLine,
  FaTachometerAlt,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFilter,
  FaDownload,
  FaSync,
  FaClock,
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const OperationalAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [completionRates, setCompletionRates] = useState(null);
  const [crossServiceUsage, setCrossServiceUsage] = useState(null);
  const [operationalEfficiency, setOperationalEfficiency] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // Filters
  const [completionPeriod, setCompletionPeriod] = useState('monthly');

  useEffect(() => {
    loadAllData();
  }, [completionPeriod]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      const [
        completionRes,
        crossServiceRes,
        efficiencyRes,
        performanceRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/operational/service-completion?period=${completionPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/operational/cross-service-usage`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/operational/efficiency`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/operational/performance`, { headers })
      ]);

      const [
        completionData,
        crossServiceData,
        efficiencyData,
        performanceData
      ] = await Promise.all([
        completionRes.json(),
        crossServiceRes.json(),
        efficiencyRes.json(),
        performanceRes.json()
      ]);

      if (completionData.success) setCompletionRates(completionData.data);
      if (crossServiceData.success) setCrossServiceUsage(crossServiceData.data);
      if (efficiencyData.success) setOperationalEfficiency(efficiencyData.data);
      if (performanceData.success) setPerformanceMetrics(performanceData.data);

    } catch (error) {
      console.error('Failed to load operational analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const serviceCompletionConfig = {
    type: 'bar',
    data: {
      labels: completionRates?.completionRates?.map(service => {
        switch(service.serviceType) {
          case 'spare_parts': return 'Spare Parts';
          case 'boat_repair': return 'Boat Repair';
          case 'boat_sales': return 'Boat Sales';
          case 'boat_ride': return 'Boat Rides';
          case 'maintenance': return 'Maintenance';
          default: return service.serviceType;
        }
      }) || [],
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: completionRates?.completionRates?.map(service => service.completionRate) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        },
        {
          label: 'Total Orders',
          data: completionRates?.completionRates?.map(service => service.totalOrders) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Service Completion Rates'
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  };

  const crossServiceUsageConfig = {
    type: 'doughnut',
    data: {
      labels: ['Multi-Service Customers', 'Single-Service Customers'],
      datasets: [{
        data: [
          crossServiceUsage?.statistics?.multiServiceCustomers || 0,
          crossServiceUsage?.statistics?.singleServiceCustomers || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Cross-Service Usage Distribution'
        },
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} customers (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  const serviceProfitabilityConfig = {
    type: 'bar',
    data: {
      labels: performanceMetrics?.serviceProfitability?.map(service => {
        switch(service.serviceType) {
          case 'spare_parts': return 'Spare Parts';
          case 'boat_repair': return 'Boat Repair';
          case 'boat_sales': return 'Boat Sales';
          case 'boat_ride': return 'Boat Rides';
          case 'maintenance': return 'Maintenance';
          default: return service.serviceType;
        }
      }) || [],
      datasets: [{
        label: 'Total Revenue (Rs.)',
        data: performanceMetrics?.serviceProfitability?.map(service => service.totalRevenue) || [],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Service Profitability'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rs. ' + value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const processingTimesConfig = {
    type: 'bar',
    data: {
      labels: operationalEfficiency?.orderProcessingTimes?.map(item => item.status) || [],
      datasets: [{
        label: 'Average Processing Time (Days)',
        data: operationalEfficiency?.orderProcessingTimes?.map(item => item.averageProcessingTime) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Order Processing Times'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toFixed(1) + ' days';
            }
          }
        }
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaEye /> },
    { id: 'completion', label: 'Service Completion', icon: <FaCheckCircle /> },
    { id: 'cross-service', label: 'Cross-Service Usage', icon: <FaUsers /> },
    { id: 'efficiency', label: 'Operational Efficiency', icon: <FaTachometerAlt /> },
    { id: 'performance', label: 'Performance Metrics', icon: <FaChartLine /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operational Analytics</h1>
              <p className="text-gray-600 mt-2">Monitor operations, efficiency, and cross-service usage</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAllData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaSync />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCheckCircle />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completionRates?.overallStats?.averageCompletionRate || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cross-Service Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {crossServiceUsage?.statistics?.crossServiceRate || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <FaClock />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {operationalEfficiency?.orderProcessingTimes?.length > 0 
                    ? operationalEfficiency.orderProcessingTimes[0].averageProcessingTime?.toFixed(1) + ' days'
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaBox />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {operationalEfficiency?.inventoryTurnover?.totalInventoryValue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Service Completion Rates</h3>
                <div className="h-64">
                  <Bar {...serviceCompletionConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Completion rates and order volumes by service type
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Cross-Service Usage</h3>
                <div className="h-64">
                  <Doughnut {...crossServiceUsageConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Distribution of customers using single vs multiple services
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Service Profitability</h3>
                <div className="h-64">
                  <Bar {...serviceProfitabilityConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Revenue generation by service type
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Order Processing Times</h3>
                <div className="h-64">
                  <Bar {...processingTimesConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Average processing times by order status
                </p>
              </div>
            </div>
          )}

          {activeTab === 'completion' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Service Completion Analysis</h3>
                  <select
                    value={completionPeriod}
                    onChange={(e) => setCompletionPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="h-64">
                  <Bar {...serviceCompletionConfig} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Completion Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Services</span>
                      <span className="text-lg font-bold text-gray-900">
                        {completionRates?.overallStats?.totalServices || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Completed</span>
                      <span className="text-lg font-bold text-gray-900">
                        {completionRates?.overallStats?.totalCompleted || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Average Completion Rate</span>
                      <span className="text-lg font-bold text-gray-900">
                        {completionRates?.overallStats?.averageCompletionRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {completionRates?.overallStats?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Order Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {completionRates?.completionRates?.map((service, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {service.serviceType === 'spare_parts' ? 'Spare Parts' :
                               service.serviceType === 'boat_repair' ? 'Boat Repair' :
                               service.serviceType === 'boat_sales' ? 'Boat Sales' :
                               service.serviceType === 'boat_ride' ? 'Boat Rides' :
                               service.serviceType === 'maintenance' ? 'Maintenance' :
                               service.serviceType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.totalOrders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.completionRate}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {service.averageOrderValue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cross-service' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Cross-Service Usage Analysis</h3>
                <div className="h-64">
                  <Doughnut {...crossServiceUsageConfig} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Cross-Service Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Multi-Service Customers</span>
                      <span className="text-lg font-bold text-blue-900">
                        {crossServiceUsage?.statistics?.multiServiceCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Single-Service Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {crossServiceUsage?.statistics?.singleServiceCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Cross-Service Rate</span>
                      <span className="text-lg font-bold text-green-900">
                        {crossServiceUsage?.statistics?.crossServiceRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {crossServiceUsage?.statistics?.totalCustomers || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Top Multi-Service Customers</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Services
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purchases
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {crossServiceUsage?.crossServiceUsage?.filter(c => c.isMultiService).slice(0, 10).map((customer, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.customerName || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">{customer.customerEmail}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.serviceCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              Rs. {customer.totalSpent.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.purchaseCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'efficiency' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Order Processing Times</h3>
                <div className="h-64">
                  <Bar {...processingTimesConfig} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Inventory Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Inventory Value</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {operationalEfficiency?.inventoryTurnover?.totalInventoryValue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Items</span>
                      <span className="text-lg font-bold text-gray-900">
                        {operationalEfficiency?.inventoryTurnover?.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Average Price</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {operationalEfficiency?.inventoryTurnover?.averagePrice?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Service Delivery Metrics</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Order Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {operationalEfficiency?.serviceDeliveryMetrics?.map((service, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {service.serviceType === 'spare_parts' ? 'Spare Parts' :
                               service.serviceType === 'boat_repair' ? 'Boat Repair' :
                               service.serviceType === 'boat_sales' ? 'Boat Sales' :
                               service.serviceType === 'boat_ride' ? 'Boat Rides' :
                               service.serviceType === 'maintenance' ? 'Maintenance' :
                               service.serviceType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.totalOrders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {service.totalRevenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rs. {service.averageOrderValue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Service Profitability</h3>
                <div className="h-64">
                  <Bar {...serviceProfitabilityConfig} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {performanceMetrics?.repeatBusinessRates?.totalCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Repeat Customers</span>
                      <span className="text-lg font-bold text-green-900">
                        {performanceMetrics?.repeatBusinessRates?.repeatCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Repeat Business Rate</span>
                      <span className="text-lg font-bold text-blue-900">
                        {performanceMetrics?.repeatBusinessRates?.repeatBusinessRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Single Purchase Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {performanceMetrics?.repeatBusinessRates?.singlePurchaseCustomers || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Service Satisfaction Scores</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Orders/Customer
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {performanceMetrics?.satisfactionScores?.map((service, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {service.serviceType === 'spare_parts' ? 'Spare Parts' :
                               service.serviceType === 'boat_repair' ? 'Boat Repair' :
                               service.serviceType === 'boat_sales' ? 'Boat Sales' :
                               service.serviceType === 'boat_ride' ? 'Boat Rides' :
                               service.serviceType === 'maintenance' ? 'Maintenance' :
                               service.serviceType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.uniqueCustomers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.totalOrders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {service.averageOrdersPerCustomer}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationalAnalytics;
