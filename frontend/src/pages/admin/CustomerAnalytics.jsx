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
  FaUsers,
  FaChartLine,
  FaHeart,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFilter,
  FaDownload,
  FaSync
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

const CustomerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [purchaseFrequency, setPurchaseFrequency] = useState(null);
  const [servicePreferences, setServicePreferences] = useState(null);
  const [clvData, setClvData] = useState(null);
  const [retentionData, setRetentionData] = useState(null);
  const [segmentationData, setSegmentationData] = useState(null);
  
  // Filters
  const [frequencyPeriod, setFrequencyPeriod] = useState('monthly');
  const [retentionPeriod, setRetentionPeriod] = useState('monthly');

  useEffect(() => {
    loadAllData();
  }, [frequencyPeriod, retentionPeriod]);

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
        frequencyRes,
        preferencesRes,
        clvRes,
        retentionRes,
        segmentationRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/customer/purchase-frequency?period=${frequencyPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/customer/service-preferences`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/customer/lifetime-value`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/customer/retention-analysis?period=${retentionPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/customer/segmentation`, { headers })
      ]);

      const [
        frequencyData,
        preferencesData,
        clvData,
        retentionData,
        segmentationData
      ] = await Promise.all([
        frequencyRes.json(),
        preferencesRes.json(),
        clvRes.json(),
        retentionRes.json(),
        segmentationRes.json()
      ]);

      if (frequencyData.success) setPurchaseFrequency(frequencyData.data);
      if (preferencesData.success) setServicePreferences(preferencesData.data);
      if (clvData.success) setClvData(clvData.data);
      if (retentionData.success) setRetentionData(retentionData.data);
      if (segmentationData.success) setSegmentationData(segmentationData.data);

    } catch (error) {
      console.error('Failed to load customer analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const purchaseFrequencyConfig = {
    type: 'line',
    data: {
      labels: purchaseFrequency?.periods || [],
      datasets: [
        {
          label: 'Unique Customers',
          data: purchaseFrequency?.uniqueCustomers || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Total Purchases',
          data: purchaseFrequency?.totalPurchases || [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Customer Purchase Frequency Over Time'
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  };

  const servicePreferencesConfig = {
    type: 'doughnut',
    data: {
      labels: servicePreferences?.servicePopularity?.services || [],
      datasets: [{
        data: servicePreferences?.servicePopularity?.customerCounts || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
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
          text: 'Service Popularity by Customer Count'
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

  const clvSegmentationConfig = {
    type: 'pie',
    data: {
      labels: ['High Value', 'Medium Value', 'Low Value'],
      datasets: [{
        data: [
          clvData?.statistics?.segmentation?.high?.count || 0,
          clvData?.statistics?.segmentation?.medium?.count || 0,
          clvData?.statistics?.segmentation?.low?.count || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
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
          text: 'Customer Lifetime Value Segmentation'
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

  const retentionRateConfig = {
    type: 'bar',
    data: {
      labels: retentionData?.cohorts?.map(c => c.cohortMonth) || [],
      datasets: [{
        label: 'Retention Rate (%)',
        data: retentionData?.cohorts?.map(c => c.retentionRate) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Customer Retention Rate by Cohort'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaEye /> },
    { id: 'behavior', label: 'Behavior', icon: <FaChartLine /> },
    { id: 'value', label: 'Lifetime Value', icon: <FaStar /> },
    { id: 'retention', label: 'Retention', icon: <FaHeart /> },
    { id: 'segmentation', label: 'Segmentation', icon: <FaUsers /> }
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
              <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive customer behavior and value analysis</p>
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
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clvData?.statistics?.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaStar />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average CLV</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {clvData?.statistics?.averageCLV?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaHeart />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {retentionData?.overallMetrics?.retentionRate || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <FaChartLine />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Value Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {segmentationData?.statistics?.highValue?.count || 0}
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
                <h3 className="text-lg font-semibold mb-4">Purchase Frequency Trends</h3>
                <div className="h-64">
                  <Line {...purchaseFrequencyConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Track how customer purchase patterns change over time
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Service Preferences</h3>
                <div className="h-64">
                  <Doughnut {...servicePreferencesConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Distribution of customers across different services
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Customer Value Segmentation</h3>
                <div className="h-64">
                  <Pie {...clvSegmentationConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Customer distribution by lifetime value tiers
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Retention Rate by Cohort</h3>
                <div className="h-64">
                  <Bar {...retentionRateConfig} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Customer retention rates for each registration cohort
                </p>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Purchase Frequency Analysis</h3>
                  <select
                    value={frequencyPeriod}
                    onChange={(e) => setFrequencyPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="h-64">
                  <Line {...purchaseFrequencyConfig} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Customers by Service Usage</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Services Used
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
                      {servicePreferences?.customerPreferences?.slice(0, 10).map((customer, index) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
          )}

          {activeTab === 'value' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">CLV Distribution</h3>
                  <div className="h-64">
                    <Pie {...clvSegmentationConfig} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">CLV Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Average CLV</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {clvData?.statistics?.averageCLV?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Median CLV</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {clvData?.statistics?.medianCLV?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {clvData?.statistics?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Customers by Lifetime Value</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Order Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Lifetime
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clvData?.customers?.map((customer, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.customerName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">{customer.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Rs. {customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.purchaseCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {customer.averageOrderValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(customer.customerLifetime)} days
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Retention Analysis</h3>
                  <select
                    value={retentionPeriod}
                    onChange={(e) => setRetentionPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="h-64">
                  <Bar {...retentionRateConfig} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Retention Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {retentionData?.overallMetrics?.totalCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Returning Customers</span>
                      <span className="text-lg font-bold text-gray-900">
                        {retentionData?.overallMetrics?.returningCustomers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Overall Retention Rate</span>
                      <span className="text-lg font-bold text-gray-900">
                        {retentionData?.overallMetrics?.retentionRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Cohort Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cohort Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Customers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Returning
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Retention Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {retentionData?.cohorts?.map((cohort, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {cohort.cohortMonth}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cohort.totalCustomers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cohort.returningCustomers}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {cohort.retentionRate}%
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

          {activeTab === 'segmentation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">High Value Customers</span>
                        <span className="text-lg font-bold text-green-900">
                          {segmentationData?.statistics?.highValue?.count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {segmentationData?.statistics?.highValue?.percentage || 0}% of total
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-800">Frequent Customers</span>
                        <span className="text-lg font-bold text-blue-900">
                          {segmentationData?.statistics?.frequent?.count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {segmentationData?.statistics?.frequent?.percentage || 0}% of total
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-purple-800">New Customers</span>
                        <span className="text-lg font-bold text-purple-900">
                          {segmentationData?.statistics?.new?.count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        {segmentationData?.statistics?.new?.percentage || 0}% of total
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-800">Returning Customers</span>
                        <span className="text-lg font-bold text-orange-900">
                          {segmentationData?.statistics?.returning?.count || 0}
                        </span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        {segmentationData?.statistics?.returning?.percentage || 0}% of total
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Segment Revenue Contribution</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">High Value Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {segmentationData?.statistics?.highValue?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Frequent Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {segmentationData?.statistics?.frequent?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">New Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {segmentationData?.statistics?.new?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Returning Revenue</span>
                      <span className="text-lg font-bold text-gray-900">
                        Rs. {segmentationData?.statistics?.returning?.totalRevenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">High Value Customers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchases
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Services Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {segmentationData?.segments?.highValue?.map((customer, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.customerName || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">{customer.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Rs. {customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.purchaseCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.serviceCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
