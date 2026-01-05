import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaTimes, 
  FaTruck, 
  FaBox,
  FaShoppingCart,
  FaTools,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaReceipt
} from 'react-icons/fa';
// Using Tailwind CSS classes instead of custom CSS

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/employee/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrder(prev => ({ ...prev, status: newStatus }));
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaSpinner />;
      case 'confirmed': return <FaCheck />;
      case 'processing': return <FaTools />;
      case 'shipped': return <FaTruck />;
      case 'delivered': return <FaBox />;
      case 'cancelled': return <FaTimes />;
      default: return <FaSpinner />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-5">
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-5"></div>
          <p className="text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-5">
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/employee/orders')} 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            <FaArrowLeft /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Details</h1>
              <p className="text-gray-600 text-lg">View and manage order information</p>
            </div>
            <div>
              <button 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate('/employee/orders')}
              >
                <FaArrowLeft className="mr-2" /> Back to Orders
              </button>
            </div>
          </div>
        </div>

        {/* Order Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col lg:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Order ID</span>
              <div className="text-2xl font-bold text-gray-800 font-mono">{order.orderId}</div>
            </div>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-lg">
              <FaCalendarAlt className="text-blue-500" />
              <span>{new Date(order.orderDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
              <FaUser className="text-blue-500 text-xl" />
              <span className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Customer Information</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border-b border-gray-100">
                <FaUser className="text-blue-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-500 block">Name</span>
                  <span className="text-lg font-semibold text-gray-800">{order.customerName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 border-b border-gray-100">
                <FaEnvelope className="text-blue-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-500 block">Email</span>
                  <span className="text-lg font-semibold text-gray-800">{order.customerEmail}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3">
                <FaPhone className="text-blue-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-500 block">Phone</span>
                  <span className="text-lg font-semibold text-gray-800">{order.customerPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <FaMapMarkerAlt className="text-blue-500 text-xl" />
                <span className="text-xl font-semibold text-gray-800 uppercase tracking-wide">
                  {order.deliveryMethod === 'pickup' ? 'Pickup Location' : 'Shipping Address'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-800 mb-1">{order.shippingAddress.street}</p>
                <p className="text-gray-800 mb-1">{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                {order.shippingAddress.postalCode && (
                  <p className="text-gray-800 mb-1">{order.shippingAddress.postalCode}</p>
                )}
                <p className="text-gray-800">Sri Lanka</p>
              </div>
            </div>
          )}

        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
            <FaShoppingCart className="text-blue-500 text-xl" />
            <span className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Order Items</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg font-semibold text-gray-700 uppercase tracking-wide text-sm">
                <div>Item</div>
                <div className="text-center">Qty</div>
                <div className="text-center">Unit Price</div>
                <div className="text-center">Total</div>
              </div>
              {order.items.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{item.productName}</div>
                    <div className="text-sm text-gray-500">Part: {item.partNumber}</div>
                  </div>
                  <div className="text-center font-semibold text-gray-800">{item.quantity}</div>
                  <div className="text-center font-semibold text-gray-800">Rs. {item.unitPrice.toLocaleString()}</div>
                  <div className="text-center font-bold text-green-600">Rs. {item.totalPrice.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
            <FaReceipt className="text-blue-500 text-xl" />
            <span className="text-xl font-semibold text-gray-800 uppercase tracking-wide">Order Summary</span>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-lg text-gray-600">Subtotal:</span>
                <span className="text-lg font-semibold text-gray-800">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-lg text-gray-600">Shipping Fee:</span>
                  <span className="text-lg font-semibold text-gray-800">Rs. {order.shippingFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg">
                <span className="text-xl font-semibold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">Rs. {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-4 justify-center">
            {order.status === 'pending' && (
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateOrderStatus('confirmed')}
                disabled={updating}
              >
                <FaCheck /> Confirm Order
              </button>
            )}
            
            {order.status === 'confirmed' && (
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateOrderStatus('processing')}
                disabled={updating}
              >
                <FaTools /> Start Processing
              </button>
            )}
            
            {order.status === 'processing' && (
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateOrderStatus('shipped')}
                disabled={updating}
              >
                <FaTruck /> Mark as Shipped
              </button>
            )}
            
            {order.status === 'shipped' && (
              <button 
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateOrderStatus('delivered')}
                disabled={updating}
              >
                <FaBox /> Mark as Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
