import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';

// Common Pages
import Home from './common/Home';
import NotFound from './common/NotFound';

// Public Pages
import CompleteAboutPage from './pages/public/CompleteAboutPage';
import Services from './pages/public/Services';
import ContactUs from './pages/public/ContactUs';
import ServiceInfo from './pages/public/ServiceInfo';

// Phase 1: Customer Pages
import BoatCatalog from './pages/customer/BoatCatalog';
import BoatDetailsPage from './pages/customer/BoatDetailsPage';
import BookAppointment from './pages/customer/BookAppointment';
import CustomerAppointmentsPage from './pages/customer/CustomerAppointmentsPage';
import ContactPage from './pages/customer/ContactPage';
import PaymentSummary from './pages/customer/PaymentSummary';

// User Pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
import CustomerProfile from './pages/user/CustomerProfile';
import Dashboard from './pages/user/dashboards/Dashboard';
import AdminDashboard from './pages/user/dashboards/AdminDashboard';
import MyBookings from './pages/user/MyBookings';
import MyRepairs from './pages/user/MyRepairs';
import RepairDetails from './pages/user/RepairDetails';
import RepairPayment from './pages/user/RepairPayment';
import ServiceHistory from './pages/user/ServiceHistory';

// Auth Pages
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Function Pages
import BoatRideBooking from './pages/rideBooking/BoatRideBooking';
import RideConfirmation from './pages/rideBooking/RideConfirmation';
import MyRides from './pages/rideBooking/MyRides';
import RepairService from './pages/repairService/RepairService';
import BoatPurchase from './pages/purchaseVisit/BoatPurchase';
import BookingConfirmation from './pages/repairService/BookingConfirmation';
import SparePartsStore from './pages/spareParts/SparePartsStore';
import ShopCategory from './pages/spareParts/ShopCategory';
import ProductDetailsPage from './pages/spareParts/ProductDetailsPage';
import InventoryManagement from './pages/spareParts/InventoryManagement';
import InventoryReport from './pages/spareParts/InventoryReport';
import CreateProduct from './pages/spareParts/CreateProduct';
import EditProduct from './pages/spareParts/EditProduct';
import CartItems from './pages/cart/CartItems';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrderConfirmation from './pages/order/OrderConfirmation';
import OrderTracking from './pages/order/OrderTracking';
import PaymentHistory from './pages/payment/PaymentHistory';

// Employee Pages
import RepairManagementList from './pages/employee/RepairManagementList';
import RepairManagementDetail from './pages/employee/RepairManagementDetail';
import RideManagement from './pages/rideBooking/RideManagement';
import PurchaseManagement from './pages/purchaseVisit/PurchaseManagement';
// import SparePartsManagement from './pages/spareParts/SparePartsManagement';
import EmployeeProfile from './pages/user/EmployeeProfile';
import EmployeeOrderManagement from './pages/employee/EmployeeOrderManagement';
import OrderDetails from './pages/employee/OrderDetails';

// Admin Pages
import CreateEmployee from './pages/admin/CreateEmployee';
import UserManagementList from './pages/admin/UserManagementList';
import UserDetails from './pages/admin/UserDetails';
import AdminProfile from './pages/admin/AdminProfile';
import UserAnalytics from './pages/admin/UserAnalytics';
import RepairAnalytics from './pages/admin/RepairAnalytics';
import FinancialAnalytics from './pages/admin/FinancialAnalytics';
import CustomerAnalytics from './pages/admin/CustomerAnalytics';
import OperationalAnalytics from './pages/admin/OperationalAnalytics';
import BoatRidesAnalytics from './pages/admin/BoatRidesAnalytics';
import SalesVisitAnalytics from './pages/admin/SalesVisitAnalytics';
import InventoryAnalytics from './pages/admin/InventoryAnalytics';
import SparePartsSalesAnalytics from './pages/admin/SparePartsSalesAnalytics';
import AdminAboutPage from './pages/admin/AdminAboutPage';
import BoatManagement from './pages/admin/BoatManagement';
import AdminAppointmentPage from './pages/admin/AdminAppointmentPage';
import AdminChatDashboard from './pages/admin/AdminChatDashboard';
import EmployeeChatDashboard from './pages/admin/EmployeeChatDashboard';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import CustomerChat from './pages/customer/CustomerChat';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAllReviewsPage from './pages/admin/AdminAllReviewsPage';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CreatePage from './pages/admin/CreatePage';
import UserReviewsPage from './pages/customer/UserReviewsPage';



// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Import new boat service components
import CustomerDashboard from './pages/CustomerDashboard';
import BookingRequestPage from './pages/BookingRequestPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import EmployeeDashboard from './pages/user/dashboards/EmployeeDashboard';
import BookingManagementPage from './pages/BookingManagementPage';
import PackageManagementPage from './pages/PackageManagementPage';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<CompleteAboutPage />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/service-info/:serviceType" element={<ServiceInfo />} />
              
              {/* Phase 1: Customer Routes */}
        <Route path="/boat-catalog" element={<BoatCatalog />} />
        <Route path="/boat-details/:id" element={<BoatDetailsPage />} />
        <Route path="/boat-reviews/:id" element={<UserReviewsPage />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<CustomerAppointmentsPage />} />
        <Route path="/contact-form" element={<ContactPage />} />
        <Route path="/reviews" element={<UserReviewsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Customer Routes */}
              <Route path="/boat-rides" element={<ProtectedRoute><BoatRideBooking /></ProtectedRoute>} />
              <Route path="/ride-confirmation/:id" element={<ProtectedRoute><RideConfirmation /></ProtectedRoute>} />
              <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
              <Route path="/payment-summary" element={<ProtectedRoute><PaymentSummary /></ProtectedRoute>} />
              
              {/* New Boat Service Routes */}
              <Route path="/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute><BookingRequestPage /></ProtectedRoute>} />
              <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
              
              {/* Employee Routes */}
              <Route path="/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/employee/bookings" element={<ProtectedRoute><BookingManagementPage /></ProtectedRoute>} />
              <Route path="/employee/packages" element={<ProtectedRoute><PackageManagementPage /></ProtectedRoute>} />
              <Route path="/repair-service" element={<ProtectedRoute><RepairService /></ProtectedRoute>} />
              <Route path="/repair-service/edit/:id" element={<ProtectedRoute><RepairService /></ProtectedRoute>} />
              <Route path="/boat-purchase" element={<ProtectedRoute><BoatPurchase /></ProtectedRoute>} />
              <Route path="/spare-parts" element={<ProtectedRoute><ShopCategory /></ProtectedRoute>} />
              <Route path="/spare-parts/:id" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute requiredRole="customer"><CartItems /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute requiredRole="customer"><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute requiredRole="customer"><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute requiredRole="customer"><OrderTracking /></ProtectedRoute>} />
              <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/my-repairs" element={<ProtectedRoute><MyRepairs /></ProtectedRoute>} />
              <Route path="/repair-details/:id" element={<ProtectedRoute><RepairDetails /></ProtectedRoute>} />
              <Route path="/repair-payment/:id" element={<ProtectedRoute><RepairPayment /></ProtectedRoute>} />
              <Route path="/service-history" element={<ProtectedRoute><ServiceHistory /></ProtectedRoute>} />
              <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
              
              {/* Employee Routes */}
              <Route path="/employee/repair-management" element={<ProtectedRoute requiredRole="employee"><RepairManagementList /></ProtectedRoute>} />
              <Route path="/employee/repair-management/:id" element={<ProtectedRoute requiredRole="employee"><RepairManagementDetail /></ProtectedRoute>} />
              <Route path="/employee/ride-management" element={<ProtectedRoute requiredRole="employee"><RideManagement /></ProtectedRoute>} />
              <Route path="/employee/purchase-management" element={<ProtectedRoute requiredRole="employee"><PurchaseManagement /></ProtectedRoute>} />
              {/* <Route path="/employee/spare-parts-management" element={<ProtectedRoute requiredRole="employee"><SparePartsManagement /></ProtectedRoute>} /> */}
              <Route path="/inventory" element={<ProtectedRoute requiredRole="employee"><InventoryManagement /></ProtectedRoute>} />
              <Route path="/inventory/report" element={<ProtectedRoute requiredRole="employee"><InventoryReport /></ProtectedRoute>} />
              <Route path="/inventory/create" element={<ProtectedRoute requiredRole="employee"><CreateProduct /></ProtectedRoute>} />
              <Route path="/inventory/edit/:id" element={<ProtectedRoute requiredRole="employee"><EditProduct /></ProtectedRoute>} />
              <Route path="/employee/profile" element={<ProtectedRoute requiredRole="employee"><EmployeeProfile /></ProtectedRoute>} />
              <Route path="/employee/orders" element={<ProtectedRoute requiredRole="employee"><EmployeeOrderManagement /></ProtectedRoute>} />
            <Route path="/employee/orders/:orderId" element={<ProtectedRoute requiredRole="employee"><OrderDetails /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/create-employee" element={<ProtectedRoute requiredRole="admin"><CreateEmployee /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagementList /></ProtectedRoute>} />
              <Route path="/admin/users/:id" element={<ProtectedRoute requiredRole="admin"><UserDetails /></ProtectedRoute>} />
              <Route path="/admin/users/:id/edit" element={<ProtectedRoute requiredRole="admin"><UserDetails /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />
              <Route path="/admin/user-analytics" element={<ProtectedRoute requiredRole="admin"><UserAnalytics /></ProtectedRoute>} />
              <Route path="/admin/repair-analytics" element={<ProtectedRoute requiredRole="admin"><RepairAnalytics /></ProtectedRoute>} />
              <Route path="/admin/boat-rides-analytics" element={<ProtectedRoute requiredRole="admin"><BoatRidesAnalytics /></ProtectedRoute>} />
              <Route path="/admin/sales-visit-analytics" element={<ProtectedRoute requiredRole="admin"><SalesVisitAnalytics /></ProtectedRoute>} />
              <Route path="/admin/inventory-analytics" element={<ProtectedRoute requiredRole="admin"><InventoryAnalytics /></ProtectedRoute>} />
              <Route path="/admin/spare-parts-sales-analytics" element={<ProtectedRoute requiredRole="admin"><SparePartsSalesAnalytics /></ProtectedRoute>} />
              <Route path="/admin/financial-analytics" element={<ProtectedRoute requiredRole="admin"><FinancialAnalytics /></ProtectedRoute>} />
              <Route path="/admin/customer-analytics" element={<ProtectedRoute requiredRole="admin"><CustomerAnalytics /></ProtectedRoute>} />
              <Route path="/admin/operational-analytics" element={<ProtectedRoute requiredRole="admin"><OperationalAnalytics /></ProtectedRoute>} />
              <Route path="/admin/content-management" element={<ProtectedRoute requiredRole="admin"><AdminAboutPage /></ProtectedRoute>} />
              <Route path="/admin/boat-management" element={<ProtectedRoute requiredRole={["employee", "admin"]}><BoatManagement /></ProtectedRoute>} />
              <Route path="/admin/create" element={<ProtectedRoute requiredRole="admin"><CreatePage /></ProtectedRoute>} />
              <Route path="/admin/appointment-management" element={<ProtectedRoute requiredRole={["employee", "admin"]}><AdminAppointmentPage /></ProtectedRoute>} />
              <Route path="/admin/chat-support" element={<ProtectedRoute requiredRole={["employee", "admin"]}><AdminChatDashboard /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute requiredRole={["employee", "admin"]}><AdminAllReviewsPage /></ProtectedRoute>} />
              <Route path="/admin/reviews/:id" element={<ProtectedRoute requiredRole={["employee", "admin"]}><AdminReviewsPage /></ProtectedRoute>} />
              <Route path="/admin/feedback" element={<ProtectedRoute requiredRole="admin"><AdminFeedback /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrderManagement /></ProtectedRoute>} />
              
              {/* Employee Chat Routes */}
              <Route path="/employee/chat-dashboard" element={<ProtectedRoute requiredRole={["employee", "admin"]}><EmployeeChatDashboard /></ProtectedRoute>} />
              
              {/* Customer Chat Routes */}
              <Route path="/customer/chat" element={<ProtectedRoute requiredRole="customer"><CustomerChat /></ProtectedRoute>} />
              
              
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
