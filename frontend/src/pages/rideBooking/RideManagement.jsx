import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaShip, FaUsers, FaMapMarkerAlt, FaEye, FaEdit, FaCheck, FaTimes, FaSpinner, FaFilter, FaSearch, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getAllRides, assignBoatAndCaptain, updateRideStatus, processRefund } from './rideApi';

const RideManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRides, setFilteredRides] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Assignment form state
  const [assignmentData, setAssignmentData] = useState({
    assignedBoat: '',
    assignedCaptain: ''
  });

  // Status form state
  const [statusData, setStatusData] = useState({
    status: ''
  });

  // Refund form state
  const [refundData, setRefundData] = useState({
    refundAmount: 0,
    reason: ''
  });

  // Fetch rides
  const fetchRides = async (page = 1, status = null) => {
    try {
      setLoading(true);
      const response = await getAllRides(status, null, page, 10);
      
      if (response.success) {
        setRides(response.data.bookings);
        setFilteredRides(response.data.bookings);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(response.data.pagination.current);
      } else {
        throw new Error(response.message || 'Failed to fetch rides');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  // Filter rides based on status and search term
  useEffect(() => {
    let filtered = rides;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ride => ride.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ride =>
        ride.boatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.journeyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRides(filtered);
  }, [rides, statusFilter, searchTerm]);

  // Handle assignment
  const handleAssignment = async () => {
    if (!assignmentData.assignedBoat || !assignmentData.assignedCaptain) {
      toast.error('Please fill in all assignment fields');
      return;
    }

    try {
      setProcessing(true);
      const response = await assignBoatAndCaptain(selectedRide._id, assignmentData);
      
      if (response.success) {
        toast.success('Boat and captain assigned successfully');
        setShowAssignmentModal(false);
        setSelectedRide(null);
        setAssignmentData({ assignedBoat: '', assignedCaptain: '' });
        fetchRides(currentPage, statusFilter === 'all' ? null : statusFilter);
      } else {
        throw new Error(response.message || 'Failed to assign boat and captain');
      }
    } catch (error) {
      console.error('Error assigning boat and captain:', error);
      toast.error(error.message || 'Failed to assign boat and captain. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusData.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      setProcessing(true);
      const response = await updateRideStatus(selectedRide._id, statusData.status);
      
      if (response.success) {
        toast.success('Ride status updated successfully');
        setShowStatusModal(false);
        setSelectedRide(null);
        setStatusData({ status: '' });
        fetchRides(currentPage, statusFilter === 'all' ? null : statusFilter);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle refund
  const handleRefund = async () => {
    if (!refundData.refundAmount || !refundData.reason) {
      toast.error('Please fill in all refund fields');
      return;
    }

    try {
      setProcessing(true);
      const response = await processRefund(selectedRide._id, refundData);
      
      if (response.success) {
        toast.success('Refund processed successfully');
        setShowRefundModal(false);
        setSelectedRide(null);
        setRefundData({ refundAmount: 0, reason: '' });
        fetchRides(currentPage, statusFilter === 'all' ? null : statusFilter);
      } else {
        throw new Error(response.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(error.message || 'Failed to process refund. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRides(page, statusFilter === 'all' ? null : statusFilter);
  };

  if (loading && rides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ride bookings...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Ride Management</h1>
              <p className="text-gray-600 mt-2">Manage boat ride bookings, assign captains, and track schedules</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, boat type, or journey type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rides List */}
        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaShip className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-600">
              {rides.length === 0 
                ? "No ride bookings have been made yet." 
                : "No rides match your current filters."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Ride Information */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {ride.boatType} - {ride.journeyType}
                      </h3>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </span>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaUser className="mr-2 text-teal-600" />
                          <span>{ride.customerName}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaEnvelope className="mr-2 text-teal-600" />
                          <span>{ride.customerEmail}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaPhone className="mr-2 text-teal-600" />
                          <span>{ride.customerPhone}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="mr-2 text-teal-600" />
                          <span>{formatDate(ride.rideDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaClock className="mr-2 text-teal-600" />
                          <span>{ride.rideTime} ({ride.duration}h)</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaUsers className="mr-2 text-teal-600" />
                          <span>{ride.passengers} passengers</span>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Information */}
                    {(ride.assignedBoat || ride.assignedCaptain) && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-md">
                        <h4 className="font-medium text-blue-900 mb-2">Assignment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                          {ride.assignedBoat && (
                            <p><strong>Boat:</strong> {ride.assignedBoat}</p>
                          )}
                          {ride.assignedCaptain && (
                            <p><strong>Captain:</strong> {ride.assignedCaptain}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {ride.specialRequests && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-1">Special Requests</h4>
                        <p className="text-sm text-gray-700">{ride.specialRequests}</p>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Total: LKR {ride.totalPrice.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>Payment: {ride.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => navigate(`/ride-confirmation/${ride._id}`)}
                      className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </button>

                    {ride.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setShowAssignmentModal(true);
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-2" />
                        Assign
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedRide(ride);
                        setStatusData({ status: ride.status });
                        setShowStatusModal(true);
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <FaCheck className="mr-2" />
                      Update Status
                    </button>

                    {ride.paymentStatus === 'paid' && ride.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedRide(ride);
                          setRefundData({ refundAmount: ride.totalPrice, reason: '' });
                          setShowRefundModal(true);
                        }}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <FaTimes className="mr-2" />
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'text-white bg-teal-600 border border-teal-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Boat and Captain</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boat</label>
                  <input
                    type="text"
                    value={assignmentData.assignedBoat}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, assignedBoat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter boat name/ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Captain</label>
                  <input
                    type="text"
                    value={assignmentData.assignedCaptain}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, assignedCaptain: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter captain name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignment}
                  disabled={processing}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {processing ? <FaSpinner className="animate-spin" /> : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusData.status}
                    onChange={(e) => setStatusData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={processing}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {processing ? <FaSpinner className="animate-spin" /> : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Refund</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount (LKR)</label>
                  <input
                    type="number"
                    value={refundData.refundAmount}
                    onChange={(e) => setRefundData(prev => ({ ...prev, refundAmount: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter refund amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={refundData.reason}
                    onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Enter refund reason"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? <FaSpinner className="animate-spin" /> : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideManagement;
