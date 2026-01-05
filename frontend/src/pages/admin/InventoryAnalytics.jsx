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
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaArrowLeft, FaBox, FaChartPie, FaExclamationTriangle, FaChartLine, FaWarehouse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InventoryAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [data, setData] = useState({
    inventoryOverview: null,
    categoryAnalytics: [],
    companyAnalytics: [],
    stockAlerts: [],
    timeAnalytics: [],
    usageAnalytics: []
  });

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [selectedPeriod]);

  const fetchInventoryAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Fetch all inventory analytics data
      const [
        overviewRes,
        categoryRes,
        companyRes,
        alertsRes,
        timeRes,
        usageRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/inventory-overview`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/category-analytics`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/company-analytics`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/stock-alerts`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/time-analytics?period=${selectedPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/usage-analytics?period=${selectedPeriod}`, { headers })
      ]);

      const [
        overview,
        category,
        company,
        alerts,
        time,
        usage
      ] = await Promise.all([
        overviewRes.json(),
        categoryRes.json(),
        companyRes.json(),
        alertsRes.json(),
        timeRes.json(),
        usageRes.json()
      ]);

      setData({
        inventoryOverview: overview.data,
        categoryAnalytics: category.data || [],
        companyAnalytics: company.data || [],
        stockAlerts: alerts.data || [],
        timeAnalytics: time.data?.monthlyAdditions || [],
        usageAnalytics: usage.data?.partsUsage || []
      });

    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const stockLevelsConfig = {
    labels: (data.categoryAnalytics || []).map(item => item.category),
    datasets: [
      {
        label: 'Stock Quantity',
        data: (data.categoryAnalytics || []).map(item => item.totalQuantity),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const inventoryValueConfig = {
    labels: (data.timeAnalytics || []).map(item => `${item.year}/${item.month}`),
    datasets: [
      {
        label: 'Products Added',
        data: (data.timeAnalytics || []).map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const companyDistributionConfig = {
    labels: (data.companyAnalytics || []).map(item => item.company),
    datasets: [
      {
        data: (data.companyAnalytics || []).map(item => item.totalValue),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ]
      }
    ]
  };

  const categoryPerformanceConfig = {
    labels: (data.categoryAnalytics || []).map(item => item.category),
    datasets: [
      {
        data: (data.categoryAnalytics || []).map(item => item.totalValue),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  const usageTrendsConfig = {
    labels: (data.usageAnalytics || []).map(item => item.partNumber),
    datasets: [
      {
        label: 'Quantity Used',
        data: (data.usageAnalytics || []).map(item => item.totalQuantityUsed),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory analytics...</p>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-gray-600">Inventory management, stock levels, and supplier performance insights</p>
        </div>

        {/* Key Metrics */}
        {data.inventoryOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FaBox className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{data.inventoryOverview.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <FaWarehouse className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {data.inventoryOverview.totalInventoryValue?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900">{data.inventoryOverview.lowStockProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FaChartLine className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{data.inventoryOverview.categoriesCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Levels by Category */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartPie className="mr-2 text-blue-600" />
              Stock Levels by Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">Total quantity of items in each category</p>
            <Bar data={stockLevelsConfig} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>

          {/* Inventory Value Over Time */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-green-600" />
              Products Added Over Time
            </h3>
            <p className="text-sm text-gray-600 mb-4">Number of new products added to inventory each month</p>
            <Line data={inventoryValueConfig} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
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
            }} />
          </div>

          {/* Company Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaBox className="mr-2 text-purple-600" />
              Company Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">Total inventory value by company (hover to see exact amounts)</p>
            <div className="h-64 flex items-center justify-center">
              <Pie data={companyDistributionConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        return `${label}: Rs. ${value.toLocaleString()}`;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartPie className="mr-2 text-orange-600" />
              Category Performance
            </h3>
            <p className="text-sm text-gray-600 mb-4">Total inventory value by category (hover to see exact amounts)</p>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={categoryPerformanceConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        return `${label}: Rs. ${value.toLocaleString()}`;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {data.stockAlerts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-600" />
              Low Stock Alerts
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.stockAlerts || []).slice(0, 10).map((alert, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {alert.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.currentStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {alert.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Usage Trends */}
        {data.usageAnalytics.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-indigo-600" />
              Parts Usage in Repairs
            </h3>
            <p className="text-sm text-gray-600 mb-4">Quantity of parts used in completed boat repairs</p>
            <Line data={usageTrendsConfig} options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAnalytics;
