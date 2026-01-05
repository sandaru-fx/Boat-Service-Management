import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise, { formatAmount } from '../config/stripe.js';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaInfoCircle, FaLock, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Payment form component
const PaymentForm = ({ 
  amount, 
  serviceType, 
  serviceId, 
  serviceDescription, 
  customerInfo, 
  onPaymentComplete, 
  isLoading = false 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState(null);

  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent with:', {
          amount,
          serviceType,
          serviceId,
          serviceDescription,
          customerInfo
        });
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: amount, // Amount in LKR
            currency: 'lkr',
            serviceType: serviceType,
            serviceId: serviceId,
            serviceDescription: serviceDescription,
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone
          })
        });

        const data = await response.json();
        console.log('Payment intent response:', data);
        
        if (data.success) {
          setPaymentIntent(data.data);
        } else {
          throw new Error(data.message || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error.message);
      }
    };

    if (amount && serviceType && serviceId && customerInfo) {
      createPaymentIntent();
    }
  }, [amount, serviceType, serviceId, customerInfo]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (confirmedPaymentIntent.status === 'succeeded') {
        // Payment succeeded with Stripe, let the parent component handle backend confirmation
        onPaymentComplete({
          paymentIntentId: confirmedPaymentIntent.id,
          amount: amount
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  if (!paymentIntent) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-4" />
        <p className="text-gray-600">Setting up secure payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{serviceDescription}</span>
            <span className="font-bold text-blue-600">{formatAmount(amount)}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-green-600">{formatAmount(amount)}</span>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FaCreditCard className="text-blue-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Card Details</h3>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>
        
        {/* Test Card Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Test Mode</h4>
              <p className="text-xs text-blue-700 mt-1">
                Use test card: <strong>4242 4242 4242 4242</strong>, any future date, any CVC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Payment Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <FaLock className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
            <p className="text-xs text-green-700 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={processing}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || isLoading}
          className="flex-2 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing || isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FaShieldAlt className="mr-2" />
              Pay {formatAmount(amount)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Main component
const SimpleStripePayment = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default SimpleStripePayment;
