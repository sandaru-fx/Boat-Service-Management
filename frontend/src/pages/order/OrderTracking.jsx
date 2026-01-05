import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './OrderTracking.css';

const OrderTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/user/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
      } else {
        if (response.status === 401) {
          setError('Please log in to view your orders');
          navigate('/login');
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrder = async () => {
    if (!searchOrderId.trim()) {
      alert('Please enter an order ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${searchOrderId}`);
      
      const data = await response.json();
      
      if (data.success) {
        setOrders([data.data]);
        setFilterStatus('all');
      } else {
        setError('Order not found');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setError('Failed to search order');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  const handleDownloadReceipt = async (orderId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/receipts/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'processing': return '#28a745';
      case 'shipped': return '#007bff';
      case 'delivered': return '#6f42c1';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '🔧';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="order-tracking">
        <div className="tracking-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <div className="tracking-container">
        <div className="tracking-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Order Tracking</h1>
              <p>Track your spare parts orders and view order history</p>
            </div>
            <button 
              className="back-button"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., ORD-123456789)"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchOrder()}
            />
            <button onClick={handleSearchOrder} className="btn-search">
              Search Order
            </button>
          </div>
          <button onClick={fetchOrders} className="btn-refresh">
            View All Orders
          </button>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <h3>No orders found</h3>
              <p>You haven't placed any orders yet or no orders match your search criteria.</p>
              <button onClick={() => navigate('/spare-parts')} className="btn-primary">
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.orderId}</h3>
                    <p>Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    <h4>Items ({order.items.length})</h4>
                    <div className="items-list">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="item">
                          <span>{item.productName}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="item">
                          <span>... and {order.items.length - 3} more items</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>Rs. {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="total-row total">
                      <span>Total:</span>
                      <span>Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    onClick={() => handleViewOrder(order.orderId)}
                    className="btn-secondary"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDownloadReceipt(order.orderId)}
                    className="btn-secondary"
                  >
                    Download Receipt
                  </button>
                </div>

                {/* Status Timeline */}
                <div className="status-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot active"></div>
                    <div className="timeline-content">
                      <span>Order Placed</span>
                      <small>{new Date(order.orderDate).toLocaleDateString()}</small>
                    </div>
                  </div>
                  
                  {order.confirmedAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot active"></div>
                      <div className="timeline-content">
                        <span>Order Confirmed</span>
                        <small>{new Date(order.confirmedAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  )}
                  
                  {order.shippedAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot active"></div>
                      <div className="timeline-content">
                        <span>Shipped</span>
                        <small>{new Date(order.shippedAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  )}
                  
                  {order.deliveredAt && (
                    <div className="timeline-item">
                      <div className="timeline-dot active"></div>
                      <div className="timeline-content">
                        <span>Delivered</span>
                        <small>{new Date(order.deliveredAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Continue Shopping Section */}
        <div className="continue-shopping-section">
          <button 
            className="continue-shopping-button"
            onClick={() => navigate('/spare-parts')}
          >
            Continue Shopping →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
