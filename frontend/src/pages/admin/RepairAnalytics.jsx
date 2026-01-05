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
import { Line, Bar, Pie } from 'react-chartjs-2';
import { FaWrench, FaArrowLeft, FaUsers, FaCheckCircle, FaClock, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
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

const RepairAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    serviceRequestsByType: [],
    monthlyServiceVolume: [],
    repairStatusBreakdown: { allTime: [], currentMonth: [] },
    technicianPerformance: []
  });

  useEffect(() => {
    fetchRepairAnalytics();
  }, []);

  const fetchRepairAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [
        serviceRequestsRes,
        monthlyVolumeRes,
        statusBreakdownRes,
        technicianPerformanceRes
      ] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/services/by-type`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/services/monthly-volume`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/services/status-breakdown`, { headers }),
        fetch(`${process.env.REACT_APP_API_URL}/api/analytics/services/technician-performance`, { headers })
      ]);

      const [
        serviceRequests,
        monthlyVolume,
        statusBreakdown,
        technicianPerformance
      ] = await Promise.all([
        serviceRequestsRes.json(),
        monthlyVolumeRes.json(),
        statusBreakdownRes.json(),
        technicianPerformanceRes.json()
      ]);

      setData({
        serviceRequestsByType: serviceRequests.data || [],
        monthlyServiceVolume: monthlyVolume.data || [],
        repairStatusBreakdown: statusBreakdown.data || { allTime: [], currentMonth: [] },
        technicianPerformance: technicianPerformance.data || []
      });
    } catch (error) {
      console.error('Error fetching repair analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const serviceRequestsConfig = {
    labels: data.serviceRequestsByType.map(item => item._id || 'Unknown'),
    datasets: [
      {
        label: 'Service Requests',
        data: data.serviceRequestsByType.map(item => item.count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      }
    ]
  };

  const monthlyVolumeConfig = {
    labels: data.monthlyServiceVolume.map(item => `${item._id.year}/${String(item._id.month).padStart(2, '0')}`),
    datasets: [
      {
        label: 'Service Volume',
        data: data.monthlyServiceVolume.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1
      }
    ]
  };

  // Status breakdown chart configuration
  const statusBreakdownConfig = {
    labels: data.repairStatusBreakdown.allTime.map(item => {
      const statusLabels = {
        'pending': 'Pending',
        'assigned': 'Assigned',
        'in_progress': 'In Progress',
        'waiting_parts': 'Waiting Parts',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'rescheduled': 'Rescheduled'
      };
      return statusLabels[item._id] || item._id;
    }),
    datasets: [
      {
        label: 'Repair Status',
        data: data.repairStatusBreakdown.allTime.map(item => item.count),
        backgroundColor: [
          '#F59E0B', // Pending - Yellow
          '#3B82F6', // Assigned - Blue
          '#10B981', // In Progress - Green
          '#F97316', // Waiting Parts - Orange
          '#059669', // Completed - Dark Green
          '#EF4444', // Cancelled - Red
          '#8B5CF6'  // Rescheduled - Purple
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'assigned': return <FaUsers className="text-blue-500" />;
      case 'in_progress': return <FaWrench className="text-green-500" />;
      case 'completed': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Repair Analytics</h1>
          </div>
          <p className="text-gray-600">Service request insights and repair volume trends</p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {data.repairStatusBreakdown.allTime.map((status, index) => {
            const statusLabels = {
              'pending': 'Pending',
              'assigned': 'Assigned',
              'in_progress': 'In Progress',
              'waiting_parts': 'Waiting Parts',
              'completed': 'Completed',
              'cancelled': 'Cancelled',
              'rescheduled': 'Rescheduled'
            };
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  {getStatusIcon(status._id)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{statusLabels[status._id] || status._id}</p>
                    <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Requests by Type */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaWrench className="text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold">Service Requests by Type</h3>
            </div>
            <div className="h-64">
              <Bar data={serviceRequestsConfig} options={{
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

          {/* Repair Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaUsers className="text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Repair Status Breakdown</h3>
            </div>
            <div className="h-64">
              <Pie data={statusBreakdownConfig} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                }
              }} />
            </div>
          </div>

          {/* Monthly Service Volume */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaWrench className="text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Monthly Service Volume</h3>
            </div>
            <div className="h-64">
              <Line data={monthlyVolumeConfig} options={{
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

          {/* Technician Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <FaUsers className="text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold">Technician Performance</h3>
            </div>
            <div className="space-y-3">
              {data.technicianPerformance.slice(0, 5).map((tech, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tech._id.technicianName}</p>
                    <p className="text-sm text-gray-500">{tech._id.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{tech.totalAssigned} assigned</p>
                    <p className="text-sm text-gray-500">{tech.completionRate}% completion</p>
                  </div>
                </div>
              ))}
              {data.technicianPerformance.length === 0 && (
                <p className="text-gray-500 text-center py-4">No technician data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaWrench className="text-orange-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Service Types</p>
                <p className="text-2xl font-bold text-gray-900">{data.serviceRequestsByType.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaWrench className="text-blue-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.monthlyServiceVolume.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaUsers className="text-purple-600 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Technicians</p>
                <p className="text-2xl font-bold text-gray-900">{data.technicianPerformance.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Types Table */}
        {data.serviceRequestsByType.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Service Types Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.serviceRequestsByType.map((item, index) => {
                    const total = data.serviceRequestsByType.reduce((sum, i) => sum + i.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item._id || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Technician Performance Table */}
        {data.technicianPerformance.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Technician Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      In Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.technicianPerformance.map((tech, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tech._id.technicianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech._id.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech.totalAssigned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tech.inProgress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tech.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                          tech.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tech.completionRate}%
                        </span>
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

export default RepairAnalytics;
