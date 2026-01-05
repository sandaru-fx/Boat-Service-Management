import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaShip, FaUsers, FaMapMarkerAlt, FaEye, FaEdit, FaTimes, FaSpinner, FaFilter, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getMyRides, cancelRide } from './rideApi';
import { getMyBoatBookings, cancelBoatBooking, updateBoatBooking, deleteBoatBooking } from '../../api/boatBookingApi';

const MyRides = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [rides, setRides] = useState([]);
  const [boatBookings, setBoatBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredRides, setFilteredRides] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch rides and boat bookings
  const fetchRides = async (page = 1, status = null) => {
    try {
      setLoading(true);
      
      // Fetch both old rides and new boat bookings
      const [ridesResponse, boatBookingsResponse] = await Promise.all([
        getMyRides(status, page, 10).catch(() => ({ success: false, data: { bookings: [] } })),
        getMyBoatBookings(status, page, 10).catch(() => ({ success: false, data: { bookings: [] } }))
      ]);
      
      const allRides = [];
      
      // Add old rides
      if (ridesResponse.success) {
        allRides.push(...ridesResponse.data.bookings.map(ride => ({
          ...ride,
          type: 'old-ride'
        })));
      }
      
      // Add new boat bookings
      if (boatBookingsResponse.success) {
        allRides.push(...boatBookingsResponse.data.bookings.map(booking => ({
          ...booking,
          type: 'boat-booking',
          // Map boat booking fields to ride fields for display
          boatType: booking.packageName,
          journeyType: booking.boatType || 'Package Booking',
          rideDate: booking.bookingDate,
          rideTime: booking.bookingDate ? new Date(booking.bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
          duration: booking.duration || 'N/A',
          passengers: booking.numberOfPassengers,
          totalPrice: booking.totalPrice,
          specialRequests: booking.passengerNames,
          assignedBoat: booking.assignedBoat,
          assignedCaptain: booking.assignedCaptain,
          // Map nested status to top-level status
          status: booking.employeeInfo?.status || 'Pending Review',
          // Ensure packageId is preserved for editing
          packageId: booking.packageId
        })));
      }
      
      setRides(allRides);
      setFilteredRides(allRides);
      
      // Use pagination from whichever response has data
      const responseWithPagination = ridesResponse.success ? ridesResponse : boatBookingsResponse;
      if (responseWithPagination.success) {
        setTotalPages(responseWithPagination.data.pagination.pages);
        setCurrentPage(responseWithPagination.data.pagination.current);
      }
      
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Failed to load your rides. Please try again.');
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
        ride.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRides(filtered);
  }, [rides, statusFilter, searchTerm]);

  // Handle view details
  const handleViewDetails = (ride) => {
    if (ride.type === 'boat-booking') {
      // For boat bookings, navigate to booking confirmation page
      navigate('/booking-confirmation', { 
        state: { 
          booking: ride,
          package: ride.packageId
        } 
      });
    } else {
      // For old rides, navigate to old ride confirmation page
      navigate(`/ride-confirmation/${ride._id}`);
    }
  };

  // Handle ride editing
  const handleEditRide = (ride) => {
    if (ride.type === 'boat-booking') {
      // For boat bookings, navigate to booking form with pre-filled data
      navigate('/booking', { 
        state: { 
          editMode: true, 
          bookingId: ride._id,
          packageId: ride.packageId,
          bookingData: ride
        } 
      });
    } else {
      // For old rides, navigate to old ride booking form
      navigate('/boat-rides', { 
        state: { 
          editMode: true, 
          rideId: ride._id,
          rideData: ride
        } 
      });
    }
  };

  // Handle ride cancellation
  const handleCancelRide = async (rideId, rideType, reason = '') => {
    if (!window.confirm('Are you sure you want to cancel this ride booking?')) {
      return;
    }

    try {
      setCancellingId(rideId);
      
      let response;
      if (rideType === 'boat-booking') {
        response = await cancelBoatBooking(rideId, reason);
      } else {
        response = await cancelRide(rideId, reason);
      }
      
      if (response.success) {
        toast.success('Ride booking cancelled successfully');
        // Refresh the rides list
        fetchRides(currentPage, statusFilter === 'all' ? null : statusFilter);
      } else {
        throw new Error(response.message || 'Failed to cancel ride');
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast.error(error.message || 'Failed to cancel ride. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Handle ride deletion
  const handleDeleteRide = async (rideId, rideType) => {
    // Find the ride to check its status
    const ride = rides.find(r => r._id === rideId);
    
    // Check if ride is in progress
    if (ride && isInProgress(ride)) {
      toast.error('Cannot delete ride while in progress. Please contact support for assistance.', {
        duration: 5000,
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this ride booking? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingId(rideId);
      
      let response;
      if (rideType === 'boat-booking') {
        response = await deleteBoatBooking(rideId);
      } else {
        // For old rides, we might need to implement delete functionality
        toast.error('Delete functionality not available for this ride type');
        return;
      }
      
      if (response.success) {
        toast.success('Ride booking deleted successfully');
        // Refresh the rides list
        fetchRides(currentPage, statusFilter === 'all' ? null : statusFilter);
      } else {
        throw new Error(response.message || 'Failed to delete ride');
      }
    } catch (error) {
      console.error('Error deleting ride:', error);
      toast.error(error.message || 'Failed to delete ride. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'Pending Review': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
      case 'Confirmed': return 'text-green-600 bg-green-100';
      case 'in-progress':
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'completed':
      case 'Completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled':
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if ride can be cancelled
  const canCancelRide = (ride) => {
    if (!ride.status) return false;
    
    const rideDate = new Date(ride.rideDate);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return ride.status === 'pending' || ride.status === 'Pending Review' || 
           (ride.status === 'confirmed' || ride.status === 'Confirmed') && rideDate > threeDaysFromNow;
  };

  // Check if ride can be deleted
  const canDeleteRide = (ride) => {
    if (!ride.status) return false;
    
    // Can delete if pending or confirmed (not in progress or completed)
    return ride.status === 'pending' || ride.status === 'Pending Review' || 
           ride.status === 'confirmed' || ride.status === 'Confirmed';
  };

  // Check if ride is in progress
  const isInProgress = (ride) => {
    return ride.status === 'in-progress' || ride.status === 'In Progress';
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
          <p className="text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Ride Bookings</h1>
              <p className="text-gray-600 mt-2">Manage your boat ride bookings</p>
            </div>
            <button
              onClick={() => navigate('/customer')}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Book New Ride
            </button>
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
                  placeholder="Search by boat type, journey type, or name..."
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
            <p className="text-gray-600 mb-6">
              {rides.length === 0 
                ? "You haven't booked any rides yet." 
                : "No rides match your current filters."
              }
            </p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Book Your First Ride
            </button>
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
                        {ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : 'Unknown'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2 text-teal-600" />
                        <span>{formatDate(ride.rideDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-teal-600" />
                        <span>{ride.rideTime} ({ride.duration})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaUsers className="mr-2 text-teal-600" />
                        <span>{ride.passengers} passengers</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-teal-600" />
                        <span>LKR {ride.totalPrice.toLocaleString()}</span>
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

                    {/* Passenger Names */}
                    {ride.specialRequests && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-1">Passenger Names</h4>
                        <p className="text-sm text-gray-700">{ride.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => handleViewDetails(ride)}
                      className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </button>

                    {canCancelRide(ride) && (
                      <button
                        onClick={() => handleEditRide(ride)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </button>
                    )}


                    <button
                      onClick={() => handleDeleteRide(ride._id, ride.type)}
                      disabled={!canDeleteRide(ride)}
                      className={`flex items-center justify-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        canDeleteRide(ride) 
                          ? 'bg-red-800 text-white hover:bg-red-900' 
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <FaTimes className="mr-2" />
                      Delete
                    </button>
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
      </div>
    </div>
  );
};

export default MyRides;
