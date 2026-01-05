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
import { FaUsers, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
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

const UserAnalytics = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    registrationTrends: [],
    userDistribution: { active: 0, inactive: 0 },
    geographicDistribution: []
  });

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  useEffect(() => {
    fetchUserAnalytics();
  }, [selectedPeriod]);

  const fetchUserAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [
        registrationTrendsRes,
        userDistributionRes,
        geographicDistributionRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/users/registration-trends?period=${selectedPeriod}`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/users/distribution`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/users/geographic`, { headers })
      ]);

      const [
        registrationTrends,
        userDistribution,
        geographicDistribution
      ] = await Promise.all([
        registrationTrendsRes.json(),
        userDistributionRes.json(),
        geographicDistributionRes.json()
      ]);

      setData({
        registrationTrends: registrationTrends.data || [],
        userDistribution: userDistribution.data || { active: 0, inactive: 0 },
        geographicDistribution: geographicDistribution.data || []
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const registrationTrendsConfig = {
    labels: data.registrationTrends.map(item => {
      const { year, month, day, hour } = item._id;
      if (selectedPeriod === '24h') {
        return `${hour}:00`;
      } else if (selectedPeriod === '7d' || selectedPeriod === '30d') {
        return `${month}/${day}`;
      } else {
        return `${year}/${month}`;
      }
    }),
    datasets: [
      {
        label: 'New Registrations',
        data: data.registrationTrends.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const userDistributionConfig = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [data.userDistribution.active, data.userDistribution.inactive],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const geographicDistributionConfig = {
    labels: data.geographicDistribution.map(item => item._id),
    datasets: [
      {
        label: 'Users',
        data: data.geographicDistribution.map(item => item.count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      }
    ]
  };

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
            <h1 className="text-3xl font-bold text-gray-900">User Analytics</h1>
          </div>
          <p className="text-gray-600">Comprehensive user insights and registration trends</p>
        </div>

        {/* Time Period Selector */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            {periods.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaUsers className="text-teal-600 mr-2" />
              <h3 className="text-lg font-semibold">Registration Trends</h3>
            </div>
            <div className="h-64">
              <Line data={registrationTrendsConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaUsers className="text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">User Distribution</h3>
            </div>
            <div className="h-64">
              <Doughnut data={userDistributionConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} />
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <div className="flex items-center mb-4">
              <FaMapMarkerAlt className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Geographic Distribution by District</h3>
            </div>
            <div className="h-64">
              <Bar data={geographicDistributionConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 90,
                      minRotation: 90,
                      font: {
                        size: 10
                      }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaUsers className="text-teal-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.userDistribution.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaUsers className="text-red-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.userDistribution.inactive}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Districts Covered</p>
                <p className="text-2xl font-bold text-gray-900">{data.geographicDistribution.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
