import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaArrowLeft, 
  FaUser, 
  FaCalendarAlt, 
  FaSpinner,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlayCircle,
  FaBan,
  FaExclamationTriangle,
  FaShip,
  FaEdit,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RepairManagementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBoatReceivedModal, setShowBoatReceivedModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [costOptions, setCostOptions] = useState([]);
  const [selectedCost, setSelectedCost] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRepairDetails();
      fetchTechnicians();
    }
  }, [id]);

  const fetchRepairDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repair details');
      }

      const data = await response.json();
      
      if (data.success) {
        setRepair(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch repair details');
      }
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setError(error.message);
      toast.error('Failed to load repair details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/technicians`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch technicians');
      }

      const data = await response.json();
      
      if (data.success) {
        setTechnicians(data.data);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    }
  };

  const fetchCostOptions = async (serviceType) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/repair-costs/cost-options/${serviceType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cost options');
      }
      
      const data = await response.json();
      setCostOptions(data.data || []);
    } catch (error) {
      console.error('Error fetching cost options:', error);
      toast.error('Failed to load cost options');
    }
  };

  const sendInvoice = async () => {
    try {
      setIsSendingInvoice(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/repair-costs/${repair._id}/send-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finalCost: parseInt(finalCost)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Invoice sent to customer successfully!');
        setShowCostModal(false);
        setSelectedCost('');
        setFinalCost('');
        fetchRepairDetails(); // Refresh repair details
      } else {
        throw new Error(data.message || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error(error.message);
    } finally {
      setIsSendingInvoice(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechnician) {
      toast.error('Please select a technician');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/${id}/assign-technician`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ technicianId: selectedTechnician })
      });

      if (!response.ok) {
        throw new Error('Failed to assign technician');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Technician assigned successfully');
        setRepair(data.data);
        setShowTechnicianModal(false);
        setSelectedTechnician('');
      } else {
        throw new Error(data.message || 'Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkBoatReceived = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/${id}/mark-received`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark boat as received');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Boat marked as received successfully');
        setRepair(data.data);
        setShowBoatReceivedModal(false);
      } else {
        throw new Error(data.message || 'Failed to mark boat as received');
      }
    } catch (error) {
      console.error('Error marking boat as received:', error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/boat-repairs/${id}/update-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: statusNotes 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Status updated successfully');
        setRepair(data.data);
        setShowStatusModal(false);
        setNewStatus('');
        setStatusNotes('');
        
        // If status is completed, show cost addition modal
        if (newStatus === 'completed') {
          await fetchCostOptions(repair.serviceType);
          setShowCostModal(true);
        }
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
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
          <p className="text-gray-600">Loading repair details...</p>
        </div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Repair not found'}</p>
          <button 
            onClick={() => navigate('/employee/repair-management')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(repair.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/employee/repair-management')}
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Repair Management
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Repair Request Details</h1>
              <p className="text-gray-600 mt-2">Booking ID: {repair.bookingId}</p>
            </div>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-2">{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{repair.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{repair.customer?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{repair.customer?.phone}</p>
                </div>
              </div>
            </div>

            {/* Boat Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Boat Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Boat Type</p>
                  <p className="text-sm text-gray-900 capitalize">{repair.boatDetails?.boatType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Make & Model</p>
                  <p className="text-sm text-gray-900">{repair.boatDetails?.boatMake} {repair.boatDetails?.boatModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Year</p>
                  <p className="text-sm text-gray-900">{repair.boatDetails?.boatYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Engine Type</p>
                  <p className="text-sm text-gray-900 capitalize">{repair.boatDetails?.engineType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Engine Model</p>
                  <p className="text-sm text-gray-900">{repair.boatDetails?.engineModel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hull Material</p>
                  <p className="text-sm text-gray-900 capitalize">{repair.boatDetails?.hullMaterial}</p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Type</p>
                  <p className="text-sm text-gray-900 capitalize">{repair.serviceType?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Problem Description</p>
                  <p className="text-sm text-gray-900">{repair.problemDescription}</p>
                </div>
                {repair.serviceDescription && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service Description</p>
                    <p className="text-sm text-gray-900">{repair.serviceDescription}</p>
                  </div>
                )}
                {repair.customerNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Notes</p>
                    <p className="text-sm text-gray-900">{repair.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Scheduled Date & Time</p>
                  <p className="text-sm text-gray-900">{formatDateTime(repair.scheduledDateTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Service Location</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {repair.serviceLocation?.type?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Files */}
            {repair.photos && repair.photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {repair.photos.map((photo, index) => {
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {!repair.assignedTechnician && (
                  <button
                    onClick={() => setShowTechnicianModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                  >
                    <FaUser className="mr-2" />
                    Assign Technician
                  </button>
                )}
                
                {repair.assignedTechnician && !repair.boatReceivedAt && (
                  <button
                    onClick={() => setShowBoatReceivedModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                  >
                    <FaShip className="mr-2" />
                    Mark Boat Received
                  </button>
                )}
                
                {repair.boatReceivedAt && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    Update Status
                  </button>
                )}

                {repair.status === 'completed' && repair.repairCosts?.paymentStatus === 'advance_paid' && (
                  <button
                    onClick={async () => {
                      await fetchCostOptions(repair.serviceType);
                      setShowCostModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <FaCheckCircle className="mr-2" />
                    Send Invoice
                  </button>
                )}
              </div>
            </div>

            {/* Assignment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned Technician</p>
                  <p className="text-sm text-gray-900">
                    {repair.assignedTechnician?.name || 'Not assigned'}
                  </p>
                  {repair.assignedTechnician?.employeeData?.position && (
                    <p className="text-xs text-gray-500">
                      {repair.assignedTechnician.employeeData.position}
                    </p>
                  )}
                </div>
                
                {repair.assignedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned Date</p>
                    <p className="text-sm text-gray-900">{formatDateTime(repair.assignedAt)}</p>
                  </div>
                )}
                
                {repair.boatReceivedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Boat Received Date</p>
                    <p className="text-sm text-gray-900">{formatDateTime(repair.boatReceivedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Repair Cost Information */}
            {repair.repairCosts && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Repair Cost Information</h2>
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
                      <p className="text-sm text-gray-900">{repair.repairCosts.remainingAmount} LKR</p>
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
                </div>
              </div>
            )}

            {/* Status History */}
            {repair.statusUpdates && repair.statusUpdates.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Status History</h2>
                <div className="space-y-3">
                  {repair.statusUpdates.map((update, index) => (
                    <div key={index} className="border-l-4 border-teal-500 pl-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {update.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(update.updatedAt)}
                        </span>
                      </div>
                      {update.notes && (
                        <p className="text-xs text-gray-600 mt-1">{update.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Technician Assignment Modal */}
        {showTechnicianModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Technician</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Technician
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Choose a technician...</option>
                  {technicians.map(tech => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} - {tech.employeeData?.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAssignTechnician}
                  disabled={isUpdating}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  Assign
                </button>
                <button
                  onClick={() => {
                    setShowTechnicianModal(false);
                    setSelectedTechnician('');
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Boat Received Modal */}
        {showBoatReceivedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Boat as Received</h3>
              <p className="text-sm text-gray-600 mb-6">
                This will mark the boat as physically received and change the status to "In Progress".
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleMarkBoatReceived}
                  disabled={isUpdating}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? <FaSpinner className="animate-spin mr-2" /> : <FaShip className="mr-2" />}
                  Mark Received
                </button>
                <button
                  onClick={() => setShowBoatReceivedModal(false)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select status...</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_parts">Waiting Parts</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add any notes about this status change..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                    setStatusNotes('');
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cost Addition Modal */}
        {showCostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Repair Cost</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cost Option
                </label>
                <select
                  value={selectedCost}
                  onChange={(e) => {
                    setSelectedCost(e.target.value);
                    const option = costOptions.find(opt => opt._id === e.target.value);
                    if (option) {
                      setFinalCost(option.estimatedCost);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select cost option...</option>
                  {costOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.repairType} - {option.estimatedCost} LKR
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Cost (LKR)
                </label>
                <input
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter final cost"
                  min="0"
                />
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Current Cost:</strong> {repair.cost || 0} LKR
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Final Cost:</strong> {finalCost || 0} LKR
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={sendInvoice}
                  disabled={isSendingInvoice || !finalCost}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingInvoice ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
                  Send Invoice
                </button>
                <button
                  onClick={() => {
                    setShowCostModal(false);
                    setSelectedCost('');
                    setFinalCost('');
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairManagementDetail;
