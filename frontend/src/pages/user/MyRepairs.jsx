import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyRepairs, deleteRepairByCustomer, generatePDFConfirmation } from '../repairService/repairApi';
import { 
  FaTools, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaCreditCard,
  FaExclamationCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyRepairs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get highlighted repair ID from URL params (for newly created repairs)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newRepairId = urlParams.get('new');
    if (newRepairId) {
      setHighlightedId(newRepairId);
      // Remove the parameter from URL after setting
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Fetch repair requests
  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const response = await getMyRepairs();
      if (response.success) {
        setRepairs(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch repairs');
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
      toast.error('Failed to load repair requests');
    } finally {
      setLoading(false);
    }
  };

  // Filter repairs based on status
  const filteredRepairs = repairs.filter(repair => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'assigned'].includes(repair.status);
    if (filter === 'in_progress') return repair.status === 'in_progress';
    if (filter === 'completed') return ['completed', 'cancelled'].includes(repair.status);
    return true;
  });

  // Get status color and icon
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

  // Handle actions
  const handleView = (repairId) => {
    navigate(`/repair-details/${repairId}`);
  };

  const handleEdit = (repairId) => {
    const repair = repairs.find(r => r._id === repairId);
    if (canEdit(repair)) {
      navigate(`/repair-service/edit/${repairId}`);
    } else {
      toast.error('Cannot edit this repair request. Appointment date has passed.');
    }
  };

  const handleCancel = (repairId) => {
    const repair = repairs.find(r => r._id === repairId);
    const deleteStatus = getDeleteStatus(repair);
    
    if (!deleteStatus.canDelete) {
      toast.error(deleteStatus.reason);
      return;
    }

    setRepairToDelete(repair);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!repairToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteRepairByCustomer(repairToDelete._id);
      if (response.success) {
        toast.success('Repair request deleted successfully');
        fetchRepairs(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete repair request');
      }
    } catch (error) {
      console.error('Error deleting repair:', error);
      toast.error(error.message || 'Failed to delete repair request');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setRepairToDelete(null);
    }
  };

  const handleDownload = async (repairId) => {
    try {
      const blob = await generatePDFConfirmation(repairId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repair-confirmation-${repairId}.pdf`;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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
          <p className="text-gray-600">Loading your repair requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Repair Requests</h1>
              <p className="text-gray-600 mt-1">Manage and track your boat repair services</p>
            </div>
            <button
              onClick={() => navigate('/repair-service')}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'all', label: 'All Requests', count: repairs.length },
              { key: 'active', label: 'Active', count: repairs.filter(r => ['pending', 'assigned'].includes(r.status)).length },
              { key: 'in_progress', label: 'In Progress', count: repairs.filter(r => r.status === 'in_progress').length },
              { key: 'completed', label: 'Completed', count: repairs.filter(r => ['completed', 'cancelled'].includes(r.status)).length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Repair Requests List */}
        {filteredRepairs.length === 0 ? (
          <div className="text-center py-12">
            <FaTools className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No repair requests found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't submitted any repair requests yet."
                : `No repair requests with status "${filter}".`
              }
            </p>
            <button
              onClick={() => navigate('/repair-service')}
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRepairs.map((repair) => {
              const statusInfo = getStatusInfo(repair.status);
              const isHighlighted = highlightedId === repair._id;
              
              return (
                <div
                  key={repair._id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
                    isHighlighted 
                      ? 'ring-2 ring-teal-500 bg-teal-50' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  {isHighlighted && (
                    <div className="flex items-center mb-4 p-2 bg-teal-100 rounded-lg">
                      <FaCheckCircle className="text-teal-600 mr-2" />
                      <span className="text-teal-800 font-medium">Newly Created Request</span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {repair.bookingId}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </span>
                        
                        {/* Payment Status Indicator */}
                        {repair.status === 'completed' && repair.repairCosts && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            repair.repairCosts.paymentStatus === 'fully_paid' 
                              ? 'bg-green-100 text-green-800'
                              : repair.repairCosts.paymentStatus === 'invoice_sent'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {repair.repairCosts.paymentStatus === 'fully_paid' ? (
                              <FaCheckCircle className="mr-1" />
                            ) : repair.repairCosts.paymentStatus === 'invoice_sent' ? (
                              <FaExclamationCircle className="mr-1" />
                            ) : (
                              <FaCreditCard className="mr-1" />
                            )}
                            <span className="ml-1">
                              {repair.repairCosts.paymentStatus === 'fully_paid' 
                                ? 'Paid' 
                                : repair.repairCosts.paymentStatus === 'invoice_sent'
                                ? 'Payment Due'
                                : 'Advance Paid'}
                            </span>
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Service Type</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {repair.serviceType.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Boat Details</p>
                          <p className="font-medium text-gray-900">
                            {repair.boatDetails.boatMake} {repair.boatDetails.boatModel} ({repair.boatDetails.boatYear})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Scheduled Date</p>
                          <p className="font-medium text-gray-900">
                            {repair.scheduledDateTime ? formatDateTime(repair.scheduledDateTime) : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Problem Description</p>
                        <p className="text-gray-900 line-clamp-2">
                          {repair.problemDescription}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-1" />
                        <span>Created on {formatDate(repair.createdAt)}</span>
                        {repair.assignedTechnician && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Assigned to {repair.assignedTechnician.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() => handleView(repair._id)}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      
                      {canEdit(repair) && (
                        <button
                          onClick={() => handleEdit(repair._id)}
                          className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </button>
                      )}
                      
                      {/* Pay Now Button for Completed Repairs */}
                      {repair.status === 'completed' && repair.repairCosts?.paymentStatus === 'invoice_sent' && repair.repairCosts?.remainingAmount > 0 && (
                        <button
                          onClick={() => navigate(`/repair-payment/${repair._id}`)}
                          className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <FaCreditCard className="mr-1" />
                          Pay Now
                        </button>
                      )}
                      
                      <div className="relative group">
                        <button
                          onClick={() => handleCancel(repair._id)}
                          className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            getDeleteStatus(repair).canDelete
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!getDeleteStatus(repair).canDelete}
                        >
                          <FaTrash className="mr-1" />
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
                        onClick={() => handleDownload(repair._id)}
                        className="flex items-center px-3 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                      >
                        <FaDownload className="mr-1" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setRepairToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Request
                </button>
                <button
                  onClick={confirmDelete}
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

export default MyRepairs;
