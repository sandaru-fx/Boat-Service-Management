import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminOrderManagement.css';

const AdminOrderManagement = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, filterStatus, filterPaymentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPaymentStatus !== 'all') params.append('paymentStatus', filterPaymentStatus);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, notes = '') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus, notes })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh orders
        fetchOrders();
        alert('Order status updated successfully');
      } else {
        alert('Failed to update order status: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'paid': return '#28a745';
      case 'failed': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      return order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="admin-order-management">
        <div className="management-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-management">
      <div className="management-container">
        <div className="management-header">
          <h1>Order Management</h1>
          <p>Manage and track all customer orders</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Rs. {stats.totalRevenue?.toFixed(2) || '0.00'}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Rs. {stats.averageOrderValue?.toFixed(2) || '0.00'}</h3>
                <p>Average Order Value</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)}>
              <option value="all">All Payment Statuses</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Payment Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button onClick={fetchOrders} className="btn-refresh">
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Orders Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id">{order.orderId}</span>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      <div className="customer-email">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td>
                    <span className="items-count">{order.items.length} items</span>
                  </td>
                  <td>
                    <span className="order-total">Rs. {order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="payment-status-badge"
                      style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className="order-date">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <select 
                        onChange={(e) => {
                          if (e.target.value !== '') {
                            handleStatusUpdate(order.orderId, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="status-select"
                      >
                        <option value="">Update Status</option>
                        <option value="confirmed">Confirm</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={filteredOrders.length < itemsPerPage}
            className="btn-pagination"
          >
            Next
          </button>
        </div>

        {/* No Orders Message */}
        {filteredOrders.length === 0 && !loading && (
          <div className="no-orders">
            <h3>No orders found</h3>
            <p>No orders match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagement;
