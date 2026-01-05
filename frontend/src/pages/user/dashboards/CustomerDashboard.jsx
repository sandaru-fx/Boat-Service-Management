import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShip, FaChartBar, FaTools, FaCalendarAlt, FaHistory, FaCreditCard, FaHeadset, FaShoppingCart, FaCar, FaHeart, FaStar, FaBell } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';

const CustomerDashboard = ({ firstName }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loadingSpent, setLoadingSpent] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  // Initialize socket and load notifications
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001');
      setSocket(newSocket);

      // Request notifications
      newSocket.emit('request-notifications', user.email);

      // Listen for notification updates
      newSocket.on('notifications-update', (data) => {
        if (data.userId === user.email) {
          setUnreadCount(data.unreadCount);
        }
      });

      // Load initial notification count
      loadNotificationCount();

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Load total spent and cart count when component mounts
  useEffect(() => {
    if (user) {
      loadTotalSpent();
      loadCartItemsCount();
    }
  }, [user]);

  // Listen for cart changes (when user navigates back to dashboard)
  useEffect(() => {
    const handleStorageChange = () => {
      loadCartItemsCount();
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (when user comes back to tab)
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const loadNotificationCount = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/notifications/${user.email}`);
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const loadTotalSpent = async () => {
    if (!user) return;
    
    try {
      setLoadingSpent(true);
      const token = localStorage.getItem('token');
      
      // Fetch all payment data from different services
      const [boatRidesRes, ordersRes, repairsRes, appointmentsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/boat-bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/orders/user/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/payments/my-payments?serviceType=boat_repair`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/api/appointments/customer?customerEmail=${user.email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [boatRidesData, ordersData, repairsData, appointmentsData] = await Promise.all([
        boatRidesRes.json(),
        ordersRes.json(),
        repairsRes.json(),
        appointmentsRes.json()
      ]);

      // Calculate total spent across all services
      let totalSpentAmount = 0;

      // Boat rides
      if (boatRidesData.success && boatRidesData.data?.bookings) {
        const boatRideTotal = boatRidesData.data.bookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0);
        }, 0);
        totalSpentAmount += boatRideTotal;
      }

      // Spare parts orders
      if (ordersData.success && ordersData.data?.orders) {
        const sparePartsTotal = ordersData.data.orders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0);
        }, 0);
        totalSpentAmount += sparePartsTotal;
      }

      // Repair payments
      if (repairsData.success && repairsData.data?.payments) {
        const repairTotal = repairsData.data.payments.reduce((sum, payment) => {
          return sum + (payment.amount || 0);
        }, 0);
        totalSpentAmount += repairTotal;
      }

      // Sales visits (appointments) - assuming fixed fee
      if (appointmentsData.success && appointmentsData.data) {
        const salesVisitTotal = appointmentsData.data.length * 2000; // Default fee per visit
        totalSpentAmount += salesVisitTotal;
      }

      setTotalSpent(totalSpentAmount);
    } catch (error) {
      console.error('Failed to load total spent:', error);
      setTotalSpent(0);
    } finally {
      setLoadingSpent(false);
    }
  };

  const loadCartItemsCount = () => {
    try {
      setLoadingCart(true);
      // Get cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Calculate total quantity
      const totalQuantity = cartItems.reduce((sum, item) => {
        return sum + (item.selectedQty || 0);
      }, 0);
      
      setCartItemsCount(totalQuantity);
    } catch (error) {
      console.error('Failed to load cart items count:', error);
      setCartItemsCount(0);
    } finally {
      setLoadingCart(false);
    }
  };

  const mainFeatures = [
    { 
      name: 'Book Boat Ride', 
      icon: <FaShip />, 
      description: 'Schedule a boat ride for your next adventure',
      color: 'bg-gradient-to-br from-blue-500 to-teal-500',
      route: '/customer'
    },
    { 
      name: 'Book Repair Service', 
      icon: <FaTools />, 
      description: 'Schedule maintenance or repair for your boat',
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      route: '/repair-service'
    },
    { 
      name: 'Boat Sales', 
      icon: <FaCar />, 
      description: 'Visit our showroom to explore and purchase new boats',
      color: 'bg-gradient-to-br from-teal-500 to-green-500',
      route: '/boat-catalog'
    },
    { 
      name: 'Spare Parts Store', 
      icon: <FaShoppingCart />, 
      description: 'Browse and purchase boat spare parts and accessories',
      color: 'bg-gradient-to-br from-blue-600 to-indigo-500',
      route: '/spare-parts'
    }
  ];

  const myAccountFeatures = [
    { 
      name: 'My Profile', 
      icon: <FaUser />, 
      description: 'View and update your personal information',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      route: '/profile'
    },
    { 
      name: 'My Rides', 
      icon: <FaCalendarAlt />, 
      description: 'View and manage your boat ride bookings',
      color: 'bg-gradient-to-br from-blue-500 to-teal-500',
      route: '/my-rides'
    },
    { 
      name: 'My Appointments', 
      icon: <FaCalendarAlt />, 
      description: 'View and manage your boat purchase appointments',
      color: 'bg-gradient-to-br from-green-500 to-teal-500',
      route: '/my-appointments'
    },
    { 
      name: 'My Repairs', 
      icon: <FaTools />, 
      description: 'View and manage your repair requests',
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      route: '/my-repairs'
    },
    { 
      name: 'Payment Summary', 
      icon: <FaCreditCard />, 
      description: 'View your payment summary across all services',
      color: 'bg-gradient-to-br from-teal-600 to-blue-600',
      route: '/payment-summary'
    },
    { 
      name: 'Order Tracking', 
      icon: <FaShoppingCart />, 
      description: 'Track your spare parts orders and status',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500',
      route: '/my-orders'
    }
  ];

  const handleFeatureClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl text-blue-600 bg-white p-3 rounded-full shadow-lg">
                <FaUser />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {firstName}!
                </h1>
                <p className="text-gray-600 mt-1">Manage your boat services, bookings, and purchases</p>
              </div>
            </div>
            
            {/* Quick Chat Access Button */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 font-medium">Need Help?</span>
              <button 
                onClick={() => navigate('/customer/chat')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 relative flex items-center space-x-2"
              >
                <FaHeadset className="text-lg" />
                <span className="font-semibold">Live Chat</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 border border-blue-200">
              <FaStar className="mr-2" />
              Customer Account
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="text-2xl text-blue-600 mr-3 bg-blue-100 p-3 rounded-full">
                <FaCalendarAlt />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-gray-600 text-sm">Upcoming Bookings</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="text-2xl text-teal-600 mr-3 bg-teal-100 p-3 rounded-full">
                <FaShoppingCart />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingCart ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                  ) : (
                    cartItemsCount
                  )}
                </div>
                <div className="text-gray-600 text-sm">Items in Cart</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="text-2xl text-cyan-600 mr-3 bg-cyan-100 p-3 rounded-full">
                <FaTools />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">2</div>
                <div className="text-gray-600 text-sm">Pending Services</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="text-2xl text-indigo-600 mr-3 bg-indigo-100 p-3 rounded-full">
                <FaCreditCard />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingSpent ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  ) : (
                    `Rs. ${totalSpent.toLocaleString()}`
                  )}
                </div>
                <div className="text-gray-600 text-sm">Total Spent (All Services)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Services - 2x2 Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FaHeart className="mr-2 text-blue-500" />
            Main Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.route)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-2xl text-white p-4 rounded-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Account - Single Row */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FaUser className="mr-2 text-teal-500" />
            My Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {myAccountFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.route)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-xl text-white p-3 rounded-xl ${feature.color} group-hover:scale-110 transition-transform duration-300 relative`}>
                    {feature.icon}
                    {feature.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
