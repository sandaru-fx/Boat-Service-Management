import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaDownload, FaPrint, FaCalendarAlt, FaUser, FaShip, FaTools, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getRepairByBookingId, generatePDFConfirmation } from './repairApi';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repairData, setRepairData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchRepairData();
  }, [bookingId]);

  const fetchRepairData = async () => {
    try {
      setLoading(true);
      const response = await getRepairByBookingId(bookingId);
      
      if (response.success) {
        setRepairData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch repair data');
      }
    } catch (error) {
      console.error('Error fetching repair data:', error);
      toast.error('Failed to load repair confirmation. Please try again.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const blob = await generatePDFConfirmation(repairData._id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `repair-confirmation-${repairData.bookingId}.pdf`;
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!repairData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Repair confirmation not found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FaCheckCircle className="text-green-500 mr-3" />
                  Booking Confirmation
                </h1>
                <p className="text-gray-600 mt-1">Your repair service request has been submitted successfully</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {downloadingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Download PDF
                  </>
                )}
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Booking Reference */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Booking Confirmed!</h3>
                <p className="text-green-700">
                  Your repair service request has been submitted with booking ID: <strong>{repairData.bookingId}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="text-teal-600 mr-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{repairData.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{repairData.customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{repairData.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Boat Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaShip className="text-teal-600 mr-2" />
              Boat Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium text-gray-900 capitalize">{repairData.boatDetails.boatType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Make</p>
                <p className="font-medium text-gray-900">{repairData.boatDetails.boatMake}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-medium text-gray-900">{repairData.boatDetails.boatModel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium text-gray-900">{repairData.boatDetails.boatYear}</p>
              </div>
              {repairData.boatDetails.engineType && (
                <div>
                  <p className="text-sm text-gray-600">Engine Type</p>
                  <p className="font-medium text-gray-900 capitalize">{repairData.boatDetails.engineType.replace('_', ' ')}</p>
                </div>
              )}
              {repairData.boatDetails.engineModel && (
                <div>
                  <p className="text-sm text-gray-600">Engine Model</p>
                  <p className="font-medium text-gray-900">{repairData.boatDetails.engineModel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaTools className="text-teal-600 mr-2" />
              Service Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="font-medium text-gray-900 capitalize">{repairData.serviceType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Problem Description</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{repairData.problemDescription}</p>
              </div>
              {repairData.serviceDescription && (
                <div>
                  <p className="text-sm text-gray-600">Service Requirements</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{repairData.serviceDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="text-teal-600 mr-2" />
              Appointment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Scheduled Date</p>
                <p className="font-medium text-gray-900">{formatDate(repairData.scheduledDateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled Time</p>
                <p className="font-medium text-gray-900">{formatTime(repairData.scheduledDateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  repairData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  repairData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {repairData.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Files Uploaded</p>
                <p className="font-medium text-gray-900">{repairData.photos.length} file(s)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Location</p>
                <p className="font-medium text-gray-900 capitalize">{repairData.serviceLocation?.type?.replace('_', ' ') || 'Service Center'}</p>
                {repairData.serviceLocation?.type === 'customer_location' && repairData.serviceLocation?.address && (
                  <p className="text-sm text-gray-500 mt-1">
                    {[repairData.serviceLocation.address.street, repairData.serviceLocation.address.city, repairData.serviceLocation.address.district].filter(Boolean).join(', ')}
                  </p>
                )}
                {repairData.serviceLocation?.type === 'marina' && repairData.serviceLocation?.marinaName && (
                  <p className="text-sm text-gray-500 mt-1">
                    {repairData.serviceLocation.marinaName}
                    {repairData.serviceLocation.dockNumber && ` - Dock ${repairData.serviceLocation.dockNumber}`}
                  </p>
                )}
                {repairData.serviceLocation?.type === 'service_center' && (
                  <p className="text-sm text-gray-500 mt-1">Colombo Marina Service Center</p>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">What Happens Next?</h3>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</span>
                <p><strong>Scheduled Visit:</strong> Visit our service center on {formatDate(repairData.scheduledDateTime)} at {formatTime(repairData.scheduledDateTime)}</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</span>
                <p><strong>Estimate Review:</strong> Our technician will analyze your photos/videos and send you a detailed estimate</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</span>
                <p><strong>Service Completion:</strong> Repairs will be completed during your scheduled visit</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</span>
                <p><strong>Payment:</strong> Pay after service completion</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>🚨 Emergency:</strong> For urgent repairs, contact our support line directly for immediate assistance.
              </p>
            </div>
          </div>

          {/* Customer Notes */}
          {repairData.customerNotes && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{repairData.customerNotes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(`/my-repairs?new=${repairData._id}`)}
            className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            View All My Repairs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
