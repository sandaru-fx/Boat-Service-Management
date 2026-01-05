import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaPrint, FaCalendarAlt, FaUser, FaShip, FaClock, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getRideById, generateRidePDFConfirmation } from './rideApi';

const RideConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchRideData();
  }, [id]);

  const fetchRideData = async () => {
    try {
      setLoading(true);
      const response = await getRideById(id);
      
      if (response.success) {
        setRideData(response.data.booking);
      } else {
        throw new Error(response.message || 'Failed to fetch ride data');
      }
    } catch (error) {
      console.error('Error fetching ride data:', error);
      toast.error('Failed to load ride confirmation. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const blob = await generateRidePDFConfirmation(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ride-booking-${rideData._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ride confirmation...</p>
        </div>
      </div>
    );
  }

  if (!rideData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Ride booking not found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-teal-600 hover:text-teal-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {downloadingPDF ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaDownload className="mr-2" />
                )}
                Download PDF
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaCheckCircle className="text-4xl text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Ride Booking Confirmed!</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Your boat ride has been successfully booked. Here are your booking details:
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUser className="mr-2 text-teal-600" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {rideData.customerName}</p>
                <p><span className="font-medium">Email:</span> {rideData.customerEmail}</p>
                <p><span className="font-medium">Phone:</span> {rideData.customerPhone}</p>
                {rideData.emergencyContact && (
                  <p><span className="font-medium">Emergency Contact:</span> {rideData.emergencyContact}</p>
                )}
              </div>
            </div>

            {/* Ride Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaShip className="mr-2 text-teal-600" />
                Ride Information
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {formatDate(rideData.rideDate)}</p>
                <p><span className="font-medium">Time:</span> {rideData.rideTime}</p>
                <p><span className="font-medium">Duration:</span> {rideData.duration} hours</p>
                <p><span className="font-medium">Boat Type:</span> {rideData.boatType}</p>
                <p><span className="font-medium">Journey Type:</span> {rideData.journeyType}</p>
                <p><span className="font-medium">Passengers:</span> {rideData.passengers}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Booking Status</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rideData.status)}`}>
                  {rideData.status.charAt(0).toUpperCase() + rideData.status.slice(1)}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Status</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(rideData.paymentStatus)}`}>
                  {rideData.paymentStatus.charAt(0).toUpperCase() + rideData.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          {(rideData.assignedBoat || rideData.assignedCaptain) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Assignment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rideData.assignedBoat && (
                  <div>
                    <span className="font-medium">Assigned Boat:</span> {rideData.assignedBoat}
                  </div>
                )}
                {rideData.assignedCaptain && (
                  <div>
                    <span className="font-medium">Assigned Captain:</span> {rideData.assignedCaptain}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Requests */}
          {rideData.specialRequests && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                {rideData.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base Price ({rideData.boatType} - {rideData.journeyType}):</span>
              <span className="font-semibold">LKR {rideData.basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Passenger Price ({rideData.passengers} × LKR {rideData.passengerPrice}):</span>
              <span className="font-semibold">LKR {(rideData.passengers * rideData.passengerPrice).toLocaleString()}</span>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total Price:</span>
              <span className="text-teal-600">LKR {rideData.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <p>
                <strong>Payment:</strong> Payment will be collected on the day of your ride. 
                You can pay by cash or card at our service center.
              </p>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <p>
                <strong>Arrival Time:</strong> Please arrive 30 minutes before your scheduled time 
                for safety briefing and preparation.
              </p>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <p>
                <strong>Cancellation Policy:</strong> Free cancellation up to 3 days before your ride. 
                Cancellations within 3 days will incur a 50% charge.
              </p>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <p>
                <strong>Weather Policy:</strong> In case of bad weather, we will reschedule your ride 
                at no additional cost or provide a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-2 text-gray-700">
                <p><strong>Phone:</strong> +94 11 234 5678</p>
                <p><strong>Email:</strong> info@boatservice.com</p>
                <p><strong>Address:</strong> 123 Marina Road, Colombo 01</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Hours</h4>
              <div className="space-y-2 text-gray-700">
                <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 8:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> 9:00 AM - 3:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideConfirmation;
