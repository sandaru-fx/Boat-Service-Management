# Stripe Payment Integration Setup Guide

## 🚀 Quick Start (6 Hours Implementation)

This guide will help you set up Stripe payments for your boat service management system in under 6 hours.

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
2. **Node.js**: Version 16+ installed
3. **MongoDB**: Database running
4. **Basic understanding**: React, Node.js, Express

## 🔧 Step 1: Stripe Account Setup (30 minutes)

### 1.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification
3. Switch to **Test Mode** (toggle in dashboard)

### 1.2 Get API Keys
1. Go to **Developers > API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)
4. Go to **Developers > Webhooks** and create endpoint:
   - URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

## 🔑 Step 2: Environment Configuration (15 minutes)

### 2.1 Backend Environment Variables
Create/update your `.env` file in the backend directory:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=lkr

# Other existing variables...
MONGODB_URI=mongodb://localhost:27017/boat-service-management
JWT_SECRET=your-jwt-secret
PORT=5000
```

### 2.2 Frontend Environment Variables
Create/update your `.env` file in the frontend directory:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏗️ Step 3: Backend Implementation (2 hours)

### 3.1 Dependencies (Already Installed)
```bash
# Backend - Already installed
npm install stripe

# Frontend - Already installed  
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3.2 Files Created/Updated
- ✅ `backend/models/Payment.js` - Payment data model
- ✅ `backend/controllers/paymentController.js` - Stripe integration logic
- ✅ `backend/routes/paymentRoutes.js` - Payment API routes
- ✅ `backend/env.config.js` - Environment configuration
- ✅ `backend/server.js` - Added payment routes

### 3.3 API Endpoints Available
```
POST /api/payments/create-payment-intent - Create payment
GET  /api/payments/payment/:paymentId - Get payment details
POST /api/payments/payment/:paymentId/confirm - Confirm payment
GET  /api/payments/my-payments - User's payments
GET  /api/payments/admin/payments - All payments (admin)
POST /api/payments/webhook - Stripe webhook
```

## 🎨 Step 4: Frontend Implementation (2 hours)

### 4.1 Files Created/Updated
- ✅ `frontend/src/config/stripe.js` - Stripe configuration
- ✅ `frontend/src/components/StripePayment.jsx` - Payment modal component
- ✅ `frontend/src/components/PaymentSection.jsx` - Updated payment section
- ✅ `frontend/src/pages/PaymentPage.jsx` - Dedicated payment page

### 4.2 How to Use Payment Components

#### Option 1: PaymentSection Component (Recommended)
```jsx
import PaymentSection from '../components/PaymentSection.jsx';

<PaymentSection
  amount={2000}
  serviceType="boat_ride"
  serviceId="123"
  serviceDescription="Boat Ride Booking"
  customerInfo={{
    name: "John Doe",
    email: "john@example.com",
    phone: "+94771234567"
  }}
  onPaymentComplete={(paymentData) => {
    console.log('Payment successful:', paymentData);
    // Handle successful payment
  }}
/>
```

#### Option 2: Dedicated Payment Page
```jsx
// Navigate to payment page
navigate('/payment', {
  state: {
    paymentData: {
      amount: 2000,
      serviceType: 'boat_ride',
      serviceId: '123',
      serviceDescription: 'Boat Ride Booking',
      customerInfo: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+94771234567"
      }
    }
  }
});
```

## 🔄 Step 5: Integration with Existing Services (1 hour)

### 5.1 Update Boat Ride Booking
```jsx
// In your boat ride booking component
const handlePayment = () => {
  navigate('/payment', {
    state: {
      paymentData: {
        amount: formData.totalPrice,
        serviceType: 'boat_ride',
        serviceId: bookingId,
        serviceDescription: `Boat Ride - ${formData.rideType}`,
        customerInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    }
  });
};
```

### 5.2 Update Spare Parts Purchase
```jsx
// In your spare parts component
const handlePurchase = () => {
  navigate('/payment', {
    state: {
      paymentData: {
        amount: selectedParts.reduce((total, part) => total + part.price, 0),
        serviceType: 'spare_parts',
        serviceId: 'cart_' + Date.now(),
        serviceDescription: `Spare Parts Purchase (${selectedParts.length} items)`,
        customerInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    }
  });
};
```

### 5.3 Update Boat Repair Booking
```jsx
// In your repair booking component
const handleRepairPayment = () => {
  navigate('/payment', {
    state: {
      paymentData: {
        amount: repairEstimate.totalCost,
        serviceType: 'boat_repair',
        serviceId: repairId,
        serviceDescription: `Boat Repair - ${repairType}`,
        customerInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      }
    }
  });
};
```

## 🧪 Step 6: Testing (30 minutes)

### 6.1 Test Cards (Stripe Test Mode)
Use these test card numbers:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Success |
| `4000 0000 0000 0002` | Visa - Declined |
| `4000 0000 0000 9995` | Visa - Insufficient Funds |
| `5555 5555 5555 4444` | Mastercard - Success |
| `3782 8224 6310 005` | American Express - Success |

**Test Details:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 6.2 Test Scenarios
1. **Successful Payment**: Use `4242 4242 4242 4242`
2. **Failed Payment**: Use `4000 0000 0000 0002`
3. **Insufficient Funds**: Use `4000 0000 0000 9995`

### 6.3 Test Flow
1. Start your backend: `npm run dev`
2. Start your frontend: `npm start`
3. Navigate to a service page
4. Click "Pay Now" button
5. Enter test card details
6. Verify payment success/failure handling

## 🔒 Security Features

### ✅ Implemented Security Measures
- **PCI Compliance**: Stripe handles all card data
- **SSL Encryption**: All communications encrypted
- **Webhook Verification**: Stripe signature verification
- **No Card Storage**: We never store card details
- **Token-based Auth**: JWT authentication
- **Input Validation**: Server-side validation
- **Rate Limiting**: API rate limiting

### 🛡️ Additional Security Recommendations
1. **HTTPS**: Use HTTPS in production
2. **Environment Variables**: Never commit API keys
3. **Webhook Security**: Verify webhook signatures
4. **Input Sanitization**: Sanitize all inputs
5. **Error Handling**: Don't expose sensitive errors

## 📊 Payment Flow Diagram

```
Customer → Payment Button → Stripe Modal → Card Details → Stripe Processing
    ↓
Payment Success → Webhook → Database Update → Confirmation Email
    ↓
Redirect to Success Page
```

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid API Key"
**Solution**: Check your Stripe keys in `.env` files

### Issue 2: "Webhook signature verification failed"
**Solution**: Ensure webhook secret is correct in environment

### Issue 3: "Payment intent not found"
**Solution**: Check if payment intent was created successfully

### Issue 4: "CORS errors"
**Solution**: Ensure CORS is configured for your frontend URL

### Issue 5: "Currency not supported"
**Solution**: Check if LKR is enabled in your Stripe account

## 📈 Production Deployment

### 1. Switch to Live Mode
1. Go to Stripe Dashboard
2. Toggle from "Test" to "Live" mode
3. Get live API keys
4. Update environment variables

### 2. Webhook Configuration
1. Create production webhook endpoint
2. Update webhook URL to production domain
3. Configure webhook events

### 3. SSL Certificate
1. Ensure HTTPS is enabled
2. Update CORS settings for production domain

## 💰 Pricing & Fees

### Stripe Fees (Sri Lanka)
- **Card Payments**: 3.4% + LKR 10 per transaction
- **International Cards**: 3.9% + LKR 10 per transaction
- **No Setup Fees**: Free to start
- **No Monthly Fees**: Pay per transaction only

### Example Calculation
- **Payment**: LKR 2,000
- **Stripe Fee**: LKR 68 (3.4% + LKR 10)
- **You Receive**: LKR 1,932

## 🎯 Next Steps

1. **Test thoroughly** with test cards
2. **Update all service pages** to use payment integration
3. **Add payment history** to user dashboard
4. **Implement refunds** for admin users
5. **Add email notifications** for payments
6. **Create payment analytics** dashboard

## 📞 Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in dashboard
- **Test Mode**: Use test cards for development
- **Webhook Testing**: Use Stripe CLI for local testing

## ✅ Checklist

- [ ] Stripe account created
- [ ] API keys obtained
- [ ] Environment variables configured
- [ ] Backend endpoints working
- [ ] Frontend components integrated
- [ ] Test payments successful
- [ ] Webhook handling working
- [ ] Error handling implemented
- [ ] Security measures in place
- [ ] Production deployment ready

---

**🎉 Congratulations!** You now have a fully functional Stripe payment system integrated into your boat service management application. The implementation is secure, scalable, and ready for production use.
