import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PaymentSection from '../../components/PaymentSection';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    customerNotes: '',
    deliveryMethod: 'delivery'
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: ''
    }
  });

  // Sri Lankan districts
  const sriLankanDistricts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
    'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
    'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
    'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
    'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
  ];

  // Load cart items from localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(cart);
    
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || ''
      }));
    }
  }, [user]);

  // Check if this is a Buy Now checkout (single item)
  const isBuyNowCheckout = cartItems.length === 1;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.selectedQty), 0);
  const shippingFee = 0; // Free shipping
  const totalAmount = subtotal + shippingFee;

  // Real-time validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'customerName':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
        
      case 'customerEmail':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
        
      case 'customerPhone':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) error = 'Invalid phone number format';
        break;
        
      case 'shippingAddress.street':
        if (!value.trim()) error = 'Street address is required';
        else if (value.trim().length < 3) error = 'Street address must be at least 3 characters';
        break;
        
      case 'shippingAddress.city':
        if (!value.trim()) error = 'City is required';
        else if (value.trim().length < 2) error = 'City must be at least 2 characters';
        break;
        
      case 'shippingAddress.district':
        if (!value.trim()) error = 'District is required';
        break;
        
      case 'shippingAddress.postalCode':
        if (value && !/^\d{5}$/.test(value)) error = 'Postal code must be exactly 5 digits';
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle postal code - only allow digits
    if (name === 'shippingAddress.postalCode') {
      const digitsOnly = value.replace(/\D/g, '');
      e.target.value = digitsOnly;
    }
    
    // Update form data
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: name === 'shippingAddress.postalCode' ? value.replace(/\D/g, '') : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Real-time validation
    const error = validateField(name, name === 'shippingAddress.postalCode' ? value.replace(/\D/g, '') : value);
    setValidationErrors(prev => {
      if (name.startsWith('shippingAddress.')) {
        const field = name.split('.')[1];
        return {
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            [field]: error
          }
        };
      } else {
        return {
          ...prev,
          [name]: error
        };
      }
    });
  };

  const validateForm = () => {
    // Check customer info errors
    const customerErrors = [
      validationErrors.customerName,
      validationErrors.customerEmail,
      validationErrors.customerPhone
    ].some(error => error);

    // Check address errors only if delivery is selected
    let addressErrors = false;
    if (formData.deliveryMethod === 'delivery') {
      addressErrors = Object.values(validationErrors.shippingAddress).some(error => error);
    }
    
    if (customerErrors || addressErrors) {
      alert('Please fix the validation errors before proceeding');
      return false;
    }
    
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        productName: item.name,
        partNumber: item.partNumber,
        quantity: item.selectedQty,
        unitPrice: item.price
      }));

      // Create order
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: formData.shippingAddress,
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerNotes: formData.customerNotes,
          deliveryMethod: formData.deliveryMethod
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderData(data.data);
        return data.data.orderId;
      } else {
        if (response.status === 401) {
          alert('Please log in to place an order');
          navigate('/login');
          return null;
        } else {
          throw new Error(data.message || 'Failed to create order');
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      // Link payment to order
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderData.orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentId: paymentData.paymentId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cart
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('storage'));
        
        // Navigate to order confirmation
        navigate(`/order-confirmation/${orderData.orderId}`, {
          state: {
            order: orderData,
            payment: paymentData
          }
        });
      } else {
        throw new Error(data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment was successful but failed to update order. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error.message);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart before checkout.</p>
            <button 
              onClick={() => navigate('/spare-parts')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Review your order and complete your purchase</p>
          {isBuyNowCheckout && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">
                Buy Now
              </span>
              <span className="text-green-600 text-sm font-medium">
                Direct purchase - no cart needed
              </span>
            </div>
          )}
        </div>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item._id} className="order-item">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Part Number: {item.partNumber}</p>
                    <p>Quantity: {item.selectedQty}</p>
                  </div>
                  <div className="item-price">
                    <p>Rs. {item.price * item.selectedQty}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row total">
                <span>Total:</span>
                <span>Rs. {totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form Sections */}
          <div className="checkout-form-column">
            {/* Customer Information */}
            <div className="customer-info">
              <h3>Customer Information</h3>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={validationErrors.customerName ? 'error' : ''}
                  required
                />
                {validationErrors.customerName && (
                  <span className="error-message">{validationErrors.customerName}</span>
                )}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={validationErrors.customerEmail ? 'error' : ''}
                  required
                />
                {validationErrors.customerEmail && (
                  <span className="error-message">{validationErrors.customerEmail}</span>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className={validationErrors.customerPhone ? 'error' : ''}
                />
                {validationErrors.customerPhone && (
                  <span className="error-message">{validationErrors.customerPhone}</span>
                )}
              </div>
            </div>


            {/* Delivery Method */}
            <div className="delivery-method">
              <h3>Delivery Method</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === 'delivery'}
                    onChange={handleInputChange}
                  />
                  <span>Home Delivery (Free)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleInputChange}
                  />
                  <span>Pickup from Store</span>
                </label>
              </div>
            </div>

            {/* Shipping Address - Only show for delivery */}
            {formData.deliveryMethod === 'delivery' && (
              <div className="shipping-info">
                <h3>Shipping Address</h3>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="Enter your street address, house number, etc."
                    className={validationErrors.shippingAddress.street ? 'error' : ''}
                    required
                  />
                  {validationErrors.shippingAddress.street && (
                    <span className="error-message">{validationErrors.shippingAddress.street}</span>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={validationErrors.shippingAddress.city ? 'error' : ''}
                      required
                    />
                    {validationErrors.shippingAddress.city && (
                      <span className="error-message">{validationErrors.shippingAddress.city}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <select
                      name="shippingAddress.district"
                      value={formData.shippingAddress.district}
                      onChange={handleInputChange}
                      className={validationErrors.shippingAddress.district ? 'error' : ''}
                      required
                    >
                      <option value="">Select District</option>
                      {sriLankanDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {validationErrors.shippingAddress.district && (
                      <span className="error-message">{validationErrors.shippingAddress.district}</span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="shippingAddress.postalCode"
                    value={formData.shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter 5-digit postal code"
                    className={validationErrors.shippingAddress.postalCode ? 'error' : ''}
                    maxLength="5"
                  />
                  {validationErrors.shippingAddress.postalCode && (
                    <span className="error-message">{validationErrors.shippingAddress.postalCode}</span>
                  )}
                </div>
              </div>
            )}

            {/* Customer Notes */}
            <div className="customer-notes">
              <h3>Additional Notes</h3>
              <div className="form-group">
                <textarea
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes..."
                  rows="5"
                />
              </div>
            </div>

            {/* Payment Section */}
            {orderData && (
              <div className="payment-section">
                <h3>Payment</h3>
                <PaymentSection
                  amount={totalAmount}
                  serviceType="spare_parts"
                  serviceId={orderData.orderId}
                  serviceDescription={`Spare Parts Order - ${cartItems.length} items`}
                  customerInfo={{
                    name: formData.customerName,
                    email: formData.customerEmail,
                    phone: formData.customerPhone
                  }}
                  onPaymentComplete={handlePaymentComplete}
                  onPaymentError={handlePaymentError}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="checkout-actions">
              <button
                onClick={() => navigate('/cart')}
                className="btn-secondary"
              >
                Back to Cart
              </button>
              {!orderData && (
                <button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating Order...' : 'Proceed to Payment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
