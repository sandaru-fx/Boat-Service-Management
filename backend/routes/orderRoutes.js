import express from 'express';
import {
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  processOrderPayment,
  getAllOrders,
  getOrderStats,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:orderId', getOrder);

// Protected routes (require authentication)
router.post('/', protect, createOrder);
router.post('/:orderId/cancel', protect, cancelOrder);

// Protected routes (require authentication)
router.get('/user/orders', protect, getUserOrders);

// Public routes for payment processing (guest checkout allowed)
router.post('/:orderId/payment', processOrderPayment);

// Employee routes
router.get('/employee/all', protect, restrictTo('employee'), getAllOrders);
router.get('/employee/stats', protect, restrictTo('employee'), getOrderStats);
router.patch('/employee/:orderId/status', protect, restrictTo('employee'), updateOrderStatus);

// Admin routes (legacy - for admin panel if needed)
router.get('/admin/all', protect, restrictTo('admin'), getAllOrders);
router.get('/admin/stats', protect, restrictTo('admin'), getOrderStats);
router.patch('/admin/:orderId/status', protect, restrictTo('admin'), updateOrderStatus);

export default router;
