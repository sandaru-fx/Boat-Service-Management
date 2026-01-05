import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaCreditCard, FaShip, FaShoppingCart, FaTools, FaCalendarAlt, FaReceipt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PaymentSummary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalPayments: 0,
    boatRides: 0,
    spareParts: 0,
    repairs: 0,
    salesVisits: 0
  });

  const tabs = [
    { id: 'all', name: 'All Payments', icon: <FaReceipt /> },
    { id: 'boat-rides', name: 'Boat Rides', icon: <FaShip /> },
    { id: 'spare-parts', name: 'Spare Parts', icon: <FaShoppingCart /> },
    { id: 'repairs', name: 'Boat Repairs', icon: <FaTools /> },
    { id: 'sales-visits', name: 'Boat Sales Visits', icon: <FaCalendarAlt /> }
  ];

  useEffect(() => {
    if (user) {
      fetchPaymentSummary();
    }
  }, [user]);

  const fetchPaymentSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
          // Fetch all payment data
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

      // Debug: Log API responses
      console.log('🔍 API Responses:', {
        boatRides: boatRidesData,
        orders: ordersData,
        repairs: repairsData,
        appointments: appointmentsData
      });

      // Debug: Log repair payment data structure
      console.log('🔧 Full repair payments API response:', repairsData);
      if (repairsData.success && repairsData.data?.payments) {
        console.log('🔧 Repair Payment Data Structure:', {
          paymentsCount: repairsData.data.payments.length,
          firstPayment: repairsData.data.payments[0],
          allPayments: repairsData.data.payments.map(payment => ({
            id: payment._id,
            amount: payment.amount,
            status: payment.status,
            serviceType: payment.serviceType,
            serviceDescription: payment.serviceDescription
          }))
        });
      } else {
        console.log('❌ No repair payment data found:', {
          success: repairsData.success,
          data: repairsData.data,
          message: repairsData.message,
          fullResponse: repairsData
        });
      }

      // Debug: Log boat rides data structure
      console.log('🔍 Full boat rides API response:', boatRidesData);
      if (boatRidesData.success && boatRidesData.data?.bookings) {
        console.log('🚤 Boat Rides Data Structure:', {
          bookingsCount: boatRidesData.data.bookings.length,
          firstBooking: boatRidesData.data.bookings[0],
          allBookings: boatRidesData.data.bookings
        });
      } else {
        console.log('❌ No boat rides data found:', {
          success: boatRidesData.success,
          data: boatRidesData.data,
          message: boatRidesData.message,
          fullResponse: boatRidesData
        });
      }

      // Debug: Log user info
      console.log('👤 Current User:', {
        id: user._id || user.id,
        email: user.email,
        name: user.name
      });

      // Process boat rides (from BoatBooking model)
      const boatRidePayments = boatRidesData.success && boatRidesData.data?.bookings ? 
        boatRidesData.data.bookings.map(booking => ({
          id: booking._id,
          date: booking.bookingDate || booking.createdAt,
          category: 'boat-rides',
          service: booking.packageName || 'Boat Ride',
          amount: booking.totalPrice || 0, // Single price field
          status: booking.employeeInfo?.status || 'completed',
          paymentMethod: 'card',
          description: `${booking.packageName} - ${booking.numberOfPassengers} passengers`
        })) : [];

      // Process spare parts orders
      const sparePartPayments = ordersData.success && ordersData.data?.orders ? 
        ordersData.data.orders.map(order => ({
          id: order._id,
          date: order.createdAt,
          category: 'spare-parts',
          service: 'Spare Parts Purchase',
          amount: order.totalAmount || 0,
          status: order.status || 'completed',
          paymentMethod: 'card',
          description: `${order.items?.length || 0} items purchased`
        })) : [];

      // Process repairs (from Payment collection)
      const repairPayments = repairsData.success && repairsData.data?.payments ? 
        repairsData.data.payments.map(payment => ({
          id: payment._id,
          date: payment.createdAt,
          category: 'repairs',
          service: 'Boat Repair Service',
          amount: payment.amount || 0,
          status: payment.status === 'succeeded' ? 'completed' : payment.status,
          paymentMethod: 'card',
          description: payment.serviceDescription || 'Repair Service'
        })) : [];

      // Process sales visits (appointments)
      const salesVisitPayments = appointmentsData.success && appointmentsData.data ? 
        appointmentsData.data.map(appointment => ({
          id: appointment._id,
          date: appointment.createdAt,
          category: 'sales-visits',
          service: 'Boat Sales Visit',
          amount: appointment.paymentAmount || 2000, // Default fee
          status: appointment.status || 'completed',
          paymentMethod: 'card',
          description: `Visit for ${appointment.boatDetails?.boatName || 'Boat Purchase'}`
        })) : [];

      // Combine all payments
      const allPayments = [
        ...boatRidePayments,
        ...sparePartPayments,
        ...repairPayments,
        ...salesVisitPayments
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Debug: Log processed payments
      console.log('💳 Processed Payments:', {
        boatRidePayments: boatRidePayments.length,
        sparePartPayments: sparePartPayments.length,
        repairPayments: repairPayments.length,
        salesVisitPayments: salesVisitPayments.length,
        allPayments: allPayments.length
      });

      // Debug: Check if we have real data
      if (allPayments.length === 0) {
        console.log('⚠️ No payments found in database');
      } else {
        console.log('✅ Found real payment data:', allPayments.length, 'payments');
      }

      setPayments(allPayments);

      // Calculate summary - only count completed/succeeded payments
      const completedPayments = allPayments.filter(payment => 
        payment.status === 'completed' || payment.status === 'succeeded' || payment.status === 'confirmed'
      );
      const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalPayments = completedPayments.length;
      const boatRides = boatRidePayments.length;
      const spareParts = sparePartPayments.length;
      const repairs = repairPayments.length;
      const salesVisits = salesVisitPayments.length;

      setSummary({
        totalSpent,
        totalPayments,
        boatRides,
        spareParts,
        repairs,
        salesVisits
      });

    } catch (error) {
      console.error('Error fetching payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    if (activeTab === 'all') {
      return payments;
    }
    return payments.filter(payment => payment.category === activeTab);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'boat-rides': return <FaShip className="text-blue-500" />;
      case 'spare-parts': return <FaShoppingCart className="text-green-500" />;
      case 'repairs': return <FaTools className="text-orange-500" />;
      case 'sales-visits': return <FaCalendarAlt className="text-purple-500" />;
      default: return <FaReceipt className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Summary</h1>
          <p className="text-gray-600">View all your payments across different services</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <FaReceipt className="text-2xl text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{summary.totalPayments}</div>
                <div className="text-gray-600 text-sm">Total Payments</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <FaCreditCard className="text-2xl text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatAmount(summary.totalSpent)}</div>
                <div className="text-gray-600 text-sm">Total Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <FaShip className="text-2xl text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{summary.boatRides}</div>
                <div className="text-gray-600 text-sm">Boat Rides</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <FaTools className="text-2xl text-orange-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{summary.repairs}</div>
                <div className="text-gray-600 text-sm">Repairs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Payment List */}
          <div className="p-6">
            {getFilteredPayments().length === 0 ? (
              <div className="text-center py-12">
                <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {activeTab === 'all' 
                    ? 'You haven\'t made any payments yet.' 
                    : `You haven't made any ${tabs.find(t => t.id === activeTab)?.name.toLowerCase()} payments yet.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredPayments().map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getCategoryIcon(payment.category)}
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{payment.service}</h4>
                        <p className="text-sm text-gray-600">{payment.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatAmount(payment.amount)}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
