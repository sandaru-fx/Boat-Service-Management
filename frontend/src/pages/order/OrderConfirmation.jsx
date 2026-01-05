import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get order data from navigation state or fetch from API
  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
      setLoading(false);
    } else {
      fetchOrderDetails();
    }
  }, [orderId, location.state]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receipts/order/${orderId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleContinueShopping = () => {
    navigate('/spare-parts');
  };

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-container">
          <div className="error">
            <h2>Order Not Found</h2>
            <p>{error || 'The order you are looking for does not exist.'}</p>
            <button onClick={() => navigate('/spare-parts')} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="order-details">
          <div className="order-info">
            <h3>Order Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Order ID:</label>
                <span>{order.orderId}</span>
              </div>
              <div className="info-item">
                <label>Order Date:</label>
                <span>{new Date(order.orderDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
              <div className="info-item">
                <label>Payment Status:</label>
                <span className={`payment-status ${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{order.customerName}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="shipping-info">
              <h3>{order.deliveryMethod === 'pickup' ? 'Pickup Location' : 'Shipping Address'}</h3>
              <div className="address">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                {order.shippingAddress.postalCode && (
                  <p>{order.shippingAddress.postalCode}</p>
                )}
                <p>Sri Lanka</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="order-items">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="item">
                <img src={item.image} alt={item.productName} className="item-image" />
                <div className="item-details">
                  <h4>{item.productName}</h4>
                  <p>Part Number: {item.partNumber}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  <p>Rs. {item.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>Rs. {order.subtotal}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="total-row total">
              <span>Total:</span>
              <span>Rs. {order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Order Confirmation</h4>
                <p>You will receive an email confirmation shortly.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Processing</h4>
                <p>We will prepare your items for shipping.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>Your order will be shipped within 2-3 business days.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleDownloadReceipt} className="btn-secondary">
            Download Receipt
          </button>
          <button onClick={handleViewOrders} className="btn-secondary">
            View My Orders
          </button>
          <button onClick={handleContinueShopping} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
