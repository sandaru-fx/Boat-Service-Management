import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaShip } from 'react-icons/fa';
import cartIcon from '../../assets/cart_icon.png';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Get cart from localStorage and calculate total
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.selectedQty, 0);
    setCartCount(total);
  };

  // Listen to localStorage changes to instantly update cart badge
  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSupportClick = () => {
    const userRole = user?.role;
    
    switch(userRole) {
      case 'customer':
        navigate('/customer/chat');
        break;
      case 'employee':
        navigate('/employee/chat-dashboard');
        break;
      case 'admin':
        navigate('/admin/chat-support');
        break;
      default:
        navigate('/customer/chat');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <FaShip className="text-white text-sm" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Marine Service Center</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSupportClick}
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Support
                </button>
                <Link
                  to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'employee' ? '/employee/profile' : '/profile'}
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                
                {/* Cart Icon - Only for Customers */}
                {user?.role === 'customer' && (
                  <div className="relative">
                    <Link to="/cart" className="flex items-center">
                      <img
                        src={cartIcon}
                        alt="Cart"
                        className="w-8 h-8 hover:opacity-80 transition-opacity"
                      />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-teal-600" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/services"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
