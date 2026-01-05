import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPayment,
  getUserPayments,
  getAllPayments,
  refundPayment,
  handleStripeWebhook,
  getPaymentStats
} from '../controllers/paymentController.js';
import authMiddleware, { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (must be before other routes to avoid middleware conflicts)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Public routes
router.post('/create-payment-intent', createPaymentIntent);
router.get('/payment/:paymentId', getPayment);
router.post('/payment/:paymentId/confirm', confirmPayment);

// Protected routes (require authentication)
router.get('/my-payments', protect, getUserPayments);

// Admin routes
router.get('/admin/payments', protect, restrictTo('admin'), getAllPayments);
router.get('/admin/stats', protect, restrictTo('admin'), getPaymentStats);
router.post('/admin/payment/:paymentId/refund', protect, restrictTo('admin'), refundPayment);

export default router;
