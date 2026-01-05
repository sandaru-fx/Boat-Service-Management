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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FaShip, FaArrowLeft, FaCalendarAlt, FaUsers, FaClock, FaChartBar } from 'react-icons/fa';
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

const BoatRidesAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bookingTrends: [],
    statusDistribution: [],
    boatTypePerformance: [],
    journeyTypePopularity: [],
    capacityUtilization: [],
    durationAnalytics: []
  });

  useEffect(() => {
    fetchBoatRideAnalytics();
  }, []);

  const fetchBoatRideAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [
        bookingTrendsRes,
        statusDistributionRes,
        boatTypePerformanceRes,
        journeyTypePopularityRes,
        capacityUtilizationRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/boat-rides/trends?period=30d`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/boat-rides/status-distribution`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/boat-rides/boat-type-popularity`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/boat-rides/journey-type-popularity`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/boat-rides/passenger-capacity`, { headers })
      ]);

      const [
        bookingTrends,
        statusDistribution,
        boatTypePerformance,
        journeyTypePopularity,
        capacityUtilization
      ] = await Promise.all([
        bookingTrendsRes.json(),
        statusDistributionRes.json(),
        boatTypePerformanceRes.json(),
        journeyTypePopularityRes.json(),
        capacityUtilizationRes.json()
      ]);

      setData({
        bookingTrends: bookingTrends.data || [],
        statusDistribution: statusDistribution.data || [],
        boatTypePerformance: boatTypePerformance.data || [],
        journeyTypePopularity: journeyTypePopularity.data || [],
        capacityUtilization: capacityUtilization.data || [],
        durationAnalytics: [] // Will be calculated from booking trends
      });
    } catch (error) {
      console.error('Error fetching boat ride analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const bookingTrendsConfig = {
    labels: data.bookingTrends.map(item => `${item._id.year}/${String(item._id.month).padStart(2, '0')}/${String(item._id.day).padStart(2, '0')}`),
    datasets: [
      {
        label: 'Bookings',
        data: data.bookingTrends.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1
      }
    ]
  };

  const statusDistributionConfig = {
    labels: data.statusDistribution.map(item => item._id),
    datasets: [
      {
        data: data.statusDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const boatTypePerformanceConfig = {
    labels: data.boatTypePerformance.map(item => item._id),
    datasets: [
      {
        label: 'Bookings',
        data: data.boatTypePerformance.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1
      }
    ]
  };

  const journeyTypePopularityConfig = {
    labels: data.journeyTypePopularity.map(item => item._id),
    datasets: [
      {
        label: 'Bookings',
        data: data.journeyTypePopularity.map(item => item.count),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  const capacityUtilizationConfig = {
    labels: data.capacityUtilization.map(item => `${item._id} passengers`),
    datasets: [
      {
        label: 'Bookings',
        data: data.capacityUtilization.map(item => item.count),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1
      }
    ]
  };

  // Calculate summary statistics
  const totalBookings = data.bookingTrends.reduce((sum, item) => sum + item.count, 0);
  const completedBookings = data.statusDistribution.find(item => item._id === 'completed')?.count || 0;
  const cancelledBookings = data.statusDistribution.find(item => item._id === 'cancelled')?.count || 0;
  const completionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;
  const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;
  const mostPopularBoatType = data.boatTypePerformance.length > 0 ? data.boatTypePerformance[0]._id : 'N/A';
  const mostPopularJourney = data.journeyTypePopularity.length > 0 ? data.journeyTypePopularity[0]._id : 'N/A';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Boat Rides Analytics</h1>
          </div>
          <p className="text-gray-600">Booking trends, performance metrics, and operational insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <FaCalendarAlt className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaChartBar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaShip className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Popular Boat</p>
                <p className="text-lg font-bold text-gray-900">{mostPopularBoatType}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Popular Journey</p>
                <p className="text-lg font-bold text-gray-900">{mostPopularJourney}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Trends */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends (30 Days)</h3>
            <div className="h-64">
              <Line 
                data={bookingTrendsConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
            <div className="h-64">
              <Doughnut 
                data={statusDistributionConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Boat Type Performance */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Boat Type Performance</h3>
            <div className="h-64">
              <Bar 
                data={boatTypePerformanceConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>

          {/* Journey Type Popularity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Journey Type Popularity</h3>
            <div className="h-64">
              <Bar 
                data={journeyTypePopularityConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Capacity Utilization</h3>
          <div className="h-64">
            <Bar 
              data={capacityUtilizationConfig} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Cancellation Rate</h4>
            <p className="text-3xl font-bold text-red-600">{cancellationRate}%</p>
            <p className="text-sm text-gray-600 mt-1">Of total bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Average Group Size</h4>
            <p className="text-3xl font-bold text-teal-600">
              {data.capacityUtilization.length > 0 
                ? (data.capacityUtilization.reduce((sum, item) => sum + (item._id * item.count), 0) / 
                   data.capacityUtilization.reduce((sum, item) => sum + item.count, 0)).toFixed(1)
                : '0'
              }
            </p>
            <p className="text-sm text-gray-600 mt-1">Passengers per booking</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Peak Capacity</h4>
            <p className="text-3xl font-bold text-green-600">
              {data.capacityUtilization.length > 0 
                ? Math.max(...data.capacityUtilization.map(item => item._id))
                : '0'
              }
            </p>
            <p className="text-sm text-gray-600 mt-1">Maximum passengers booked</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoatRidesAnalytics;