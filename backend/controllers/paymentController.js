import Stripe from 'stripe';
import Payment from '../models/Payment.js';

// Initialize Stripe - moved to function level to ensure env vars are loaded
let stripe = null;

const initializeStripe = () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    console.log('🔑 Stripe secret key check:', secretKey ? 'Present' : 'Missing');
    if (!secretKey) {
      console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripe = new Stripe(secretKey);
    console.log('✅ Stripe instance created');
  }
  return stripe;
};

// Create payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    console.log('🔍 Payment intent request received:', req.body);
    
    // Initialize Stripe
    const stripe = initializeStripe();
    console.log('✅ Stripe initialized successfully');

    const {
      amount,
      currency = 'lkr',
      serviceType,
      serviceId,
      serviceDescription,
      customerEmail,
      customerName,
      customerPhone,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!amount || !serviceType || !serviceId || !serviceDescription || !customerEmail || !customerName) {
      console.log('❌ Missing required fields:', {
        amount: !!amount,
        serviceType: !!serviceType,
        serviceId: !!serviceId,
        serviceDescription: !!serviceDescription,
        customerEmail: !!customerEmail,
        customerName: !!customerName
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, serviceType, serviceId, serviceDescription, customerEmail, customerName'
      });
    }

    // Validate amount (minimum 50 LKR)
    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum payment amount is 50 LKR'
      });
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create Stripe customer
    let stripeCustomer;
    try {
      stripeCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        metadata: {
          serviceType,
          serviceId: serviceId.toString()
        }
      });
    } catch (stripeError) {
      console.error('Error creating Stripe customer:', stripeError.message);
      // Continue without customer if creation fails
    }

    // Create payment intent
    console.log('💳 Creating Stripe payment intent with amount:', amountInCents, 'cents');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: stripeCustomer?.id,
      metadata: {
        serviceType,
        serviceId: serviceId.toString(),
        serviceDescription,
        customerEmail,
        customerName,
        ...metadata
      },
      description: `Payment for ${serviceDescription}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log('✅ Payment intent created:', paymentIntent.id);

    // Generate payment ID manually to ensure it's set
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create payment record in database
    const payment = new Payment({
      paymentId: paymentId,
      invoiceNumber: invoiceNumber,
      stripePaymentIntentId: paymentIntent.id,
      customerId: req.user?.id || null,
      customerEmail,
      customerName,
      customerPhone,
      amount,
      currency: currency.toLowerCase(),
      amountInCents,
      serviceType,
      serviceId,
      serviceDescription,
      status: 'pending',
      stripeCustomerId: stripeCustomer?.id,
      metadata: new Map(Object.entries(metadata))
    });

    await payment.save();
    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.paymentId,
        amount,
        currency,
        serviceType,
        serviceDescription
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Initialize Stripe and retrieve payment intent
    const stripe = initializeStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);

    // Update payment status based on Stripe status
    let newStatus = 'pending';
    switch (paymentIntent.status) {
      case 'succeeded':
        newStatus = 'succeeded';
        payment.paidAt = new Date();
        break;
      case 'processing':
        newStatus = 'processing';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        newStatus = 'pending';
        break;
      case 'canceled':
        newStatus = 'canceled';
        break;
      default:
        newStatus = 'failed';
    }

    payment.status = newStatus;
    payment.stripeChargeId = paymentIntent.latest_charge;
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
        receiptUrl: payment.receiptUrl
      }
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// Get payment details
export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId })
      .populate('customerId', 'name email phone')
      .populate('serviceId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
};

// Get user payments
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, serviceType } = req.query;

    // Get user email to filter payments
    const User = (await import('../models/userModel.js')).default;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const filter = { customerEmail: user.email };
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    
    // Default to only succeeded payments if no status filter is provided
    if (!status) {
      filter.status = 'succeeded';
    }

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('serviceId');

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, serviceType, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (serviceType) filter.serviceType = serviceType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);
    const stats = await Payment.getPaymentStats(filter);

    res.status(200).json({
      success: true,
      data: {
        payments,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (!payment.canBeRefunded()) {
      return res.status(400).json({
        success: false,
        message: 'Payment cannot be refunded'
      });
    }

    const refundAmount = amount || payment.getRemainingRefundAmount();
    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund amount'
      });
    }

    // Create refund in Stripe
    const stripe = initializeStripe();
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        paymentId: payment.paymentId,
        refundedBy: req.user.id
      }
    });

    // Update payment record
    payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
    payment.refundedAt = new Date();
    payment.refundReason = reason;
    
    if (payment.refundAmount >= payment.amount) {
      payment.status = 'refunded';
    }

    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        refundId: refund.id,
        refundAmount,
        remainingAmount: payment.getRemainingRefundAmount(),
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
      error: error.message
    });
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = initializeStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions for webhook handling
const handlePaymentSuccess = async (paymentIntent) => {
  const payment = await Payment.findOne({ 
    stripePaymentIntentId: paymentIntent.id 
  });
  
  if (payment) {
    payment.status = 'succeeded';
    payment.paidAt = new Date();
    payment.stripeChargeId = paymentIntent.latest_charge;
    await payment.save();
    
    console.log(`Payment ${payment.paymentId} marked as succeeded`);
  }
};

const handlePaymentFailure = async (paymentIntent) => {
  const payment = await Payment.findOne({ 
    stripePaymentIntentId: paymentIntent.id 
  });
  
  if (payment) {
    payment.status = 'failed';
    await payment.save();
    
    console.log(`Payment ${payment.paymentId} marked as failed`);
  }
};

const handlePaymentCanceled = async (paymentIntent) => {
  const payment = await Payment.findOne({ 
    stripePaymentIntentId: paymentIntent.id 
  });
  
  if (payment) {
    payment.status = 'canceled';
    await payment.save();
    
    console.log(`Payment ${payment.paymentId} marked as canceled`);
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, serviceType } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (serviceType) filter.serviceType = serviceType;

    const stats = await Payment.getPaymentStats(filter);
    
    // Get additional stats
    const serviceTypeStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulCount: {
            $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
          },
          successfulAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        serviceTypeStats
      }
    });

  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
};
