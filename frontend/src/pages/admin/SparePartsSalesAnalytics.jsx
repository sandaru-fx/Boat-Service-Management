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
import { FaArrowLeft, FaShoppingCart, FaChartLine, FaUsers, FaDollarSign, FaTrophy } from 'react-icons/fa';
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

const SparePartsSalesAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [data, setData] = useState({
    salesTrends: [],
    topProducts: [],
    revenueByCategory: [],
    monthlyPerformance: [],
    orderStatusDistribution: [],
    customerFrequency: []
  });

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchSalesAnalytics();
  }, [selectedPeriod]);

  const fetchSalesAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Fetch all sales analytics data
      const [
        trendsRes,
        topProductsRes,
        revenueRes,
        monthlyRes,
        statusRes,
        frequencyRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/sales-trends?period=${selectedPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/top-selling?limit=10`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/revenue-by-category`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/monthly-performance`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/order-status-distribution`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/spare-parts/customer-frequency`, { headers })
      ]);

      const [
        trends,
        topProducts,
        revenue,
        monthly,
        status,
        frequency
      ] = await Promise.all([
        trendsRes.json(),
        topProductsRes.json(),
        revenueRes.json(),
        monthlyRes.json(),
        statusRes.json(),
        frequencyRes.json()
      ]);

      setData({
        salesTrends: trends.data || [],
        topProducts: topProducts.data || [],
        revenueByCategory: revenue.data || [],
        monthlyPerformance: monthly.data || [],
        orderStatusDistribution: status.data || [],
        customerFrequency: frequency.data || []
      });

    } catch (error) {
      console.error('Error fetching sales analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const salesTrendsConfig = {
    labels: (data.salesTrends || []).map(item => `${item._id.year}/${item._id.month}/${item._id.day}`),
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: (data.salesTrends || []).map(item => item.totalRevenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Orders',
        data: (data.salesTrends || []).map(item => item.orderCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const topProductsConfig = {
    labels: (data.topProducts || []).map(item => item._id.productName),
    datasets: [
      {
        label: 'Quantity Sold',
        data: (data.topProducts || []).map(item => item.totalQuantitySold),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const revenueByCategoryConfig = {
    labels: (data.revenueByCategory || []).map(item => item._id),
    datasets: [
      {
        data: (data.revenueByCategory || []).map(item => item.totalRevenue),
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

  const monthlyPerformanceConfig = {
    labels: (data.monthlyPerformance || []).map(item => `${item._id.year}/${item._id.month}`),
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: (data.monthlyPerformance || []).map(item => item.totalRevenue),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const orderStatusConfig = {
    labels: (data.orderStatusDistribution || []).map(item => item._id),
    datasets: [
      {
        data: (data.orderStatusDistribution || []).map(item => item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  const customerFrequencyConfig = {
    labels: (data.customerFrequency || []).map(item => item.customerName),
    datasets: [
      {
        label: 'Order Count',
        data: (data.customerFrequency || []).map(item => item.orderCount),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  // Calculate summary statistics
  const totalRevenue = (data.salesTrends || []).reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalOrders = (data.salesTrends || []).reduce((sum, item) => sum + (item.orderCount || 0), 0);
  const totalCustomers = (data.customerFrequency || []).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sales analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Spare Parts Sales Analytics</h1>
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
          <p className="text-gray-600">Sales performance, top products, and revenue trends insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaDollarSign className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FaShoppingCart className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <FaChartLine className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {averageOrderValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Revenue Trends */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-green-600" />
              Sales Revenue Trends
            </h3>
            <p className="text-sm text-gray-600 mb-4">Daily revenue and order count trends (left axis: revenue, right axis: orders)</p>
            <Line data={salesTrendsConfig} options={{
              responsive: true,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  ticks: {
                    callback: function(value) {
                      return 'Rs. ' + value.toLocaleString();
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
            }} />
          </div>

          {/* Top Selling Products */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaTrophy className="mr-2 text-yellow-600" />
              Top Selling Products
            </h3>
            <p className="text-sm text-gray-600 mb-4">Products ranked by total quantity sold</p>
            <Bar data={topProductsConfig} options={{
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

          {/* Revenue by Category */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-purple-600" />
              Revenue by Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">Total sales revenue by product category (hover to see exact amounts)</p>
            <div className="h-64 flex items-center justify-center">
              <Pie data={revenueByCategoryConfig} options={{
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

          {/* Monthly Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Monthly Performance
            </h3>
            <p className="text-sm text-gray-600 mb-4">Total revenue generated each month</p>
            <Bar data={monthlyPerformanceConfig} options={{
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
                      return 'Rs. ' + value.toLocaleString();
                    }
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaShoppingCart className="mr-2 text-indigo-600" />
              Order Status Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">Number of orders by status (hover to see exact counts)</p>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={orderStatusConfig} options={{
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
                        return `${label}: ${value} orders`;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Customer Purchase Frequency */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaUsers className="mr-2 text-teal-600" />
              Top Customers by Purchase Frequency
            </h3>
            <p className="text-sm text-gray-600 mb-4">Customers ranked by number of orders placed</p>
            <Bar data={customerFrequencyConfig} options={{
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
        </div>

        {/* Top Products Table */}
        {data.topProducts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaTrophy className="mr-2 text-yellow-600" />
              Top Selling Products Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.topProducts || []).map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product._id.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product._id.partNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalQuantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {product.totalRevenue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.orderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Customers Table */}
        {data.customerFrequency.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-teal-600" />
              Top Customers by Purchase Frequency
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.customerFrequency || []).slice(0, 10).map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.customerEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rs. {customer.totalSpent?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.totalItems}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SparePartsSalesAnalytics;
