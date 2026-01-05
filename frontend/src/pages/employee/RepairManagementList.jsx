import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaEye, 
  FaUser, 
  FaTools, 
  FaCalendarAlt, 
  FaSpinner,
  FaFilter,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlayCircle,
  FaBan,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RepairManagementList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchRepairs();
  }, [filters.status, pagination.current]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: 10
      });
      
      if (filters.status) {
        queryParams.append('status', filters.status);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/employee/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repairs');
      }

      const data = await response.json();
      
      if (data.success) {
        setRepairs(data.data);
        setPagination(prev => ({
          ...prev,
          pages: data.pagination.pages,
          total: data.pagination.total
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch repairs');
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
      setError(error.message);
      toast.error('Failed to load repair requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (repairId) => {
    navigate(`/employee/repair-management/${repairId}`);
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FaHourglassHalf className="text-yellow-600" />,
        label: 'Pending'
      },
      assigned: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FaUser className="text-blue-600" />,
        label: 'Assigned'
      },
      confirmed: { 
        color: 'bg-indigo-100 text-indigo-800', 
        icon: <FaCheckCircle className="text-indigo-600" />,
        label: 'Confirmed'
      },
      in_progress: { 
        color: 'bg-orange-100 text-orange-800', 
        icon: <FaPlayCircle className="text-orange-600" />,
        label: 'In Progress'
      },
      waiting_parts: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <FaExclamationTriangle className="text-purple-600" />,
        label: 'Waiting Parts'
      },
      completed: { 
        color: 'bg-green-100 text-green-800', 
        icon: <FaCheckCircle className="text-green-600" />,
        label: 'Completed'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        icon: <FaBan className="text-red-600" />,
        label: 'Cancelled'
      },
      rescheduled: { 
        color: 'bg-gray-100 text-gray-800', 
        icon: <FaCalendarAlt className="text-gray-600" />,
        label: 'Rescheduled'
      }
    };
    
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading repair requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchRepairs}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
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
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors mr-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Repair Management</h1>
          <p className="text-gray-600 mt-2">Manage all repair requests from customers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === status
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaHourglassHalf className="text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUser className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repairs.filter(r => r.status === 'assigned').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaPlayCircle className="text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repairs.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repairs.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Repair Requests List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Repair Requests</h2>
          </div>
          
          {repairs.length === 0 ? (
            <div className="text-center py-12">
              <FaTools className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No repair requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {repairs.map((repair) => {
                const statusInfo = getStatusInfo(repair.status);
                
                return (
                  <div key={repair._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">Booking ID:</span>
                            <span className="text-sm font-mono text-gray-900">{repair.bookingId}</span>
                          </div>
                          
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Customer</p>
                            <p className="text-sm text-gray-900">{repair.customer?.name}</p>
                            <p className="text-xs text-gray-500">{repair.customer?.email}</p>
                            <p className="text-sm font-medium text-gray-500 mt-2">Appointment</p>
                            <p className="text-sm text-gray-900">
                              {formatDateTime(repair.scheduledDateTime)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Boat Details</p>
                            <p className="text-sm text-gray-900">
                              {repair.boatDetails?.boatType} - {repair.boatDetails?.boatMake} {repair.boatDetails?.boatModel}
                            </p>
                            <p className="text-xs text-gray-500">Year: {repair.boatDetails?.boatYear}</p>
                            <p className="text-sm font-medium text-gray-500 mt-2">Assigned Technician</p>
                            <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                              repair.assignedTechnician?.name 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {repair.assignedTechnician?.name || 'Not assigned'}
                            </p>
                            {repair.assignedTechnician?.employeeData?.position && (
                              <p className="text-xs text-gray-500">
                                {repair.assignedTechnician.employeeData.position}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-500">Service</p>
                            <p className="text-sm text-gray-900 capitalize">
                              {repair.serviceType?.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {repair.problemDescription?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button
                          onClick={() => handleViewDetails(repair._id)}
                          className="inline-flex items-center px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                        >
                          <FaEye className="mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                  page === pagination.current
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairManagementList;
