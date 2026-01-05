import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRepairById, deleteRepairByCustomer, generatePDFConfirmation } from '../repairService/repairApi';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTools,
  FaShip,
  FaUser,
  FaCreditCard,
  FaExclamationCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RepairDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadRepairDetails();
    }
  }, [id]);

  const loadRepairDetails = async () => {
    try {
      setLoading(true);
      const response = await getRepairById(id);
      
      if (response.success) {
        setRepair(response.data);
      } else {
        throw new Error(response.message || 'Failed to load repair details');
      }
    } catch (error) {
      console.error('Error loading repair details:', error);
      toast.error('Failed to load repair details');
      navigate('/my-repairs');
    } finally {
      setLoading(false);
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600 bg-yellow-100', icon: <FaClock />, label: 'Pending' };
      case 'assigned':
        return { color: 'text-blue-600 bg-blue-100', icon: <FaTools />, label: 'Assigned' };
      case 'in_progress':
        return { color: 'text-orange-600 bg-orange-100', icon: <FaSpinner className="animate-spin" />, label: 'In Progress' };
      case 'completed':
        return { color: 'text-green-600 bg-green-100', icon: <FaCheckCircle />, label: 'Completed' };
      case 'cancelled':
        return { color: 'text-red-600 bg-red-100', icon: <FaTimesCircle />, label: 'Cancelled' };
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: <FaExclamationTriangle />, label: 'Unknown' };
    }
  };

  // Check if repair can be edited (until appointment date)
  const canEdit = (repair) => {
    if (!repair || !repair.scheduledDateTime) return false;
    const appointmentDate = new Date(repair.scheduledDateTime);
    const today = new Date();
    return appointmentDate > today;
  };

  // Check if repair can be deleted (max 3 days before appointment)
  const getDeleteStatus = (repair) => {
    if (!repair) return { canDelete: false, reason: 'Repair not found' };
    
    // If no scheduled date, allow deletion
    if (!repair.scheduledDateTime) return { canDelete: true, reason: null };
    
    // If scheduled date exists, check 3-day rule
    const appointmentDate = new Date(repair.scheduledDateTime);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    
    if (appointmentDate <= threeDaysFromNow) {
      return { 
        canDelete: false, 
        reason: 'Cannot delete within 3 days of appointment. Contact support for urgent cancellations.' 
      };
    }
    
    return { canDelete: true, reason: null };
  };

  // Handle edit
  const handleEdit = () => {
    if (canEdit(repair)) {
      navigate(`/repair-service/edit/${repair._id}`);
    } else {
      toast.error('Cannot edit this repair request. Appointment date has passed.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const deleteStatus = getDeleteStatus(repair);
    if (!deleteStatus.canDelete) {
      toast.error(deleteStatus.reason);
      return;
    }

    try {
      setIsDeleting(true);
      const response = await deleteRepairByCustomer(repair._id);
      
      if (response.success) {
        toast.success('Repair request deleted successfully');
        navigate('/my-repairs');
      } else {
        throw new Error(response.message || 'Failed to delete repair request');
      }
    } catch (error) {
      console.error('Error deleting repair:', error);
      toast.error(error.message || 'Failed to delete repair request');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    try {
      const blob = await generatePDFConfirmation(repair._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repair-confirmation-${repair.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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
          <p className="text-gray-600">Loading repair details...</p>
        </div>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Repair Request Not Found</h2>
          <p className="text-gray-600 mb-6">The repair request you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/my-repairs')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to My Repairs
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(repair.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-repairs')}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Repairs
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {repair.bookingId}
                </h1>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="ml-2">{statusInfo.label}</span>
                  </span>
                  <span className="text-gray-500">
                    Created on {formatDate(repair.createdAt)}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                {canEdit(repair) && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                )}
                
                <div className="relative group">
                  <button
                    onClick={() => {
                      const deleteStatus = getDeleteStatus(repair);
                      if (deleteStatus.canDelete) {
                        setShowDeleteConfirm(true);
                      } else {
                        toast.error(deleteStatus.reason);
                      }
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      getDeleteStatus(repair).canDelete
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                    disabled={!getDeleteStatus(repair).canDelete}
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                  
                  {/* Custom hover message */}
                  {!getDeleteStatus(repair).canDelete && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                      <div className="text-center leading-tight">
                        Cannot delete within 3 days of appointment. Contact support for urgent cancellations.
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FaDownload className="mr-2" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Service Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaTools className="text-teal-600 mr-2" />
              Service Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {repair.serviceType.replace('_', ' ')}
                </p>
              </div>
              {repair.priority && (
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {repair.priority}
                  </p>
                </div>
              )}
              {repair.estimatedCost && (
                <div>
                  <p className="text-sm text-gray-600">Estimated Cost</p>
                  <p className="font-medium text-gray-900">
                    LKR {repair.estimatedCost.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-gray-600">Problem Description</p>
                <p className="font-medium text-gray-900">
                  {repair.problemDescription}
                </p>
              </div>
              {repair.serviceDescription && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-600">Service Requirements</p>
                  <p className="font-medium text-gray-900">
                    {repair.serviceDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Boat Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaShip className="text-teal-600 mr-2" />
              Boat Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Boat Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {repair.boatDetails.boatType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Make</p>
                <p className="font-medium text-gray-900">
                  {repair.boatDetails.boatMake}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-medium text-gray-900">
                  {repair.boatDetails.boatModel}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium text-gray-900">
                  {repair.boatDetails.boatYear}
                </p>
              </div>
              {repair.boatDetails.engineType && (
                <div>
                  <p className="text-sm text-gray-600">Engine Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {repair.boatDetails.engineType.replace('_', ' ')}
                  </p>
                </div>
              )}
              {repair.boatDetails.engineModel && (
                <div>
                  <p className="text-sm text-gray-600">Engine Model</p>
                  <p className="font-medium text-gray-900">
                    {repair.boatDetails.engineModel}
                  </p>
                </div>
              )}
              {repair.boatDetails.hullMaterial && (
                <div>
                  <p className="text-sm text-gray-600">Hull Material</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {repair.boatDetails.hullMaterial.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="text-teal-600 mr-2" />
              Appointment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Scheduled Date & Time</p>
                <p className="font-medium text-gray-900">
                  {repair.scheduledDateTime ? formatDateTime(repair.scheduledDateTime) : 'Not scheduled'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Location</p>
                <p className="font-medium text-gray-900 capitalize">
                  {repair.serviceLocation?.type?.replace('_', ' ') || 'Service Center'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Calendly Event ID</p>
                <p className="font-medium text-gray-900">
                  {repair.calendlyEventId || 'Not available'}
                </p>
              </div>
              {repair.serviceLocation?.type === 'customer_location' && repair.serviceLocation?.address && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-600">Customer Address</p>
                  <p className="font-medium text-gray-900">
                    {[repair.serviceLocation.address.street, repair.serviceLocation.address.city, repair.serviceLocation.address.district, repair.serviceLocation.address.postalCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {repair.serviceLocation?.type === 'marina' && repair.serviceLocation?.marinaName && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-gray-600">Marina Details</p>
                  <p className="font-medium text-gray-900">
                    {repair.serviceLocation.marinaName}
                    {repair.serviceLocation.dockNumber && ` - Dock ${repair.serviceLocation.dockNumber}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="text-teal-600 mr-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{repair.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">
                  {repair.customer.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">
                  {repair.customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Work Details (if available) */}
          {(repair.workPerformed || repair.partsUsed?.length > 0 || repair.laborHours) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Work Details</h2>
              <div className="space-y-4">
                {repair.workPerformed && (
                  <div>
                    <p className="text-sm text-gray-600">Work Performed</p>
                    <p className="font-medium text-gray-900">{repair.workPerformed}</p>
                  </div>
                )}
                {repair.partsUsed && repair.partsUsed.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Parts Used</p>
                    <div className="space-y-2">
                      {repair.partsUsed.map((part, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{part.partName}</p>
                          <p className="text-sm text-gray-600">Part #: {part.partNumber} | Qty: {part.quantity} | Cost: LKR {part.cost?.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(repair.laborHours || repair.laborRate) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repair.laborHours && (
                      <div>
                        <p className="text-sm text-gray-600">Labor Hours</p>
                        <p className="font-medium text-gray-900">{repair.laborHours} hours</p>
                      </div>
                    )}
                    {repair.laborRate && (
                      <div>
                        <p className="text-sm text-gray-600">Labor Rate</p>
                        <p className="font-medium text-gray-900">LKR {repair.laborRate.toLocaleString()}/hour</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cost Information */}
          {(repair.finalCost || repair.payment) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost & Payment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repair.finalCost && (
                  <div>
                    <p className="text-sm text-gray-600">Final Cost</p>
                    <p className="font-medium text-gray-900">LKR {repair.finalCost.toLocaleString()}</p>
                  </div>
                )}
                {repair.payment && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-medium text-gray-900 capitalize">{repair.payment.status}</p>
                    </div>
                    {repair.payment.amount && (
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-medium text-gray-900">LKR {repair.payment.amount.toLocaleString()}</p>
                      </div>
                    )}
                    {repair.payment.paidAt && (
                      <div>
                        <p className="text-sm text-gray-600">Paid At</p>
                        <p className="font-medium text-gray-900">{formatDateTime(repair.payment.paidAt)}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Files */}
          {repair.photos && repair.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repair.photos.map((photo, index) => {
                  // Debug: Log photo data structure
                  console.log('Photo data:', photo);
                  
                  const isVideo = photo.originalName && (
                    photo.originalName.toLowerCase().includes('.mp4') ||
                    photo.originalName.toLowerCase().includes('.mov') ||
                    photo.originalName.toLowerCase().includes('.avi') ||
                    photo.originalName.toLowerCase().includes('.webm')
                  );
                  
                  return (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="mb-3">
                        {(photo.cloudinaryUrl || photo.path || photo.secureUrl) ? (
                          isVideo ? (
                            <video 
                              src={photo.cloudinaryUrl || photo.path || photo.secureUrl} 
                              controls 
                              className="w-full h-32 object-cover rounded-lg"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img 
                              src={photo.cloudinaryUrl || photo.path || photo.secureUrl} 
                              alt={photo.originalName}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          )
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No preview available</span>
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate" title={photo.originalName}>
                        {photo.originalName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {photo.uploadedAt ? formatDate(photo.uploadedAt) : 'Uploaded'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer Notes */}
          {repair.customerNotes && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {repair.customerNotes}
              </p>
            </div>
          )}

          {/* Assigned Technician */}
          {repair.assignedTechnician && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assigned Technician</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{repair.assignedTechnician.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{repair.assignedTechnician.email}</p>
                </div>
                {repair.assignedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Assigned At</p>
                    <p className="font-medium text-gray-900">{formatDateTime(repair.assignedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {repair.status === 'completed' && repair.repairCosts && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FaCreditCard className="text-green-600 mr-2" />
                Payment Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Advance Payment</p>
                    <p className="text-sm text-gray-900">{repair.repairCosts.advancePayment} LKR</p>
                  </div>
                  
                  {repair.repairCosts.finalCost > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Final Cost</p>
                      <p className="text-sm text-gray-900">{repair.repairCosts.finalCost} LKR</p>
                    </div>
                  )}
                  
                  {repair.repairCosts.remainingAmount > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Remaining Amount</p>
                      <p className="text-lg font-bold text-red-600">{repair.repairCosts.remainingAmount} LKR</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      repair.repairCosts.paymentStatus === 'fully_paid' 
                        ? 'bg-green-100 text-green-800'
                        : repair.repairCosts.paymentStatus === 'invoice_sent'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {repair.repairCosts.paymentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="space-y-3">
                  {repair.repairCosts.invoiceSentAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Invoice Sent Date</p>
                      <p className="text-sm text-gray-900">{formatDateTime(repair.repairCosts.invoiceSentAt)}</p>
                    </div>
                  )}
                  
                  {repair.repairCosts.finalPaymentAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Final Payment Date</p>
                      <p className="text-sm text-gray-900">{formatDateTime(repair.repairCosts.finalPaymentAt)}</p>
                    </div>
                  )}

                  {/* Payment Button */}
                  {repair.repairCosts.paymentStatus === 'invoice_sent' && repair.repairCosts.remainingAmount > 0 && (
                    <div className="pt-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <FaExclamationCircle className="text-yellow-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Payment Required</p>
                            <p className="text-xs text-yellow-700">
                              Please complete your payment to finalize the repair service.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/repair-payment/${repair._id}`)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <FaCreditCard className="mr-2" />
                        Pay {repair.repairCosts.remainingAmount} LKR
                      </button>
                    </div>
                  )}

                  {repair.repairCosts.paymentStatus === 'fully_paid' && (
                    <div className="pt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Payment Complete</p>
                            <p className="text-xs text-green-700">
                              Your repair service has been fully paid and completed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Updates */}
          {repair.statusUpdates && repair.statusUpdates.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {repair.statusUpdates.map((update, index) => (
                  <div key={index} className="border-l-2 border-teal-200 pl-3">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {update.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(update.updatedAt)}
                    </p>
                    {update.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {update.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Details */}
          {repair.completedAt && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completion Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Completed At</p>
                  <p className="font-medium text-gray-900">{formatDateTime(repair.completedAt)}</p>
                </div>
                {repair.customerSatisfaction && (
                  <div>
                    <p className="text-sm text-gray-600">Customer Rating</p>
                    <p className="font-medium text-gray-900">
                      {repair.customerSatisfaction.rating}/5 stars
                    </p>
                    {repair.customerSatisfaction.feedback && (
                      <p className="text-sm text-gray-600 mt-1">
                        {repair.customerSatisfaction.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Repair Request</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this repair request? This action cannot be undone and will permanently remove the request from the system. Your scheduled appointment will also be cancelled.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Request
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairDetails;
