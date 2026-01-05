import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// For testing, use the test publishable key from your Stripe dashboard
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

console.log('🔑 Stripe publishable key check:', stripeKey ? 'Present' : 'Missing');
if (!stripeKey) {
  console.error('❌ REACT_APP_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

const stripePromise = loadStripe(stripeKey);

export default stripePromise;

// Stripe configuration
export const STRIPE_CONFIG = {
  // Test card numbers for development
  TEST_CARDS: {
    VISA_SUCCESS: '4242424242424242',
    VISA_DECLINED: '4000000000000002',
    VISA_INSUFFICIENT_FUNDS: '4000000000009995',
    VISA_PROCESSING_ERROR: '4000000000000119',
    MASTERCARD_SUCCESS: '5555555555554444',
    AMEX_SUCCESS: '378282246310005',
    DISCOVER_SUCCESS: '6011111111111117'
  },
  
  // Currency settings
  CURRENCY: 'lkr',
  CURRENCY_SYMBOL: 'LKR',
  
  // Payment method types
  PAYMENT_METHOD_TYPES: ['card'],
  
  // Appearance settings
  APPEARANCE: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  }
};

// Helper function to format amount for display
export const formatAmount = (amount, currency = 'lkr') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to convert amount to cents (Stripe uses smallest currency unit)
export const amountToCents = (amount) => {
  return Math.round(amount * 100);
};

// Helper function to convert cents to amount
export const centsToAmount = (cents) => {
  return cents / 100;
};
