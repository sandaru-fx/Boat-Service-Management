import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import SimpleStripePayment from '../../components/SimpleStripePayment';
import toast from 'react-hot-toast';

const RepairPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRepairDetails();
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
        
        // Check if payment is required
        if (data.data.repairCosts?.paymentStatus !== 'invoice_sent') {
          toast.error('No invoice available for this repair');
          navigate('/my-repairs');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch repair details');
      }
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/repair-costs/${repair.bookingId}/final-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: repair.repairCosts.remainingAmount,
          paymentIntentId: paymentData.paymentIntentId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentCompleted(true);
        toast.success('Payment processed successfully!');
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/my-repairs');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/my-repairs')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to My Repairs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!repair || repair.repairCosts?.paymentStatus !== 'invoice_sent') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Payment Required</h2>
            <p className="text-gray-600 mb-4">This repair does not have a pending payment.</p>
            <button
              onClick={() => navigate('/my-repairs')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to My Repairs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-repairs')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to My Repairs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Repair Payment</h1>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaCreditCard className="mr-2 text-blue-600" />
            Payment Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repair Information */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Repair ID</p>
                <p className="text-sm text-gray-900">{repair.bookingId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Service Type</p>
                <p className="text-sm text-gray-900 capitalize">{repair.serviceType.replace('_', ' ')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {repair.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Invoice Sent Date</p>
                <p className="text-sm text-gray-900">{formatDate(repair.repairCosts.invoiceSentAt)}</p>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Advance Payment</p>
                <p className="text-sm text-gray-900">{repair.repairCosts.advancePayment} LKR</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Final Cost</p>
                <p className="text-sm text-gray-900">{repair.repairCosts.finalCost} LKR</p>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-500">Remaining Amount</p>
                <p className="text-lg font-bold text-blue-600">{repair.repairCosts.remainingAmount} LKR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-800">Advance Payment:</span>
              <span className="text-blue-800">{repair.repairCosts.advancePayment} LKR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Final Cost:</span>
              <span className="text-blue-800">{repair.repairCosts.finalCost} LKR</span>
            </div>
            <div className="border-t border-blue-200 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-blue-900">Amount to Pay:</span>
                <span className="text-lg font-bold text-blue-900">{repair.repairCosts.remainingAmount} LKR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Payment</h3>
            <p className="text-gray-600">
              Secure payment for your repair service
            </p>
          </div>
          
          {paymentCompleted ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment of {repair.repairCosts.remainingAmount} LKR has been processed successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your repairs...
              </p>
            </div>
          ) : (
            <SimpleStripePayment
              amount={repair.repairCosts.remainingAmount}
              serviceType="boat_repair"
              serviceId={repair._id}
              serviceDescription={`Repair payment for ${repair.bookingId}`}
              customerInfo={{
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || ''
              }}
              onPaymentComplete={handlePaymentComplete}
              isLoading={processing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairPayment;
