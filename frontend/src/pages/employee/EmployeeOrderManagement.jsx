import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaArrowLeft, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaTruck, 
  FaBox,
  FaShoppingCart,
  FaTools,
  FaSpinner,
  FaTh,
  FaList
} from 'react-icons/fa';
// Using Tailwind CSS classes instead of custom CSS

const EmployeeOrderManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterCustomer, searchTerm]);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, searchTerm ? 500 : 0); // 500ms delay for search, immediate for other filters

    return () => clearTimeout(timeoutId);
  }, [currentPage, filterStatus, filterCustomer, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = `${process.env.REACT_APP_API_URL}/api/orders/employee/all?page=${currentPage}&limit=10&status=${filterStatus}&customer=${filterCustomer}&search=${searchTerm}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
        
        // Calculate stats
        const orderStats = {
          total: data.data.pagination.totalOrders,
          pending: data.data.orders.filter(o => o.status === 'pending').length,
          confirmed: data.data.orders.filter(o => o.status === 'confirmed').length,
          processing: data.data.orders.filter(o => o.status === 'processing').length,
          shipped: data.data.orders.filter(o => o.status === 'shipped').length,
          delivered: data.data.orders.filter(o => o.status === 'delivered').length
        };
        setStats(orderStats);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
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
        // Refresh orders
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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

  // Get unique customers for filter dropdown
  const uniqueCustomers = [...new Set(orders.map(order => order.customerName))].sort();

  // Use orders directly since filtering is now done on the backend
  const filteredOrders = orders;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-5">
        <div className="flex flex-col items-center justify-center min-h-96 text-gray-600">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-5"></div>
          <p className="text-lg">Loading orders...</p>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Management</h1>
              <p className="text-gray-600 text-lg">Manage and track spare parts orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/inventory" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                📦 Inventory Management
              </Link>
              <button 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate('/dashboard')}
              >
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl">
              <FaShoppingCart />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-600 text-sm">Total Orders</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl">
              <FaSpinner />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.pending}</div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
              <FaTools />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.processing}</div>
              <div className="text-gray-600 text-sm">Processing</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
              <FaTruck />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{stats.shipped}</div>
              <div className="text-gray-600 text-sm">Shipped</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-300 bg-white"
              >
                <option value="all">All Customers</option>
                {uniqueCustomers.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Grid View"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FaShoppingCart className="text-6xl mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No orders found</h3>
              <p>No orders match your current filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Order ID</span>
                      <div className="text-lg font-bold text-gray-800 font-mono">{order.orderId}</div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                        <FaBox className="text-blue-500" />
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Customer Details</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Name:</span>
                          <span className="text-sm font-semibold text-gray-800">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm font-semibold text-gray-800">{order.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Phone:</span>
                          <span className="text-sm font-semibold text-gray-800">{order.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                        <FaShoppingCart className="text-blue-500" />
                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Order Summary</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Items:</span>
                          <span className="text-sm font-semibold text-gray-800">{order.items.length} item(s)</span>
                        </div>
                        <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                          <span className="text-sm text-gray-500">Total:</span>
                          <span className="text-lg font-bold text-green-600">Rs. {order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Date:</span>
                          <span className="text-sm font-semibold text-gray-800">{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-100">
                    <button 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={() => navigate(`/employee/orders/${order.orderId}`)}
                    >
                      <FaEye /> View Details
                    </button>
                    
                    {order.status === 'pending' && (
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                      >
                        <FaCheck /> Confirm
                      </button>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => updateOrderStatus(order.orderId, 'processing')}
                      >
                        <FaTools /> Process
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transform hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg"
                        onClick={() => updateOrderStatus(order.orderId, 'shipped')}
                      >
                        <FaTruck /> Ship
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Order ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Customer</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Items</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Total</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700 uppercase tracking-wide text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <div className="font-mono text-sm font-semibold text-gray-800">{order.orderId}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold text-gray-800">{order.items.length} item(s)</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-green-600">Rs. {order.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-md hover:bg-gray-700 transition-colors duration-300"
                            onClick={() => navigate(`/employee/orders/${order.orderId}`)}
                          >
                            <FaEye /> View
                          </button>
                          
                          {order.status === 'pending' && (
                            <button 
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600 transition-colors duration-300"
                              onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                            >
                              <FaCheck /> Confirm
                            </button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <button 
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-md hover:bg-orange-600 transition-colors duration-300"
                              onClick={() => updateOrderStatus(order.orderId, 'processing')}
                            >
                              <FaTools /> Process
                            </button>
                          )}
                          
                          {order.status === 'processing' && (
                            <button 
                              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-md hover:bg-purple-600 transition-colors duration-300"
                              onClick={() => updateOrderStatus(order.orderId, 'shipped')}
                            >
                              <FaTruck /> Ship
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-5 mt-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 border-2 border-blue-500 bg-white text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600 font-semibold">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 border-2 border-blue-500 bg-white text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeOrderManagement;
