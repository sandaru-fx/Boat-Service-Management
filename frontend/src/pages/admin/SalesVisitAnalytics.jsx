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
import { FaArrowLeft, FaShip, FaChartLine, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaEye } from 'react-icons/fa';
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

const SalesVisitAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [data, setData] = useState({
    visitTrends: [],
    categoryDistribution: [],
    geographicDistribution: [],
    peakHours: [],
    conversionRates: [],
    statusAnalytics: []
  });

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchSalesVisitAnalytics();
  }, [selectedPeriod]);

  const fetchSalesVisitAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

      // Fetch all sales visit analytics data
      const [
        trendsRes,
        categoryRes,
        geographicRes,
        hoursRes,
        conversionRes,
        statusRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/trends?period=${selectedPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/category-distribution`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/geographic-distribution`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/peak-hours`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/conversion-rates`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/sales-visits/status-analytics`, { headers })
      ]);

      const [
        trends,
        category,
        geographic,
        hours,
        conversion,
        status
      ] = await Promise.all([
        trendsRes.json(),
        categoryRes.json(),
        geographicRes.json(),
        hoursRes.json(),
        conversionRes.json(),
        statusRes.json()
      ]);

      setData({
        visitTrends: trends.data || [],
        categoryDistribution: category.data || [],
        geographicDistribution: geographic.data || [],
        peakHours: hours.data || [],
        conversionRates: conversion.data || [],
        statusAnalytics: status.data || []
      });

    } catch (error) {
      console.error('Error fetching sales visit analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const visitTrendsConfig = {
    labels: (data.visitTrends || []).map(item => `${item._id.year}/${item._id.month}/${item._id.day}`),
    datasets: [
      {
        label: 'Visit Bookings',
        data: (data.visitTrends || []).map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const categoryDistributionConfig = {
    labels: (data.categoryDistribution || []).map(item => item.category),
    datasets: [
      {
        data: (data.categoryDistribution || []).map(item => item.count),
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


  const peakHoursConfig = {
    labels: (data.peakHours || []).map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Bookings',
        data: (data.peakHours || []).map(item => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const statusAnalyticsConfig = {
    labels: (data.statusAnalytics || []).map(item => item.status),
    datasets: [
      {
        data: (data.statusAnalytics || []).map(item => item.count),
        backgroundColor: [
          '#FF6384', // Pending - Red
          '#36A2EB', // Confirmed - Blue
          '#FFCE56', // In Progress - Yellow
          '#4BC0C0', // Completed - Green
          '#9966FF', // Cancelled - Purple
          '#FF9F40'  // Other - Orange
        ]
      }
    ]
  };

  // Calculate summary statistics
  const totalVisits = (data.visitTrends || []).reduce((sum, item) => sum + (item.count || 0), 0);
  const topCategory = (data.categoryDistribution || []).length > 0 ? data.categoryDistribution[0].category : 'N/A';
  const peakHour = (data.peakHours || []).length > 0 ? `${data.peakHours[0].hour}:00` : 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sales visit analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Sales Visit Analytics</h1>
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
          <p className="text-gray-600">Sales visit insights, customer preferences, and booking trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <FaUsers className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <FaShip className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-gray-900">{topCategory}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <FaClock className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">{peakHour}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Visit Trends */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Visit Booking Trends
            </h3>
            <p className="text-sm text-gray-600 mb-4">Daily sales visit bookings over time</p>
            <Line data={visitTrendsConfig} options={{
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

          {/* Category Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaShip className="mr-2 text-green-600" />
              Popular Boat Categories
            </h3>
            <p className="text-sm text-gray-600 mb-4">Most requested boat categories for visits (hover to see exact counts)</p>
            <div className="h-64 flex items-center justify-center">
              <Pie data={categoryDistributionConfig} options={{
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
                        return `${label}: ${value} visits`;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>


          {/* Peak Hours */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaClock className="mr-2 text-orange-600" />
              Peak Booking Hours
            </h3>
            <p className="text-sm text-gray-600 mb-4">Most popular hours for booking sales visits</p>
            <Bar data={peakHoursConfig} options={{
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

          {/* Appointment Status Analytics */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-indigo-600" />
              Appointment Status Distribution
            </h3>
            <p className="text-sm text-gray-600 mb-4">Current status of all sales visit appointments (hover to see exact counts)</p>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={statusAnalyticsConfig} options={{
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
                        const percentage = context.parsed / context.dataset.data.reduce((a, b) => a + b, 0) * 100;
                        return `${label}: ${value} (${percentage.toFixed(1)}%)`;
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        {data.geographicDistribution.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-teal-600" />
              Geographic Distribution
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.geographicDistribution || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((item.count / totalVisits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointment Status Details */}
        {data.statusAnalytics.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-indigo-600" />
              Appointment Status Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(data.statusAnalytics || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                          item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.status === 'Pending' ? 'Awaiting confirmation' :
                         item.status === 'Confirmed' ? 'Confirmed by employee' :
                         item.status === 'In Progress' ? 'Visit in progress' :
                         item.status === 'Completed' ? 'Visit completed successfully' :
                         item.status === 'Cancelled' ? 'Visit cancelled' :
                         'Unknown status'}
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

export default SalesVisitAnalytics;
